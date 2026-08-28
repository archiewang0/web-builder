'use client';

import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS, useCombinedRefs } from '@dnd-kit/utilities';
import classNames from 'classnames';
import React from 'react';
import { useSchemaStore } from '@/store/use-schema-store';
import { useSelectedElementStore } from '@/store/use-selected-element-store';
import { useHeaderStore } from '@/store/use-header-store';
import { ElementTypeEnums, ElementSchema } from '@/lib/schema';
import { resolveStyles, writeStyles } from '@/lib/responsive-styles';
import {
    ButtonElement,
    ContainerElement,
    DropdownMenuElement,
    ImgElement,
    TextElement,
} from './elements';
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
    const activeDevice = useHeaderStore((state) => state.activeDevice);

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
        data: { elementType: data.elementType },
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

    const resolvedStyle = resolveStyles(data.styles, activeDevice) as React.CSSProperties;
    // 「這個裝置隱藏」是 VisibilitySetting 寫進 styles.display 的 'none'，見
    // use-property-setting.tsx 的 handleVisibilityChange 註解。編輯模式下不
    // 真的用 display:none 讓元素消失——不然沒辦法點選/拖曳/編輯它，只能靠
    // 結構樹才找得到——改成半透明＋小標籤呈現「這個裝置會被隱藏」，選取/拖曳
    // 邏輯完全不受影響。只有切到「預覽模式」才真的套用 display:none，準確
    // 模擬正式站台在這個裝置下的樣子。
    const isHiddenOnDevice = resolvedStyle.display === 'none';
    const showHiddenGhost = isHiddenOnDevice && !isPreviewMode;

    const elementProperty = {
        ['data-element-type']: data.elementType,
        ['data-element-id']: data.id,
        ['selected-style']: classNames(
            // 選取框跟拖曳插入提示原本用 Tailwind 的 ring（底層也是套用 box-shadow），
            // 一旦元素自己也設了陰影（shadow-setting 面板寫進 styles.boxShadow，
            // 以 inline style 套用），inline style 的 box-shadow 會直接蓋掉 ring 的
            // box-shadow，選取框就悄悄消失。outline 是獨立的 CSS 屬性、不佔版面，
            // 不會跟 box-shadow 搶同一個屬性，改用它就不受自訂陰影影響。
            isSelected && !isPreviewMode && 'relative z-10 outline outline-2 outline-blue-500',
            // outline-dashed 不是真的存在的 Tailwind class（outline 沒有虛線畫法可用
            // 在這個情境下跟 ring 一樣的限制），瀏覽器會直接忽略——改用背景色 + 實心
            // outline，確保「放手後會塞進這個容器」跟「插在它前面/後面」視覺上明顯不同。
            isDropTarget &&
                dropPosition === 'inside' &&
                'relative z-10 outline outline-2 outline-blue-400 bg-blue-50/60',
            // before/after 是插入線：在 target 的上緣／下緣畫一條粗線，
            // 提示放手後會插在它的前面還是後面，而不是塞進它裡面。
            isDropTarget && dropPosition === 'before' && 'relative border-t-4 border-t-blue-500',
            isDropTarget && dropPosition === 'after' && 'relative border-b-4 border-b-blue-500',
            // 用 ::before 的 content 掛一個小標籤，不用另外在 5 種元件裡各自加一個
            // DOM 節點——加一個真的 sibling 節點會多佔一個 flex/grid 欄位，
            // 破壞版面（跟 img-element 註解裡「不能直接回傳 null」是同一個顧慮）。
            showHiddenGhost &&
                "relative before:absolute before:left-0 before:top-0 before:z-20 before:whitespace-nowrap before:rounded before:bg-amber-100 before:px-1 before:text-[10px] before:text-amber-700 before:content-['已隱藏']"
        ),
        ref: setNodeRef,
        ...attributes,
        ...listeners,
        style: {
            ...resolvedStyle,
            display: showHiddenGhost ? undefined : resolvedStyle.display,
            opacity: showHiddenGhost ? 0.4 : resolvedStyle.opacity,
            transform: transform ? CSS.Translate.toString(transform) : undefined,
            ...(isBeingDragged ? { opacity: 0.4 } : {}),
        },
        onClick: (e: React.MouseEvent) => {
            e.stopPropagation();
            setSelectedElement(data.id);
        },
    };

    // 根據元件類型渲染
    switch (data.elementType) {
        case ElementTypeEnums.text:
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

        case ElementTypeEnums.image: {
            // 單位（% or px）跟寬高都要看「目前 activeDevice 解析後」的值——
            // 使用者可能只在某個裝置覆寫過寬度，直接讀 data.styles.width（現在是
            // 巢狀結構，且不一定是目前裝置那一層）會拿到錯的值，跟
            // image-size-setting.tsx 的判斷方式要一致，都走 resolveStyles。
            const resolvedImageStyles = resolveStyles(data.styles, activeDevice);
            const rawWidth = resolvedImageStyles.width;
            const isPxUnit = Boolean(rawWidth && rawWidth.endsWith('px'));
            const widthValue = rawWidth ? parseInt(rawWidth, 10) : NaN;
            const heightValue = resolvedImageStyles.height
                ? parseInt(resolvedImageStyles.height, 10)
                : NaN;
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
                            styles: writeStyles(data.styles, activeDevice, { width: `${percent}%` }),
                        } as Partial<ElementSchema>)
                    }
                />
            );
        }

        case ElementTypeEnums.button:
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

        case ElementTypeEnums.container:
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

        case ElementTypeEnums.dropdownMenu:
            return (
                <DropdownMenuElement
                    key={data.id}
                    id={data.id}
                    elementProperty={elementProperty}
                    content={data.content}
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
