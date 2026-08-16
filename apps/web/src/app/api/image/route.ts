import { get } from '@vercel/blob';
import { type NextRequest, NextResponse } from 'next/server';

// TODO: 目前登入狀態只是前端 Zustand mock（見 apps/web/app/builder/page.tsx），
// 沒有 server-side session/cookie，這裡還沒有真正的權限驗證——
// 任何知道 pathname 的人都能讀到這個 blob。等有真正的登入機制再補上驗證。
export async function GET(request: NextRequest) {
    const pathname = request.nextUrl.searchParams.get('pathname');
    if (!pathname) {
        return NextResponse.json({ error: 'Missing pathname' }, { status: 400 });
    }

    const result = await get(pathname, { access: 'private' });
    if (result === null || result.stream === null) {
        return new NextResponse('Not found', { status: 404 });
    }

    return new NextResponse(result.stream, {
        headers: {
            'Cache-Control': 'private, no-cache',
            'Content-Type': result.blob.contentType,
            'X-Content-Type-Options': 'nosniff',
        },
    });
}
