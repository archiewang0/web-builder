import classNames from 'classnames';
import type { JSX } from 'react';
import { ChevronDown } from 'lucide-react';
import { ElementSchema } from '@/lib/schema';
import { BUTTON_BASE_CLASSNAME } from '@/lib/element-base-class';

interface DropdownMenuElementProps {
    id: string;
    elementProperty: { [key: string]: any };
    content?: string;
    childrenElements?: ElementSchema[];
    SchemaElementRender: (data: ElementSchema) => JSX.Element;
    isPreviewMode?: boolean;
}

// 編輯器裡不模擬真正的開合互動（正式站台才是真的 Radix DropdownMenu，見
// app/site/[id]/dropdown-menu-widget.tsx）——內容區塊永遠展開，比照
// ContainerElement 用同一個 id 當拖放目標、同一組 SchemaElementRender callback
// 遞迴渲染小孩，這樣使用者可以直接把 button/text/container 拖進來編輯。
export function DropdownMenuElement({
    id,
    elementProperty,
    content,
    childrenElements,
    SchemaElementRender,
    isPreviewMode = false,
}: DropdownMenuElementProps) {
    const { style, onClick, 'selected-style': selectedStyle, ...divProps } = elementProperty;

    return (
        <div key={id} {...divProps} className="pointer-events-auto">
            <button
                style={style}
                onClick={onClick}
                className={classNames(
                    BUTTON_BASE_CLASSNAME,
                    'pointer-events-auto inline-flex cursor-pointer items-center gap-1 hover:opacity-80',
                    selectedStyle
                )}
            >
                {content || '選單'}
                <ChevronDown className="size-4" />
            </button>

            <div
                className={classNames(
                    'mt-1 min-w-40 space-y-1 rounded-lg p-2',
                    !isPreviewMode && 'border-2 border-dashed border-gray-300'
                )}
            >
                {!isPreviewMode && (
                    <span className="block text-xs text-gray-400">選單內容（發布後預設收合）</span>
                )}
                {childrenElements?.map((child) => SchemaElementRender(child))}
                {!isPreviewMode && childrenElements?.length === 0 && <div className="h-10" />}
            </div>
        </div>
    );
}
