import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from '../config/index.ts';
import { logger } from '../utils/logger.ts';
import * as schema from './schema.ts';

// SSL: only enable when DATABASE_SSL is explicitly set to 'true' or 'require'.
// Docker-internal connections (postgres:5432) don't use SSL, so default is off.
const sslEnabled =
  config.DATABASE_SSL === 'true' || config.DATABASE_SSL === 'require';
const sslOptions = sslEnabled
  ? ({ rejectUnauthorized: config.DATABASE_SSL === 'require' } as const)
  : false;

// Connection pool for application queries
const queryClient = postgres(config.DATABASE_URL, {
  max: 20,
  idle_timeout: 30,
  connect_timeout: 10,
  ssl: sslOptions,
  onnotice: (msg) => logger.debug({ msg }, 'PG notice'),
});

export const db = drizzle(queryClient, { schema, logger: false });

/**
 * Returns a single-connection client suitable for running Drizzle migrations.
 * The caller is responsible for calling `.end()` when finished to avoid
 * leaking a connection:
 *
 *   const client = getMigrationClient();
 *   await migrate(drizzle(client), { migrationsFolder: '...' });
 *   await client.end();
 */
export const getMigrationClient = () =>
  postgres(config.DATABASE_URL, { max: 1, ssl: sslOptions });

export { schema };
