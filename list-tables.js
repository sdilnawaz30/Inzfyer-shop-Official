import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);
async function run() {
  const result = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`;
  console.log('Tables:', result.map(r => r.table_name));
}
run();
