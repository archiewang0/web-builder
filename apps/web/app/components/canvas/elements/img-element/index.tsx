'use client';

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

    const { style, ...restProperty } = elementProperty;
    const hasImage = Boolean(content);

    return (
        <div
            ref={wrapperRef}
            {...restProperty}
            onDragStart={handleDragStart}
            style={
                hasImage
                    ? { ...style, width: `${displayPercent}%`, maxWidth: PLACEHOLDER_WIDTH }
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
                    style={{
                        display: 'block',
                        width: '100%',
                        height: 'auto',
                        maxHeight: PLACEHOLDER_HEIGHT,
                        objectFit: 'contain',
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
                onMouseDown={startResize('left')}
                className={classNames(handleClassName, 'left-0 -translate-x-1/2')}
            />
            <div
                draggable={false}
                onMouseDown={startResize('right')}
                className={classNames(handleClassName, 'right-0 translate-x-1/2')}
            />
        </div>
    );
}
