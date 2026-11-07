import { readdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from 'pg';

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const migrationsDirectory = resolve(currentDirectory, '../../../../infra/db/migrations');

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is required to run migrations.');
  }

  const client = new Client({ connectionString });
  await client.connect();

  try {
    await client.query(
      'CREATE TABLE IF NOT EXISTS schema_migrations (filename text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())',
    );

    const migrationFiles = (await readdir(migrationsDirectory))
      .filter((filename) => filename.endsWith('.sql'))
      .sort();

    for (const filename of migrationFiles) {
      const existing = await client.query(
        'SELECT filename FROM schema_migrations WHERE filename = $1',
        [filename],
      );

      if (existing.rowCount) {
        console.info('Already applied: ' + filename);
        continue;
      }

      const sql = await readFile(resolve(migrationsDirectory, filename), 'utf8');
      console.info('Applying: ' + filename);
      await client.query('BEGIN');

      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [filename]);
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }

    console.info('Database migrations are up to date.');
  } finally {
    await client.end();
  }
}

runMigrations().catch((error: unknown) => {
  console.error('Database migration failed', error);
  process.exitCode = 1;
});
