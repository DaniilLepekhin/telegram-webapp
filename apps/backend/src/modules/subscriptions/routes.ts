import Elysia, { t } from 'elysia';
import { eq, desc, and, or } from 'drizzle-orm';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { db, schema } from '../../db/index.ts';
import { requireAuth } from '../../middlewares/auth.ts';
import { gamificationService } from '../gamification/service.ts';
import { getRedis, cacheKey } from '../../utils/redis.ts';
import { logger } from '../../utils/logger.ts';
import { config } from '../../config/index.ts';

// ─── Webhook signature verification ──────────────────────────────────────────

/**
 * Verify Lava webhook: HMAC-SHA256 of raw body with LAVA_WEBHOOK_SECRET.
 * Header: X-Api-Signature
 *
 * SECURITY: fails CLOSED — if the secret is not configured we reject the request
 * rather than letting it through. Fail-open here would allow anyone to activate
 * arbitrary subscriptions by forging the orderId.
 */
function verifyLavaSignature(rawBody: string, signature: string | null): boolean {
  const secret = config.LAVA_WEBHOOK_SECRET || undefined;
  if (!secret) {
    logger.error('LAVA_WEBHOOK_SECRET is not set — rejecting webhook (configure before going live)');
    return false; // fail closed
  }
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
 *
 * Same fail-closed policy as verifyLavaSignature above.
 */
function verifyCloudPaymentsSignature(rawBody: string, signature: string | null): boolean {
  const secret = config.CP_WEBHOOK_SECRET || undefined;
  if (!secret) {
    logger.error('CP_WEBHOOK_SECRET is not set — rejecting webhook (configure before going live)');
    return false; // fail closed
  }
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
  const baseUrl = config.WEBAPP_URL;
  const params = new URLSearchParams({ provider, amount: String(amount), uid: userId });
  return `${baseUrl}/pay?${params.toString()}`;
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
  .get('/status', async ({ user }: { user: { id: string } }) => {
    const userId = user.id;
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
    async ({ body, user, set }: { body: { plan: string; trial?: boolean; provider?: string }; user: { id: string }; set: { status: number } }) => {
      const userId = user.id;
      const plan = PLANS[body.plan as keyof typeof PLANS];

      if (!plan) {
        set.status = 400;
        return { success: false, error: { code: 'INVALID_PLAN', message: 'Неверный план' } };
      }

      const isTrial = body.trial !== false;
      const now = new Date();
      const expiresAt = new Date(now.getTime() + (isTrial ? plan.trialDays : 30) * 24 * 60 * 60 * 1000);

      // Wrap the existence check + insert in a transaction to prevent a TOCTOU race
      // where two concurrent requests both pass the "not subscribed" check and both insert.
      const subResult = await db.transaction(async (tx) => {
        const [existing] = await tx
          .select({ id: subscriptions.id, status: subscriptions.status })
          .from(subscriptions)
          .where(eq(subscriptions.userId, userId))
          .orderBy(desc(subscriptions.createdAt))
          .limit(1);

        if (existing?.status === 'active' || existing?.status === 'trial') {
          return { conflict: true, sub: null };
        }

        const [inserted] = await tx.insert(subscriptions).values({
          userId,
          plan: body.plan as 'pro' | 'enterprise',
          // Non-trial subscriptions start as 'pending' until payment webhook confirms
          status: isTrial ? 'trial' : 'pending',
          amount: isTrial ? 0 : plan.price,
          currency: plan.currency,
          paymentProvider: body.provider ?? 'lava',
          startedAt: now,
          expiresAt,
        }).returning();

        return { conflict: false, sub: inserted };
      });

      if (subResult.conflict || !subResult.sub) {
        set.status = 409;
        return { success: false, error: { code: 'ALREADY_SUBSCRIBED', message: 'Подписка уже активна' } };
      }

      const sub = subResult.sub;

      if (isTrial) {
        // Trial: upgrade role immediately (no payment required)
        await db.update(users)
          .set({ role: 'premium', updatedAt: new Date() })
          .where(eq(users.id, userId));

        // Award XP for starting trial
        await gamificationService.awardXp(userId, 500, 'Активирована пробная подписка', 'subscription_start');

        // Invalidate cache
        const redis = getRedis();
        await redis.del(cacheKey.user(userId));
      }
      // Non-trial: role upgrade happens in the payment webhook after successful payment

      // Generate payment URL if not trial
      const provider: PaymentProvider = (body.provider as PaymentProvider | undefined) ?? 'lava';
      const paymentUrl = !isTrial ? generatePaymentUrl(provider, plan.price, userId) : null;

      logger.info({ userId, plan: body.plan, isTrial, subscriptionId: sub.id }, 'Subscription started');

      return {
        success: true,
        data: {
          subscription: sub,
          paymentUrl,
          message: isTrial
            ? `✅ Trial на ${plan.trialDays} дней активирован!`
            : `✅ Оплатите подписку ${plan.name}`,
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

  // Cancel subscription (only active/trial rows — preserves history)
  .post('/cancel', async ({ user }: { user: { id: string } }) => {
    const userId = user.id;

    await db
      .update(subscriptions)
      .set({ status: 'cancelled', cancelledAt: new Date() })
      .where(and(
        eq(subscriptions.userId, userId),
        or(eq(subscriptions.status, 'active'), eq(subscriptions.status, 'trial')),
      ));

    await db.update(users)
      .set({ role: 'user', updatedAt: new Date() })
      .where(eq(users.id, userId));

    const redis = getRedis();
    await redis.del(cacheKey.user(userId));

    return { success: true, data: { message: 'Подписка отменена. Доступ сохраняется до конца периода.' } };
  })

  // Payment webhook (Lava / CloudPayments)
  // Body parsing is disabled so we can read the raw bytes for HMAC verification.
  // Re-serializing a parsed object would produce a different byte sequence (key order,
  // whitespace) and thus a different HMAC, causing all legitimately signed webhooks to fail.
  .post(
    '/webhook/:provider',
    async ({ params, set, request }) => {
      const { provider } = params;

      // Read raw bytes BEFORE any JSON parsing for correct HMAC computation
      const rawBody = await request.text();

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

      // Parse the verified body
      let payload: Record<string, unknown>;
      try {
        payload = JSON.parse(rawBody) as Record<string, unknown>;
      } catch {
        set.status = 400;
        return { success: false, error: { code: 'INVALID_BODY', message: 'Невалидный JSON' } };
      }

      logger.info({ provider }, 'Payment webhook received');

      /**
       * Activate a subscription and upgrade the user role.
       * userId is ALWAYS resolved from the DB subscription record — never trusted from
       * the webhook payload (which an attacker could forge to privilege-escalate).
       */
      async function activateSubscription(orderId: string | undefined, amount?: number): Promise<void> {
        if (!orderId) return;

        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        // Resolve subscription by externalId (orderId stored when payment was initiated)
        const [sub] = await db
          .select({ id: subscriptions.id, userId: subscriptions.userId })
          .from(subscriptions)
          .where(eq(subscriptions.externalId, orderId))
          .limit(1);

        if (!sub) {
          logger.warn({ orderId, provider }, 'Webhook: subscription not found for orderId');
          return;
        }

        await db.update(subscriptions)
          .set({ status: 'active', expiresAt, ...(amount !== undefined ? { amount } : {}) })
          .where(eq(subscriptions.id, sub.id));

        // Upgrade role — userId comes from DB, not webhook payload
        await db.update(users).set({ role: 'premium', updatedAt: new Date() }).where(eq(users.id, sub.userId));
        await gamificationService.awardXp(sub.userId, 200, 'Оплата подписки', 'payment_success');

        const redis = getRedis();
        await redis.del(cacheKey.user(sub.userId));

        logger.info({ orderId, userId: sub.userId, provider }, 'Subscription activated via webhook');
      }

      if (provider === 'lava') {
        const { orderId, status, amount } = payload as { orderId?: string; status: string; amount?: number };
        if (status === 'success') {
          await activateSubscription(orderId, amount);
        }
      }

      if (provider === 'cloudpayments') {
        const { InvoiceId: orderId, Status: status } = payload as { InvoiceId?: string; Status: string };
        if (status === 'Completed') {
          await activateSubscription(orderId);
        }
      }

      return { success: true };
    },
    {
      // type: 'text' tells Elysia NOT to JSON-parse the body — we do it manually after HMAC check
      type: 'text',
    },
  );
