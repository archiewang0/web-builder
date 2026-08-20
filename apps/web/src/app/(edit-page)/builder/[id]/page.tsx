'use client';
import Link from 'next/link';
import { DndContext, pointerWithin } from '@dnd-kit/core';
import { useSidebar } from '../_components/sidebar/use-sidebar';
import { useHeaderStore } from '@/store/use-header-store';
import { Sidebar } from '../_components/sidebar';
import { Canvas } from '../_components/canvas';
import { PropertySetting } from '../_components/property-setting';
import { PreviewFloatingControls } from '../_components/preview-floating-controls';
import { usePageLoader } from './use-page-loader';
import { useCanvasDnd } from '../_components/_hooks/use-canvas-dnd';
import { useEventLogger } from '../_components/canvas/event-log/use-event-logger';
import { EventLoggerPanel } from '../_components/canvas/event-log/event-logger-panel';

// 登入檢查已經交給 middleware.ts 做 server-side guard，這裡不用再判斷。
export default function WebBuilderPage() {
    const isPreviewMode = useHeaderStore((state) => state.isPreviewMode);
    const { components } = useSidebar();
    const { status } = usePageLoader();
    const { eventLog, logEvent, clearLog, copyAsJSON, copyAsTest } = useEventLogger();
    // 唯一的拖曳協調者：Sidebar（新元件來源）跟 Canvas（既有元素 reorder + drop 目標）
    // 都要在同一個 <DndContext> 底下才能互相拖放，所以掛在這裡，而不是 Canvas 內部。
    const { sensors, handleDragStart, handleDragOver, handleDragEnd, activeId, overId, dropPosition } =
        useCanvasDnd(logEvent);

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
        <DndContext
            sensors={sensors}
            // 預設的 rectIntersection 是用「拖曳中元素」跟「droppable」的面積重疊比例
            // （IoU）判斷 over，兩者大小差太多時（例如拖一個大元素經過空容器——空容器
            // 只有 padding、沒有內容撐高度，面積很小）比例會被拉低，導致空容器幾乎選不到，
            // 永遠被外層的 Body 或旁邊的元素卡位。pointerWithin 改成單純看滑鼠座標點有沒有
            // 落在該 droppable 範圍內，跟拖曳元素的大小無關，巢狀小目標才能被準確選到。
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex-1 flex ">
                {/* 左側面板：裝置切換／預覽／儲存工具列常駐，組件庫與頁面結構在預覽模式下收起 */}
                <Sidebar components={components} />

                {/* 中央畫布區域 */}
                <Canvas
                    isPreviewMode={isPreviewMode}
                    dragState={{ activeId, overId, dropPosition }}
                />

                {/* 右側屬性面板：預覽模式下隱藏 */}
                {!isPreviewMode && <PropertySetting />}

                {/* 預覽模式：sidebar 已整個不 render，改用浮動小工具負責返回編輯／儲存 */}
                {isPreviewMode && <PreviewFloatingControls />}
            </div>

            <EventLoggerPanel
                eventLog={eventLog}
                onClear={clearLog}
                onCopyJSON={copyAsJSON}
                onCopyTest={copyAsTest}
            />
        </DndContext>
    );
}
