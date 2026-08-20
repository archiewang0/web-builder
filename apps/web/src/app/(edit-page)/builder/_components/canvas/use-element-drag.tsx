import { useMemo, useState, type RefObject } from 'react';
import { useSchemaStore } from '@/store/use-schema-store';
import { useSelectedElementStore } from '@/store/use-selected-element-store';
import { ComponentIdEnums } from '../sidebar/use-sidebar';
import { computeReorder, getDropPosition, type DropPosition } from './lib';
import type { LogEvent } from './event-log/use-event-logger';
import { useThrottle } from '@/lib/use-throttle';

// canvas 內部既有元素的拖曳／reorder 邏輯，只有 schema-elements.tsx 會用到，
// 所以留在 canvas 資料夾裡（不像 useCanvasDrop 那樣搬去 _hooks）——
// useCanvasDrop 處理的是跨邊界的來源（sidebar 拖新元件進 canvas、或既有元素拖到
// canvas 的空白 Body），這裡處理的單純是「元素拖到另一個元素上」的 reorder。
export function useElementDrag(logEvent: LogEvent, draggedIdRef: RefObject<string | null>) {
    const schema = useSchemaStore((state) => state.schema);
    const setSchema = useSchemaStore((state) => state.setSchema);
    const elementMap = useSchemaStore((state) => state.elementMap);
    const setSelectedElement = useSelectedElementStore((state) => state.setSelectedElement);

    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [dropTargetId, setDropTargetId] = useState<string | null>(null);
    const [dropPosition, setDropPosition] = useState<DropPosition | null>(null);

    // dragOver 時即時推導預覽畫面，dropTargetId 或 dropPosition 換了才重算
    const shadowElements = useMemo(() => {
        if (!draggedId || !dropTargetId || !dropPosition || draggedId === dropTargetId) {
            return schema.elements;
        }
        return computeReorder(schema.elements, elementMap, draggedId, dropTargetId, dropPosition);
    }, [schema.elements, elementMap, draggedId, dropTargetId, dropPosition]);

    const handleElementDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        const el = (e.target as HTMLElement).closest('[data-element-id]');
        const id = el?.getAttribute('data-element-id');
        if (!id) return;
        e.dataTransfer.setData('application/element-id', id);
        e.dataTransfer.effectAllowed = 'move';
        setDraggedId(id);
        draggedIdRef.current = id;
        setSelectedElement(id);
        if (process.env.NODE_ENV === 'development') {
            logEvent(id, id, schema.elements, schema.elements);
            console.log('🟢 [element drag] dragStart:', id);
        }
    };

    const handleElementDragEnd = (_e: React.DragEvent<HTMLDivElement>) => {
        // drop 沒有發生（拖到無效區域）時還原預覽。原生 DnD 事件順序是
        // dragstart → drop → dragend，成功 drop 在既有元素上時 handleElementDrop
        // 會先把 draggedIdRef 清空；drop 在 Body 空白處時 useCanvasDrop 也會清空——
        // 這裡 draggedIdRef 還有值，才代表真的是「取消拖曳」，沒有觸發任何 drop。
        if (process.env.NODE_ENV === 'development' && draggedIdRef.current) {
            logEvent(draggedIdRef.current, draggedIdRef.current, schema.elements, schema.elements);
            console.log('🔴 [element drag] dragEnd (cancelled):', draggedIdRef.current);
        }
        setDraggedId(null);
        setDropTargetId(null);
        setDropPosition(null);
        draggedIdRef.current = null;
    };

    const throttledUpdateTarget = useThrottle((e: React.DragEvent<HTMLDivElement>) => {
        const el = (e.target as HTMLElement).closest('[data-element-id]') as HTMLElement | null;
        const id = el?.getAttribute('data-element-id');
        // draggedId 本身不能是 drop target
        if (!id || !el || id === draggedId) return;

        const isContainer = el.getAttribute('data-component-id') === ComponentIdEnums.container;
        const position = getDropPosition(el.getBoundingClientRect(), e.clientY, isContainer);

        if (id !== dropTargetId) {
            setDropTargetId(id);
            if (process.env.NODE_ENV === 'development') {
                console.log('🟡 [element drag] dragOver target:', id);
            }
        }
        // 即使還在同一個 target 上，滑鼠上下移動也可能讓插入位置換邊，要跟著更新。
        if (position !== dropPosition) {
            setDropPosition(position);
        }
    }, 50);

    const handleElementDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        if (!e.dataTransfer.types.includes('application/element-id')) return;
        // preventDefault / stopPropagation 每次都要執行，瀏覽器才允許 drop
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';
        throttledUpdateTarget(e);
    };

    const handleElementDrop = (e: React.DragEvent<HTMLDivElement>) => {
        const id = e.dataTransfer.getData('application/element-id');
        if (!id) return;
        e.preventDefault();
        e.stopPropagation();

        // 記錄此次互動，再 commit——只在 development 記錄，production 沒有面板可看/清，
        // 沒必要一直在記憶體裡累積完整的拖曳前後 schema 快取。
        if (process.env.NODE_ENV === 'development' && draggedId && dropTargetId && dropPosition) {
            logEvent(draggedId, dropTargetId, schema.elements, shadowElements, dropPosition);
            console.log('🔵 [element drag] drop committed:', dropPosition);
        }
        setSchema((prev) => ({ ...prev, elements: shadowElements }));
        setDraggedId(null);
        setDropTargetId(null);
        setDropPosition(null);
        draggedIdRef.current = null;
    };

    return {
        draggedId,
        dropTargetId,
        dropPosition,
        shadowElements,
        handleElementDragStart,
        handleElementDragEnd,
        handleElementDragOver,
        handleElementDrop,
    };
}
