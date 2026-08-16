'use client';

import classNames from 'classnames';
import { useLayoutEffect, useRef } from 'react';
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
    const ref = useRef<HTMLDivElement>(null);

    // contentEditable 由瀏覽器直接操作 DOM，若讓 React 用 children 控制文字，
    // 每次 content 變動都會整個覆蓋掉游標位置，因此改用 ref 手動同步文字，
    // 且只在非編輯狀態下才寫回 DOM，避免打字打到一半被蓋掉。
    useLayoutEffect(() => {
        if (!ref.current || document.activeElement === ref.current) return;
        ref.current.textContent = content || '預設文字';
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

    const { draggable, ...restProperty } = elementProperty;

    return (
        <div
            ref={ref}
            key={id}
            {...restProperty}
            contentEditable={isSelected}
            suppressContentEditableWarning
            draggable={isSelected ? false : draggable}
            onInput={isSelected ? handleInput : undefined}
            onBlur={isSelected ? handleBlur : undefined}
            className={classNames(
                'pointer-events-auto cursor-pointer p-2 rounded transition-all outline-none whitespace-pre-wrap',
                elementProperty['selected-style']
            )}
        />
    );
}
