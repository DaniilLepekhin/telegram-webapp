import {
  pgTable, pgEnum, text, integer, bigint, boolean,
  timestamp, jsonb, uuid, varchar, index, uniqueIndex,
  primaryKey
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── Enums ────────────────────────────────────────────────────────────────────
export const userRoleEnum = pgEnum('user_role', ['guest', 'user', 'premium', 'admin']);
export const subscriptionPlanEnum = pgEnum('subscription_plan', ['free', 'pro', 'enterprise']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['pending', 'active', 'trial', 'past_due', 'cancelled', 'expired']);
export const deviceTypeEnum = pgEnum('device_type', ['mobile', 'tablet', 'desktop', 'unknown']);
export const eventTypeEnum = pgEnum('event_type', [
  'page_view', 'button_click', 'scenario_start', 'scenario_complete',
  'tracking_link_click', 'subscription_start', 'subscription_cancel',
  'payment_success', 'payment_fail', 'referral_click', 'referral_convert',
  'xp_earned', 'achievement_unlock', 'quest_complete', 'streak_update',
]);
export const scenarioIdEnum = pgEnum('scenario_id', ['ecom', 'club', 'service', 'education', 'support', 'funnel']);
export const achievementRarityEnum = pgEnum('achievement_rarity', ['common', 'rare', 'epic', 'legendary']);

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  telegramId: bigint('telegram_id', { mode: 'number' }).notNull().unique(),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }),
  username: varchar('username', { length: 255 }),
  photoUrl: text('photo_url'),
  languageCode: varchar('language_code', { length: 10 }).default('ru'),
  isPremium: boolean('is_premium').default(false).notNull(),
  role: userRoleEnum('role').default('user').notNull(),
  // Gamification
  xp: integer('xp').default(0).notNull(),
  level: integer('level').default(0).notNull(),
  streak: integer('streak').default(0).notNull(),
  longestStreak: integer('longest_streak').default(0).notNull(),
  energyBalance: integer('energy_balance').default(0).notNull(),
  lastActivityAt: timestamp('last_activity_at').defaultNow(),
  // Referral — FK ensures referredById must point to a valid user
  referralCode: varchar('referral_code', { length: 20 }).unique(),
  referredById: uuid('referred_by_id').references(() => users.id, { onDelete: 'set null' }),
  // Meta — use sql`'{}'::jsonb` as default instead of a shared mutable object literal
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
  // telegramId already has a unique index from .unique() above — skip redundant index
  index('users_username_idx').on(t.username),
  // referralCode already has a unique index from .unique() above — skip redundant index
]);

// ─── Sessions ─────────────────────────────────────────────────────────────────
export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  refreshToken: text('refresh_token').notNull().unique(),
  deviceInfo: jsonb('device_info').$type<{ ua?: string; ip?: string; platform?: string }>(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('sessions_user_id_idx').on(t.userId),
  index('sessions_refresh_token_idx').on(t.refreshToken),
]);

// ─── Subscriptions ────────────────────────────────────────────────────────────
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  plan: subscriptionPlanEnum('plan').default('free').notNull(),
  status: subscriptionStatusEnum('status').default('active').notNull(),
  amount: integer('amount').default(0),
  currency: varchar('currency', { length: 3 }).default('RUB'),
  paymentProvider: varchar('payment_provider', { length: 50 }),
  externalId: varchar('external_id', { length: 255 }),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
  cancelledAt: timestamp('cancelled_at'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('subscriptions_user_id_idx').on(t.userId),
]);

// ─── Tracking Links ───────────────────────────────────────────────────────────
export const trackingLinks = pgTable('tracking_links', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  targetUrl: text('target_url').notNull(),
  title: varchar('title', { length: 255 }),
  utmSource: varchar('utm_source', { length: 100 }),
  utmMedium: varchar('utm_medium', { length: 100 }),
  utmCampaign: varchar('utm_campaign', { length: 100 }),
  utmContent: varchar('utm_content', { length: 100 }),
  utmTerm: varchar('utm_term', { length: 100 }),
  abTestName: varchar('ab_test_name', { length: 100 }),
  abTestGroups: jsonb('ab_test_groups').$type<Array<{ name: string; weight: number; url: string }>>(),
  qrCodeUrl: text('qr_code_url'),
  clickCount: integer('click_count').default(0).notNull(),
  uniqueClickCount: integer('unique_click_count').default(0).notNull(),
  conversionCount: integer('conversion_count').default(0).notNull(),
  maxClicks: integer('max_clicks'),
  isActive: boolean('is_active').default(true).notNull(),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
  // slug already has a unique index from .unique() above — skip redundant uniqueIndex
  index('tracking_links_user_id_idx').on(t.userId),
]);

// ─── Tracking Clicks ──────────────────────────────────────────────────────────
export const trackingClicks = pgTable('tracking_clicks', {
  id: uuid('id').defaultRandom().primaryKey(),
  linkId: uuid('link_id').notNull().references(() => trackingLinks.id, { onDelete: 'cascade' }),
  telegramUserId: bigint('telegram_user_id', { mode: 'number' }),
  ip: varchar('ip', { length: 45 }),
  country: varchar('country', { length: 2 }),
  city: varchar('city', { length: 100 }),
  deviceType: deviceTypeEnum('device_type').default('unknown'),
  browser: varchar('browser', { length: 100 }),
  os: varchar('os', { length: 100 }),
  utmParams: jsonb('utm_params').$type<Record<string, string>>(),
  abGroup: varchar('ab_group', { length: 50 }),
  isConverted: boolean('is_converted').default(false).notNull(),
  convertedAt: timestamp('converted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('tracking_clicks_link_id_idx').on(t.linkId),
  index('tracking_clicks_created_at_idx').on(t.createdAt),
]);

// ─── Analytics Events ─────────────────────────────────────────────────────────
export const analyticsEvents = pgTable('analytics_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  sessionId: uuid('session_id'),
  type: eventTypeEnum('type').notNull(),
  payload: jsonb('payload').$type<Record<string, unknown>>().default({}),
  ip: varchar('ip', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('analytics_events_user_id_idx').on(t.userId),
  index('analytics_events_type_idx').on(t.type),
  index('analytics_events_created_at_idx').on(t.createdAt),
]);

// ─── Demo Scenario Runs ───────────────────────────────────────────────────────
export const scenarioRuns = pgTable('scenario_runs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  scenarioId: scenarioIdEnum('scenario_id').notNull(),
  completedSteps: integer('completed_steps').default(0).notNull(),
  totalSteps: integer('total_steps').notNull(),
  isCompleted: boolean('is_completed').default(false).notNull(),
  timeToComplete: integer('time_to_complete_ms'),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
}, (t) => [
  index('scenario_runs_user_id_idx').on(t.userId),
  index('scenario_runs_scenario_id_idx').on(t.scenarioId),
]);

// ─── Gamification: XP History ─────────────────────────────────────────────────
export const xpHistory = pgTable('xp_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(),
  reason: varchar('reason', { length: 255 }).notNull(),
  actionType: varchar('action_type', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('xp_history_user_id_idx').on(t.userId),
]);

// ─── Gamification: Achievements ───────────────────────────────────────────────
export const achievements = pgTable('achievements', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  icon: varchar('icon', { length: 100 }).notNull(),
  rarity: achievementRarityEnum('rarity').default('common').notNull(),
  xpReward: integer('xp_reward').default(0).notNull(),
  condition: jsonb('condition').$type<Record<string, unknown>>().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
});

export const userAchievements = pgTable('user_achievements', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  achievementId: varchar('achievement_id', { length: 50 }).notNull().references(() => achievements.id),
  unlockedAt: timestamp('unlocked_at').defaultNow().notNull(),
}, (t) => [
  primaryKey({ columns: [t.userId, t.achievementId] }),
]);

// ─── Gamification: Quests ─────────────────────────────────────────────────────
export const quests = pgTable('quests', {
  id: varchar('id', { length: 50 }).primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  icon: varchar('icon', { length: 100 }).notNull(),
  xpReward: integer('xp_reward').default(0).notNull(),
  energyReward: integer('energy_reward').default(0).notNull(),
  steps: jsonb('steps').$type<Array<{ id: string; title: string; target: number }>>().notNull(),
  isRepeatable: boolean('is_repeatable').default(false).notNull(),
  resetPeriod: varchar('reset_period', { length: 20 }), // 'daily' | 'weekly' | 'monthly'
  isActive: boolean('is_active').default(true).notNull(),
});

export const userQuests = pgTable('user_quests', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  questId: varchar('quest_id', { length: 50 }).notNull().references(() => quests.id),
  progress: jsonb('progress').$type<Record<string, number>>().default({}),
  isCompleted: boolean('is_completed').default(false).notNull(),
  completedAt: timestamp('completed_at'),
  startedAt: timestamp('started_at').defaultNow().notNull(),
}, (t) => [
  primaryKey({ columns: [t.userId, t.questId] }),
]);

// ─── Referrals ────────────────────────────────────────────────────────────────
export const referrals = pgTable('referrals', {
  id: uuid('id').defaultRandom().primaryKey(),
  referrerId: uuid('referrer_id').notNull().references(() => users.id),
  referredId: uuid('referred_id').notNull().references(() => users.id),
  level: integer('level').default(1).notNull(), // 1-5
  xpRewarded: integer('xp_rewarded').default(0).notNull(),
  energyRewarded: integer('energy_rewarded').default(0).notNull(),
  isRewarded: boolean('is_rewarded').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('referrals_referrer_id_idx').on(t.referrerId),
  uniqueIndex('referrals_referred_id_unique').on(t.referredId),
]);

// ─── Audit Log ────────────────────────────────────────────────────────────────
export const auditLog = pgTable('audit_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 100 }).notNull(),
  resource: varchar('resource', { length: 100 }),
  resourceId: varchar('resource_id', { length: 255 }),
  ip: varchar('ip', { length: 45 }),
  userAgent: text('user_agent'),
  details: jsonb('details').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('audit_log_user_id_idx').on(t.userId),
  index('audit_log_action_idx').on(t.action),
  index('audit_log_created_at_idx').on(t.createdAt),
]);

// ─── Rate Limit Store (in DB fallback) ───────────────────────────────────────
export const rateLimitStore = pgTable('rate_limit_store', {
  key: varchar('key', { length: 255 }).primaryKey(),
  count: integer('count').default(0).notNull(),
  resetAt: timestamp('reset_at').notNull(),
});

// ─── Relations ────────────────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ many, one }) => ({
  sessions: many(sessions),
  subscriptions: many(subscriptions),
  trackingLinks: many(trackingLinks),
  analyticsEvents: many(analyticsEvents),
  xpHistory: many(xpHistory),
  userAchievements: many(userAchievements),
  userQuests: many(userQuests),
  referralsMade: many(referrals, { relationName: 'referrer' }),
  referralReceived: one(referrals, { relationName: 'referred', fields: [users.id], references: [referrals.referredId] }),
  scenarioRuns: many(scenarioRuns),
}));

export const trackingLinksRelations = relations(trackingLinks, ({ one, many }) => ({
  user: one(users, { fields: [trackingLinks.userId], references: [users.id] }),
  clicks: many(trackingClicks),
}));

export const trackingClicksRelations = relations(trackingClicks, ({ one }) => ({
  link: one(trackingLinks, { fields: [trackingClicks.linkId], references: [trackingLinks.id] }),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, { fields: [userAchievements.userId], references: [users.id] }),
  achievement: one(achievements, { fields: [userAchievements.achievementId], references: [achievements.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
}));

export const xpHistoryRelations = relations(xpHistory, ({ one }) => ({
  user: one(users, { fields: [xpHistory.userId], references: [users.id] }),
}));

export const scenarioRunsRelations = relations(scenarioRuns, ({ one }) => ({
  user: one(users, { fields: [scenarioRuns.userId], references: [users.id] }),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, { relationName: 'referrer', fields: [referrals.referrerId], references: [users.id] }),
  referred: one(users, { relationName: 'referred', fields: [referrals.referredId], references: [users.id] }),
}));

export const userQuestsRelations = relations(userQuests, ({ one }) => ({
  user: one(users, { fields: [userQuests.userId], references: [users.id] }),
  quest: one(quests, { fields: [userQuests.questId], references: [quests.id] }),
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const questsRelations = relations(quests, ({ many }) => ({
  userQuests: many(userQuests),
}));
