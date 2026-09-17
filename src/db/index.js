import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from './schema.js';

// Required for Neon serverless in Node.js environments (like Vercel API routes)
neonConfig.webSocketConstructor = ws;

function createDb() {
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL;
  if (!dbUrl) {
    console.warn("DATABASE_URL is not set. Database operations will fail.");
  }
  
  // Use Pool which uses WebSockets, supporting interactive transactions
  const pool = new Pool({ connectionString: dbUrl || 'postgres://user:pass@host/db' });
  return drizzle(pool, { schema });
}

let _db = null;

export function getDb() {
  if (!_db) _db = createDb();
  return _db;
}
