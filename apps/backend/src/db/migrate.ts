import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { config } from '../config/index.ts';

const run = async () => {
  // Use the validated config so the same minLength/format checks apply as in the server
  const url = config.DATABASE_URL;

  const client = postgres(url, { max: 1 });
  const db = drizzle(client);

  console.log('▶ Running migrations...');
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('✓ Migrations complete');

  await client.end();
  process.exit(0);
};

run().catch((e) => {
  console.error('✗ Migration failed:', e);
  process.exit(1);
});
