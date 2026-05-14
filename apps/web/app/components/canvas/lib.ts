import { ContainerElementSchema, ElementSchema } from "../../context/schema-context";
import { ComponentIdEnums } from "../sidebar/use-sidebar";

// Map 索引節點
export interface ElementMapNode {
    element: ElementSchema;
    parent: ContainerElementSchema | null;
    path: number[]; // 在樹中的位置路徑
    depth: number;  // 深度（根層級 = 0）
}
/*

  path 是一個數字陣列，記錄元素在樹狀結構中的「陣列索引路徑」

  舉例說明：

  schema = {
    elements: [
      container-1,        // path: [0]
        ├─ text-1,        // path: [0, 0]  → elements[0].children[0]
        └─ container-2,   // path: [0, 1]  → elements[0].children[1]
             ├─ button-1  // path: [0, 1, 0]  → elements[0].children[1].children[0]
             └─ text-2    // path: [0, 1, 1]  → elements[0].children[1].children[1]
      container-3         // path: [1]
    ]
  }

  實際用途：

  // path = [0, 1, 0] 表示：
  elements[0]              // 第一個元素 (container-1)
    .children[1]           // 該元素的第二個子元素 (container-2)
      .children[0]         // 該子元素的第一個子元素 (button-1)
      
*/

// 取得某 path 的父層陣列
export function getParentArray(elements: ElementSchema[], path: number[]): ElementSchema[] {
    if (path.length === 1) return elements;
    let current: any = elements;
    for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]!];
        if ('children' in current) current = current.children;
    }
    return current as ElementSchema[];
}

// 取得某 path 指向的元素
export function getElementAtPath(elements: ElementSchema[], path: number[]): ElementSchema {
    const parentArray = getParentArray(elements, path);
    return parentArray[path[path.length - 1]!]!;
}

// 計算移動後的 elements（pure，不修改原始資料）
// 同時給 drag preview（useMemo）和真正 drop 使用
export function computeReorder(
    elements: ElementSchema[],
    elementMap: Map<string, ElementMapNode>,
    draggedId: string,
    targetId: string
): ElementSchema[] {
    if (draggedId === targetId) return elements;

    const draggedNode = elementMap.get(draggedId);
    const targetNode = elementMap.get(targetId);
    if (!draggedNode || !targetNode) return elements;

    const newElements = JSON.parse(JSON.stringify(elements)) as ElementSchema[];

    const draggedPath = [...draggedNode.path];
    const targetPath = [...targetNode.path];

    // target 是 dragged 的子孫節點，無法移入自己內部
    const isDraggedAncestorOfTarget =
        draggedPath.length < targetPath.length &&
        draggedPath.every((v, i) => v === targetPath[i]);
    if (isDraggedAncestorOfTarget) return elements;

    // Step 1: 移除 dragged element
    const draggedParentArray = getParentArray(newElements, draggedPath);
    const draggedIndex = draggedPath[draggedPath.length - 1]!;
    const [draggedElement] = draggedParentArray.splice(draggedIndex, 1);

    // Step 2: 補正 targetPath
    // 移除 dragged 後，所有「與 dragged 共用同一父陣列、且 index 在 dragged 之後」的路徑節點都需 -1
    // 這包含：與 dragged 同層的 target，以及 target 是某個被移位的兄弟節點之子孫的情況
    const draggedParentPath = draggedPath.slice(0, -1);
    const sharedPrefixLevel = draggedParentPath.length;
    const sharesParentPrefix = draggedParentPath.every((v, i) => v === targetPath[i]);

    if (sharesParentPrefix && (targetPath[sharedPrefixLevel] ?? -1) > draggedIndex) {
        targetPath[sharedPrefixLevel]!--;
    }

    // Step 3: 插入到目標位置
    if (targetNode.element.componentId === ComponentIdEnums.container) {
        const container = getElementAtPath(newElements, targetPath) as ContainerElementSchema;
        container.children.push(draggedElement!);
    } else {
        const targetParentArray = getParentArray(newElements, targetPath);
        targetParentArray.splice(targetPath[targetPath.length - 1]!, 0, draggedElement!);
    }

    return newElements;
}

// 建立元素索引 Map
export function buildElementMap(
    elements: ElementSchema[],
    map: Map<string, ElementMapNode> = new Map()
): Map<string, ElementMapNode> {

    function traverse(
        elements: ElementSchema[],
        parent: ContainerElementSchema | null = null,
        currentPath: number[] = [],
        depth: number = 0
    ) {
        elements.forEach((element, index) => {
            const elementPath = [...currentPath, index];

            // 存入 Map
            map.set(element.id, {
                element: element,
                parent: parent,
                path: elementPath,
                depth: depth
            });

            // 如果是 Container，遞歸處理子元素
            if (element.componentId === ComponentIdEnums.container) {
                const containerElement = element as ContainerElementSchema;
                traverse(
                    containerElement.children,
                    containerElement,
                    elementPath,
                    depth + 1
                );
            }
        });
    }

    map.clear();
    traverse(elements);
    return map;
}