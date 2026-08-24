import { useEffect, useRef, useState } from 'react';

interface UseResizablePanelOptions {
    // 面板貼在螢幕哪一側，決定拖拉方向的算法跟收合時往哪邊裁切內容：
    // 'left' 給貼在螢幕左側、把手在右邊的面板（例如 Sidebar）；
    // 'right' 給貼在螢幕右側、把手在左邊的面板（例如 PropertySetting），拖拉方向鏡像。
    edge: 'left' | 'right';
    minWidth: number;
    maxWidth: number;
}

// Sidebar、PropertySetting 共用的邊緣拖拉調整寬度邏輯：拖到最窄會收合到 minWidth（視覺上等於隱藏），拖到最寬回到 maxWidth。
export function useResizablePanel({ edge, minWidth, maxWidth }: UseResizablePanelOptions) {
    const panelRef = useRef<HTMLElement>(null);
    const [width, setWidth] = useState(maxWidth);
    const [isResizing, setIsResizing] = useState(false);

    const handleResizeStart = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    };

    useEffect(() => {
        if (!isResizing) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = panelRef.current?.getBoundingClientRect();
            const nextWidth = edge === 'left' ? e.clientX - (rect?.left ?? 0) : (rect?.right ?? 0) - e.clientX;
            setWidth(Math.min(maxWidth, Math.max(minWidth, nextWidth)));
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
    }, [isResizing, edge, minWidth, maxWidth]);

    return { panelRef, width, handleResizeStart, isCollapsed: width <= minWidth };
}
