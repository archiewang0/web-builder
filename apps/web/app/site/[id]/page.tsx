import Link from 'next/link';
import type { Metadata } from 'next';
import { getPublicPageById } from '@/lib/db/queries';
import { RenderSchemaElements } from './render-schema';

interface PageProps {
    params: Promise<{ id: string }>;
}

// pages.id 是 Postgres 的 uuid 欄位，網址上的 id 如果不是合法 UUID 格式，
// 查詢會讓 Postgres 直接丟例外，要在打資料庫之前先擋掉。
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    if (!UUID_REGEX.test(id)) return {};

    const page = await getPublicPageById(id);
    return { title: page?.title ?? '找不到網頁' };
}

export default async function PublicSitePage({ params }: PageProps) {
    const { id } = await params;
    const page = UUID_REGEX.test(id) ? await getPublicPageById(id) : null;

    if (!page) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="mb-4 text-gray-500">找不到這個網頁，或作者尚未公開</p>
                    <Link href="/" className="text-blue-500 hover:underline">
                        回首頁
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50 py-10">
            <div className="mx-auto max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="p-2 gap-2 flex flex-col min-h-[600px]">
                    <RenderSchemaElements elements={page.schema.elements} />
                </div>
            </div>
        </div>
    );
}
