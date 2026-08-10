'use client';
import Link from 'next/link';
import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { usePages } from './use-pages';
import { useCreatePage } from '@/lib/use-create-page';

export default function MemberPage() {
    const { data: session } = useSession();
    const user = session?.user;
    const { pages, isLoading } = usePages(Boolean(user));
    const handleCreatePage = useCreatePage();

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
                                        className="flex items-center justify-between py-3 hover:bg-gray-50 rounded px-2 -mx-2 transition-colors"
                                    >
                                        <span className="text-sm text-gray-700">{page.title}</span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(page.updatedAt).toLocaleString('zh-TW')}
                                        </span>
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

function GoogleIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 18 18" className={className}>
            <path
                fill="#4285F4"
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.259h2.908c1.702-1.567 2.684-3.874 2.684-6.617z"
            />
            <path
                fill="#34A853"
                d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
            />
            <path
                fill="#FBBC05"
                d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.348 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"
            />
            <path
                fill="#EA4335"
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
            />
        </svg>
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
