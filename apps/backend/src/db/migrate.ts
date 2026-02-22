import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const run = async () => {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required');

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
