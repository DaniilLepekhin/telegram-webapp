import Elysia, { t } from 'elysia';
import { validateTelegramInitData } from './telegram.ts';
import { authService } from './service.ts';
import { config, isProd } from '../../config/index.ts';
import { logger } from '../../utils/logger.ts';

export const authModule = new Elysia({ prefix: '/auth' })
  .post(
    '/telegram',
    async ({ body, cookie: { accessToken, refreshToken: rfCookie }, set, request, jwt }: any) => {
      const { initData } = body;

      const { valid, data } = validateTelegramInitData(initData, config.TELEGRAM_BOT_TOKEN);
      if (!valid || !data?.user) {
        set.status = 401;
        return { success: false, error: { code: 'INVALID_INIT_DATA', message: 'Невалидные данные Telegram' } };
      }

      const user = await authService.findOrCreateUser(data.user);

      const tokens = await authService.createTokens(user.id, user.telegramId, user.role, {
        ua: request.headers.get('user-agent') ?? undefined,
        ip: request.headers.get('x-forwarded-for') ?? undefined,
      });

      // Sign JWT access token
      const signedAccess = await jwt.sign({
        sub: user.id,
        telegramId: user.telegramId,
        role: user.role,
      });
      tokens.accessToken = signedAccess;

      // Set httpOnly cookies
      accessToken.set({ value: signedAccess, httpOnly: true, secure: isProd, sameSite: 'none', maxAge: 15 * 60, path: '/' });
      rfCookie.set({ value: tokens.refreshToken, httpOnly: true, secure: isProd, sameSite: 'none', maxAge: 30 * 24 * 60 * 60, path: '/' });

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
  )
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
    atCookie.set({ value: newAccess, httpOnly: true, secure: isProd, sameSite: 'none', maxAge: 15 * 60, path: '/' });

    return { success: true, data: { accessToken: newAccess, expiresIn: 15 * 60 } };
  })
  .post('/logout', async ({ cookie: { refreshToken: rfCookie, accessToken: atCookie } }: any) => {
    const token = rfCookie.value;
    if (token) await authService.revokeSession(token as string);
    rfCookie.remove();
    atCookie.remove();
    return { success: true };
  });
