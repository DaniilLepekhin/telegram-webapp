// Telegram types
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface TelegramInitData {
  user?: TelegramUser;
  chat_instance?: string;
  chat_type?: string;
  start_param?: string;
  auth_date: number;
  hash: string;
}

// Auth types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JWTPayload {
  sub: string; // userId
  telegramId: number;
  role: UserRole;
  iat: number;
  exp: number;
}

export type UserRole = 'guest' | 'user' | 'premium' | 'admin';

// User types
export interface User {
  id: string;
  telegramId: number;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  languageCode: string;
  isPremium: boolean;
  role: UserRole;
  xp: number;
  level: number;
  streak: number;
  energyBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

// Demo Scenario types
export type ScenarioId = 'ecom' | 'club' | 'service' | 'education' | 'support' | 'funnel';

export interface DemoScenario {
  id: ScenarioId;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  gradient: string;
  metrics: ScenarioMetric[];
  steps: ScenarioStep[];
  tags: string[];
}

export interface ScenarioMetric {
  label: string;
  value: string;
  delta?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface ScenarioStep {
  id: string;
  title: string;
  description: string;
  type: 'bot' | 'webapp' | 'payment' | 'notification' | 'analytics';
  durationMs: number;
}

// Tracking types
export interface TrackingLink {
  id: string;
  userId: string;
  slug: string;
  targetUrl: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  abTestGroup?: string;
  qrCodeUrl?: string;
  clickCount: number;
  conversionCount: number;
  isActive: boolean;
  expiresAt?: Date;
  createdAt: Date;
}

export interface TrackingEvent {
  linkId: string;
  country?: string;
  city?: string;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  browser?: string;
  os?: string;
  utmParams?: Record<string, string>;
  abGroup?: string;
  telegramUserId?: number;
  timestamp: Date;
}

// Analytics types
export interface AnalyticsEvent {
  id: string;
  userId?: string;
  type: EventType;
  payload: Record<string, unknown>;
  sessionId?: string;
  timestamp: Date;
}

export type EventType =
  | 'page_view'
  | 'button_click'
  | 'scenario_start'
  | 'scenario_complete'
  | 'tracking_link_click'
  | 'subscription_start'
  | 'subscription_cancel'
  | 'payment_success'
  | 'payment_fail'
  | 'referral_click'
  | 'referral_convert'
  | 'xp_earned'
  | 'achievement_unlock'
  | 'quest_complete'
  | 'streak_update';

// Gamification types
export interface GamificationStats {
  userId: string;
  xp: number;
  level: number;
  levelName: string;
  xpToNextLevel: number;
  streak: number;
  longestStreak: number;
  energyBalance: number;
  achievements: Achievement[];
  recentXpEvents: XpEvent[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
}

export interface XpEvent {
  amount: number;
  reason: string;
  timestamp: Date;
}

// Subscription types
export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'trial' | 'past_due' | 'cancelled' | 'expired';

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  amount: number;
  currency: string;
  startedAt: Date;
  expiresAt: Date;
  renewsAt?: Date;
}

// Live metrics (SSE/WebSocket)
export interface LiveMetric {
  type: 'counter' | 'gauge' | 'event';
  metric: string;
  value: number;
  label: string;
  delta?: number;
  timestamp: Date;
}

export interface LiveEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  icon: string;
  timestamp: Date;
}

// API Response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

// Level system constants
export const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000, 15000,
] as const;

export const LEVEL_NAMES = [
  'Новичок', 'Стартапер', 'Энтузиаст', 'Практик',
  'Эксперт', 'Мастер', 'Архитектор', 'Визионер',
  'Легенда', 'Создатель', 'Гуру',
] as const;

export function getLevelFromXp(xp: number): number {
  let level = 0;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i;
      break;
    }
  }
  return level;
}

export function getXpToNextLevel(xp: number): number {
  const level = getLevelFromXp(xp);
  if (level >= LEVEL_THRESHOLDS.length - 1) return 0;
  return LEVEL_THRESHOLDS[level + 1] - xp;
}
