import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.ts';
import { config, isProd } from '../config/index.ts';
import { logger } from '../utils/logger.ts';

// SSL: enforce TLS certificate validation in production
const sslOptions = isProd ? ({ rejectUnauthorized: true } as const) : false;

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
