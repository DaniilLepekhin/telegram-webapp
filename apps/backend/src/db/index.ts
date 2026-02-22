import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.ts';
import { logger } from '../utils/logger.ts';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required');

// Connection pool for queries
const queryClient = postgres(connectionString, {
  max: 20,
  idle_timeout: 30,
  connect_timeout: 10,
  onnotice: (msg) => logger.debug({ msg }, 'PG notice'),
});

export const db = drizzle(queryClient, { schema, logger: false });

// Migration client (single connection)
export const getMigrationClient = () =>
  postgres(connectionString, { max: 1 });

export { schema };
