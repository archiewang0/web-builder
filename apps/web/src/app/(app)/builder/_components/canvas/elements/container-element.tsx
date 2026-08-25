import classNames from 'classnames';
import { JSX, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { ElementSchema } from '@/lib/schema';

const GRID_COLS: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
};

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
    const isFixed = (elementProperty.style as React.CSSProperties | undefined)?.position === 'fixed';

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
                {...elementProperty}
                ref={mergedRef}
                className={classNames(
                    'relative w-full pointer-events-auto rounded-lg transition-all',
                    !isPreviewMode && ' p-3 border-2 border-dashed hover:shadow-md cursor-pointer',
                    isFlexMode && 'flex flex-wrap gap-2',
                    !isFlexMode && columns > 1 && `grid gap-2 ${GRID_COLS[columns] ?? 'grid-cols-2'}`,
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
