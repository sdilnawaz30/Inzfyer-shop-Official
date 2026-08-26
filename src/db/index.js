import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema.js';

function createDb() {
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL;
  if (!dbUrl) {
    console.warn("DATABASE_URL is not set. Database operations will fail.");
  }
  const sql = neon(dbUrl || 'postgres://user:pass@host/db');
  return drizzle(sql, { schema });
}

let _db = null;

export function getDb() {
  if (!_db) _db = createDb();
  return _db;
}
