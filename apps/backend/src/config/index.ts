import * as v from 'valibot';

const EnvSchema = v.object({
  // Server
  NODE_ENV: v.optional(v.picklist(['development', 'production', 'test']), 'development'),
  PORT: v.optional(v.string(), '3100'),
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
  TELEGRAM_WEBHOOK_SECRET: v.optional(v.string(), ''),
  WEBAPP_URL: v.optional(v.string(), 'http://localhost:3000'),

  // CORS
  CORS_ORIGINS: v.optional(v.string(), 'http://localhost:3000'),

  // Feature flags
  ENABLE_AI: v.optional(v.string(), 'false'),
  OPENAI_API_KEY: v.optional(v.string(), ''),
});

function parseEnv() {
  const result = v.safeParse(EnvSchema, process.env);
  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    for (const issue of result.issues) {
      console.error(`  ${issue.path?.map((p) => p.key).join('.')} — ${issue.message}`);
    }
    process.exit(1);
  }
  return result.output;
}

export const config = parseEnv();

export const isDev = config.NODE_ENV === 'development';
export const isProd = config.NODE_ENV === 'production';
export const corsOrigins = config.CORS_ORIGINS.split(',').map((s) => s.trim());

// Augment config with computed props for convenience
declare module './index.ts' {
  interface ParsedConfig {
    isProd: boolean;
    isDev: boolean;
  }
}

// Attach to config object for convenience in other modules
(config as Record<string, unknown>).isProd = isProd;
(config as Record<string, unknown>).isDev = isDev;
