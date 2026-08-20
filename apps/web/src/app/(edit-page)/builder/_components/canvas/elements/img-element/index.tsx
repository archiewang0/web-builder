'use client';

import { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import { Image as ImageIcon } from 'lucide-react';
import { useImageResize } from './use-image-resize';

interface ImgElementProps {
    id: string;
    content?: string;
    elementProperty: { [key: string]: any };
    widthPercent?: number;
    onResizeWidth?: (percent: number) => void;
}

const handleClassName =
    'absolute top-1/2 -translate-y-1/2 w-2 h-10 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-ew-resize';

const PLACEHOLDER_WIDTH = 300;
const PLACEHOLDER_HEIGHT = 200;

export function ImgElement({
    id,
    content,
    elementProperty,
    widthPercent = 100,
    onResizeWidth,
}: ImgElementProps) {
    const { wrapperRef, displayPercent, startResize, handleDragStart } = useImageResize({
        widthPercent,
        onResizeWidth,
    });

    // elementProperty.ref 是 dnd-kit 的 setNodeRef（穩定的 callback），這裡還需要
    // 自己的 wrapperRef 量測尺寸做縮放，兩個 ref 要一起呼叫——合併函式本身也要用
    // useCallback 記住，不然每次 render 都是新函式，會觸發 dndRef 內部的
    // re-register，變成無限迴圈（跟 schema-element-node.tsx 修過的問題一樣）。
    const { style, ref: dndRef, ...restProperty } = elementProperty;
    const setRefs = useCallback(
        (node: HTMLDivElement | null) => {
            wrapperRef.current = node;
            if (typeof dndRef === 'function') dndRef(node);
        },
        [dndRef, wrapperRef]
    );
    const hasImage = Boolean(content);

    // 換圖時先清掉舊尺寸，避免顯示上一張圖片殘留的自然尺寸
    const [naturalWidth, setNaturalWidth] = useState<number | null>(null);
    useEffect(() => {
        setNaturalWidth(null);
    }, [content]);

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        setNaturalWidth(e.currentTarget.naturalWidth);
    };

    return (
        <div
            ref={setRefs}
            {...restProperty}
            onDragStart={handleDragStart}
            style={
                hasImage
                    ? {
                          ...style,
                          width: `${displayPercent}%`,
                          maxWidth: naturalWidth ?? PLACEHOLDER_WIDTH,
                      }
                    : {
                          ...style,
                          width: '100%',
                          maxWidth: PLACEHOLDER_WIDTH,
                          aspectRatio: `${PLACEHOLDER_WIDTH} / ${PLACEHOLDER_HEIGHT}`,
                      }
            }
            className={classNames(
                'inline-block group relative pointer-events-auto cursor-pointer rounded transition-all',
                elementProperty['selected-style']
            )}
        >
            {hasImage ? (
                <img
                    key={id}
                    src={content}
                    alt="元件圖片"
                    draggable={false}
                    onLoad={handleImageLoad}
                    style={{
                        display: 'block',
                        width: '100%',
                        height: 'auto',
                        borderRadius: style?.borderRadius,
                    }}
                    className="pointer-events-auto rounded"
                />
            ) : (
                <div
                    className="flex flex-col items-center justify-center gap-2 w-full h-full bg-gray-50 text-gray-300"
                    style={{ borderRadius: style?.borderRadius }}
                >
                    <ImageIcon size={48} strokeWidth={1.5} />
                    <span className="text-xs text-gray-400">尚未設定圖片</span>
                </div>
            )}
            <div
                draggable={false}
                onPointerDownCapture={(e) => e.stopPropagation()}
                onMouseDown={startResize('left')}
                className={classNames(handleClassName, 'left-0 -translate-x-1/2')}
            />
            <div
                draggable={false}
                onPointerDownCapture={(e) => e.stopPropagation()}
                onMouseDown={startResize('right')}
                className={classNames(handleClassName, 'right-0 translate-x-1/2')}
            />
        </div>
    );
}
