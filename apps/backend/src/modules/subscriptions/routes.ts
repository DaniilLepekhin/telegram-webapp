import Elysia, { t } from 'elysia';
import { eq, desc } from 'drizzle-orm';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { db, schema } from '../../db/index.ts';
import { requireAuth } from '../../middlewares/auth.ts';
import { gamificationService } from '../gamification/service.ts';
import { getRedis, cacheKey } from '../../utils/redis.ts';
import { logger } from '../../utils/logger.ts';

// ─── Webhook signature verification ──────────────────────────────────────────

/**
 * Verify Lava webhook: HMAC-SHA256 of raw body with LAVA_WEBHOOK_SECRET.
 * Header: X-Api-Signature
 */
function verifyLavaSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.LAVA_WEBHOOK_SECRET;
  if (!secret) return true; // secret not configured — skip in dev
  if (!signature) return false;
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

/**
 * Verify CloudPayments webhook: HMAC-SHA256(base64) of raw body with CP_WEBHOOK_SECRET.
 * Header: X-Content-HMAC
 */
function verifyCloudPaymentsSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.CP_WEBHOOK_SECRET;
  if (!secret) return true;
  if (!signature) return false;
  const expected = createHmac('sha256', secret).update(rawBody).digest('base64');
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

const { subscriptions, users } = schema;

// ─── Payment Adapters ─────────────────────────────────────────────────────────
type PaymentProvider = 'lava' | 'cloudpayments' | 'telegram';

function generatePaymentUrl(provider: PaymentProvider, amount: number, userId: string): string {
  const baseUrl = process.env.WEBAPP_URL ?? 'https://example.com';
  // In production — real payment form URLs
  return `${baseUrl}/pay?provider=${provider}&amount=${amount}&uid=${userId}`;
}

// ─── Plans config ─────────────────────────────────────────────────────────────
export const PLANS = {
  pro: {
    id: 'pro',
    name: 'Showcase Pro',
    price: 2990,
    currency: 'RUB',
    trialDays: 7,
    features: [
      'Неограниченные трекинг-ссылки',
      'A/B тесты без лимитов',
      'Полная аналитика (30 дней)',
      'AI-генерация воронок',
      'White-label пресеты',
      'Экспорт отчётов',
      'API доступ',
      'Приоритетная поддержка',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Showcase Enterprise',
    price: 9990,
    currency: 'RUB',
    trialDays: 14,
    features: ['Всё из Pro', 'Команда до 10 человек', 'Dedicated support', 'SLA 99.9%', 'Custom интеграции'],
  },
} as const;

export const subscriptionsModule = new Elysia({ prefix: '/subscriptions' })
  // ─── Plans (public) ───────────────────────────────────────────────────────
  .get('/plans', () => ({
    success: true,
    data: Object.values(PLANS),
  }))

  // ─── Auth required ────────────────────────────────────────────────────────
  .use(requireAuth)

  // Current subscription status
  .get('/status', async ({ user, set }: any) => {
    const userId = (user as { id: string }).id;
    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);

    const [userData] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    return {
      success: true,
      data: {
        isActive: sub?.status === 'active' || sub?.status === 'trial',
        plan: sub?.plan ?? 'free',
        status: sub?.status ?? 'none',
        expiresAt: sub?.expiresAt,
        role: userData?.role,
      },
    };
  })

  // Start subscription / trial
  .post(
    '/start',
    async ({ body, user, set }: any) => {
      const userId = (user as { id: string }).id;
      const plan = PLANS[body.plan as keyof typeof PLANS];

      if (!plan) {
        set.status = 400;
        return { success: false, error: { code: 'INVALID_PLAN', message: 'Неверный план' } };
      }

      // Check if already subscribed
      const [existing] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId))
        .orderBy(desc(subscriptions.createdAt))
        .limit(1);

      if (existing?.status === 'active') {
        set.status = 409;
        return { success: false, error: { code: 'ALREADY_SUBSCRIBED', message: 'Подписка уже активна' } };
      }

      // Trial or direct subscription
      const isTrial = body.trial !== false;
      const now = new Date();
      const expiresAt = new Date(now.getTime() + (isTrial ? plan.trialDays : 30) * 24 * 60 * 60 * 1000);

      const [sub] = await db.insert(subscriptions).values({
        userId,
        plan: body.plan as 'pro' | 'enterprise',
        status: isTrial ? 'trial' : 'active',
        amount: isTrial ? 0 : plan.price,
        currency: plan.currency,
        paymentProvider: body.provider ?? 'lava',
        startedAt: now,
        expiresAt,
      }).returning();

      // Upgrade user role
      await db.update(users)
        .set({ role: 'premium', updatedAt: new Date() })
        .where(eq(users.id, userId));

      // Award XP for subscribing
      await gamificationService.awardXp(userId, 500, 'Активирована подписка Pro', 'subscription_start');

      // Invalidate cache
      const redis = getRedis();
      await redis.del(cacheKey.user(userId));

      // Generate payment URL if not trial
      const paymentUrl = !isTrial
        ? generatePaymentUrl(body.provider as PaymentProvider ?? 'lava', plan.price, userId)
        : null;

      logger.info({ userId, plan: body.plan, isTrial }, 'Subscription started');

      return {
        success: true,
        data: {
          subscription: sub,
          paymentUrl,
          message: isTrial
            ? `✅ Trial на ${plan.trialDays} дней активирован!`
            : `✅ Подписка ${plan.name} активирована!`,
        },
      };
    },
    {
      body: t.Object({
        plan: t.String(),
        trial: t.Optional(t.Boolean()),
        provider: t.Optional(t.String()),
      }),
    },
  )

  // Cancel subscription
  .post('/cancel', async ({ user }: any) => {
    const userId = (user as { id: string }).id;

    await db
      .update(subscriptions)
      .set({ status: 'cancelled', cancelledAt: new Date() })
      .where(eq(subscriptions.userId, userId));

    await db.update(users)
      .set({ role: 'user', updatedAt: new Date() })
      .where(eq(users.id, userId));

    const redis = getRedis();
    await redis.del(cacheKey.user(userId));

    return { success: true, data: { message: 'Подписка отменена. Доступ сохраняется до конца периода.' } };
  })

  // Payment webhook (Lava / CloudPayments)
  .post(
    '/webhook/:provider',
    async ({ params, body, set, request }) => {
      const { provider } = params;
      const payload = body as Record<string, unknown>;

      // Read raw body text for HMAC verification
      const rawBody = JSON.stringify(payload);

      // ── Signature verification ────────────────────────────────────────────
      if (provider === 'lava') {
        const sig = request.headers.get('x-api-signature');
        if (!verifyLavaSignature(rawBody, sig)) {
          logger.warn({ provider }, 'Webhook signature verification failed');
          set.status = 401;
          return { success: false, error: { code: 'INVALID_SIGNATURE', message: 'Неверная подпись вебхука' } };
        }
      }

      if (provider === 'cloudpayments') {
        const sig = request.headers.get('x-content-hmac');
        if (!verifyCloudPaymentsSignature(rawBody, sig)) {
          logger.warn({ provider }, 'Webhook signature verification failed');
          set.status = 401;
          return { success: false, error: { code: 'INVALID_SIGNATURE', message: 'Неверная подпись вебхука' } };
        }
      }

      logger.info({ provider, payload }, 'Payment webhook received');

      if (provider === 'lava') {
        const { userId, status, amount } = payload as { userId: string; status: string; amount: number };
        if (status === 'success') {
          const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          await db.update(subscriptions)
            .set({ status: 'active', expiresAt, amount })
            .where(eq(subscriptions.userId, userId));
          await db.update(users).set({ role: 'premium' }).where(eq(users.id, userId));
          await gamificationService.awardXp(userId, 200, 'Оплата подписки', 'payment_success');
        }
      }

      if (provider === 'cloudpayments') {
        const { AccountId: userId, Status: status } = payload as { AccountId: string; Status: string };
        if (status === 'Completed') {
          const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          await db.update(subscriptions)
            .set({ status: 'active', expiresAt })
            .where(eq(subscriptions.userId, userId));
        }
      }

      return { success: true };
    },
    {
      body: t.Record(t.String(), t.Any()),
    },
  );
