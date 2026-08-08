import type { DefaultSession } from 'next-auth';

// JWT 的 token 型別實際上繼承 Record<string, unknown>，declaration merging 加不進去，
// 所以 auth.ts 裡讀寫 token 上的自訂欄位都用 `as` 轉型，這裡只需要擴充 Session.user。
declare module 'next-auth' {
    interface Session {
        user: {
            given_name?: string;
            family_name?: string;
            email_verified?: boolean;
            locale?: string;
        } & DefaultSession['user'];
    }
}
