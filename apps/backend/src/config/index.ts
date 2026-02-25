import * as v from 'valibot';

const EnvSchema = v.object({
  // Server
  NODE_ENV: v.optional(
    v.picklist(['development', 'production', 'test']),
    'development',
  ),
  // PORT validated as a numeric string then coerced to number
  PORT: v.optional(
    v.pipe(v.string(), v.regex(/^\d+$/, 'PORT must be a positive integer')),
    '3100',
  ),
  HOST: v.optional(v.string(), '0.0.0.0'),

  // Database
  DATABASE_URL: v.pipe(v.string(), v.minLength(10)),

  // Redis
  REDIS_URL: v.optional(v.string(), 'redis://localhost:6379'),

  // JWT
  JWT_SECRET: v.pipe(v.string(), v.minLength(32)),
  JWT_ACCESS_TTL: v.optional(v.string(), '15m'),
  JWT_REFRESH_TTL: v.optional(v.string(), '30d'),

  // Telegram
  TELEGRAM_BOT_TOKEN: v.pipe(v.string(), v.minLength(10)),
  // Allowed to be empty in development; required (min 32 chars) in production.
  // The conditional check is applied after parsing via a post-parse guard below.
  TELEGRAM_WEBHOOK_SECRET: v.optional(v.string(), ''),
  BOT_USERNAME: v.optional(v.string(), 'your_bot'),
  WEBAPP_URL: v.optional(v.string(), 'http://localhost:3000'),

  // CORS
  CORS_ORIGINS: v.optional(v.string(), 'http://localhost:3000'),

  // Payment webhook secrets (fail-closed if absent — see subscriptions/routes.ts)
  LAVA_WEBHOOK_SECRET: v.optional(v.string(), ''),
  CP_WEBHOOK_SECRET: v.optional(v.string(), ''),

  // Feature flags
  ENABLE_AI: v.optional(v.string(), 'false'),
  OPENAI_API_KEY: v.optional(v.string(), ''),
});

function parseEnv() {
  const result = v.safeParse(EnvSchema, process.env);
  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    for (const issue of result.issues) {
      console.error(
        `  ${issue.path?.map((p) => p.key).join('.')} — ${issue.message}`,
      );
    }
    process.exit(1);
  }

  const env = result.output;

  // In production the webhook secret must be set to a non-trivial value so that
  // the Telegram→backend webhook endpoint cannot be called by third parties.
  if (
    env.NODE_ENV === 'production' &&
    env.TELEGRAM_WEBHOOK_SECRET.length < 32
  ) {
    console.error(
      '❌ TELEGRAM_WEBHOOK_SECRET must be at least 32 characters in production.',
    );
    process.exit(1);
  }

  return env;
}

const _env = parseEnv();

export const isDev = _env.NODE_ENV === 'development';
export const isProd = _env.NODE_ENV === 'production';
export const corsOrigins = _env.CORS_ORIGINS.split(',').map((s) => s.trim());

/**
 * Validated, typed application config.
 * Computed boolean flags (isDev / isProd) are co-located here so callers
 * don't need to import them separately, while the object itself remains
 * fully typed without any runtime `as Record<string, unknown>` mutations.
 */
export const config = {
  ..._env,
  // Coerce PORT to a number once so callers never have to parseInt themselves
  PORT: Number.parseInt(_env.PORT, 10),
  isDev,
  isProd,
} as const;
