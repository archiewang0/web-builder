import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// /builder 需要登入；/member 自己會依登入狀態顯示登入按鈕或會員資料，不需要在這裡擋。
export default auth((req) => {
    if (!req.auth) {
        return NextResponse.redirect(new URL('/member', req.url));
    }
});

export const config = {
    matcher: ['/builder/:path*'],
};
