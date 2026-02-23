import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { cfg } from '../config.ts';

// Import shared schema from backend (single source of truth)
// Both apps share the same DB, so we re-use the same schema definitions
import * as schema from '@showcase/backend/db/schema.ts';

export { schema };

const client = postgres(cfg.DATABASE_URL, { max: 5, idle_timeout: 20 });
export const db = drizzle(client, { schema, logger: false });
