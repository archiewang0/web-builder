import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { deletePageForUser, getPageById, upsertPageSchema } from '@/lib/db/queries';
import { validatePageTitle } from '@/lib/validate-page-title';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// pages.id 是 Postgres 的 uuid 欄位，網址上的 id 如果不是合法 UUID 格式
// （例如使用者手動改網址），查詢會讓 Postgres 直接丟例外變成 500，
// 要在打資料庫之前先擋掉，回乾淨的 400。
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_request: Request, { params }: RouteParams) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!UUID_REGEX.test(id)) {
        return NextResponse.json({ error: 'Invalid page id' }, { status: 400 });
    }

    const page = await getPageById(id);
    if (!page) {
        // 這個 id 是前端自己生成的，還沒存過檔時本來就查不到，不算錯誤。
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (page.userId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ page });
}

export async function PUT(request: Request, { params }: RouteParams) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!UUID_REGEX.test(id)) {
        return NextResponse.json({ error: 'Invalid page id' }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    if (!body?.schema || !Array.isArray(body.schema.elements)) {
        return NextResponse.json({ error: 'Missing or invalid schema' }, { status: 400 });
    }
    if (typeof body.title !== 'string') {
        return NextResponse.json({ error: 'Missing title' }, { status: 400 });
    }
    const titleError = validatePageTitle(body.title);
    if (titleError) {
        return NextResponse.json({ error: titleError }, { status: 400 });
    }
    if (typeof body.isPublic !== 'boolean') {
        return NextResponse.json({ error: 'Missing isPublic' }, { status: 400 });
    }

    const page = await upsertPageSchema(
        id,
        session.user.id,
        body.schema,
        body.title.trim(),
        body.isPublic
    );
    if (!page) {
        // 只有「id 已存在但屬於別人」才會落到這裡；自己的（不管新舊）都會成功。
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ page });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!UUID_REGEX.test(id)) {
        return NextResponse.json({ error: 'Invalid page id' }, { status: 400 });
    }

    const page = await deletePageForUser(id, session.user.id);
    if (!page) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ page });
}
