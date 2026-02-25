import * as v from 'valibot';

const schema = v.object({
  TELEGRAM_BOT_TOKEN: v.pipe(v.string(), v.minLength(10)),
  // Empty string is the safe default — if somehow deployed with the old
  // 'dev-secret' placeholder, any attacker who knows it could spoof webhook
  // calls. We enforce a minimum length in production below.
  TELEGRAM_WEBHOOK_SECRET: v.optional(v.string(), ''),
  WEBAPP_URL: v.optional(v.string(), 'https://t.me'),
  DATABASE_URL: v.pipe(v.string(), v.minLength(10)),
  REDIS_URL: v.optional(v.string(), 'redis://localhost:6379'),
  NODE_ENV: v.optional(v.picklist(['development', 'production', 'test']), 'development'),
  BOT_WEBHOOK_PORT: v.optional(v.pipe(v.string(), v.regex(/^\d+$/, 'BOT_WEBHOOK_PORT must be a positive integer')), '3200'),
  API_URL: v.optional(v.string(), 'http://localhost:3100'),
});

function parse() {
  const r = v.safeParse(schema, process.env);
  if (!r.success) {
    console.error('❌ Bot config error:', r.issues.map((i) => i.message).join(', '));
    process.exit(1);
  }

  const env = r.output;

  if (env.NODE_ENV === 'production' && env.TELEGRAM_WEBHOOK_SECRET.length < 32) {
    console.error(
      '❌ TELEGRAM_WEBHOOK_SECRET must be at least 32 characters in production.',
    );
    process.exit(1);
  }

  return env;
}

const _cfg = parse();

export const isDev = _cfg.NODE_ENV === 'development';
export const isProd = _cfg.NODE_ENV === 'production';

export const cfg = {
  ..._cfg,
  BOT_WEBHOOK_PORT: Number.parseInt(_cfg.BOT_WEBHOOK_PORT, 10),
  isDev,
  isProd,
} as const;
