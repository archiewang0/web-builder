'use client';

import { useCallback } from 'react';
import classNames from 'classnames';
import { Image as ImageIcon } from 'lucide-react';
import { useImageResize } from './use-image-resize';
import { IMAGE_BASE_CLASSNAME } from '@/lib/element-base-class';
import {
    PLACEHOLDER_IMG_WIDTH_PX,
    PLACEHOLDER_IMG_HEIGHT_PX,
    PLACEHOLDER_IMG_MAX_WIDTH_PERCENT,
    PLACEHOLDER_IMG_MIN_WIDTH_PERCENT,
} from '@/app/(app)/builder/_const/img';
import { useHeaderStore } from '@/store/use-header-store';

interface ImgElementProps {
    id: string;
    content?: string;
    elementProperty: { [key: string]: any };
    unit?: 'percent' | 'px';
    widthPercent?: number;
    widthPx?: number;
    heightPx?: number;
    onResizeWidth?: (percent: number) => void;
}

const handleClassName =
    'absolute top-1/2 -translate-y-1/2 w-2 h-10 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-ew-resize';

export function ImgElement({
    id,
    content,
    elementProperty,
    unit = 'percent',
    widthPercent = 100,
    widthPx,
    heightPx,
    onResizeWidth,
}: ImgElementProps) {
    const isPxMode = unit === 'px';
    const { wrapperRef, displayPercent, startResize, handleDragStart } = useImageResize({
        widthPercent,
        onResizeWidth,
    });

    const isPreviewMode = useHeaderStore((state) => state.isPreviewMode);

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
    // 沒設圖片時的佔位框，寬度也要跟著拖曳把手／屬性面板的百分比走，不能寫死
    // 100%——不然使用者在還沒上傳圖片前调整寬度，畫面完全沒反應，會以為调整
    // 失敗。用獨立的 PLACEHOLDER_IMG_MIN/MAX_WIDTH_PERCENT 夾住，避免 schema
    // 裡存了超出範圍的髒值時佔位框跑版。
    const clampedPlaceholderPercent = Math.min(
        PLACEHOLDER_IMG_MAX_WIDTH_PERCENT,
        Math.max(PLACEHOLDER_IMG_MIN_WIDTH_PERCENT, displayPercent)
    );

    return (
        <div
            ref={setRefs}
            {...restProperty}
            onDragStart={handleDragStart}
            style={
                isPxMode
                    ? {
                          ...style,
                          width: widthPx ?? PLACEHOLDER_IMG_WIDTH_PX,
                          height: heightPx ?? PLACEHOLDER_IMG_HEIGHT_PX,
                      }
                    : {
                          ...style,
                          width: `${hasImage ? displayPercent : clampedPlaceholderPercent}%`,
                          ...(!hasImage && {
                              aspectRatio: `${PLACEHOLDER_IMG_WIDTH_PX} / ${PLACEHOLDER_IMG_HEIGHT_PX}`,
                          }),
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
                    style={{
                        display: 'block',
                        width: '100%',
                        height: isPxMode ? '100%' : 'auto',
                        borderRadius: style?.borderRadius,
                    }}
                    className={classNames(
                        IMAGE_BASE_CLASSNAME,
                        'pointer-events-auto',
                        'object-cover'
                        // isPxMode && 'object-cover'
                    )}
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

            {/* image resize bar：px 模式的寬高由屬性面板輸入框直接控制，
                拖曳把手是針對「相對父層百分比」設計的，px 模式下不適用，先隱藏 */}

            {!isPreviewMode && !isPxMode && (
                <>
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
                </>
            )}
        </div>
    );
}
