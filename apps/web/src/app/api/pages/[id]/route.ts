import { del } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { deletePageForUser, getPageById, upsertPageSchema } from '@/lib/db/queries';
import { validatePageTitle } from '@/lib/validate-page-title';
import { collectBlobPathnames } from '@/lib/collect-blob-pathnames';
import type { CanvasSchema } from '@/lib/schema';

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
    const thumbnailPath = typeof body.thumbnailPath === 'string' ? body.thumbnailPath : undefined;

    // 先記住存檔前的內容，等新內容真的存成功後，才能比對出「這次存檔換掉的舊圖」。
    const previousPage = await getPageById(id);

    const page = await upsertPageSchema(
        id,
        session.user.id,
        body.schema,
        body.title.trim(),
        body.isPublic,
        thumbnailPath
    );
    if (!page) {
        // 只有「id 已存在但屬於別人」才會落到這裡；自己的（不管新舊）都會成功。
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (previousPage) {
        await deleteOrphanedBlobs(previousPage, page);
    }

    return NextResponse.json({ page });
}

// 存檔前後的 schema/縮圖裡，各自引用到哪些 Blob pathname——存在舊的裡卻不在新的裡，
// 代表這次存檔已經換掉或移除了它，變成沒人引用的孤兒檔案，可以安全刪除。
async function deleteOrphanedBlobs(
    previousPage: { schema: CanvasSchema; thumbnailPath: string | null },
    nextPage: { schema: CanvasSchema; thumbnailPath: string | null }
) {
    const before = collectBlobPathnames(previousPage.schema, previousPage.thumbnailPath);
    const after = new Set(collectBlobPathnames(nextPage.schema, nextPage.thumbnailPath));
    const orphaned = before.filter((pathname) => !after.has(pathname));
    if (orphaned.length === 0) return;

    // 清理孤兒檔案是「順手做」，不是存檔成功的必要條件——失敗就算了，不能讓存檔跟著報錯。
    try {
        await del(orphaned, { token: process.env.WEB_BUILDER_READ_WRITE_TOKEN });
    } catch {
        // best-effort cleanup
    }
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

    // 頁面本身都刪了，它引用的圖片/縮圖不會再被任何地方用到，一起清掉（best-effort）。
    const pathnames = collectBlobPathnames(page.schema, page.thumbnailPath);
    if (pathnames.length > 0) {
        try {
            await del(pathnames, { token: process.env.WEB_BUILDER_READ_WRITE_TOKEN });
        } catch {
            // best-effort cleanup
        }
    }

    return NextResponse.json({ page });
}
