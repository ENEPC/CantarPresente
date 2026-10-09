import 'dotenv/config';
import pg from 'pg';

const isServerless = Boolean(process.env.VERCEL);

export const pool = new pg.Pool({
  // Serverless usa el pooler de Supabase (modo transacción, puerto 6543) para no
  // agotar las conexiones directas del plan gratuito; local usa la conexión directa.
  connectionString: isServerless ? process.env.DATABASE_URL_POOLED : process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: isServerless ? 2 : 10,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  statement_timeout: 8000,
  allowExitOnIdle: true,
});

// Envuelve la lógica de sync en BEGIN/COMMIT; los repos reciben el client y
// comparten la transacción.
export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const resultado = await fn(client);
    await client.query('COMMIT');
    return resultado;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
