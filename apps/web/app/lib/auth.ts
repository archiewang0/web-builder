import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

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
            session.user.given_name = token.given_name as string | undefined;
            session.user.family_name = token.family_name as string | undefined;
            session.user.email_verified = token.email_verified as boolean | undefined;
            session.user.locale = token.locale as string | undefined;
            return session;
        },
    },
});
