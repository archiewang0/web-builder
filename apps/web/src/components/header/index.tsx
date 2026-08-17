'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogIn, LogOut } from 'lucide-react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useHeaderStore } from '@/store/use-header-store';

// 頂部工具欄：被提升到 layout 中渲染，所有頁面共用。
// 裝置切換／預覽／儲存是 builder 專屬功能，改放進 Sidebar 裡面。
export function Header() {
    const { data: session } = useSession();
    const isLoggedIn = Boolean(session);
    const user = session?.user;
    const isPreviewMode = useHeaderStore((state) => state.isPreviewMode);
    const pathname = usePathname();

    // isPreviewMode 是跨頁面共用的全域 state，只有在 builder 頁面本身才需要
    // 因為預覽模式隱藏 header；離開 /builder 後即使值還沒重置，也不該連帶消失。
    if (isPreviewMode && pathname.startsWith('/builder')) return null;

    return (
        <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-4">
                <Link href="/" className="text-xl font-bold text-gray-800">
                    Website Builder
                </Link>
                <Link href="/gallery" className="text-sm text-gray-600 hover:text-gray-900">
                    展示牆
                </Link>
            </div>

            <div className="flex items-center ">
                {isLoggedIn && (
                    <Link
                        href="/member"
                        title="會員中心"
                        className=" flex items-center mr-8
                    "
                    >
                        {user?.image ? (
                            <img
                                src={user.image}
                                alt={user.name ?? ''}
                                className="w-8 h-8 rounded-full"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-300" />
                        )}

                        {user?.name && (
                            <span className="ml-2 text-sm text-gray-600">{user.name}</span>
                        )}
                    </Link>
                )}

                <button
                    onClick={() => (isLoggedIn ? signOut() : signIn('google'))}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    {isLoggedIn ? <LogOut className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                    <span className="text-sm">{isLoggedIn ? '登出' : '登入'}</span>
                </button>
            </div>
        </header>
    );
}
