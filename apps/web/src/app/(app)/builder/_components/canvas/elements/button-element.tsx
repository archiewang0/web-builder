'use client';

import classNames from 'classnames';
import { useCallback } from 'react';
import { useSelectedElementStore } from '@/store/use-selected-element-store';
import { BUTTON_BASE_CLASSNAME } from '@/lib/element-base-class';
import { useEditableContent } from '@/app/(app)/builder/_hooks/use-editable-content';

interface ButtonElementProps {
    id: string;
    content?: string;
    elementProperty: { [key: string]: any };
    href?: string;
    isPreviewMode?: boolean;
    isSelected?: boolean;
    isEditing?: boolean;
    onContentChange?: (content: string) => void;
}

// '#' 開頭 = 捲動到元素；跟 store 欄位註解、button-link-setting.tsx 是同一套判斷。
const isScrollHref = (href: string) => href.startsWith('#');

export function ButtonElement({
    id,
    content,
    elementProperty,
    href,
    isPreviewMode,
    isSelected = false,
    isEditing = false,
    onContentChange,
}: ButtonElementProps) {
    const setEditingElement = useSelectedElementStore((state) => state.setEditingElement);
    const {
        ref: localRef,
        handleInput,
        handleBlur,
        handlePaste,
    } = useEditableContent<HTMLSpanElement>({
        content,
        defaultText: '按鈕',
        isEditing,
        onContentChange,
    });

    const {
        style,
        onClick: selectOnClick,
        onPointerDown: dndPointerDown,
        'selected-style': selectedStyle,
        ...divProps
    } = elementProperty;

    // preview 模式下模擬公開頁的真實點擊行為，不再只是選取元素。
    // 編輯器畫布的節點只有 data-element-id（沒有原生 id 屬性，id 是保留給公開頁
    // 的錨點導覽用），沒辦法靠瀏覽器原生 <a href="#..."> 跳轉，用
    // querySelector + scrollIntoView 自己找目標節點捲過去。外部網址則開新分頁，
    // 避免在編輯器裡點一下就把整個分頁導航走、弄丟正在編輯的頁面。
    const handlePreviewClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!href) return;
        if (isScrollHref(href)) {
            const targetId = href.slice(1);
            document
                .querySelector(`[data-element-id="${targetId}"]`)
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }
        window.open(href, '_blank', 'noopener,noreferrer');
    };

    // 外層＝outline 層：第一次點擊只負責選取（顯示外框、可以按 Delete 刪掉整個
    // 按鈕），不會自動進入編輯模式。已經選取過的狀態下再點一次，才進入
    // editingElement，真正 focus 進去改文案。
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (isPreviewMode && href) {
            handlePreviewClick(e);
            return;
        }
        if (!isSelected) {
            selectOnClick?.(e);
            return;
        }
        e.stopPropagation();
        setEditingElement(id);
    };

    // p-2 般的邊緣拖曳把手概念套用在整個按鈕方塊：還沒進入編輯模式時整顆按鈕
    // 都能拖，一旦進入編輯（isEditing），中間要留給打字／移動游標／選字，
    // 只有抓邊緣才轉發給 dnd-kit 開始拖曳，避免點進去打字被誤判成要拖曳。
    const EDGE_GRAB_PX = 8;
    const handlePointerDown = useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            if (!isEditing) {
                dndPointerDown?.(e);
                return;
            }
            const rect = e.currentTarget.getBoundingClientRect();
            const nearEdge =
                e.clientX - rect.left <= EDGE_GRAB_PX ||
                rect.right - e.clientX <= EDGE_GRAB_PX ||
                e.clientY - rect.top <= EDGE_GRAB_PX ||
                rect.bottom - e.clientY <= EDGE_GRAB_PX;
            if (nearEdge) {
                dndPointerDown?.(e);
            }
        },
        [isEditing, dndPointerDown]
    );

    return (
        <div {...divProps} onPointerDown={handlePointerDown}>
            <button
                type="button"
                style={style}
                onClick={handleClick}
                className={classNames(
                    BUTTON_BASE_CLASSNAME,
                    'pointer-events-auto cursor-pointer ',
                    selectedStyle
                )}
            >
                <span
                    ref={localRef}
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    onInput={isEditing ? handleInput : undefined}
                    onBlur={isEditing ? handleBlur : undefined}
                    onPaste={isEditing ? handlePaste : undefined}
                    className={classNames(
                        'outline-none',
                        isEditing && 'cursor-text',
                        'hover:opacity-50 transition-all'
                    )}
                />
            </button>
        </div>
    );
}
