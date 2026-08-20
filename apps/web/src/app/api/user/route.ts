import { del } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { deleteUserAccount } from '@/lib/db/queries';
import { collectBlobPathnames } from '@/lib/collect-blob-pathnames';

export async function DELETE() {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deletedPages = await deleteUserAccount(session.user.id);

    const pathnames = [
        ...new Set(
            deletedPages.flatMap((page) => collectBlobPathnames(page.schema, page.thumbnailPath))
        ),
    ];
    if (pathnames.length > 0) {
        try {
            await del(pathnames);
        } catch {
            // best-effort cleanup
        }
    }

    return NextResponse.json({ ok: true });
}
