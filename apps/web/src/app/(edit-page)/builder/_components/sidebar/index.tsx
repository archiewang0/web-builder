import classNames from 'classnames';
import { Component } from './use-sidebar';
import { useHeaderStore } from '@/store/use-header-store';
import { useResizablePanel } from '@/lib/use-resizable-panel';
import { Toolbar } from './toolbar';
import { ComponentPalette } from './component-palette';
import { PageStructure } from './page-structure';
import { DeletePageButton } from './delete-page-button';

interface SidebarProps {
    components: Component[];
}

export function Sidebar({ components }: SidebarProps) {
    const isPreviewMode = useHeaderStore((state) => state.isPreviewMode);
    const { panelRef, width, handleResizeStart, isCollapsed } = useResizablePanel({
        edge: 'left',
        minWidth: 10,
        maxWidth: 256,
    });

    // 預覽模式改用 PreviewFloatingControls 浮動小工具處理返回編輯／儲存，
    // sidebar（含 device 切換等 Toolbar 功能）整個不 render，畫面才不會被壓縮。
    if (isPreviewMode) return null;

    return (
        <aside ref={panelRef} style={{ width }} className="relative shrink-0 overflow-hidden z-10">
            {/* 內層固定 w-64（256px），對齊 sidebar 最右側；外層寬度縮小時只裁切內層，不會擠壓裡面的文字 */}
            <div className="absolute right-0 top-0 h-full w-64 flex flex-col bg-white border-r border-gray-200 shadow-sm overflow-y-auto">
                <Toolbar />
                {/* 組件庫與頁面結構：預覽模式下收起，只留上方工具列 */}
                {!isPreviewMode && (
                    <>
                        <ComponentPalette components={components} />
                        <PageStructure />
                    </>
                )}

                {/* 刪除目前這份網頁：確認彈窗跟 API 呼叫都跟 member 列表共用（見 delete-confirm-dialog、lib/delete-page） */}
                <div className="mt-auto p-3 border-t border-gray-100">
                    <DeletePageButton />
                </div>
            </div>

            {/* 右邊緣拖拉把手：拖到最左收合隱藏，拖到最右回到 w-64；收合時常駐提示色，方便找到重新拖開的位置 */}
            <div
                onMouseDown={handleResizeStart}
                className={classNames(
                    'absolute inset-y-0 right-0 z-20 w-1.5 cursor-grab hover:bg-blue-400/40 active:cursor-grabbing',
                    isCollapsed && 'bg-blue-400/40'
                )}
            />
        </aside>
    );
}
