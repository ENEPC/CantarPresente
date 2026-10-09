// Runner simple: aplica los .sql de esta carpeta en orden y registra los aplicados.
// Uso: DATABASE_URL=<url directa> node db/migrations/migrate.js
import 'dotenv/config';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Client } = pg;
const DIR = path.dirname(fileURLToPath(import.meta.url));

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();
  await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    nombre TEXT PRIMARY KEY,
    aplicada_en TIMESTAMPTZ NOT NULL DEFAULT now()
  )`);

  const archivos = (await readdir(DIR))
    .filter((f) => /^\d+.*\.sql$/.test(f))
    .sort();

  for (const archivo of archivos) {
    const { rows } = await client.query(
      'SELECT 1 FROM schema_migrations WHERE nombre = $1',
      [archivo]
    );
    if (rows.length > 0) {
      console.log(`= ${archivo} (ya aplicada)`);
      continue;
    }
    const sql = await readFile(path.join(DIR, archivo), 'utf8');
    await client.query('BEGIN');
    try {
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (nombre) VALUES ($1)', [archivo]);
      await client.query('COMMIT');
      console.log(`✓ ${archivo}`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`✗ ${archivo}: ${error.message}`);
      process.exitCode = 1;
      break;
    }
  }

  await client.end();
}

main();
