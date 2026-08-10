import Link from 'next/link';
import { Globe } from 'lucide-react';
import { listPublicPages } from '@/lib/db/queries';

export const metadata = { title: '公開展示牆' };

export default async function GalleryPage() {
    const pages = await listPublicPages();

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50 py-10 px-4">
            <div className="mx-auto max-w-4xl">
                <div className="mb-6 flex items-center gap-2">
                    <Globe className="w-6 h-6 text-blue-500" />
                    <h1 className="text-2xl font-bold text-gray-800">公開展示牆</h1>
                </div>

                {pages.length === 0 ? (
                    <p className="text-gray-500">目前還沒有人公開網頁</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {pages.map((page) => (
                            <Link
                                key={page.id}
                                href={`/site/${page.id}`}
                                className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 border border-gray-100"
                            >
                                <p className="font-medium text-gray-800 truncate">{page.title}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    由 {page.authorName ?? '匿名'} 建立
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                    更新於 {page.updatedAt.toLocaleDateString('zh-TW')}
                                </p>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
