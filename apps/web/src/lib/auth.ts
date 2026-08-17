import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { upsertUser } from '@/lib/db/queries';

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    session: { strategy: 'jwt' },
    callbacks: {
        // Google 完整的 profile（given_name/family_name/email_verified/locale）只有登入那一刻拿得到，
        // 之後每次 middleware/頁面呼叫 auth() 都是從 JWT 解出來，所以要在這裡先存進 token。
        //
        // 沒有接資料庫 adapter 時，next-auth 預設會用 crypto.randomUUID() 當作 user.id
        // （見 @auth/core callback.js），並不是 Google 的 sub，導致 token.sub 每次登入都不同、
        // users table 因此每次都新增一筆。這裡登入當下強制把 token.sub 蓋回 profile.sub
        // （Google OIDC 真正穩定的使用者識別碼），後續沒有 profile 的請求則沿用已存在的 token.sub。
        async jwt({ token, profile }) {
            if (profile) {
                token.sub = profile.sub as string;
                token.given_name = profile.given_name as string | undefined;
                token.family_name = profile.family_name as string | undefined;
                token.email_verified = profile.email_verified as boolean | undefined;
                token.locale = profile.locale as string | undefined;
            }
            return token;
        },
        async session({ session, token }) {
            session.user.id = token.sub as string;
            session.user.given_name = token.given_name as string | undefined;
            session.user.family_name = token.family_name as string | undefined;
            session.user.email_verified = token.email_verified as boolean | undefined;
            session.user.locale = token.locale as string | undefined;
            return session;
        },
    },
    events: {
        // user.id 在沒有資料庫 adapter 時是 next-auth 亂數產生的 uuid，不是穩定值，
        // 所以這裡改用 profile.sub（Google 的使用者唯一識別碼）當 users table 的 id，
        // 每次登入都 upsert 一次，讓 users table 跟 Google 那邊的資料保持最新。
        async signIn({ profile, user }) {
            const id = profile?.sub;
            if (!id || !user.email) return;
            await upsertUser({
                id,
                email: user.email,
                name: user.name,
                picture: user.image,
                givenName: profile?.given_name,
                familyName: profile?.family_name,
                locale: profile?.locale,
                emailVerified: profile?.email_verified,
            });
        },
    },
});
