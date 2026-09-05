'use client';

import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useSelectedElementStore } from '@/store/use-selected-element-store';
import { useDebouncedCallback } from './use-debounce';

interface UseEditableContentOptions {
    content?: string;
    defaultText: string;
    isEditing: boolean;
    onContentChange?: (content: string) => void;
}

// text-element、button-element 都需要同一套「進入編輯才 contentEditable、貼上要
// 清掉來源樣式、離開編輯時存檔並清掉 editingElement」邏輯，抽成共用 hook，
// 避免兩邊各自維護一份、之後改一邊忘了改另一邊。
export function useEditableContent<T extends HTMLElement>({
    content,
    defaultText,
    isEditing,
    onContentChange,
}: UseEditableContentOptions) {
    const ref = useRef<T>(null);
    const setEditingElement = useSelectedElementStore((state) => state.setEditingElement);

    // contentEditable 由瀏覽器直接操作 DOM，若讓 React 用 children 控制文字，
    // 每次 content 變動都會整個覆蓋掉游標位置，因此改用 ref 手動同步文字，
    // 且只在非編輯狀態下才寫回 DOM，避免打字打到一半被蓋掉。
    useLayoutEffect(() => {
        if (!ref.current || document.activeElement === ref.current) return;
        ref.current.textContent = content || defaultText;
    }, [content, defaultText]);

    const debouncedContentChange = useDebouncedCallback((value: string) => {
        onContentChange?.(value);
    }, 300);

    const handleInput = useCallback(
        (e: React.FormEvent<T>) => {
            debouncedContentChange(e.currentTarget.innerText);
        },
        [debouncedContentChange]
    );

    const handleBlur = useCallback(
        (e: React.FocusEvent<T>) => {
            onContentChange?.(e.currentTarget.innerText);
            setEditingElement(null);
        },
        [onContentChange, setEditingElement]
    );

    // 使用者從別的地方（Word、網頁、其他元素）複製文字時，剪貼簿常常還帶著來源的
    // 樣式（字體、顏色、粗細...），貼進來會汙染這個元素本來的樣式設定。只取
    // text/plain、手動插入純文字節點，強制清掉任何格式。
    const handlePaste = useCallback(
        (e: React.ClipboardEvent<T>) => {
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;

            const range = selection.getRangeAt(0);
            range.deleteContents();
            const textNode = document.createTextNode(text);
            range.insertNode(textNode);
            range.setStartAfter(textNode);
            range.setEndAfter(textNode);
            selection.removeAllRanges();
            selection.addRange(range);

            debouncedContentChange(e.currentTarget.innerText);
        },
        [debouncedContentChange]
    );

    // 進入編輯狀態時才真的把游標移進去，並停在文字結尾——不然每次點擊都會選取
    // 全部文字，使用者只是想接著打字卻要先清空選取範圍。
    useEffect(() => {
        if (!isEditing || !ref.current) return;
        ref.current.focus();
        const range = document.createRange();
        range.selectNodeContents(ref.current);
        range.collapse(false);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
    }, [isEditing]);

    return { ref, handleInput, handleBlur, handlePaste };
}
