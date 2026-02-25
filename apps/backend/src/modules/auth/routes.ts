import Elysia, { t } from 'elysia';
import { validateTelegramInitData } from './telegram.ts';
import { authService } from './service.ts';
import { gamificationService } from '../gamification/service.ts';
import { config, isProd } from '../../config/index.ts';
import { logger } from '../../utils/logger.ts';
import { rateLimit } from '../../middlewares/rateLimit.ts';

// ─── Rate-limited sub-app: only /telegram (5 req/min per IP) ─────────────────
// IMPORTANT: rateLimit is scoped to this sub-instance so /refresh and /logout
// are NOT affected — they must be free to call during normal token refresh flow.
const telegramLoginRoute = new Elysia()
  .use(rateLimit({ max: 5, windowMs: 60_000, keyPrefix: 'auth-telegram' }))
  .post(
    '/telegram',
    // biome-ignore lint/suspicious/noExplicitAny: Elysia JWT plugin injects `jwt` dynamically; no public type export
    async ({ body, cookie: { accessToken, refreshToken: rfCookie }, set, request, jwt }: any) => {
      const { initData } = body;

      const { valid, data } = validateTelegramInitData(initData, config.TELEGRAM_BOT_TOKEN);
      if (!valid || !data?.user) {
        set.status = 401;
        return { success: false, error: { code: 'INVALID_INIT_DATA', message: 'Невалидные данные Telegram' } };
      }

      // findOrCreateUser always runs an upsert and returns a flag indicating whether
      // this was a brand-new INSERT (vs. an UPDATE of an existing row).
      const { user, isNew } = await authService.findOrCreateUser(data.user);

      // Grant first_login achievement only for genuinely new accounts.
      // We rely on the DB upsert return value (isNew) rather than a fragile wall-clock
      // window — the "30-second" heuristic broke when Postgres was slow or the server
      // clock drifted relative to the DB clock.
      if (isNew) {
        gamificationService.checkAndAwardAchievement(user.id, 'first_login').catch(() => {});
        gamificationService.awardXp(user.id, 50, 'Первый вход в приложение', 'first_login').catch(() => {});
      }

      const tokens = await authService.createTokens(user.id, user.telegramId, user.role, {
        ua: request.headers.get('user-agent') ?? undefined,
        ip: request.headers.get('x-forwarded-for') ?? undefined,
      });

      const signedAccess = await jwt.sign({
        sub: user.id,
        telegramId: user.telegramId,
        role: user.role,
      });
      tokens.accessToken = signedAccess;

      const sameSite = isProd ? 'none' : 'lax';
      accessToken.set({ value: signedAccess, httpOnly: true, secure: isProd, sameSite, maxAge: 15 * 60, path: '/' });
      rfCookie.set({ value: tokens.refreshToken, httpOnly: true, secure: isProd, sameSite, maxAge: 30 * 24 * 60 * 60, path: '/' });

      logger.info({ userId: user.id }, 'User authenticated');

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            telegramId: user.telegramId,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            photoUrl: user.photoUrl,
            isPremium: user.isPremium,
            role: user.role,
            xp: user.xp,
            level: user.level,
            streak: user.streak,
            energyBalance: user.energyBalance,
          },
          accessToken: signedAccess,
          expiresIn: 15 * 60,
        },
      };
    },
    {
      body: t.Object({ initData: t.String({ minLength: 10 }) }),
    },
  );

// ─── Main auth module ─────────────────────────────────────────────────────────
export const authModule = new Elysia({ prefix: '/auth' })
  // Mount rate-limited /telegram sub-route
  .use(telegramLoginRoute)
  // /refresh and /logout are intentionally NOT rate-limited
  // biome-ignore lint/suspicious/noExplicitAny: Elysia JWT plugin injects `jwt` dynamically
  .post('/refresh', async ({ cookie: { refreshToken: rfCookie, accessToken: atCookie }, jwt, set }: any) => {
    const token = rfCookie.value;
    if (!token) {
      set.status = 401;
      return { success: false, error: { code: 'NO_REFRESH_TOKEN', message: 'Токен не найден' } };
    }

    const payload = await authService.refreshSession(token as string);
    if (!payload) {
      set.status = 401;
      rfCookie.remove();
      atCookie.remove();
      return { success: false, error: { code: 'INVALID_REFRESH_TOKEN', message: 'Невалидный токен' } };
    }

    const newAccess = await jwt.sign({ sub: payload.userId, telegramId: payload.telegramId, role: payload.role });
    atCookie.set({ value: newAccess, httpOnly: true, secure: isProd, sameSite: isProd ? 'none' : 'lax', maxAge: 15 * 60, path: '/' });

    return { success: true, data: { accessToken: newAccess, expiresIn: 15 * 60 } };
  })
  // biome-ignore lint/suspicious/noExplicitAny: Elysia cookie plugin injects cookie objects dynamically
  .post('/logout', async ({ cookie: { refreshToken: rfCookie, accessToken: atCookie } }: any) => {
    const token = rfCookie.value;
    if (token) await authService.revokeSession(token as string);
    rfCookie.remove();
    atCookie.remove();
    return { success: true };
  });
