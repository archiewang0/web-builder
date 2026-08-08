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
        async jwt({ token, profile }) {
            if (profile) {
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
        // user.id 是 Google 的 sub（provider 的 profile() mapper 已經把它搬到 id 上），
        // 每次登入都 upsert 一次，讓 users table 跟 Google 那邊的資料保持最新。
        async signIn({ user, profile }) {
            if (!user.id || !user.email) return;
            await upsertUser({
                id: user.id,
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
