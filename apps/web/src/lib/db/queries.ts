import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, pages } from './schema';
import type { CanvasSchema } from '@/lib/schema';

export interface UpsertUserInput {
    id: string;
    email: string;
    name?: string | null;
    givenName?: string | null;
    familyName?: string | null;
    picture?: string | null;
    locale?: string | null;
    emailVerified?: boolean | null;
}

export async function upsertUser(input: UpsertUserInput) {
    await db
        .insert(users)
        .values(input)
        .onConflictDoUpdate({
            target: users.id,
            set: {
                email: input.email,
                name: input.name,
                givenName: input.givenName,
                familyName: input.familyName,
                picture: input.picture,
                locale: input.locale,
                emailVerified: input.emailVerified,
                updatedAt: new Date(),
            },
        });
}

export async function listPagesForUser(userId: string) {
    return db
        .select({
            id: pages.id,
            title: pages.title,
            createdAt: pages.createdAt,
            updatedAt: pages.updatedAt,
            thumbnailPath: pages.thumbnailPath,
        })
        .from(pages)
        .where(eq(pages.userId, userId))
        .orderBy(pages.updatedAt);
}

// id 由前端產生（建立新網頁時不打 API，只是換一個網址），所以這裡不分「找不到」跟
// 「是別人的」——回傳原始 row，讓呼叫端自己判斷要顯示 404 還是 403。
export async function getPageById(id: string) {
    const [page] = await db.select().from(pages).where(eq(pages.id, id));
    return page ?? null;
}

// 給公開展示頁（/site/[id]）用：不檢查登入身分，只檢查是否被作者設為公開。
export async function getPublicPageById(id: string) {
    const [page] = await db
        .select()
        .from(pages)
        .where(and(eq(pages.id, id), eq(pages.isPublic, true)));
    return page ?? null;
}

// 給 /gallery 展示牆用：列出所有被設為公開的頁面，帶作者名稱，最新更新排最前面。
export async function listPublicPages() {
    return db
        .select({
            id: pages.id,
            title: pages.title,
            updatedAt: pages.updatedAt,
            authorName: users.name,
            thumbnailPath: pages.thumbnailPath,
        })
        .from(pages)
        .innerJoin(users, eq(pages.userId, users.id))
        .where(eq(pages.isPublic, true))
        .orderBy(desc(pages.updatedAt));
}

// 第一次儲存時這筆 id 在 DB 裡還不存在 → 視為新增；已經存在且是自己的 → 更新；
// 存在但是別人的 → WHERE 條件不成立，不會更新也不會新增，回傳 null 讓呼叫端擋掉。
export async function upsertPageSchema(
    id: string,
    userId: string,
    schema: CanvasSchema,
    title: string,
    isPublic: boolean,
    thumbnailPath?: string
) {
    // thumbnailPath 沒帶（截圖失敗時）就不動這個欄位，保留舊縮圖，而不是清空它。
    const thumbnailPatch = thumbnailPath !== undefined ? { thumbnailPath } : {};

    const [page] = await db
        .insert(pages)
        .values({ id, userId, schema, title, isPublic, ...thumbnailPatch })
        .onConflictDoUpdate({
            target: pages.id,
            set: { schema, title, isPublic, updatedAt: new Date(), ...thumbnailPatch },
            where: eq(pages.userId, userId),
        })
        .returning();
    return page ?? null;
}

export async function deletePageForUser(id: string, userId: string) {
    const [page] = await db
        .delete(pages)
        .where(and(eq(pages.id, id), eq(pages.userId, userId)))
        .returning();
    return page ?? null;
}

// 刪除帳號：users FK 對 pages 設了 onDelete: 'cascade'，刪 user row 時 Postgres
// 會自動連帶刪掉他所有的 pages，這裡不用手動刪 pages。但刪之前要先把每份頁面
// 的 schema/縮圖記下來，回傳給呼叫端去清 Blob store 裡對應的圖片檔案。
export async function deleteUserAccount(userId: string) {
    return db.transaction(async (tx) => {
        const userPages = await tx
            .select({ schema: pages.schema, thumbnailPath: pages.thumbnailPath })
            .from(pages)
            .where(eq(pages.userId, userId));

        await tx.delete(users).where(eq(users.id, userId));

        return userPages;
    });
}
