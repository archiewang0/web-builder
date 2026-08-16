import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Next.js 慣例把本地環境變數放在 .env.local，dotenv 預設只讀 .env，這裡要指定路徑。
config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
    throw new Error('Missing DATABASE_URL environment variable');
}

export default defineConfig({
    schema: './src/lib/db/schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },
});
