'use client';
import Link from 'next/link';
import { useSidebar } from '../_components/sidebar/use-sidebar';
import { useHeaderStore } from '@/store/use-header-store';
import { Sidebar } from '../_components/sidebar';
import { Canvas } from '../_components/canvas';
import { PropertySetting } from '../_components/property-setting';
import { usePageLoader } from './use-page-loader';

// 登入檢查已經交給 middleware.ts 做 server-side guard，這裡不用再判斷。
export default function WebBuilderPage() {
    const isPreviewMode = useHeaderStore((state) => state.isPreviewMode);
    const { components, setDragEndTaget, setDragStartTaget } = useSidebar();
    const { status } = usePageLoader();

    if (status === 'loading') {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-400">
                載入中...
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="mb-4 text-gray-500">找不到這份網頁，或你沒有權限查看</p>
                    <Link href="/member" className="text-blue-500 hover:underline">
                        回會員中心
                    </Link>
                </div>
            </div>
        );
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
