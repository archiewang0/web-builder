'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSidebar } from './_components/sidebar/use-sidebar';
import { useHeaderStore } from '@/store/use-header-store';
import { useAuthStore } from '@/store/use-auth-store';
import { Sidebar } from './_components/sidebar';
import { Canvas } from './_components/canvas';
import { PropertySetting } from './_components/property-setting';

export default function WebBuilderPage() {
    const router = useRouter();
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
    const isPreviewMode = useHeaderStore((state) => state.isPreviewMode);
    const { components, setDragEndTaget, setDragStartTaget } = useSidebar();

    // 目前登入狀態只是前端 Zustand mock，沒有 cookie/session 可以在 middleware 做 server-side guard，
    // 先用 client-side 導向；未接上真的 Google OAuth 之後可以換成 middleware 檢查 session。
    useEffect(() => {
        if (!isLoggedIn) {
            router.replace('/member');
        }
    }, [isLoggedIn, router]);

    if (!isLoggedIn) {
        return null;
    }

    return (
        <div className="flex-1 flex overflow-hidden bg-gray-50">
            {/* 左側面板：裝置切換／預覽／儲存工具列常駐，組件庫與頁面結構在預覽模式下收起 */}
            <Sidebar
                components={components}
                setDragEndTaget={setDragEndTaget}
                setDragStartTaget={setDragStartTaget}
            />

            {/* 中央畫布區域 */}
            <Canvas isPreviewMode={isPreviewMode} />

            {/* 右側屬性面板：預覽模式下隱藏 */}
            {!isPreviewMode && <PropertySetting />}
        </div>
    );
}
