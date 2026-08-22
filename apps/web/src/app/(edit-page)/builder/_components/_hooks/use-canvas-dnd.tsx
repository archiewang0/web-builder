import { useRef, useState } from 'react';
import { PointerSensor, useSensor, useSensors, pointerWithin } from '@dnd-kit/core';
import type {
    CollisionDetection,
    DragEndEvent,
    DragMoveEvent,
    DragOverEvent,
    DragStartEvent,
} from '@dnd-kit/core';
import {
    useSchemaStore,
    ElementSchema,
    ContainerElementSchema,
    BODY_ELEMENT_ID,
} from '@/store/use-schema-store';
import { useSelectedElementStore } from '@/store/use-selected-element-store';
import { ComponentIdEnums } from '../sidebar/use-sidebar';
import { computeReorder, createElement, getDropPosition, type DropPosition } from '../canvas/lib';
import type { LogEvent } from '../canvas/event-log/use-event-logger';

// 滑鼠壓在某個元素上時直接用 pointerWithin（維持巢狀小目標優先命中的判斷，
// 進一步要不要算 before/after/inside 交給 canvas/lib.ts 的 getDropPosition：
// 滑鼠只要真的落在該元素範圍內，container 一律是 inside）；
// 但如果這次只命中最外層的 Body（代表落在元素之間的間隙裡，還沒進到任何元素
// 範圍內），改成找「離滑鼠最近的元素」，只要距離在 CANVAS_PROXIMITY_PX 以內
// 就當作命中它——不用整段路徑都要精準貼邊才能安插，也不會像 dnd-kit 內建的
// closestCenter 一樣「不管多遠都硬 snap」。
const CANVAS_PROXIMITY_PX = 50;

function distanceToRect(
    point: { x: number; y: number },
    rect: { top: number; left: number; width: number; height: number }
) {
    const dx = Math.max(rect.left - point.x, 0, point.x - (rect.left + rect.width));
    const dy = Math.max(rect.top - point.y, 0, point.y - (rect.top + rect.height));
    return Math.sqrt(dx * dx + dy * dy);
}

// 從 dragstart/dragover 的原生事件裡拿滑鼠（或觸控點）的 clientY——只有
// PointerSensor 會用到，理論上一定是 PointerEvent，但保守處理 MouseEvent/
// TouchEvent 避免以後換 sensor 就整個壞掉。
function getClientY(event: Event): number | null {
    if (event instanceof PointerEvent || event instanceof MouseEvent) return event.clientY;
    if (event instanceof TouchEvent) return event.touches[0]?.clientY ?? null;
    return null;
}

export const pointerWithinOrNearest: CollisionDetection = (args) => {
    const hits = pointerWithin(args);
    const onlyHitBody =
        hits.length > 0 && hits.every((collision) => collision.id === BODY_ELEMENT_ID);
    if (hits.length > 0 && !onlyHitBody) return hits;

    const { pointerCoordinates, droppableContainers, droppableRects } = args;
    if (!pointerCoordinates) return hits;

    let nearestId: string | null = null;
    let nearestDistance = Infinity;
    for (const container of droppableContainers) {
        if (container.id === BODY_ELEMENT_ID) continue;
        const rect = droppableRects.get(container.id);
        if (!rect) continue;
        const distance = distanceToRect(pointerCoordinates, rect);
        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestId = String(container.id);
        }
    }

    if (nearestId && nearestDistance <= CANVAS_PROXIMITY_PX) {
        return [{ id: nearestId }];
    }

    return hits;
};

// 這支 hook 是唯一的 DnD 協調者，取代原本分開的 useCanvasDrop（sidebar 拖新元件、
// 既有元素拖到 Body）跟 useElementDrag（既有元素拖到別的元素上 reorder）。
// dnd-kit 的 <DndContext> 只有一個，掛在 builder page 最外層（同時包住 Sidebar 跟
// Canvas），這裡回傳的 handleDragStart/Over/End 就是接給那個 context 用的。
//
// 不再需要原本那套「靠 DOM 事件冒泡 + stopPropagation + draggedIdRef 手動同步」的
// 機制——dnd-kit 用 active/over 集中管理拖曳狀態，直接讀 active.data.current.type
// 就能分辨這次拖曳是「sidebar 新元件」還是「既有元素」，不用再猜事件是被誰攔截的。
export interface NewComponentDragData {
    type: 'new-component';
    componentId: ComponentIdEnums;
}
export interface ExistingElementDragData {
    type: 'existing-element';
}
export type ActiveDragData = NewComponentDragData | ExistingElementDragData;

interface DroppableData {
    componentId?: ComponentIdEnums;
}

export function useCanvasDnd(logEvent: LogEvent) {
    const schema = useSchemaStore((state) => state.schema);
    const setSchema = useSchemaStore((state) => state.setSchema);
    const elementMap = useSchemaStore((state) => state.elementMap);
    const setSelectedElement = useSelectedElementStore((state) => state.setSelectedElement);

    // 拖曳一小段距離才真的算「開始拖曳」，避免單純點擊（例如點文字進入編輯模式）被誤判成拖曳。
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

    const [activeId, setActiveId] = useState<string | null>(null);
    const [overId, setOverId] = useState<string | null>(null);
    const [dropPosition, setDropPosition] = useState<DropPosition | null>(null);
    // DragOverlay 要渲染的預覽內容取決於這次拖曳的來源（sidebar 新元件 vs 既有元素），
    // 存起來給 page.tsx 判斷要渲染哪種預覽，不用另外重新讀 event.active.data。
    const [activeDragData, setActiveDragData] = useState<ActiveDragData | null>(null);
    // dragstart 當下滑鼠的 clientY，dragover 時加回 event.delta.y（累積位移）
    // 就能還原「滑鼠現在的即時 Y 座標」，取代原本用「被拖曳元素的 rect 中心」
    // 判斷 before/after/inside 的做法——空容器只剩 padding 撐出的高度可能比
    // 被拖曳的元素矮很多，用元素中心點永遠算不到 inside。
    const pointerStartYRef = useRef<number | null>(null);
    // dropPosition 的計算節流：dnd-kit 的 onDragMove 每次滑鼠移動都會觸發，
    // 拖曳中不需要每個 frame 都重算一次 getDropPosition，300ms 算一次就夠讓
    // 使用者感覺得到即時反應，同時省掉大量重複計算。0 代表「還沒算過」，
    // 讓拖曳一開始（或剛換到新目標）的第一次移動一定會立刻算一次，不用等滿 300ms。
    const DROP_POSITION_THROTTLE_MS = 300;
    const lastDropPositionComputeAtRef = useRef<number>(0);

    function reset() {
        setActiveId(null);
        setOverId(null);
        setDropPosition(null);
        setActiveDragData(null);
        pointerStartYRef.current = null;
        lastDropPositionComputeAtRef.current = 0;
    }

    const handleDragStart = (event: DragStartEvent) => {
        const data = event.active.data.current as ActiveDragData | undefined;
        if (!data) return;

        const id = String(event.active.id);
        setActiveId(id);
        setActiveDragData(data);
        pointerStartYRef.current = getClientY(event.activatorEvent);

        if (data.type === 'existing-element') {
            setSelectedElement(id);
            if (process.env.NODE_ENV === 'development') {
                logEvent(id, id, schema.elements, schema.elements);
                console.log('🟢 [element drag] dragStart:', id);
            }
        }
    };

    // dnd-kit 的 onDragOver 內部是包在 `useEffect(..., [overId])` 裡——只有「這次
    // 壓到的目標換人」（overId 改變）才會重新觸發，滑鼠在同一個 target 內部繼續
    // 移動（例如從上緣移到中間）不會重跑。這裡只用它做 overId 的設定/清空，
    // 真正的 before/after/inside 計算搬去 handleDragMove（見下）。
    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over || over.id === active.id) {
            setOverId(null);
            setDropPosition(null);
            return;
        }

        const overIdStr = String(over.id);
        setOverId((prev) => (prev === overIdStr ? prev : overIdStr));
    };

    // onDragMove 綁的是 dnd-kit 內部的 `useEffect(..., [scrollAdjustedTranslate])`，
    // 滑鼠只要一移動就會觸發，不管有沒有換目標——用它才能在同一個 target 內部
    // 移動時持續重算 dropPosition。但不需要每個 frame 都算一次，節流到 300ms
    // 一次：拖曳中使用者感覺不出差異，同時省掉大量重複計算。
    const handleDragMove = (event: DragMoveEvent) => {
        const { active, over, delta } = event;
        if (!over || over.id === active.id) return;

        const now = Date.now();
        if (now - lastDropPositionComputeAtRef.current < DROP_POSITION_THROTTLE_MS) return;
        lastDropPositionComputeAtRef.current = now;

        // sidebar 拖新元件跟既有元素 reorder 共用同一套插入位置判斷（before/after/
        // inside），才能在拖新元件時也看到插入線／容器高亮，不然使用者完全看不出
        // 「放手後會插在哪裡」。
        const overRect = over.rect;
        if (!overRect) return;

        // 用滑鼠實際的即時 Y 座標判斷，不要用「被拖曳元素本身的 rect 中心」——
        // 空容器可能矮到只剩 padding（例如 44px），被拖曳的元素只要比它高，
        // 元素中心點永遠不會落在容器範圍內，會一直誤判成 before/after，
        // 導致完全塞不進空容器。拿不到即時滑鼠座標（理論上不會發生）才退回
        // 用被拖曳元素的 rect 中心當備援。
        const pointerY =
            pointerStartYRef.current !== null
                ? pointerStartYRef.current + delta.y
                : (active.rect.current.translated ?? active.rect.current.initial)?.top;
        if (pointerY === undefined) return;

        const overData = over.data.current as DroppableData | undefined;
        const isContainer = overData?.componentId === ComponentIdEnums.container;
        const position = getDropPosition(overRect, pointerY, isContainer);
        setDropPosition((prev) => (prev === position ? prev : position));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        const data = active.data.current as ActiveDragData | undefined;

        if (data?.type === 'new-component') {
            const overData = over?.data.current as DroppableData | undefined;
            insertNewComponent(
                data.componentId,
                over ? String(over.id) : null,
                overData,
                dropPosition
            );
            reset();
            return;
        }

        if (data?.type === 'existing-element') {
            const draggedId = String(active.id);

            // 沒有 over：拖到任何 droppable 之外（例如整個放到瀏覽器視窗外），視為取消。
            if (!over) {
                if (process.env.NODE_ENV === 'development') {
                    logEvent(draggedId, draggedId, schema.elements, schema.elements);
                    console.log('🔴 [element drag] dragEnd (cancelled):', draggedId);
                }
                reset();
                return;
            }

            // 拖到 Body 空白處——目前維持原本的 no-op，只記一筆事件；
            // 「真的把既有元素移到根層級」是可以做但目前先不做的下一步（沒有既有 UI 決定
            // 要插在根層級哪個位置），避免這次遷移順便夾帶新行為。
            if (over.id === BODY_ELEMENT_ID) {
                if (process.env.NODE_ENV === 'development') {
                    logEvent(draggedId, BODY_ELEMENT_ID, schema.elements, schema.elements);
                    console.log('🟣 [element drag] drop on body:', draggedId);
                }
                reset();
                return;
            }

            // 拖曳中完全不重排 DOM（不再有 shadowElements 即時預覽）——真正的重新排序
            // 只在放手這一刻算一次、套用一次，避免元素在拖曳過程中位移，
            // 造成 dnd-kit 重新量測 rect → dragover 又觸發 → 又重排的無限迴圈，
            // 也讓使用者拖曳時目標不會一直跑掉。
            if (over.id !== active.id && dropPosition) {
                const overIdStr = String(over.id);
                const result = computeReorder(
                    schema.elements,
                    elementMap,
                    draggedId,
                    overIdStr,
                    dropPosition
                );
                if (process.env.NODE_ENV === 'development') {
                    logEvent(draggedId, overIdStr, schema.elements, result, dropPosition);
                    console.log('🔵 [element drag] drop committed:', dropPosition);
                }
                setSchema((prev) => ({ ...prev, elements: result }));
            }
            reset();
        }
    };

    // 跟既有元素 reorder 共用同一套 dropPosition 規則：'inside' 且 target 是 container
    // 才塞進 children；其餘（'before'/'after'，或 target 不是 container）都是插在
    // target 同層的前面／後面。沒有 dropPosition（理論上不會發生，防呆用）就跟舊版一樣
    // 預設插在後面。
    function insertNewComponent(
        componentId: ComponentIdEnums,
        overElementId: string | null,
        overData: DroppableData | undefined,
        dropPosition: DropPosition | null
    ) {
        const newElement = createElement(componentId, { x: 0, y: 0 }, schema.elements.length);

        if (!overElementId || overElementId === BODY_ELEMENT_ID) {
            setSchema((prev) => ({ ...prev, elements: [...prev.elements, newElement] }));
            return;
        }

        const targetNode = elementMap.get(overElementId);
        if (!targetNode) return;
        const { path: nodePath, parent: nodeParent } = targetNode;
        const isContainer = overData?.componentId === ComponentIdEnums.container;

        if (isContainer && dropPosition === 'inside') {
            setSchema((prev) => {
                const elements = JSON.parse(JSON.stringify(prev.elements)) as ElementSchema[];
                let cur: any = elements;
                for (let i = 0; i < nodePath.length; i++) {
                    if (i === nodePath.length - 1) {
                        (cur[nodePath[i]!] as ContainerElementSchema).children.push(newElement);
                    } else {
                        cur = cur[nodePath[i]!];
                        if ('children' in cur) cur = cur.children;
                    }
                }
                return { ...prev, elements };
            });
            return;
        }

        const insertOffset = dropPosition === 'before' ? 0 : 1;

        setSchema((prev) => {
            const elements = JSON.parse(JSON.stringify(prev.elements)) as ElementSchema[];
            if (nodeParent) {
                const parentPath = nodePath.slice(0, -1);
                let cur: any = elements;
                for (let i = 0; i < parentPath.length; i++) {
                    if (i === parentPath.length - 1) {
                        (cur[parentPath[i]!] as ContainerElementSchema).children.splice(
                            nodePath[nodePath.length - 1]! + insertOffset,
                            0,
                            newElement
                        );
                    } else {
                        cur = cur[parentPath[i]!];
                        if ('children' in cur) cur = cur.children;
                    }
                }
            } else {
                elements.splice(nodePath[0]! + insertOffset, 0, newElement);
            }
            return { ...prev, elements };
        });
    }

    return {
        sensors,
        handleDragStart,
        handleDragOver,
        handleDragMove,
        handleDragEnd,
        activeId,
        overId,
        dropPosition,
        activeDragData,
    };
}
