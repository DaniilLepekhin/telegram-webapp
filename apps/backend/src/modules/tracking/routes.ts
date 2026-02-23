import Elysia, { t } from 'elysia';
import { eq, desc, sql, and, gte } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import geoip from 'geoip-lite';
import QRCode from 'qrcode';
import { UAParser } from 'ua-parser-js';
import { db, schema } from '../../db/index.ts';
import { requireAuth } from '../../middlewares/auth.ts';
import { rateLimit } from '../../middlewares/rateLimit.ts';
import { config } from '../../config/index.ts';

const { trackingLinks, trackingClicks } = schema;

export const trackingModule = new Elysia({ prefix: '/tracking' })
  // ─── Create link ─────────────────────────────────────────────────────────────
  .use(requireAuth)
  .post(
    '/links',
    async ({ body, user, set }: any) => {
      const slug = body.slug ?? nanoid(8);

      // Check slug uniqueness
      const existing = await db.select().from(trackingLinks).where(eq(trackingLinks.slug, slug)).limit(1);
      if (existing.length > 0) {
        set.status = 409;
        return { success: false, error: { code: 'SLUG_TAKEN', message: 'Этот slug уже занят' } };
      }

      // Generate QR code
      const trackUrl = `${config.WEBAPP_URL}/t/${slug}`;
      const qrCodeUrl = await QRCode.toDataURL(trackUrl, { width: 400, margin: 2 });

      const [link] = await db
        .insert(trackingLinks)
        .values({
          userId: (user as { id: string }).id,
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
          expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
        })
        .returning();

      return { success: true, data: { ...link, trackUrl, qrCodeUrl } };
    },
    {
      body: t.Object({
        targetUrl: t.String({ format: 'uri' }),
        slug: t.Optional(t.String({ minLength: 3, maxLength: 50 })),
        title: t.Optional(t.String({ maxLength: 255 })),
        utmSource: t.Optional(t.String()),
        utmMedium: t.Optional(t.String()),
        utmCampaign: t.Optional(t.String()),
        utmContent: t.Optional(t.String()),
        utmTerm: t.Optional(t.String()),
        abTestName: t.Optional(t.String()),
        abTestGroups: t.Optional(t.Array(t.Object({
          name: t.String(),
          weight: t.Number({ minimum: 0, maximum: 100 }),
          url: t.String(),
        }))),
        maxClicks: t.Optional(t.Number({ minimum: 1 })),
        expiresAt: t.Optional(t.String()),
      }),
    },
  )
  // ─── Get my links ─────────────────────────────────────────────────────────
  .get('/links', async ({ user }: any) => {
    const links = await db
      .select()
      .from(trackingLinks)
      .where(eq(trackingLinks.userId, (user as { id: string }).id))
      .orderBy(desc(trackingLinks.createdAt));

    return { success: true, data: links };
  })
  // ─── Get link analytics ───────────────────────────────────────────────────
  .get('/links/:id/analytics', async ({ params, user, set }: any) => {
    const [link] = await db
      .select()
      .from(trackingLinks)
      .where(and(eq(trackingLinks.id, params.id), eq(trackingLinks.userId, (user as { id: string }).id)))
      .limit(1);

    if (!link) {
      set.status = 404;
      return { success: false, error: { code: 'NOT_FOUND', message: 'Ссылка не найдена' } };
    }

    // Timeline (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const clicks = await db
      .select()
      .from(trackingClicks)
      .where(and(eq(trackingClicks.linkId, link.id), gte(trackingClicks.createdAt, thirtyDaysAgo)))
      .orderBy(desc(trackingClicks.createdAt));

    // Aggregate by country
    const byCountry = clicks.reduce<Record<string, number>>((acc, c) => {
      const country = c.country ?? 'unknown';
      acc[country] = (acc[country] ?? 0) + 1;
      return acc;
    }, {});

    // Aggregate by device
    const byDevice = clicks.reduce<Record<string, number>>((acc, c) => {
      acc[c.deviceType ?? 'unknown'] = (acc[c.deviceType ?? 'unknown'] ?? 0) + 1;
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
          conversionRate: link.clickCount > 0 ? (link.conversionCount / link.clickCount) * 100 : 0,
          byCountry,
          byDevice,
          byDay,
          byAbGroup,
          recentClicks: clicks.slice(0, 20),
        },
      },
    };
  })
  // ─── Delete link ──────────────────────────────────────────────────────────
  .delete('/links/:id', async ({ params, user, set }: any) => {
    const result = await db
      .delete(trackingLinks)
      .where(and(eq(trackingLinks.id, params.id), eq(trackingLinks.userId, (user as { id: string }).id)));

    return { success: true };
  });

// ─── Public redirect handler (no auth) ───────────────────────────────────────
export const trackingRedirectModule = new Elysia({ prefix: '/t' })
  .use(rateLimit({ max: 200, windowMs: 60_000, keyPrefix: 'track' }))
  .get('/:slug', async ({ params, request, redirect, set }) => {
    const [link] = await db
      .select()
      .from(trackingLinks)
      .where(and(eq(trackingLinks.slug, params.slug), eq(trackingLinks.isActive, true)))
      .limit(1);

    if (!link) {
      set.status = 404;
      return { success: false, error: { code: 'NOT_FOUND', message: 'Ссылка не найдена или неактивна' } };
    }

    // Check limits
    if (link.maxClicks && link.clickCount >= link.maxClicks) {
      set.status = 410;
      return { success: false, error: { code: 'LINK_EXHAUSTED', message: 'Лимит кликов исчерпан' } };
    }
    if (link.expiresAt && link.expiresAt < new Date()) {
      set.status = 410;
      return { success: false, error: { code: 'LINK_EXPIRED', message: 'Срок ссылки истёк' } };
    }

    // Parse user agent & geo
    const ua = request.headers.get('user-agent') ?? '';
    const parser = new UAParser(ua);
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '';
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

    // Log click async
    Promise.all([
      db.insert(trackingClicks).values({
        linkId: link.id,
        ip,
        country: geo?.country,
        city: geo?.city,
        deviceType: (parser.getDevice().type as 'mobile' | 'tablet' | 'desktop') ?? 'desktop',
        browser: parser.getBrowser().name,
        os: parser.getOS().name,
        utmParams: {
          source: link.utmSource ?? '',
          medium: link.utmMedium ?? '',
          campaign: link.utmCampaign ?? '',
        },
        abGroup,
      }),
      db
        .update(trackingLinks)
        .set({
          clickCount: sql`${trackingLinks.clickCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(trackingLinks.id, link.id)),
    ]).catch(() => {});

    return redirect(targetUrl, 302);
  });
