const { Pool } = require("pg");

const globalForPg = global;

export const pool =
  globalForPg.pgPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : false,
  });

if (process.env.NODE_ENV !== "production") globalForPg.pgPool = pool;

// Helper simple para queries
export async function query(text, params) {
  return pool.query(text, params);
}
