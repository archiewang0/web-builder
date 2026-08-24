import { pgTable, text, timestamp, jsonb, uuid, boolean } from 'drizzle-orm/pg-core';
import type { CanvasSchema } from '@/lib/schema';

// id 用 Google 的 sub（OIDC 裡的使用者唯一識別碼），不用 email——
// email 理論上可能變動，sub 才是真正穩定的識別碼。
export const users = pgTable('users', {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    name: text('name'),
    givenName: text('given_name'),
    familyName: text('family_name'),
    picture: text('picture'),
    locale: text('locale'),
    emailVerified: boolean('email_verified'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const pages = pgTable('pages', {
    id: uuid('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull().default('未命名頁面'),
    isPublic: boolean('is_public').notNull().default(false),
    schema: jsonb('schema').notNull().$type<CanvasSchema>(),
    thumbnailPath: text('thumbnail_path'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
