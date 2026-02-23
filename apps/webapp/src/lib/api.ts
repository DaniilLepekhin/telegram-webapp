import { useAuthStore } from '@/store/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3100';

/** Error with HTTP status code for fine-grained retry logic */
export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
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
      // Try refresh on 401
      if (res.status === 401 && path !== '/api/v1/auth/refresh') {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          return this.request(path, options);
        }
      }
      const err = await res.json().catch(() => ({}));
      throw new ApiError(res.status, err?.error?.message ?? `HTTP ${res.status}`);
    }

    return res.json();
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) return false;
      const data = await res.json();
      this.token = data.data.accessToken;
      return true;
    } catch {
      return false;
    }
  }

  // Auth
  async loginWithTelegram(initData: string) {
    return this.request<{ success: boolean; data: { user: unknown; accessToken: string } }>(
      '/api/v1/auth/telegram',
      { method: 'POST', body: JSON.stringify({ initData }) },
    );
  }

  async logout() {
    return this.request('/api/v1/auth/logout', { method: 'POST' });
  }

  // Showcase
  async getScenarios() {
    return this.request<{ success: boolean; data: unknown[] }>('/api/v1/showcase/scenarios');
  }

  async runScenario(id: string) {
    return this.request<{ success: boolean; data: unknown }>(
      `/api/v1/showcase/scenarios/${id}/run`,
      { method: 'POST' },
    );
  }

  async completeScenario(id: string, runId: string, timeMs: number) {
    return this.request(`/api/v1/showcase/scenarios/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ runId, timeMs }),
    });
  }

  async getGlobalMetrics() {
    return this.request<{ success: boolean; data: unknown }>('/api/v1/showcase/metrics');
  }

  // Gamification
  async getGamificationStats() {
    return this.request<{ success: boolean; data: unknown }>('/api/v1/gamification/stats');
  }

  async awardXp(amount: number, reason: string, actionType: string) {
    return this.request('/api/v1/gamification/award-xp', {
      method: 'POST',
      body: JSON.stringify({ amount, reason, actionType }),
    });
  }

  async updateStreak() {
    return this.request('/api/v1/gamification/streak', { method: 'POST' });
  }

  // Users
  async getMe() {
    return this.request<{ success: boolean; data: unknown }>('/api/v1/users/me');
  }

  async getLeaderboard(limit = 20) {
    return this.request<{ success: boolean; data: unknown[] }>(`/api/v1/users/leaderboard?limit=${limit}`);
  }

  async getReferrals() {
    return this.request<{ success: boolean; data: unknown }>('/api/v1/users/referrals');
  }

  async getActivity() {
    return this.request<{ success: boolean; data: unknown[] }>('/api/v1/users/activity');
  }

  // Subscriptions
  async getPlans() {
    return this.request<{ success: boolean; data: unknown[] }>('/api/v1/subscriptions/plans');
  }

  async getSubscriptionStatus() {
    return this.request<{ success: boolean; data: unknown }>('/api/v1/subscriptions/status');
  }

  async startSubscription(plan: string, trial = true) {
    return this.request('/api/v1/subscriptions/start', {
      method: 'POST',
      body: JSON.stringify({ plan, trial }),
    });
  }

  async cancelSubscription() {
    return this.request('/api/v1/subscriptions/cancel', { method: 'POST' });
  }

  // Analytics
  async trackEvent(type: string, payload?: Record<string, unknown>) {
    if (!this.token) return; // skip if not authenticated
    return this.request('/api/v1/analytics/events', {
      method: 'POST',
      body: JSON.stringify({ type, payload }),
    }).catch(() => {}); // silent fail for analytics
  }

  async getDashboard() {
    return this.request<{ success: boolean; data: unknown }>('/api/v1/analytics/dashboard');
  }

  // Tracking
  async createLink(data: Record<string, unknown>) {
    return this.request('/api/v1/tracking/links', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyLinks() {
    return this.request<{ success: boolean; data: unknown[] }>('/api/v1/tracking/links');
  }

  async getLinkAnalytics(id: string) {
    return this.request<{ success: boolean; data: unknown }>(`/api/v1/tracking/links/${id}/analytics`);
  }

  async deleteLink(id: string) {
    return this.request(`/api/v1/tracking/links/${id}`, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_BASE);
