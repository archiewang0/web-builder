'use client';

import classNames from 'classnames';
import { useCallback, useLayoutEffect, useRef } from 'react';
import { useDebouncedCallback } from '@/lib/use-debounce';

interface TextElementProps {
    id: string;
    content?: string;
    elementProperty: { [key: string]: any };
    isSelected?: boolean;
    onContentChange?: (content: string) => void;
}

export function TextElement({
    id,
    content,
    elementProperty,
    isSelected = false,
    onContentChange,
}: TextElementProps) {
    const localRef = useRef<HTMLDivElement>(null);

    // contentEditable 由瀏覽器直接操作 DOM，若讓 React 用 children 控制文字，
    // 每次 content 變動都會整個覆蓋掉游標位置，因此改用 ref 手動同步文字，
    // 且只在非編輯狀態下才寫回 DOM，避免打字打到一半被蓋掉。
    useLayoutEffect(() => {
        if (!localRef.current || document.activeElement === localRef.current) return;
        localRef.current.textContent = content || '預設文字';
    }, [content]);

    const debouncedContentChange = useDebouncedCallback((value: string) => {
        onContentChange?.(value);
    }, 300);

    const handleInput = (e: React.InputEvent<HTMLDivElement>) => {
        debouncedContentChange(e.currentTarget.innerText);
    };

    const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
        onContentChange?.(e.currentTarget.innerText);
    };

    // elementProperty.ref 是 dnd-kit 的 setNodeRef（穩定的 callback，見
    // schema-element-node.tsx 的 useCombinedRefs），這裡還需要自己的 localRef 做
    // contentEditable 文字同步，兩個 ref 要一起呼叫——但這個合併函式本身也要用
    // useCallback 記住，不然每次 render 都是新函式，一樣會觸發 dndRef 內部的
    // re-register，變成無限迴圈（跟 schema-element-node.tsx 修過的問題一樣）。
    const { ref: dndRef, onPointerDown: dndPointerDown, ...restProperty } = elementProperty;
    const setRefs = useCallback(
        (node: HTMLDivElement | null) => {
            localRef.current = node;
            if (typeof dndRef === 'function') dndRef(node);
        },
        [dndRef]
    );

    // p-2（8px）的 padding 區域當拖曳把手。還沒進入編輯模式時整個方塊都能拖，
    // 跟其他元件一致；一旦點進去變成 contentEditable，中間要留給打字／移動游標／
    // 選字，只有抓邊緣（padding 那一圈）才轉發給 dnd-kit 開始拖曳，
    // 不然點進去打字會被 PointerSensor 誤判成要拖曳整個元素。
    const EDGE_GRAB_PX = 8;
    const handlePointerDown = useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            if (!isSelected) {
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
        [isSelected, dndPointerDown]
    );

    return (
        <div
            ref={setRefs}
            key={id}
            {...restProperty}
            onPointerDown={handlePointerDown}
            contentEditable={isSelected}
            suppressContentEditableWarning
            onInput={isSelected ? handleInput : undefined}
            onBlur={isSelected ? handleBlur : undefined}
            className={classNames(
                'pointer-events-auto cursor-pointer p-2 rounded transition-all outline-none whitespace-pre-wrap',
                elementProperty['selected-style']
            )}
        />
    );
}
