import { ElementTypeEnums, ContainerElementSchema, ElementSchema } from './schema';

// Map 索引節點
export interface ElementMapNode {
    element: ElementSchema;
    parent: ContainerElementSchema | null;
    path: number[]; // 在樹中的位置路徑
    depth: number; // 深度（根層級 = 0）
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

// 'before'/'after' = 插在 target 同層的前面／後面（變成兄弟節點）；
// 'inside' 只對 container 類型的 target 有意義，代表塞進它的 children 尾端。
export type DropPosition = 'before' | 'after' | 'inside';

// 計算移動後的 elements（pure，不修改原始資料）
// 同時給 drag preview（useMemo）和真正 drop 使用
export function computeReorder(
    elements: ElementSchema[],
    elementMap: Map<string, ElementMapNode>,
    draggedId: string,
    targetId: string,
    dropPosition: DropPosition
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
        draggedPath.length < targetPath.length && draggedPath.every((v, i) => v === targetPath[i]);
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

    // Step 3: 依 dropPosition 插入到目標位置。'inside' 只有 target 是 container
    // 才塞進它的 children；其餘情況（包含 target 不是 container 卻收到
    // 'inside' 的防呆）都當成插在 target 同層的前面／後面。
    if (dropPosition === 'inside' && isContainerElement(elementMap, targetId)) {
        const container = getElementAtPath(newElements, targetPath) as ContainerElementSchema;
        container.children.push(draggedElement!);
    } else {
        const targetParentArray = getParentArray(newElements, targetPath);
        const targetIndex = targetPath[targetPath.length - 1]!;
        const insertAt = dropPosition === 'after' ? targetIndex + 1 : targetIndex;
        targetParentArray.splice(insertAt, 0, draggedElement!);
    }

    return newElements;
}

// 只取 top/height，不要求真的是 DOMRect——dnd-kit 的 over.rect 是它自己的
// ClientRect 形狀（純資料物件，不是 DOM 量出來的 DOMRect 實例），形狀相容即可直接傳進來。
interface RectLike {
    top: number;
    height: number;
}

// 上緣留固定 EDGE_ZONE_PX 寬的判定帶，不隨 target 本身的大小縮放。
// 不用「相對 target 高度的比例」（例如之前的 50% 對半分）——target 越大，
// 比例算出來的 before/after 判定區就跟著等比放大，變成一大片模糊區域，滑鼠
// 稍微移動就整片算同一邊，反而不精準；target 大到接近整個畫布時，甚至逼滑鼠
// 要整個移出它的範圍才能插在旁邊，幾乎摸不到 before/after。
const EDGE_ZONE_PX = 16;

export function getDropPosition(
    targetRect: RectLike,
    pointY: number,
    isContainer: boolean
): DropPosition {
    const offsetFromTop = pointY - targetRect.top;
    const offsetFromBottom = targetRect.height - offsetFromTop;

    if (offsetFromTop < EDGE_ZONE_PX) return 'before';

    // container 的下緣不再切一段固定寬度的 after 判定帶——container 矮的話
    // （例如空容器只剩 padding 撐出的高度），上緣扣掉一段之後，剩下能命中
    // inside 的區域會被壓縮成很窄一條，滑鼠稍微沒對準就滑進 after，變成
    // 「明明想塞進去卻被丟到它外面、變成同層的下一個元素」。
    // 只要滑鼠還在 container 的範圍內（offsetFromBottom >= 0），扣掉上緣後
    // 全部算 inside；真的移到它下緣以外（例如它是同層最後一個，靠鄰近命中
    // 撿到它）才算 after——這樣還是能把新元素插在它後面，只是要滑鼠貼在最
    // 上緣才能插在它前面，其他情況一律優先塞進去。
    if (isContainer) return offsetFromBottom < 0 ? 'after' : 'inside';

    if (offsetFromBottom < EDGE_ZONE_PX) return 'after';
    return offsetFromTop < offsetFromBottom ? 'before' : 'after';
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
                depth: depth,
            });

            // 如果是 Container，遞歸處理子元素
            if (element.elementType === ElementTypeEnums.container) {
                const containerElement = element as ContainerElementSchema;
                traverse(containerElement.children, containerElement, elementPath, depth + 1);
            }
        });
    }

    map.clear();
    traverse(elements);
    return map;
}

// 判斷某個 id 指到的元素是不是 container——一律查 elementMap（schema 本身的資料），
// 不要另外從 DOM／dnd-kit droppable 掛的 data 猜。拖曳過程中 (handleDragMove) 跟
// 放手那一刻 (insertElement/computeReorder) 都要用同一份依據判斷，才不會兩邊各自
// 維護一套「target 是不是 container」的邏輯、算出不一致的結果。
export function isContainerElement(elementMap: Map<string, ElementMapNode>, id: string): boolean {
    return elementMap.get(id)?.element.elementType === ElementTypeEnums.container;
}
