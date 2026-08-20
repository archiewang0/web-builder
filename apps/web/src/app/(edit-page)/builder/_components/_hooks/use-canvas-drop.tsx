import { useState, type RefObject } from 'react';
import {
    useSchemaStore,
    ElementSchema,
    ContainerElementSchema,
    BODY_ELEMENT_ID,
} from '@/store/use-schema-store';
import { ComponentIdEnums } from '../sidebar/use-sidebar';
import { createElement } from '../canvas/lib';
import type { LogEvent } from '../canvas/event-log/use-event-logger';
import { useThrottle } from '@/lib/use-throttle';

// 這個 hook 的 handler 掛在 #canvas 本身（最外層畫布容器），只有事件冒泡到這裡才會觸發，
// 對應兩種不同來源的拖曳，靠 dataTransfer 的 type 分辨：
//
// 1. 從 sidebar 拖新元件進來（component-palette.tsx 設定 text/plain，非 container
//    元件還會多設 application/component-leaf）。isLeafDrag 分支（懸停容器偵測、🚫
//    提示、throttledLogContainerHover）只服務這個來源。
// 2. 拖曳既有元素（schema-elements.tsx 設定 application/element-id）但放到畫布空白處
//    （Body）——既有元素懸停/放在「別的元素上」時，會被 schema-elements.tsx 自己的
//    handler 攔截並 stopPropagation，事件根本冒泡不到這裡；只有放到空白 Body 才會
//    冒泡進來，對應下面 handleDrop 開頭那段 application/element-id 的 no-op + log。
//
// 換句話說：canvas 內部既有元素的搬移／reorder，永遠不會觸發 isLeafDrag 那個分支
// （它們不會設定 application/component-leaf），只有在放到 Body 時才會摸到這個 hook。
export function useCanvasDrop(logEvent: LogEvent, draggedIdRef: RefObject<string | null>) {
    const schema = useSchemaStore((state) => state.schema);
    const setSchema = useSchemaStore((state) => state.setSchema);
    const elementMap = useSchemaStore((state) => state.elementMap);
    const [dragHint, setDragHint] = useState<{ x: number; y: number } | null>(null);

    // dragover 每次滑鼠移動都會觸發，只節流「記錄目前懸停在哪個 container」這件事，
    // e.preventDefault()／dropEffect／dragHint 這些每個 tick 都要跑，不能一起節流，
    // 否則會漏掉 preventDefault（瀏覽器不允許 drop）或讓 🚫 提示的座標卡頓。
    const throttledLogContainerHover = useThrottle((containerId: string) => {
        logEvent(containerId, BODY_ELEMENT_ID, schema.elements, schema.elements);
        console.log('run throttledLogContainerHover');
    }, 50);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const isLeafDrag = e.dataTransfer.types.includes('application/component-leaf');
        if (isLeafDrag) {
            const insideContainer = (e.target as HTMLElement).closest(
                `[data-component-id="${ComponentIdEnums.container}"]`
            );
            const containerId = insideContainer?.getAttribute('data-element-id');
            if (process.env.NODE_ENV === 'development' && containerId) {
                throttledLogContainerHover(containerId);
            }
            if (!insideContainer) {
                e.dataTransfer.dropEffect = 'none';
                setDragHint({ x: e.clientX, y: e.clientY });
                return;
            }
        }
        e.dataTransfer.dropEffect = 'copy';
        setDragHint(null);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setDragHint(null);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragHint(null);

        // 能執行到這裡代表 drop 事件冒泡到了 #canvas 本身，沒有被 schema-elements.tsx
        // 的 handleElementDrop 攔截（它 drop 在既有元素上時一定會 stopPropagation）——
        // 也就是使用者把既有元素拖到畫布空白處（Body），不是拖到別的元素上。
        // 目前這裡本來就不處理既有元素的 reorder，維持原本的 no-op，只補記一筆事件。
        const draggedElementId = e.dataTransfer.getData('application/element-id');
        if (draggedElementId) {
            if (process.env.NODE_ENV === 'development') {
                logEvent(draggedElementId, BODY_ELEMENT_ID, schema.elements, schema.elements);
                console.log('🟣 [element drag] drop on body:', draggedElementId);
            }
            // dragend 還會在 schema-elements.tsx 觸發一次，把這裡清空讓它知道
            // 這次已經被記錄成「拖到 body」，不要又記一筆「取消拖曳」。
            draggedIdRef.current = null;
            return;
        }

        const componentId = e.dataTransfer.getData('text/plain') as ComponentIdEnums;
        const isLeaf =
            componentId === ComponentIdEnums.text ||
            componentId === ComponentIdEnums.image ||
            componentId === ComponentIdEnums.button;

        const canvasRect = e.currentTarget.getBoundingClientRect();
        const newElement = createElement(
            componentId,
            { x: e.clientX - canvasRect.left, y: e.clientY - canvasRect.top },
            schema.elements.length
        );

        const targetElementId = (e.target as HTMLElement).getAttribute('data-element-id');
        if (targetElementId) {
            const targetNode = elementMap.get(targetElementId);
            if (!targetNode) return;

            const {
                path: nodePath,
                parent: nodeParent,
                element: { componentId: nodeComponentId, id: nodeElementId },
            } = targetNode;

            if (nodeComponentId === ComponentIdEnums.container) {
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

            if (!nodeParent && isLeaf) return;

            setSchema((prev) => {
                const elements = JSON.parse(JSON.stringify(prev.elements)) as ElementSchema[];
                if (nodeParent) {
                    const parentPath = nodePath.slice(0, -1);
                    let cur: any = elements;
                    for (let i = 0; i < parentPath.length; i++) {
                        if (i === parentPath.length - 1) {
                            (cur[parentPath[i]!] as ContainerElementSchema).children.splice(
                                nodePath[nodePath.length - 1]! + 1,
                                0,
                                newElement
                            );
                        } else {
                            cur = cur[parentPath[i]!];
                            if ('children' in cur) cur = cur.children;
                        }
                    }
                } else {
                    elements.splice(nodePath[0]! + 1, 0, newElement);
                }
                return { ...prev, elements };
            });
            return;
        }

        if (isLeaf) return;

        setSchema((prev) => ({ ...prev, elements: [...prev.elements, newElement] }));
    };

    return { dragHint, handleDragOver, handleDragLeave, handleDrop };
}
