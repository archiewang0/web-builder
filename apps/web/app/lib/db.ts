import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

if (!process.env.DATABASE_URL) {
    throw new Error('Missing DATABASE_URL environment variable');
}

// Supabase 的 Transaction pooler（pgbouncer）不支援 prepared statements，
// serverless 環境每次呼叫都可能是新連線，一律關掉 prepare 比較保險。
const client = postgres(process.env.DATABASE_URL, { prepare: false });

export const db = drizzle(client);
