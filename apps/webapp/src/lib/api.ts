import { clearAuth, registerApiSetToken, useAuthStore } from '@/store/auth';
import type {
  Achievement,
  ApiResponse,
  DemoScenario,
  GamificationStats,
  TrackingLink,
  User,
  XpEvent,
} from '@showcase/shared';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3100';

/** Error with HTTP status code for fine-grained retry logic */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;
  /**
   * Deduplicate concurrent token refresh requests.
   * If a refresh is already in-flight, subsequent 401 retries await the same
   * promise instead of firing a second /auth/refresh call.
   */
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
    isRetry = false,
  ): Promise<T> {
    if (!this.token) {
      const persistedToken = useAuthStore.getState().accessToken;
      if (persistedToken) this.token = persistedToken;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (!res.ok) {
      // Try refresh on 401, but only once to prevent infinite recursion.
      // All concurrent 401s share a single refresh attempt via refreshPromise.
      if (res.status === 401 && path !== '/api/v1/auth/refresh' && !isRetry) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Pass isRetry=true so a second 401 bubbles up instead of looping
          return this.request(path, options, true);
        }
      }
      const err = await res.json().catch(() => ({}));
      throw new ApiError(
        res.status,
        err?.error?.message ?? `HTTP ${res.status}`,
      );
    }

    return res.json();
  }

  private refreshToken(): Promise<boolean> {
    // If a refresh is already in-flight, reuse it — prevents duplicate /auth/refresh
    // calls when multiple requests get 401 simultaneously (e.g. on page load with
    // an expired token).
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = (async (): Promise<boolean> => {
      try {
        const res = await fetch(`${this.baseUrl}/api/v1/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        if (!res.ok) {
          // Refresh failed — clear auth to prevent infinite broken-state loops
          this.token = null;
          clearAuth();
          return false;
        }
        const data = await res.json();
        // Validate response shape before accessing nested property
        const newToken: unknown = data?.data?.accessToken;
        if (typeof newToken !== 'string' || !newToken) {
          this.token = null;
          clearAuth();
          return false;
        }
        this.token = newToken;
        // Keep Zustand store in sync so subsequent calls from React Query use the fresh token
        useAuthStore.getState().setAccessToken(newToken);
        return true;
      } catch {
        this.token = null;
        clearAuth();
        return false;
      } finally {
        // Always clear the in-flight promise so future 401s trigger a new refresh
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  // Auth
  async loginWithTelegram(initData: string) {
    return this.request<ApiResponse<{ user: User; accessToken: string }>>(
      '/api/v1/auth/telegram',
      {
        method: 'POST',
        body: JSON.stringify({ initData }),
      },
    );
  }

  async logout() {
    return this.request<ApiResponse>('/api/v1/auth/logout', { method: 'POST' });
  }

  // Showcase
  async getScenarios() {
    return this.request<ApiResponse<DemoScenario[]>>(
      '/api/v1/showcase/scenarios',
    );
  }

  async runScenario(id: string) {
    return this.request<ApiResponse>(`/api/v1/showcase/scenarios/${id}/run`, {
      method: 'POST',
    });
  }

  async completeScenario(id: string, runId: string, timeMs: number) {
    return this.request<ApiResponse>(
      `/api/v1/showcase/scenarios/${id}/complete`,
      {
        method: 'POST',
        body: JSON.stringify({ runId, timeMs }),
      },
    );
  }

  async getGlobalMetrics() {
    return this.request<ApiResponse>('/api/v1/showcase/metrics');
  }

  // Gamification
  async getGamificationStats() {
    return this.request<ApiResponse<GamificationStats>>(
      '/api/v1/gamification/stats',
    );
  }

  async awardXp(amount: number, reason: string, actionType: string) {
    return this.request<ApiResponse<XpEvent>>('/api/v1/gamification/award-xp', {
      method: 'POST',
      body: JSON.stringify({ amount, reason, actionType }),
    });
  }

  async updateStreak() {
    return this.request<ApiResponse>('/api/v1/gamification/streak', {
      method: 'POST',
    });
  }

  async getAllAchievements() {
    return this.request<ApiResponse<Achievement[]>>(
      '/api/v1/gamification/achievements',
    );
  }

  // Users
  async getMe() {
    return this.request<ApiResponse<User>>('/api/v1/users/me');
  }

  async getLeaderboard(limit = 20) {
    return this.request<ApiResponse<User[]>>(
      `/api/v1/users/leaderboard?limit=${limit}`,
    );
  }

  async getReferrals() {
    return this.request<ApiResponse>('/api/v1/users/referrals');
  }

  async getActivity() {
    return this.request<ApiResponse>('/api/v1/users/activity');
  }

  // Subscriptions
  async getPlans() {
    return this.request<ApiResponse>('/api/v1/subscriptions/plans');
  }

  async getSubscriptionStatus() {
    return this.request<ApiResponse>('/api/v1/subscriptions/status');
  }

  async startSubscription(plan: string, trial = true) {
    return this.request<ApiResponse>('/api/v1/subscriptions/start', {
      method: 'POST',
      body: JSON.stringify({ plan, trial }),
    });
  }

  async cancelSubscription() {
    return this.request<ApiResponse>('/api/v1/subscriptions/cancel', {
      method: 'POST',
    });
  }

  // Analytics
  async trackEvent(type: string, payload?: Record<string, unknown>) {
    if (!this.token) return; // skip if not authenticated
    return this.request<ApiResponse>('/api/v1/analytics/events', {
      method: 'POST',
      body: JSON.stringify({ type, payload }),
    }).catch(() => {}); // silent fail for analytics
  }

  async getDashboard() {
    return this.request<ApiResponse>('/api/v1/analytics/dashboard');
  }

  // Tracking
  async createLink(data: Record<string, unknown>) {
    return this.request<ApiResponse<TrackingLink>>('/api/v1/tracking/links', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyLinks() {
    return this.request<ApiResponse<TrackingLink[]>>('/api/v1/tracking/links');
  }

  async getLinkAnalytics(id: string) {
    return this.request<ApiResponse>(`/api/v1/tracking/links/${id}/analytics`);
  }

  async deleteLink(id: string) {
    return this.request<ApiResponse>(`/api/v1/tracking/links/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient(API_BASE);

// Register setToken with the store so it can be called synchronously during hydration
// This breaks the race condition where React Query fires before useEffect sets the token
registerApiSetToken((token) => api.setToken(token));
