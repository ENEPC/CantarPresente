// Runner de seeds: aplica los .sql de esta carpeta en orden, sentencia por sentencia.
// Idempotente por diseño (ON CONFLICT / WHERE NOT EXISTS): re-ejecutar no duplica nada.
// Uso:
//   node db/seeds/run.js            → conexión directa (requiere IPv6)
//   node db/seeds/run.js --pooled   → usa DATABASE_URL_POOLED (redes sin IPv6)
import 'dotenv/config';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Client } = pg;
const DIR = path.dirname(fileURLToPath(import.meta.url));

const usarPooled = true

const client = new Client({
  connectionString: usarPooled ? process.env.DATABASE_URL_POOLED : process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Se descartan las líneas de comentario antes de partir por ';' para que un ';'
// dentro de un comentario no corte la sentencia a la mitad.
const sinComentarios = (sql) =>
  sql
    .split('\n')
    .filter((l) => !l.trim().startsWith('--'))
    .join('\n');

async function main() {
  await client.connect();
  const archivos = (await readdir(DIR))
    .filter((f) => /^\d+.*\.sql$/.test(f))
    .sort();

  for (const archivo of archivos) {
    const sql = await readFile(path.join(DIR, archivo), 'utf8');
    console.log(`▶ ${archivo}`);
    // Sentencia por sentencia (sin transacción envolvente) para que funcione
    // también contra el pooler en modo transacción.
    for (const chunk of sinComentarios(sql).split(';')) {
      const stmt = chunk.trim();
      if (!stmt) continue;
      await client.query(stmt);
    }
    console.log(`✓ ${archivo}`);
  }
  await client.end();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
