import { useEffect, useRef, useState } from 'react';

interface UseDraggablePositionOptions {
    defaultTop: number;
    defaultLeft: number;
}

// 浮動面板（目前給 PreviewFloatingControls 用）的拖曳定位邏輯：只有按在面板的空白處
// 才會觸發拖曳，按鈕、裝置切換等互動元素維持原本的點擊行為。拖曳邊界夾在視窗範圍內，
// 避免面板被拖出可視區域後找不到、也拖不回來。
export function useDraggablePosition({ defaultTop, defaultLeft }: UseDraggablePositionOptions) {
    const panelRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: defaultTop, left: defaultLeft });
    const [isDragging, setIsDragging] = useState(false);
    // 記錄滑鼠按下時，游標相對於面板左上角的偏移量，拖曳時用來算面板新的 top/left，
    // 不然面板會用左上角瞬間跳去對齊游標。
    const dragOffsetRef = useRef({ x: 0, y: 0 });

    const handleDragStart = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('button')) return;
        e.preventDefault();

        const rect = panelRef.current?.getBoundingClientRect();
        dragOffsetRef.current = {
            x: e.clientX - (rect?.left ?? 0),
            y: e.clientY - (rect?.top ?? 0),
        };
        setIsDragging(true);
    };

    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = panelRef.current?.getBoundingClientRect();
            const width = rect?.width ?? 0;
            const height = rect?.height ?? 0;
            const nextLeft = e.clientX - dragOffsetRef.current.x;
            const nextTop = e.clientY - dragOffsetRef.current.y;
            const maxLeft = Math.max(window.innerWidth - width, 0);
            const maxTop = Math.max(window.innerHeight - height, 0);

            setPosition({
                left: Math.min(Math.max(nextLeft, 0), maxLeft),
                top: Math.min(Math.max(nextTop, 0), maxTop),
            });
        };

        const handleMouseUp = () => setIsDragging(false);

        document.body.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none';

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    return { panelRef, position, isDragging, handleDragStart };
}
