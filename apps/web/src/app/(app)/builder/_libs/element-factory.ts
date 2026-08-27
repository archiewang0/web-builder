import {
    ElementTypeEnums,
    ContainerElementSchema,
    ElementSchema,
    LeafElementSchema,
    PresetIdEnums,
} from '@/lib/schema';
import { DeviceIdEnums } from '@/components/header/devices';
import { writeStyles } from '@/lib/responsive-styles';
import { IMG_DEFAULT_WIDTH_PX, IMG_DEFAULT_HEIGHT_PX } from '../_const/img';

// 依 elementType 建出新元素（pure factory，不依賴 React）
export function createElement(
    elementType: ElementTypeEnums,
    position: { x: number; y: number },
    order: number
): ElementSchema {
    const id = `${elementType}-${Date.now()}`;
    if (elementType === ElementTypeEnums.container) {
        return { id, elementType, order, columns: 1, position, children: [] };
    }
    const contentMap: Partial<Record<ElementTypeEnums, string>> = {
        [ElementTypeEnums.text]: '新增文字',
        [ElementTypeEnums.button]: '按鈕',
    };
    // 圖片元件預設用 px 單位，不是 %——unit 是從 styles.width 字串後綴判斷的
    // （見 image-size-setting.tsx），一開始就存 px 字串，新增的圖片元件才會
    // 直接進 px 模式，不用使用者自己手動切換。
    const styles =
        elementType === ElementTypeEnums.image
            ? {
                  base: { width: `${IMG_DEFAULT_WIDTH_PX}px`, height: `${IMG_DEFAULT_HEIGHT_PX}px` },
              }
            : undefined;

    return {
        id,
        elementType: elementType as
            | ElementTypeEnums.text
            | ElementTypeEnums.image
            | ElementTypeEnums.button,
        order,
        position,
        content: contentMap[elementType] ?? '',
        styles,
    };
}

// createElement 用 `${elementType}-${Date.now()}` 當 id，同一毫秒內連續呼叫
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
        createElement(ElementTypeEnums.image, { x: 0, y: 0 }, 0),
        nextSeq()
    ) as LeafElementSchema;
    // 樣板裡的 logo 是預覽用的合理尺寸，不用 createElement 圖片預設的 500x500
    // （那是給一般使用者手動插入的單張圖片用的預設值，logo 應該小很多）。
    logo.styles = writeStyles(logo.styles, DeviceIdEnums.desktop, { width: '140px', height: '40px' });

    const navLinks = ['首頁', '關於我們', '聯絡我們'].map((label, index) => {
        const button = withUniqueId(
            createElement(ElementTypeEnums.button, { x: 0, y: 0 }, index),
            nextSeq()
        ) as LeafElementSchema;
        return { ...button, content: label };
    });

    const linksContainer = withUniqueId(
        createElement(ElementTypeEnums.container, { x: 0, y: 0 }, 1),
        nextSeq()
    ) as ContainerElementSchema;
    // columns: undefined 才是 flex 排版（見 schema-tree.ts 開頭 DropPosition 上面的型別註解），
    // 不然 createElement 給 container 的預設值是 columns: 1（grid 單欄），套不了 justifyContent。
    linksContainer.columns = undefined;
    linksContainer.styles = {
        base: { justifyContent: 'flex-end', alignItems: 'center', gap: '24px' },
    };
    linksContainer.children = navLinks;

    // logo 跟導覽連結包在同一個 2 欄 grid row 裡，不要直接讓 root 用 flex 並排——
    // container-element.tsx 的 flex 模式是寫死 flex-wrap，畫布變窄時兩側直接
    // wrap 掉變成上下兩排；grid-cols-2 的欄寬是固定切好的，不會有這個問題，
    // navbar 兩側要永遠並排這點用 grid 比較穩。
    const row = withUniqueId(
        createElement(ElementTypeEnums.container, { x: 0, y: 0 }, 0),
        nextSeq()
    ) as ContainerElementSchema;
    row.columns = 2;
    row.styles = { base: { alignItems: 'center', gap: '24px' } };
    row.children = [logo, linksContainer];

    const navbar = withUniqueId(
        createElement(ElementTypeEnums.container, { x: 0, y: 0 }, order),
        nextSeq()
    ) as ContainerElementSchema;
    navbar.columns = undefined;
    navbar.styles = {
        base: {
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            backgroundColor: '#ffffff',
            width: '100%',
        },
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
