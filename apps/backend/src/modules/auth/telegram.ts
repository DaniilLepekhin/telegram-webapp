import { createHmac, timingSafeEqual } from 'node:crypto';
import type { TelegramInitData, TelegramUser } from '@showcase/shared';
import { config } from '../../config/index.ts';

/**
 * Validates Telegram WebApp initData using HMAC-SHA256
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function validateTelegramInitData(
  initDataRaw: string,
  botToken: string,
): { valid: boolean; data: TelegramInitData | null } {
  try {
    const params = new URLSearchParams(initDataRaw);
    const hash = params.get('hash');
    if (!hash) return { valid: false, data: null };

    // Build data-check-string
    params.delete('hash');
    const entries = [...params.entries()].sort(([a], [b]) =>
      a.localeCompare(b),
    );
    const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join('\n');

    // HMAC-SHA256 with secret key = HMAC-SHA256("WebAppData", botToken)
    const secretKey = createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();
    const expectedHash = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Use timingSafeEqual to prevent timing-based hash enumeration attacks
    let hashesMatch = false;
    try {
      hashesMatch = timingSafeEqual(
        Buffer.from(expectedHash, 'hex'),
        Buffer.from(hash, 'hex'),
      );
    } catch {
      // Buffers of different lengths throw — treat as mismatch
      hashesMatch = false;
    }
    if (!hashesMatch) return { valid: false, data: null };

    // Check timestamp — use config.isProd instead of process.env.NODE_ENV for consistency
    const authDate = Number.parseInt(params.get('auth_date') ?? '0', 10);
    const maxAge = config.isProd ? 5 * 60 : 24 * 60 * 60;
    if (Date.now() / 1000 - authDate > maxAge)
      return { valid: false, data: null };

    // Parse user
    const userRaw = params.get('user');
    const user: TelegramUser | undefined = userRaw
      ? JSON.parse(userRaw)
      : undefined;

    return {
      valid: true,
      data: {
        user,
        chat_instance: params.get('chat_instance') ?? undefined,
        chat_type: params.get('chat_type') ?? undefined,
        start_param: params.get('start_param') ?? undefined,
        auth_date: authDate,
        hash,
      },
    };
  } catch {
    return { valid: false, data: null };
  }
}
