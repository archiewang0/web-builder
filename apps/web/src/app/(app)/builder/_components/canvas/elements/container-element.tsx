import classNames from 'classnames';
import { JSX, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { ElementSchema } from '@/lib/schema';
import { getContainerBaseClassName } from '@/lib/element-base-class';
import { useCanvasFixedBounds } from '@/app/(app)/builder/_hooks/use-canvas-fixed-bounds';

interface ContainerElementProps {
    id: string;
    elementProperty: { [key: string]: any };
    columns?: number;
    childrenElements?: ElementSchema[];
    SchemaElementRender: (data: ElementSchema) => JSX.Element;
    isPreviewMode?: boolean;
}

export function ContainerElement({
    id,
    elementProperty,
    columns,
    childrenElements,
    SchemaElementRender,
    isPreviewMode = false,
}: ContainerElementProps) {
    const isFlexMode = columns === undefined;
    const isFixed =
        (elementProperty.style as React.CSSProperties | undefined)?.position === 'fixed';

    // 編輯／預覽畫布不是真正的瀏覽器視窗（有裝置外框、可能只佔部分寬度），
    // 原生 position: fixed 的 top/left/width 沒辦法貼齊畫布，改用 JS 量測外框
    // 目前的實際位置來定位，細節見 use-canvas-fixed-bounds.ts。
    const bounds = useCanvasFixedBounds(isFixed);
    const { style: schemaStyle, ...restElementProperty } = elementProperty;
    const style: React.CSSProperties | undefined =
        isFixed && bounds
            ? { ...schemaStyle, top: bounds.top, left: bounds.left, width: bounds.width }
            : schemaStyle;

    // fixed 元素會脫離文件排版，下方內容會被蓋住——這裡量測它實際渲染的高度，
    // 補一個同高的隱形佔位 div 把後面的內容往下推，行為對齊一般 fixed navbar
    // 的慣用做法。用 ResizeObserver 而不是固定一個 px 數字，是因為 navbar 高度
    // 會隨內容（換行、字型載入、內距調整）變動，寫死高度只會在少數情況下對。
    const spacerRef = useRef<HTMLDivElement>(null);
    const [spacerHeight, setSpacerHeight] = useState(0);

    useLayoutEffect(() => {
        if (!isFixed) {
            setSpacerHeight(0);
            return;
        }
        const el = spacerRef.current;
        if (!el) return;

        const updateHeight = () => setSpacerHeight(el.offsetHeight);
        updateHeight();

        const observer = new ResizeObserver(updateHeight);
        observer.observe(el);
        return () => observer.disconnect();
    }, [isFixed]);

    // 不能直接用 dnd-kit 的 useCombinedRefs 混 useRef 出來的 RefObject（它只吃
    // callback ref）。這裡手刻合併 ref，並用 useCallback 讓身份保持穩定——
    // schema-element-node.tsx 已有註解提醒：ref 身份每個 render 都變的話，
    // dnd-kit 的 setNodeRef 會被反覆呼叫成 null 再呼叫成節點，觸發無限更新。
    const dragDropRef = elementProperty.ref;
    const mergedRef = useCallback(
        (node: HTMLDivElement | null) => {
            spacerRef.current = node;
            if (typeof dragDropRef === 'function') {
                dragDropRef(node);
            }
        },
        [dragDropRef]
    );

    return (
        <>
            <div
                key={id}
                {...restElementProperty}
                style={style}
                ref={mergedRef}
                className={classNames(
                    getContainerBaseClassName({ isFlexMode, columns }),
                    'pointer-events-auto transition-all',
                    !isPreviewMode &&
                        ' p-3 border-2 border-dashed hover:shadow-md cursor-pointer rounded-lg',
                    !isPreviewMode && (elementProperty['selected-style'] || 'border-gray-200'),
                    !isPreviewMode && childrenElements?.length === 0 && 'h-16'
                )}
            >
                {!isPreviewMode && (
                    <span className="absolute top-0 left-0 bg-gray-200 !text-xs">{id}</span>
                )}
                {childrenElements?.map((child) => SchemaElementRender(child))}
            </div>
            {isFixed && <div aria-hidden="true" style={{ height: spacerHeight }} />}
        </>
    );
}
