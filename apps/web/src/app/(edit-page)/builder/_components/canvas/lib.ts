import { ContainerElementSchema, ElementSchema, LeafElementSchema } from '@/store/use-schema-store';
import { ComponentIdEnums } from '../sidebar/use-sidebar';
import { PresetIdEnums } from '../_types/preset-id-enums';
import { IMG_DEFAULT_WIDTH_PX, IMG_DEFAULT_HEIGHT_PX } from '../_const/img';

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
    if (
        dropPosition === 'inside' &&
        targetNode.element.componentId === ComponentIdEnums.container
    ) {
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

// 上下緣各留固定 EDGE_ZONE_PX 寬的判定帶，不隨 target 本身的大小縮放。
// 不用「相對 target 高度的比例」（例如之前的 50% 對半分）——target 越大，
// 比例算出來的 before/after 判定區就跟著等比放大，變成一大片模糊區域，滑鼠
// 稍微移動就整片算同一邊，反而不精準；target 大到接近整個畫布時，甚至逼滑鼠
// 要整個移出它的範圍才能插在旁邊，幾乎摸不到 before/after。
// 改成固定像素：不管 target 多大，滑鼠只要落在上/下緣固定這麼寬的範圍內，
// 就是 before/after，讓使用者用同樣精細度的滑鼠移動就能命中，不被 target
// 大小牽著跑；扣掉這兩段固定帶之後剩下的中間區域，container 才算 inside。
const EDGE_ZONE_PX = 16;

export function getDropPosition(
    targetRect: RectLike,
    pointY: number,
    isContainer: boolean
): DropPosition {
    const offsetFromTop = pointY - targetRect.top;
    const offsetFromBottom = targetRect.height - offsetFromTop;

    console.log('offsetFromTop: ', offsetFromTop);
    console.log('offsetFromBottom: ', offsetFromBottom);
    console.log('isContainer: ', isContainer);

    let result: DropPosition;
    if (offsetFromTop < EDGE_ZONE_PX) {
        result = 'before';
    } else if (offsetFromBottom < EDGE_ZONE_PX) {
        result = 'after';
    } else if (isContainer) {
        result = 'inside';
    } else {
        result = offsetFromTop < offsetFromBottom ? 'before' : 'after';
    }

    console.log('result: ', result);
    return result;
}

// 依 componentId 建出新元素（pure factory，不依賴 React）
export function createElement(
    componentId: ComponentIdEnums,
    position: { x: number; y: number },
    order: number
): ElementSchema {
    const id = `${componentId}-${Date.now()}`;
    if (componentId === ComponentIdEnums.container) {
        return { id, componentId, order, columns: 1, position, children: [] };
    }
    const contentMap: Partial<Record<ComponentIdEnums, string>> = {
        [ComponentIdEnums.text]: '新增文字',
        [ComponentIdEnums.button]: '按鈕',
    };
    // 圖片元件預設用 px 單位，不是 %——unit 是從 styles.width 字串後綴判斷的
    // （見 image-size-setting.tsx），一開始就存 px 字串，新增的圖片元件才會
    // 直接進 px 模式，不用使用者自己手動切換。
    const styles =
        componentId === ComponentIdEnums.image
            ? { width: `${IMG_DEFAULT_WIDTH_PX}px`, height: `${IMG_DEFAULT_HEIGHT_PX}px` }
            : undefined;

    return {
        id,
        componentId: componentId as
            | ComponentIdEnums.text
            | ComponentIdEnums.image
            | ComponentIdEnums.button,
        order,
        position,
        content: contentMap[componentId] ?? '',
        styles,
    };
}

// createElement 用 `${componentId}-${Date.now()}` 當 id，同一毫秒內連續呼叫
// 好幾次（組樣板時很常見）很容易撞出重複 id。樣板內部元素一律再疊加一個遞增
// 序號保證唯一，不用去動 createElement 本身的 id 產生方式（那是整個 app 通用
// 的既有邏輯，改了影響面太大)。
function withUniqueId<T extends { id: string }>(element: T, seq: number): T {
    return { ...element, id: `${element.id}-${seq}` };
}

// Navbar 樣板：一次展開成「logo（圖片）+ 導覽連結（container 包幾個 button）」
// 的 container 樹，全部都是既有組件組出來的，使用者放開滑鼠後看到的、能點選/
// 調整/刪除的都是貨真價實的 container/image/button，跟手動疊出來的沒有兩樣。
export function createNavbarPreset(order: number): ContainerElementSchema {
    let seq = 0;
    const nextSeq = () => seq++;

    const logo = withUniqueId(
        createElement(ComponentIdEnums.image, { x: 0, y: 0 }, 0),
        nextSeq()
    ) as LeafElementSchema;
    // 樣板裡的 logo 是預覽用的合理尺寸，不用 createElement 圖片預設的 500x500
    // （那是給一般使用者手動插入的單張圖片用的預設值，logo 應該小很多）。
    logo.styles = { ...logo.styles, width: '140px', height: '40px' };

    const navLinks = ['首頁', '關於我們', '聯絡我們'].map((label, index) => {
        const button = withUniqueId(
            createElement(ComponentIdEnums.button, { x: 0, y: 0 }, index),
            nextSeq()
        ) as LeafElementSchema;
        return { ...button, content: label };
    });

    const linksContainer = withUniqueId(
        createElement(ComponentIdEnums.container, { x: 0, y: 0 }, 1),
        nextSeq()
    ) as ContainerElementSchema;
    // columns: undefined 才是 flex 排版（見本檔案開頭 DropPosition 上面的型別註解），
    // 不然 createElement 給 container 的預設值是 columns: 1（grid 單欄），套不了 justifyContent。
    linksContainer.columns = undefined;
    linksContainer.styles = { justifyContent: 'flex-end', alignItems: 'center', gap: '24px' };
    linksContainer.children = navLinks;

    // logo 跟導覽連結包在同一個 2 欄 grid row 裡，不要直接讓 root 用 flex 並排——
    // container-element.tsx 的 flex 模式是寫死 flex-wrap，畫布變窄時兩側直接
    // wrap 掉變成上下兩排；grid-cols-2 的欄寬是固定切好的，不會有這個問題，
    // navbar 兩側要永遠並排這點用 grid 比較穩。
    const row = withUniqueId(
        createElement(ComponentIdEnums.container, { x: 0, y: 0 }, 0),
        nextSeq()
    ) as ContainerElementSchema;
    row.columns = 2;
    row.styles = { alignItems: 'center', gap: '24px' };
    row.children = [logo, linksContainer];

    const navbar = withUniqueId(
        createElement(ComponentIdEnums.container, { x: 0, y: 0 }, order),
        nextSeq()
    ) as ContainerElementSchema;
    navbar.columns = undefined;
    navbar.styles = {
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        backgroundColor: '#ffffff',
        width: '100%',
    };
    navbar.children = [row];
    // 標記這個 container 是 navbar 樣板展開出來的，屬性面板才知道要多顯示
    // 導覽列定位控制項——child 結構還是普通 image/button/container，使用者
    // 拆掉重排都不受影響，只有這個標記留在 root container 上。
    navbar.variant = PresetIdEnums.navbar;

    return navbar;
}

// 依 presetId 分派到對應的樣板 factory——目前只有 navbar 一種，先用 switch
// 開好路，之後加新樣板只要多一個 case，呼叫端（use-canvas-dnd.tsx）不用改。
export function createPreset(presetId: PresetIdEnums, order: number): ElementSchema {
    switch (presetId) {
        case PresetIdEnums.navbar:
            return createNavbarPreset(order);
    }
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
            if (element.componentId === ComponentIdEnums.container) {
                const containerElement = element as ContainerElementSchema;
                traverse(containerElement.children, containerElement, elementPath, depth + 1);
            }
        });
    }

    map.clear();
    traverse(elements);
    return map;
}
