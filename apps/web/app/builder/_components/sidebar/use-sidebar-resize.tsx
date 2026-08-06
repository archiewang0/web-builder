import { useEffect, useRef, useState } from 'react';

const MIN_WIDTH = 10;
const MAX_WIDTH = 256; // w-64

// Sidebar 右邊緣拖拉調整寬度：拖到最左會收合到 0（隱藏），拖到最右回到 w-64。
export function useSidebarResize() {
    const asideRef = useRef<HTMLElement>(null);
    const [width, setWidth] = useState(MAX_WIDTH);
    const [isResizing, setIsResizing] = useState(false);

    const handleResizeStart = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    };

    useEffect(() => {
        if (!isResizing) return;

        const handleMouseMove = (e: MouseEvent) => {
            const left = asideRef.current?.getBoundingClientRect().left ?? 0;
            const nextWidth = e.clientX - left;
            setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, nextWidth)));
        };

        const handleMouseUp = () => setIsResizing(false);

        // 拖拉中維持 grabbing 游標、避免拖過快選到文字
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
    }, [isResizing]);

    return { asideRef, width, handleResizeStart, isCollapsed: width <= MIN_WIDTH };
}
