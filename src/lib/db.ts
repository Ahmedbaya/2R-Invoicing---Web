import { Pool, types } from 'pg'

types.setTypeParser(1082, (v) => v) // keep DATE as 'yyyy-mm-dd'

const g = globalThis as unknown as { pgPool?: Pool }

export const pool =
  g.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 2,
    connectionTimeoutMillis: 20000,
    idleTimeoutMillis: 10000,
  })
pool.on('error', (e) => console.error('Idle PG client error', e.message))
g.pgPool = pool