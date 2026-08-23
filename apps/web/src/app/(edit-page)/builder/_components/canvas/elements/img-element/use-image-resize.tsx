import { useEffect, useRef, useState } from 'react';
import {
    IMG_MIN_WIDTH_PERCENT,
    IMG_MAX_WIDTH_PERCENT,
} from '@/app/(edit-page)/builder/_components/_const/img';

type ResizeSide = 'left' | 'right';

interface DragState {
    side: ResizeSide;
    startX: number;
    startPixelWidth: number;
    parentWidth: number;
}

interface UseImageResizeOptions {
    widthPercent: number;
    onResizeWidth?: (percent: number) => void;
}

export function useImageResize({ widthPercent, onResizeWidth }: UseImageResizeOptions) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const dragStateRef = useRef<DragState | null>(null);
    const latestPercentRef = useRef<number | null>(null);
    const suppressClickRef = useRef(false);
    const [previewPercent, setPreviewPercent] = useState<number | null>(null);

    const displayPercent = previewPercent ?? widthPercent;

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const state = dragStateRef.current;
            if (!state) return;
            const direction = state.side === 'right' ? 1 : -1;
            const deltaX = e.clientX - state.startX;
            const newPixelWidth = Math.max(state.startPixelWidth + direction * deltaX, 1);
            const newPercent = Math.min(
                IMG_MAX_WIDTH_PERCENT,
                Math.max(
                    IMG_MIN_WIDTH_PERCENT,
                    Math.round((newPixelWidth / state.parentWidth) * 100)
                )
            );
            latestPercentRef.current = newPercent;
            setPreviewPercent(newPercent);
        };

        const handleMouseUp = () => {
            if (!dragStateRef.current) return;
            dragStateRef.current = null;
            suppressClickRef.current = true;
            const finalPercent = latestPercentRef.current;
            latestPercentRef.current = null;
            setPreviewPercent(null);
            if (finalPercent !== null) {
                onResizeWidth?.(finalPercent);
            }
        };

        // A plain <div> (unlike a native button/link) fires "click" wherever
        // the pointer released, even if mousedown started elsewhere — so a
        // resize ending over the container's exposed background still
        // selects it. Swallow the one click that follows a resize.
        const handleClickCapture = (e: MouseEvent) => {
            if (!suppressClickRef.current) return;
            suppressClickRef.current = false;
            e.preventDefault();
            e.stopPropagation();
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('click', handleClickCapture, true);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('click', handleClickCapture, true);
        };
    }, [onResizeWidth]);

    const startResize = (side: ResizeSide) => (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const wrapper = wrapperRef.current;
        if (!wrapper) return;
        dragStateRef.current = {
            side,
            startX: e.clientX,
            startPixelWidth: wrapper.getBoundingClientRect().width,
            parentWidth: wrapper.parentElement?.clientWidth || wrapper.clientWidth || 1,
        };
    };

    // mousedown.preventDefault() on the handles doesn't reliably stop the
    // ancestor's draggable=true from starting a native drag — dragstart is
    // the actual cancelable event, and its target is this wrapper.
    const handleDragStart = (e: React.DragEvent) => {
        if (dragStateRef.current) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    return { wrapperRef, displayPercent, startResize, handleDragStart };
}
