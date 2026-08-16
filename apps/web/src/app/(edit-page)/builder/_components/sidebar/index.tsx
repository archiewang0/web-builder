import classNames from 'classnames';
import { Dispatch, SetStateAction } from 'react';
import { Component, ComponentIdEnums } from './use-sidebar';
import { useHeaderStore } from '@/store/use-header-store';
import { useSidebarResize } from './use-sidebar-resize';
import { Toolbar } from './toolbar';
import { ComponentPalette } from './component-palette';
import { PageStructure } from './page-structure';

interface SidebarProps {
    components: Component[];
    setDragStartTaget: Dispatch<SetStateAction<ComponentIdEnums | null>>;
    setDragEndTaget: Dispatch<SetStateAction<ComponentIdEnums | null>>;
}

export function Sidebar({ components, setDragStartTaget, setDragEndTaget }: SidebarProps) {
    const isPreviewMode = useHeaderStore((state) => state.isPreviewMode);
    const { asideRef, width, handleResizeStart, isCollapsed } = useSidebarResize();

    return (
        <aside ref={asideRef} style={{ width }} className="relative shrink-0 overflow-hidden">
            {/* 內層固定 w-64（256px），對齊 sidebar 最右側；外層寬度縮小時只裁切內層，不會擠壓裡面的文字 */}
            <div className="absolute right-0 top-0 h-full w-64 flex flex-col bg-white border-r border-gray-200 shadow-sm overflow-y-auto">
                <Toolbar />

                {/* 組件庫與頁面結構：預覽模式下收起，只留上方工具列 */}
                {!isPreviewMode && (
                    <>
                        <ComponentPalette
                            components={components}
                            setDragStartTaget={setDragStartTaget}
                            setDragEndTaget={setDragEndTaget}
                        />
                        <PageStructure />
                    </>
                )}
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
