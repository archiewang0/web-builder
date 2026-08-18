'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ImageOff, Trash2 } from 'lucide-react';
import { signIn, useSession } from 'next-auth/react';
import { usePages } from './use-pages';
import { useCreatePage } from '@/lib/use-create-page';
import { useDialogStore } from '@/store/use-dialog-store';
import { GoogleIcon } from '@/icons/google-icon';

export default function MemberPage() {
    const { data: session } = useSession();
    const user = session?.user;
    const { pages, isLoading, deletePage } = usePages(Boolean(user));
    const handleCreatePage = useCreatePage();

    const confirmDeletePage = (id: string, title: string) => {
        useDialogStore.getState().open({
            title: '刪除網頁',
            description: `確定要刪除「${title}」嗎？此操作無法復原。`,
            confirmText: '確定刪除',
            danger: true,
            onConfirm: () => deletePage(id),
        });
    };

    if (!user) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="mb-6 text-gray-500">請先登入才能查看會員資料</p>
                    <button
                        onClick={() => signIn('google')}
                        className="inline-flex items-center gap-3 px-6 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                        <GoogleIcon className="w-5 h-5" />
                        <span className="text-sm font-medium text-gray-700">
                            使用 Google 帳號登入
                        </span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Google 帳號資料 */}
                <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-4">
                        <Avatar name={user.name ?? ''} picture={user.image ?? undefined} />
                        <div>
                            <h1 className="text-lg font-semibold text-gray-800">{user.name}</h1>
                            <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                    </div>

                    <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
                        <Field label="名" value={user.given_name ?? '-'} />
                        <Field label="姓" value={user.family_name ?? '-'} />
                        <Field label="Email 已驗證" value={user.email_verified ? '是' : '否'} />
                        <Field label="語言地區" value={user.locale ?? '-'} />
                    </dl>
                </section>

                {/* 使用者自建網頁 */}
                <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold text-gray-800">我的網頁</h2>
                        <button
                            onClick={handleCreatePage}
                            className="text-sm px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                        >
                            + 建立新網頁
                        </button>
                    </div>

                    {isLoading ? (
                        <p className="text-sm text-gray-400 text-center py-8">載入中...</p>
                    ) : pages.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-8">尚未建立任何網頁</p>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {pages.map((page) => (
                                <li key={page.id}>
                                    <Link
                                        href={`/builder/${page.id}`}
                                        className="flex items-center gap-3 justify-between py-3 hover:bg-gray-50 rounded px-2 -mx-2 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className=" mr-3 h-24 aspect-video shrink-0 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                                                {page.thumbnailPath ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={`/api/image?pathname=${encodeURIComponent(page.thumbnailPath)}`}
                                                        alt={page.title}
                                                        className="w-full h-full object-cover shadow-lg border rounded-md border-gray-300 "
                                                    />
                                                ) : (
                                                    <ImageOff className="w-4 h-4 text-gray-300" />
                                                )}
                                            </div>
                                            <span className="text-sm text-gray-700 truncate">
                                                {page.title}
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-400 shrink-0">
                                            {new Date(page.updatedAt).toLocaleString('zh-TW')}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                confirmDeletePage(page.id, page.title);
                                            }}
                                            className="p-1.5 rounded shrink-0 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                            aria-label="刪除網頁"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    );
}

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="text-gray-400">{label}</dt>
            <dd className="text-gray-700">{value}</dd>
        </div>
    );
}

function Avatar({ name, picture }: { name: string; picture?: string }) {
    const [failed, setFailed] = useState(false);

    if (!picture || failed) {
        return (
            <div className="size-14 shrink-0 rounded-full bg-gray-400 text-white flex items-center justify-center text-lg font-medium">
                {name.slice(0, 1)}
            </div>
        );
    }

    return (
        <img
            src={picture}
            alt={name}
            referrerPolicy="no-referrer"
            onError={() => setFailed(true)}
            className="size-14 shrink-0 rounded-full object-cover"
        />
    );
}
