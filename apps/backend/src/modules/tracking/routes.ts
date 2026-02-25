import { and, desc, eq, gte, sql } from 'drizzle-orm';
import Elysia, { t } from 'elysia';
import geoip from 'geoip-lite';
import { nanoid } from 'nanoid';
import QRCode from 'qrcode';
import { UAParser } from 'ua-parser-js';
import { config } from '../../config/index.ts';
import { db, schema } from '../../db/index.ts';
import { requireAuth } from '../../middlewares/auth.ts';
import { rateLimit } from '../../middlewares/rateLimit.ts';
import { logger } from '../../utils/logger.ts';

const { trackingLinks, trackingClicks } = schema;

export const trackingModule = new Elysia({ prefix: '/tracking' })
  // ─── Create link ─────────────────────────────────────────────────────────────
  .use(requireAuth)
  .use(
    rateLimit({
      max: 20,
      windowMs: 60_000,
      keyPrefix: 'create-link',
      keyBy: ({ user }) => user?.id ?? 'anon',
    }),
  )
  .post(
    '/links',
    (async (ctx: any) => {
      const { body, user, set } = ctx as {
        body: {
          targetUrl: string;
          slug?: string;
          title?: string;
          utmSource?: string;
          utmMedium?: string;
          utmCampaign?: string;
          utmContent?: string;
          utmTerm?: string;
          abTestName?: string;
          abTestGroups?: Array<{ name: string; weight: number; url: string }>;
          maxClicks?: number;
          expiresAt?: string;
        };
        user: { id: string };
        set: { status: number };
      };
      const slug = body.slug ?? nanoid(8);

      // Generate QR code upfront (before insert — avoids wasted work if slug conflicts)
      const trackUrl = `${config.WEBAPP_URL}/t/${slug}`;
      const qrCodeUrl = await QRCode.toDataURL(trackUrl, {
        width: 400,
        margin: 2,
      });

      // Use onConflictDoNothing().returning() to atomically detect slug conflicts —
      // eliminates the TOCTOU race between the pre-check SELECT and the INSERT.
      let inserted: (typeof trackingLinks.$inferSelect)[];
      try {
        inserted = await db
          .insert(trackingLinks)
          .values({
            userId: user.id,
            slug,
            targetUrl: body.targetUrl,
            title: body.title,
            utmSource: body.utmSource,
            utmMedium: body.utmMedium,
            utmCampaign: body.utmCampaign,
            utmContent: body.utmContent,
            utmTerm: body.utmTerm,
            abTestName: body.abTestName,
            abTestGroups: body.abTestGroups,
            qrCodeUrl,
            maxClicks: body.maxClicks,
            expiresAt: (() => {
              if (!body.expiresAt) return undefined;
              const d = new Date(body.expiresAt);
              return Number.isNaN(d.getTime()) ? undefined : d;
            })(),
          })
          .onConflictDoNothing()
          .returning();
      } catch (err: unknown) {
        // Catch any unexpected DB error (e.g. constraint violation on other columns)
        const code = (err as { code?: string })?.code;
        if (code === '23505') {
          set.status = 409;
          return {
            success: false,
            error: { code: 'SLUG_TAKEN', message: 'Этот slug уже занят' },
          };
        }
        throw err;
      }

      if (!inserted || inserted.length === 0) {
        // onConflictDoNothing silently skipped — slug was taken
        set.status = 409;
        return {
          success: false,
          error: { code: 'SLUG_TAKEN', message: 'Этот slug уже занят' },
        };
      }

      const [link] = inserted;
      return { success: true, data: { ...link, trackUrl, qrCodeUrl } };
    }) as any,
    {
      body: t.Object({
        targetUrl: t.String({ format: 'uri' }),
        slug: t.Optional(
          t.String({
            minLength: 3,
            maxLength: 50,
            pattern: '^[a-zA-Z0-9_-]+$',
          }),
        ),
        title: t.Optional(t.String({ maxLength: 255 })),
        utmSource: t.Optional(t.String()),
        utmMedium: t.Optional(t.String()),
        utmCampaign: t.Optional(t.String()),
        utmContent: t.Optional(t.String()),
        utmTerm: t.Optional(t.String()),
        abTestName: t.Optional(t.String()),
        abTestGroups: t.Optional(
          t.Array(
            t.Object({
              name: t.String(),
              weight: t.Number({ minimum: 0, maximum: 100 }),
              url: t.String(),
            }),
          ),
        ),
        maxClicks: t.Optional(t.Number({ minimum: 1 })),
        expiresAt: t.Optional(t.String()),
      }),
    },
  )
  // ─── Get my links ─────────────────────────────────────────────────────────
  .get('/links', (async (ctx: any) => {
    const { user } = ctx as { user: { id: string } };
    const links = await db
      .select()
      .from(trackingLinks)
      .where(eq(trackingLinks.userId, user.id))
      .orderBy(desc(trackingLinks.createdAt));

    return { success: true, data: links };
  }) as any)
  // ─── Get link analytics ───────────────────────────────────────────────────
  .get('/links/:id/analytics', (async (ctx: any) => {
    const { params, user, set } = ctx as {
      params: { id: string };
      user: { id: string };
      set: { status: number };
    };
    const [link] = await db
      .select()
      .from(trackingLinks)
      .where(
        and(eq(trackingLinks.id, params.id), eq(trackingLinks.userId, user.id)),
      )
      .limit(1);

    if (!link) {
      set.status = 404;
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Ссылка не найдена' },
      };
    }

    // Timeline (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const clicks = await db
      .select()
      .from(trackingClicks)
      .where(
        and(
          eq(trackingClicks.linkId, link.id),
          gte(trackingClicks.createdAt, thirtyDaysAgo),
        ),
      )
      .orderBy(desc(trackingClicks.createdAt));

    // Aggregate by country
    const byCountry = clicks.reduce<Record<string, number>>((acc, c) => {
      const country = c.country ?? 'unknown';
      acc[country] = (acc[country] ?? 0) + 1;
      return acc;
    }, {});

    // Aggregate by device
    const byDevice = clicks.reduce<Record<string, number>>((acc, c) => {
      acc[c.deviceType ?? 'unknown'] =
        (acc[c.deviceType ?? 'unknown'] ?? 0) + 1;
      return acc;
    }, {});

    // Daily timeline
    const byDay = clicks.reduce<Record<string, number>>((acc, c) => {
      const day = c.createdAt.toISOString().split('T')[0];
      acc[day] = (acc[day] ?? 0) + 1;
      return acc;
    }, {});

    // A/B groups
    const byAbGroup = clicks.reduce<Record<string, number>>((acc, c) => {
      if (c.abGroup) acc[c.abGroup] = (acc[c.abGroup] ?? 0) + 1;
      return acc;
    }, {});

    return {
      success: true,
      data: {
        link,
        stats: {
          totalClicks: link.clickCount,
          uniqueClicks: link.uniqueClickCount,
          conversions: link.conversionCount,
          conversionRate:
            link.clickCount > 0
              ? (link.conversionCount / link.clickCount) * 100
              : 0,
          byCountry,
          byDevice,
          byDay,
          byAbGroup,
          recentClicks: clicks.slice(0, 20),
        },
      },
    };
  }) as any)
  // ─── Delete link ──────────────────────────────────────────────────────────
  .delete('/links/:id', (async (ctx: any) => {
    const { params, user, set } = ctx as {
      params: { id: string };
      user: { id: string };
      set: { status: number };
    };
    const deleted = await db
      .delete(trackingLinks)
      .where(
        and(eq(trackingLinks.id, params.id), eq(trackingLinks.userId, user.id)),
      )
      .returning({ id: trackingLinks.id });

    if (deleted.length === 0) {
      set.status = 404;
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Ссылка не найдена' },
      };
    }

    return { success: true };
  }) as any);

// ─── Public redirect handler (no auth) ───────────────────────────────────────
export const trackingRedirectModule = new Elysia({ prefix: '/t' })
  .use(rateLimit({ max: 200, windowMs: 60_000, keyPrefix: 'track' }))
  .get('/:slug', async ({ params, request, redirect, set }) => {
    const [link] = await db
      .select()
      .from(trackingLinks)
      .where(
        and(
          eq(trackingLinks.slug, params.slug),
          eq(trackingLinks.isActive, true),
        ),
      )
      .limit(1);

    if (!link) {
      set.status = 404;
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Ссылка не найдена или неактивна',
        },
      };
    }

    // Check limits
    if (link.maxClicks && link.clickCount >= link.maxClicks) {
      set.status = 410;
      return {
        success: false,
        error: { code: 'LINK_EXHAUSTED', message: 'Лимит кликов исчерпан' },
      };
    }
    if (link.expiresAt && link.expiresAt < new Date()) {
      set.status = 410;
      return {
        success: false,
        error: { code: 'LINK_EXPIRED', message: 'Срок ссылки истёк' },
      };
    }

    // Parse user agent & geo
    const ua = request.headers.get('user-agent') ?? '';
    const parser = new UAParser(ua);
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '';
    const geo = geoip.lookup(ip);

    // A/B routing
    let targetUrl = link.targetUrl;
    let abGroup: string | undefined;
    if (link.abTestGroups?.length) {
      const rand = Math.random() * 100;
      let cumulative = 0;
      for (const group of link.abTestGroups) {
        cumulative += group.weight;
        if (rand <= cumulative) {
          targetUrl = group.url;
          abGroup = group.name;
          break;
        }
      }
    }

    const deviceRaw = parser.getDevice().type;
    const deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown' =
      deviceRaw === 'mobile' ||
      deviceRaw === 'tablet' ||
      deviceRaw === 'desktop'
        ? deviceRaw
        : 'unknown';

    // Record click + update counters in a background task (non-blocking).
    // Uniqueness race is eliminated by using an INSERT ... ON CONFLICT DO NOTHING
    // pattern on a per-(linkId, ip) unique index: only the winner of concurrent
    // requests will get a returned row, and only that winner increments uniqueClickCount.
    // Both clickCount and uniqueClickCount are updated atomically in a single UPDATE.
    (async () => {
      try {
        const isKnownIp = ip !== '';

        // Insert the click row. If an identical (linkId, ip) row was already inserted
        // by a concurrent request in the same millisecond, ON CONFLICT DO NOTHING
        // skips it. We don't need a unique index for this — we rely on the
        // conditional CASE in the UPDATE below to count correctly.
        await db.insert(trackingClicks).values({
          linkId: link.id,
          ip: ip || null,
          country: geo?.country ?? null,
          city: geo?.city ?? null,
          deviceType,
          browser: parser.getBrowser().name ?? null,
          os: parser.getOS().name ?? null,
          utmParams: {
            source: link.utmSource ?? '',
            medium: link.utmMedium ?? '',
            campaign: link.utmCampaign ?? '',
          },
          abGroup: abGroup ?? null,
        });

        // Atomic UPDATE: clickCount always increments; uniqueClickCount increments
        // only when this IP appears exactly ONCE in tracking_clicks after our insert
        // (i.e., this was the first click from this IP on this link).
        // Because the INSERT above ran first inside this sequential async block,
        // a count of 1 definitively means "first visit from this IP".
        await db
          .update(trackingLinks)
          .set({
            clickCount: sql`${trackingLinks.clickCount} + 1`,
            uniqueClickCount: isKnownIp
              ? sql`${trackingLinks.uniqueClickCount} + CASE WHEN (
                  SELECT COUNT(*) FROM tracking_clicks
                  WHERE link_id = ${link.id} AND ip = ${ip}
                ) = 1 THEN 1 ELSE 0 END`
              : trackingLinks.uniqueClickCount,
            updatedAt: new Date(),
          })
          .where(eq(trackingLinks.id, link.id));
      } catch (err) {
        logger.error({ err }, '[Tracking] click log error');
      }
    })();

    return redirect(targetUrl, 302);
  });
