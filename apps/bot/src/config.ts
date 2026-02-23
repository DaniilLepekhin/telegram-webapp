import * as v from 'valibot';

const schema = v.object({
  TELEGRAM_BOT_TOKEN: v.pipe(v.string(), v.minLength(10)),
  TELEGRAM_WEBHOOK_SECRET: v.optional(v.string(), 'dev-secret'),
  WEBAPP_URL: v.optional(v.string(), 'https://t.me'),
  DATABASE_URL: v.pipe(v.string(), v.minLength(10)),
  REDIS_URL: v.optional(v.string(), 'redis://localhost:6379'),
  NODE_ENV: v.optional(v.picklist(['development', 'production', 'test']), 'development'),
  BOT_WEBHOOK_PORT: v.optional(v.string(), '3200'),
  API_URL: v.optional(v.string(), 'http://localhost:3100'),
});

function parse() {
  const r = v.safeParse(schema, process.env);
  if (!r.success) {
    console.error('❌ Bot config error:', r.issues.map(i => i.message).join(', '));
    process.exit(1);
  }
  return r.output;
}

export const cfg = parse();
export const isDev = cfg.NODE_ENV === 'development';
