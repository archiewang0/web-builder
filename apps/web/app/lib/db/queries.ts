import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, pages } from './schema';
import type { CanvasSchema } from '@/store/use-schema-store';

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

// 第一次儲存時這筆 id 在 DB 裡還不存在 → 視為新增；已經存在且是自己的 → 更新；
// 存在但是別人的 → WHERE 條件不成立，不會更新也不會新增，回傳 null 讓呼叫端擋掉。
export async function upsertPageSchema(id: string, userId: string, schema: CanvasSchema) {
    const [page] = await db
        .insert(pages)
        .values({ id, userId, schema })
        .onConflictDoUpdate({
            target: pages.id,
            set: { schema, updatedAt: new Date() },
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
