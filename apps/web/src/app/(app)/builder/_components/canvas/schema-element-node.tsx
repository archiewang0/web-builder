'use client';

import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS, useCombinedRefs } from '@dnd-kit/utilities';
import classNames from 'classnames';
import React from 'react';
import { useSchemaStore } from '@/store/use-schema-store';
import { useSelectedElementStore } from '@/store/use-selected-element-store';
import { ComponentIdEnums, ElementSchema } from '@/lib/schema';
import { ButtonElement, ContainerElement, ImgElement, TextElement } from './elements';
import type { DropPosition } from '@/lib/schema-tree';

export interface DragVisualState {
    activeId: string | null;
    overId: string | null;
    dropPosition: DropPosition | null;
}

interface SchemaElementNodeProps {
    data: ElementSchema;
    isPreviewMode: boolean;
    dragState: DragVisualState;
}

export function SchemaElementNode({ data, isPreviewMode, dragState }: SchemaElementNodeProps) {
    const updateElement = useSchemaStore((state) => state.updateElement);
    const selectedElement = useSelectedElementStore((state) => state.selectedElement);
    const setSelectedElement = useSelectedElementStore((state) => state.setSelectedElement);

    const isSelected = data.id === selectedElement;

    // 文字選取後會進入 contentEditable 編輯狀態，這裡不整個停用拖曳——而是保持
    // useDraggable 一直是 enabled，改由 TextElement 自己決定要不要把 onPointerDown
    // 轉發給 dnd-kit（只有抓邊緣才轉發，抓文字中間讓瀏覽器處理游標定位/選取字）。
    const {
        attributes,
        listeners,
        setNodeRef: setDragRef,
        transform,
    } = useDraggable({
        id: data.id,
        data: { type: 'existing-element' as const },
    });
    const { setNodeRef: setDropRef } = useDroppable({
        id: data.id,
        data: { componentId: data.componentId },
    });

    // dnd-kit 自己的 setDragRef/setDropRef 是穩定的（内部用 useCallback([]) 包住），
    // 但合併成一個 ref callback 這個動作如果每次 render 都重新 new 一個函式，
    // ref 的身份（identity）就會每次 render 都不一樣——React 判斷 ref prop 換了新的
    // function，就會每個 render 都先把舊 ref 呼叫成 null 再把新 ref 呼叫成該節點，
    // 而 dnd-kit 的 setNodeRef 內部在「node 變了」時會 dispatch 更新 context，
    // 於是變成 render → ref 換身份 → dispatch → re-render → ref 又換身份 → 無限迴圈
    // （Maximum update depth exceeded）。用 dnd-kit 官方提供的 useCombinedRefs，
    // 它用 useMemo 把合併後的 ref 記住，只要 setDragRef/setDropRef 不變就不會重建。
    const setNodeRef = useCombinedRefs(setDragRef, setDropRef);

    const { activeId, overId, dropPosition } = dragState;
    const isBeingDragged = data.id === activeId;
    const isDropTarget = data.id === overId && data.id !== activeId;

    const elementProperty = {
        ['data-component-id']: data.componentId,
        ['data-element-id']: data.id,
        ['selected-style']: classNames(
            isSelected && 'relative z-10 ring-2 ring-blue-500',
            // ring-dashed 不是真的存在的 Tailwind class（ring 是用 box-shadow 模擬，
            // box-shadow 沒有虛線畫法），瀏覽器會直接忽略——改用背景色 + 實心 ring，
            // 確保「放手後會塞進這個容器」跟「插在它前面/後面」視覺上明顯不同。
            isDropTarget &&
                dropPosition === 'inside' &&
                'relative z-10 ring-2 ring-blue-400 bg-blue-50/60',
            // before/after 是插入線：在 target 的上緣／下緣畫一條粗線，
            // 提示放手後會插在它的前面還是後面，而不是塞進它裡面。
            isDropTarget && dropPosition === 'before' && 'relative border-t-4 border-t-blue-500',
            isDropTarget && dropPosition === 'after' && 'relative border-b-4 border-b-blue-500'
        ),
        ref: setNodeRef,
        ...attributes,
        ...listeners,
        style: {
            ...(data.styles as React.CSSProperties),
            transform: transform ? CSS.Translate.toString(transform) : undefined,
            ...(isBeingDragged ? { opacity: 0.4 } : {}),
        },
        onClick: (e: React.MouseEvent) => {
            e.stopPropagation();
            setSelectedElement(data.id);
        },
    };

    // 根據元件類型渲染
    switch (data.componentId) {
        case ComponentIdEnums.text:
            return (
                <TextElement
                    key={data.id}
                    id={data.id}
                    elementProperty={elementProperty}
                    content={data.content}
                    isSelected={isSelected}
                    onContentChange={(content) =>
                        updateElement(data.id, { content } as Partial<ElementSchema>)
                    }
                />
            );

        case ComponentIdEnums.image: {
            // 單位（% or px）直接看 styles.width 的後綴，跟 image-size-setting.tsx
            // 判斷方式一致，不用另外存一個 unit 欄位。
            const rawWidth = data.styles?.width;
            const isPxUnit = Boolean(rawWidth && rawWidth.endsWith('px'));
            const widthValue = rawWidth ? parseInt(rawWidth, 10) : NaN;
            const heightValue = data.styles?.height ? parseInt(data.styles.height, 10) : NaN;
            return (
                <ImgElement
                    key={data.id}
                    id={data.id}
                    elementProperty={elementProperty}
                    content={data.content}
                    unit={isPxUnit ? 'px' : 'percent'}
                    widthPercent={!isPxUnit && !Number.isNaN(widthValue) ? widthValue : 100}
                    widthPx={isPxUnit && !Number.isNaN(widthValue) ? widthValue : undefined}
                    heightPx={isPxUnit && !Number.isNaN(heightValue) ? heightValue : undefined}
                    onResizeWidth={(percent) =>
                        updateElement(data.id, {
                            styles: { ...data.styles, width: `${percent}%` },
                        } as Partial<ElementSchema>)
                    }
                />
            );
        }

        case ComponentIdEnums.button:
            return (
                <ButtonElement
                    key={data.id}
                    id={data.id}
                    elementProperty={elementProperty}
                    content={data.content}
                    href={data.href}
                    isPreviewMode={isPreviewMode}
                />
            );

        case ComponentIdEnums.container:
            return (
                <ContainerElement
                    key={data.id}
                    id={data.id}
                    elementProperty={elementProperty}
                    columns={data.columns}
                    SchemaElementRender={(child) => (
                        <SchemaElementNode
                            key={child.id}
                            data={child}
                            isPreviewMode={isPreviewMode}
                            dragState={dragState}
                        />
                    )}
                    childrenElements={data.children}
                    isPreviewMode={isPreviewMode}
                />
            );
    }
}
