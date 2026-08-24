import { useRef, useState } from 'react';
import { PointerSensor, useSensor, useSensors, pointerWithin } from '@dnd-kit/core';
import type {
    CollisionDetection,
    DragEndEvent,
    DragMoveEvent,
    DragOverEvent,
    DragStartEvent,
} from '@dnd-kit/core';
import { useSchemaStore } from '@/store/use-schema-store';
import { useSelectedElementStore } from '@/store/use-selected-element-store';
import {
    ComponentIdEnums,
    PresetIdEnums,
    ElementSchema,
    ContainerElementSchema,
    BODY_ELEMENT_ID,
} from '@/lib/schema';
import {
    computeReorder,
    getDropPosition,
    isContainerElement,
    type DropPosition,
} from '@/lib/schema-tree';
import { createElement, createPreset } from '@/app/(app)/builder/_libs/element-factory';
import type { LogEvent } from '@/app/(app)/builder/_components/canvas/event-log/use-event-logger';

// 滑鼠壓在某個元素上時直接用 pointerWithin（維持巢狀小目標優先命中的判斷，
// 進一步要不要算 before/after/inside 交給 lib/schema-tree.ts 的 getDropPosition：
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
// 樣板（例如 navbar）拖到畫布上，放手後展開成一整棵既有組件組成的樹，
// 跟 NewComponentDragData 分開是因為放手時要呼叫的 factory 不一樣
// （createElement vs createPreset），其餘插入位置判斷邏輯完全共用。
export interface NewPresetDragData {
    type: 'new-preset';
    presetId: PresetIdEnums;
}
export interface ExistingElementDragData {
    type: 'existing-element';
}
export type ActiveDragData = NewComponentDragData | NewPresetDragData | ExistingElementDragData;

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

    // 用「滑鼠現在真正的即時 Y 座標」算 dropPosition，不管拖的是 sidebar 新元件
    // 還是既有元素——一律用 pointerStartYRef + delta 還原滑鼠位置，不用被拖曳
    // 東西本身的 rect（sidebar 拖曳時那是一張跟實際元素大小毫無關係的小預覽卡片，
    // 用它的 rect 當依據就是「用抓的東西本身當標準」，大小不一，沒有一致依據）。
    // handleDragMove 節流算出來的 dropPosition 是拖曳中即時提示用；放手那一刻
    // （handleDragEnd）另外呼叫這個函式重新算一次最新的，不吃節流後可能過期的
    // state——拖曳速度快、放手前最後一次節流間隔內滑鼠又移動過的話，state 裡
    // 留著的會是舊的目標位置，實際套用的位置就會跟畫面上看到的插入線對不起來。
    function computeLiveDropPosition(
        over: { id: string | number; rect: { top: number; height: number } } | null | undefined,
        delta: { x: number; y: number }
    ): DropPosition | null {
        if (!over) return null;
        const overRect = over.rect;
        if (!overRect) return null;

        const pointerY =
            pointerStartYRef.current !== null ? pointerStartYRef.current + delta.y : undefined;
        if (pointerY === undefined) return null;

        const isContainer = isContainerElement(elementMap, String(over.id));
        return getDropPosition(overRect, pointerY, isContainer);
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
        const activeData = active.data.current as ActiveDragData | undefined;

        // 樣板（目前只有 navbar）不管拖去哪裡，放手後一律強制回到 Body 最上層
        // （見 handleDragEnd），不會真的插進滑鼠正壓著的那個 target——顯示
        // insert 插入線／容器高亮反而是在騙使用者，乾脆不顯示任何 over 狀態。
        if (activeData?.type === 'new-preset') {
            setOverId(null);
            setDropPosition(null);
            return;
        }

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
        const activeData = active.data.current as ActiveDragData | undefined;
        // 樣板一律強制回到 Body 最上層（見 handleDragEnd），不需要算 before/after/
        // inside——理由同 handleDragOver。
        if (activeData?.type === 'new-preset') return;
        if (!over || over.id === active.id) return;

        const now = Date.now();
        if (now - lastDropPositionComputeAtRef.current < DROP_POSITION_THROTTLE_MS) return;
        lastDropPositionComputeAtRef.current = now;

        // sidebar 拖新元件跟既有元素 reorder 共用同一套插入位置判斷（before/after/
        // inside，見 computeLiveDropPosition），才能在拖新元件時也看到插入線／
        // 容器高亮，不然使用者完全看不出「放手後會插在哪裡」。這裡算出來的只是
        // 拖曳中即時提示用；真正決定要套用哪個位置是放手那一刻在 handleDragEnd
        // 另外重算一次最新的，不會用這裡節流後可能過期的值。
        const position = computeLiveDropPosition(over, delta);
        if (position === null) return;
        setDropPosition((prev) => (prev === position ? prev : position));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over, delta } = event;
        const data = active.data.current as ActiveDragData | undefined;
        // 放手這一刻重新算一次最新的 dropPosition，不要沿用 state 裡可能因為
        // handleDragMove 節流（300ms 一次）而過期的舊值——拖曳速度快、最後一段
        // 節流間隔內滑鼠又移動過的話，state 留著的會是舊目標位置，套用結果就會
        // 跟畫面上看到的插入線對不起來。
        const liveDropPosition = computeLiveDropPosition(over, delta);

        // 樣板（目前只有 navbar）完全不管 over/dropPosition 是什麼——不管拖去哪裡、
        // 就算放到某個既有 container 上面，一律強制插進 Body 最上層（陣列最前面）。
        // sticky/fixed 定位需要它是頁面最外層的第一個元素才能穩定運作（見
        // createNavbarPreset 的註解），不接受被塞進任何 container 裡面。
        if (data?.type === 'new-preset') {
            // 一個頁面只允許存在一個 navbar——重複拖拉不會疊出第二個把原本已經
            // 客製化過的內容擠到後面（視覺上就像被蓋掉一樣），已經有的話直接選取
            // 它，讓使用者知道要調整的是這一個，而不是又生一個帶預設值的新的。
            const existingNavbar = Array.from(elementMap.values()).find(
                (node) =>
                    node.element.componentId === ComponentIdEnums.container &&
                    node.element.variant === data.presetId
            )?.element;
            if (existingNavbar) {
                setSelectedElement(existingNavbar.id);
                reset();
                return;
            }

            const newElement = createPreset(data.presetId, 0);
            setSchema((prev) => ({ ...prev, elements: [newElement, ...prev.elements] }));
            reset();
            return;
        }

        if (data?.type === 'new-component') {
            const newElement = createElement(
                data.componentId,
                { x: 0, y: 0 },
                schema.elements.length
            );
            insertElement(newElement, over ? String(over.id) : null, liveDropPosition);
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
            if (over.id !== active.id && liveDropPosition) {
                const overIdStr = String(over.id);
                const result = computeReorder(
                    schema.elements,
                    elementMap,
                    draggedId,
                    overIdStr,
                    liveDropPosition
                );
                if (process.env.NODE_ENV === 'development') {
                    logEvent(draggedId, overIdStr, schema.elements, result, liveDropPosition);
                    console.log('🔵 [element drag] drop committed:', liveDropPosition);
                }
                setSchema((prev) => ({ ...prev, elements: result }));
            }
            reset();
        }
    };

    // 跟既有元素 reorder 共用同一套 dropPosition 規則：'inside' 且 target 是 container
    // 才塞進 children；其餘（'before'/'after'，或 target 不是 container）都是插在
    // target 同層的前面／後面。沒有 dropPosition（理論上不會發生，防呆用）就跟舊版一樣
    // 預設插在後面。newElement 已經是組好的完整節點（單一組件或整棵樣板樹都一樣，
    // 這裡只負責決定插在哪裡，不管它長什麼樣子）。
    function insertElement(
        newElement: ElementSchema,
        overElementId: string | null,
        dropPosition: DropPosition | null
    ) {
        if (!overElementId || overElementId === BODY_ELEMENT_ID) {
            setSchema((prev) => ({ ...prev, elements: [...prev.elements, newElement] }));
            return;
        }

        const targetNode = elementMap.get(overElementId);
        if (!targetNode) return;
        const { path: nodePath, parent: nodeParent } = targetNode;
        const isContainer = isContainerElement(elementMap, overElementId);

        // 暫時除錯用，確認完可以拿掉。
        if (process.env.NODE_ENV === 'development') {
            console.log('🧭 [insertElement commit]', { overElementId, isContainer, dropPosition });
        }

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
