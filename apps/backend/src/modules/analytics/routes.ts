import type { EventType, LiveEvent } from '@showcase/shared';
import { and, desc, eq, gte } from 'drizzle-orm';
import Elysia, { t } from 'elysia';
import { jwtVerify } from 'jose';
import { config } from '../../config/index.ts';
import { db, schema } from '../../db/index.ts';
import { authMiddleware, requireAuth } from '../../middlewares/auth.ts';

const { analyticsEvents, trackingLinks, scenarioRuns } = schema;

// In-memory live event bus (simple pub/sub for SSE)
type Subscriber = (event: LiveEvent) => void;
const subscribers = new Set<Subscriber>();

export function emitLiveEvent(event: LiveEvent) {
  for (const sub of subscribers) {
    try {
      sub(event);
    } catch {
      subscribers.delete(sub);
    }
  }
}

export const analyticsModule = new Elysia({ prefix: '/analytics' })
  // ─── Live events SSE stream — requires valid JWT (Bearer token in query or header) ──
  .get('/live', async ({ set, request }) => {
    // Accept token from Authorization header OR ?token= query param (for EventSource which can't set headers)
    const url = new URL(request.url);
    const token =
      request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/)?.[1] ??
      url.searchParams.get('token') ??
      '';

    if (!token) {
      set.status = 401;
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Требуется авторизация' },
      };
    }

    try {
      await jwtVerify(token, new TextEncoder().encode(config.JWT_SECRET));
    } catch {
      set.status = 401;
      return {
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Невалидный токен' },
      };
    }

    set.headers['Content-Type'] = 'text/event-stream';
    set.headers['Cache-Control'] = 'no-cache';
    set.headers.Connection = 'keep-alive';
    set.headers['X-Accel-Buffering'] = 'no';

    const encoder = new TextEncoder();
    let closed = false;
    let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
    let demoTimer: ReturnType<typeof setInterval> | null = null;
    let autoCloseTimer: ReturnType<typeof setTimeout> | null = null;
    let subscriber: Subscriber | null = null;

    const cleanup = () => {
      if (closed) return;
      closed = true;
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      if (demoTimer) clearInterval(demoTimer);
      if (autoCloseTimer) clearTimeout(autoCloseTimer);
      if (subscriber) subscribers.delete(subscriber);
      heartbeatTimer = null;
      demoTimer = null;
      autoCloseTimer = null;
      subscriber = null;
    };

    const stream = new ReadableStream({
      start(controller) {
        const safeEnqueue = (data: string) => {
          if (closed) return;
          try {
            controller.enqueue(encoder.encode(data));
          } catch {
            cleanup();
          }
        };

        subscriber = (event: LiveEvent) => {
          safeEnqueue(`data: ${JSON.stringify(event)}\n\n`);
        };
        subscribers.add(subscriber);

        heartbeatTimer = setInterval(() => {
          safeEnqueue(': heartbeat\n\n');
        }, 15_000);

        demoTimer = setInterval(
          () => {
            if (closed) return;
            const demoEvent = generateDemoEvent();
            // Send only to this subscriber (demo events are per-client, not broadcast)
            if (subscriber) subscriber(demoEvent);
          },
          3000 + Math.random() * 4000,
        );

        // Auto-close after 5 min
        autoCloseTimer = setTimeout(
          () => {
            cleanup();
            try {
              controller.close();
            } catch {}
          },
          5 * 60 * 1000,
        );
      },
      cancel() {
        // Client disconnected — clean up all timers/subscribers
        cleanup();
      },
    });

    return stream;
  })

  // ─── Track event (optionally authenticated) ──────────────────────────────
  .use(authMiddleware)
  .post(
    '/events',
    async ({
      body,
      user,
    }: {
      body: {
        type: string;
        payload?: Record<string, unknown>;
        sessionId?: string;
      };
      user: { id: string } | null;
    }) => {
      const userId = user?.id ?? null;
      if (!userId) return { success: true }; // anonymous — silently ignore
      await db.insert(analyticsEvents).values({
        userId,
        type: body.type as EventType,
        payload: body.payload,
        sessionId: body.sessionId
          ? (body.sessionId as unknown as string)
          : undefined,
      });

      // Emit live event
      emitLiveEvent({
        id: crypto.randomUUID(),
        type: body.type as EventType,
        title: getEventTitle(body.type as EventType),
        description: getEventDescription(body.type as EventType, body.payload),
        icon: getEventIcon(body.type as EventType),
        timestamp: new Date(),
      });

      return { success: true };
    },
    {
      body: t.Object({
        type: t.String(),
        payload: t.Optional(t.Record(t.String(), t.Any())),
        sessionId: t.Optional(t.String()),
      }),
    },
  )

  // ─── Dashboard stats (auth required) ────────────────────────────────────
  .use(requireAuth)
  .get('/dashboard', async ({ user }: { user: { id: string } | null }) => {
    const userId = user?.id;
    if (!userId) return { success: false, error: { code: 'UNAUTHORIZED' } };
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [myLinks, recentEvents, myScenarios] = await Promise.all([
      db.select().from(trackingLinks).where(eq(trackingLinks.userId, userId)),
      db
        .select()
        .from(analyticsEvents)
        .where(
          and(
            eq(analyticsEvents.userId, userId),
            gte(analyticsEvents.createdAt, thirtyDaysAgo),
          ),
        )
        .orderBy(desc(analyticsEvents.createdAt))
        .limit(50),
      db.select().from(scenarioRuns).where(eq(scenarioRuns.userId, userId)),
    ]);

    const totalClicks = myLinks.reduce((s, l) => s + l.clickCount, 0);
    const totalConversions = myLinks.reduce((s, l) => s + l.conversionCount, 0);
    const conversionRate =
      totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

    // Event timeline (by day)
    const byDay = recentEvents.reduce<Record<string, number>>((acc, e) => {
      const day = e.createdAt.toISOString().split('T')[0];
      acc[day] = (acc[day] ?? 0) + 1;
      return acc;
    }, {});

    return {
      success: true,
      data: {
        summary: {
          totalLinks: myLinks.length,
          totalClicks,
          totalConversions,
          conversionRate: Math.round(conversionRate * 10) / 10,
          completedScenarios: myScenarios.filter((s) => s.isCompleted).length,
          totalScenarioRuns: myScenarios.length,
        },
        charts: {
          eventsByDay: Object.entries(byDay).map(([date, count]) => ({
            date,
            count,
          })),
          linksByClicks: myLinks
            .sort((a, b) => b.clickCount - a.clickCount)
            .slice(0, 5)
            .map((l) => ({
              slug: l.slug,
              clicks: l.clickCount,
              conversions: l.conversionCount,
            })),
        },
        recentEvents: recentEvents.slice(0, 20),
      },
    };
  });

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getEventTitle(type: EventType): string {
  const titles: Record<EventType, string> = {
    page_view: 'Просмотр страницы',
    button_click: 'Клик по кнопке',
    scenario_start: 'Запущен сценарий',
    scenario_complete: 'Сценарий завершён',
    tracking_link_click: 'Клик по ссылке',
    subscription_start: 'Новая подписка',
    subscription_cancel: 'Отмена подписки',
    payment_success: 'Успешная оплата',
    payment_fail: 'Ошибка оплаты',
    referral_click: 'Переход по реферальной',
    referral_convert: 'Реферальная конверсия',
    xp_earned: 'XP получен',
    achievement_unlock: 'Достижение разблокировано',
    quest_complete: 'Квест выполнен',
    streak_update: 'Обновление стрика',
  };
  return titles[type] ?? type;
}

function getEventDescription(
  type: EventType,
  payload?: Record<string, unknown>,
): string {
  if (type === 'scenario_complete')
    return `Сценарий "${payload?.scenarioTitle ?? ''}" завершён`;
  if (type === 'payment_success') return `Оплата ₽${payload?.amount ?? 0}`;
  if (type === 'xp_earned')
    return `+${payload?.amount ?? 0} XP за ${payload?.reason ?? ''}`;
  if (type === 'tracking_link_click')
    return `Клик со страны ${payload?.country ?? '?'}`;
  return '';
}

function getEventIcon(type: EventType): string {
  const icons: Record<EventType, string> = {
    page_view: '👁️',
    button_click: '🖱️',
    scenario_start: '▶️',
    scenario_complete: '✅',
    tracking_link_click: '🔗',
    subscription_start: '⭐',
    subscription_cancel: '❌',
    payment_success: '💳',
    payment_fail: '⚠️',
    referral_click: '👥',
    referral_convert: '🎉',
    xp_earned: '⚡',
    achievement_unlock: '🏆',
    quest_complete: '🗺️',
    streak_update: '🔥',
  };
  return icons[type] ?? '📊';
}

// Demo event generator for showcase effect
const DEMO_EVENTS: Array<{
  type: EventType;
  title: string;
  description: string;
  icon: string;
}> = [
  {
    type: 'tracking_link_click',
    title: 'Клик по ссылке',
    description: 'Пользователь из 🇷🇺 Москвы перешёл',
    icon: '🔗',
  },
  {
    type: 'payment_success',
    title: 'Успешная оплата',
    description: 'Подписка Pro • ₽2 990',
    icon: '💳',
  },
  {
    type: 'scenario_complete',
    title: 'Сценарий завершён',
    description: 'E-Commerce Bot за 87 сек',
    icon: '✅',
  },
  {
    type: 'xp_earned',
    title: 'XP получен',
    description: '+150 XP за завершение сценария',
    icon: '⚡',
  },
  {
    type: 'referral_convert',
    title: 'Реферал конвертирован',
    description: 'Новый участник по приглашению',
    icon: '🎉',
  },
  {
    type: 'achievement_unlock',
    title: 'Достижение разблокировано',
    description: '🏆 "Исследователь" получен',
    icon: '🏆',
  },
  {
    type: 'tracking_link_click',
    title: 'Клик по ссылке',
    description: 'Пользователь из 🇺🇦 Киева перешёл',
    icon: '🔗',
  },
  {
    type: 'subscription_start',
    title: 'Новая подписка',
    description: 'Club Growth • ₽990/мес',
    icon: '⭐',
  },
  {
    type: 'scenario_start',
    title: 'Запущен сценарий',
    description: 'Growth Funnels — демо-режим',
    icon: '▶️',
  },
  {
    type: 'streak_update',
    title: '🔥 Стрик!',
    description: '7 дней подряд активности',
    icon: '🔥',
  },
];

function generateDemoEvent(): LiveEvent {
  const template = DEMO_EVENTS[Math.floor(Math.random() * DEMO_EVENTS.length)];
  return { ...template, id: crypto.randomUUID(), timestamp: new Date() };
}
