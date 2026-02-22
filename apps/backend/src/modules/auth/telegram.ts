import { createHmac } from 'crypto';
import type { TelegramInitData, TelegramUser } from '@showcase/shared';

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
    const entries = [...params.entries()].sort(([a], [b]) => a.localeCompare(b));
    const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join('\n');

    // HMAC-SHA256 with secret key = HMAC-SHA256("WebAppData", botToken)
    const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
    const expectedHash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    if (expectedHash !== hash) return { valid: false, data: null };

    // Check timestamp (max 5 min old in production)
    const authDate = parseInt(params.get('auth_date') ?? '0', 10);
    const maxAge = process.env.NODE_ENV === 'production' ? 5 * 60 : 24 * 60 * 60;
    if (Date.now() / 1000 - authDate > maxAge) return { valid: false, data: null };

    // Parse user
    const userRaw = params.get('user');
    const user: TelegramUser | undefined = userRaw ? JSON.parse(userRaw) : undefined;

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
