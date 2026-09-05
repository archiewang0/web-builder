'use client';

import classNames from 'classnames';
import { useCallback } from 'react';
import { useSelectedElementStore } from '@/store/use-selected-element-store';
import { TEXT_BASE_CLASSNAME } from '@/lib/element-base-class';
import { useEditableContent } from '@/app/(app)/builder/_hooks/use-editable-content';

interface TextElementProps {
    id: string;
    content?: string;
    elementProperty: { [key: string]: any };
    isSelected?: boolean;
    isEditing?: boolean;
    onContentChange?: (content: string) => void;
}

export function TextElement({
    id,
    content,
    elementProperty,
    isSelected = false,
    isEditing = false,
    onContentChange,
}: TextElementProps) {
    const setEditingElement = useSelectedElementStore((state) => state.setEditingElement);
    const { ref: localRef, handleInput, handleBlur, handlePaste } = useEditableContent<HTMLDivElement>({
        content,
        defaultText: '預設文字',
        isEditing,
        onContentChange,
    });

    // elementProperty.ref 是 dnd-kit 的 setNodeRef（穩定的 callback，見
    // schema-element-node.tsx 的 useCombinedRefs），這裡還需要自己的 localRef 做
    // contentEditable 文字同步，兩個 ref 要一起呼叫——但這個合併函式本身也要用
    // useCallback 記住，不然每次 render 都是新函式，一樣會觸發 dndRef 內部的
    // re-register，變成無限迴圈（跟 schema-element-node.tsx 修過的問題一樣）。
    const {
        ref: dndRef,
        onPointerDown: dndPointerDown,
        onClick: selectOnClick,
        ...restProperty
    } = elementProperty;
    const setRefs = useCallback(
        (node: HTMLDivElement | null) => {
            localRef.current = node;
            if (typeof dndRef === 'function') dndRef(node);
        },
        [dndRef, localRef]
    );

    // 外層＝outline 層：第一次點擊只負責選取（顯示外框、可以按 Delete 刪掉整個
    // 元素），不會自動進入編輯模式。已經選取過的狀態下再點一次，才視為「使用者
    // 要打字了」，改成進入 editingElement、真正 focus 進去。
    const handleClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (!isSelected) {
                selectOnClick?.(e);
                return;
            }
            e.stopPropagation();
            setEditingElement(id);
        },
        [isSelected, selectOnClick, setEditingElement, id]
    );

    // p-2（8px）的 padding 區域當拖曳把手。還沒進入編輯模式時整個方塊都能拖，
    // 跟其他元件一致；一旦進入編輯（isEditing），中間要留給打字／移動游標／
    // 選字，只有抓邊緣（padding 那一圈）才轉發給 dnd-kit 開始拖曳，
    // 不然點進去打字會被 PointerSensor 誤判成要拖曳整個元素。
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
        <div
            className={classNames(
                elementProperty['selected-style'],
                'pointer-events-auto cursor-pointer transition-all outline-none'
            )}
        >
            <div
                ref={setRefs}
                key={id}
                {...restProperty}
                onClick={handleClick}
                onPointerDown={handlePointerDown}
                contentEditable={isEditing}
                suppressContentEditableWarning
                onInput={isEditing ? handleInput : undefined}
                onBlur={isEditing ? handleBlur : undefined}
                onPaste={isEditing ? handlePaste : undefined}
                className={classNames(TEXT_BASE_CLASSNAME, isEditing && 'cursor-text')}
            />
        </div>
    );
}
