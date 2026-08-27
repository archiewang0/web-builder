'use client';

import { useDraggable } from '@dnd-kit/core';
import { Component, isPresetId } from './use-sidebar';

interface ComponentPaletteProps {
    components: Component[];
}

// 左側組件庫：拖曳組件到畫布上新增元素
export function ComponentPalette({ components }: ComponentPaletteProps) {
    return (
        <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">組件庫</h2>

            <div className="space-y-1">
                {components.map((component) => (
                    <PaletteItem key={component.id} component={component} />
                ))}
            </div>
        </div>
    );
}

// icon + 文字這塊視覺內容跟 PaletteItem 共用，PaletteItemPreview 給 DragOverlay 用——
// DragOverlay 是 portal 到 document.body，不受 sidebar/canvas 任何 overflow 或
// z-index 影響，拖到哪都看得到，才不用在「overflow-y-auto 的滾動體驗」跟
// 「拖曳預覽會不會被裁掉/蓋住」之間二選一。
function PaletteItemContent({ component }: { component: Component }) {
    return (
        <>
            <component.icon className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-700">{component.name}</span>
        </>
    );
}

// sidebar 組件庫的地方, 這裡有用 useDraggable 用來處理拖曳的部分
function PaletteItem({ component }: { component: Component }) {
    // 樣板跟一般組件視覺上完全一樣，差別只在放開滑鼠後 use-canvas-dnd.tsx
    // 要組出單一元素還是一整棵樣板樹——這裡決定要標成哪一種 drag data。
    const dragData = isPresetId(component.id)
        ? ({ type: 'new-preset' as const, presetId: component.id } as const)
        : ({ type: 'new-component' as const, elementType: component.id } as const);

    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `palette:${component.id}`,
        data: dragData,
    });

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            style={{ opacity: isDragging ? 0.4 : 1 }}
            className=" z-20 flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-grab active:cursor-grabbing border border-gray-100 transition-all hover:shadow-sm"
        >
            <PaletteItemContent component={component} />
        </div>
    );
}

// DragOverlay 底下的靜態預覽：不掛 useDraggable，dnd-kit 自己算 transform 讓它跟著滑鼠跑。
export function PaletteItemPreview({ component }: { component: Component }) {
    return (
        <div className="z-20 flex items-center space-x-3 p-3 rounded-lg border border-gray-100 bg-white shadow-lg cursor-grabbing">
            <PaletteItemContent component={component} />
        </div>
    );
}
