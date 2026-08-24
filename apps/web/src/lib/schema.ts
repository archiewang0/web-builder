// Canvas schema 的核心領域型別／enum。跟 useSchemaStore（zustand store 本身）分開放，
// 因為這些型別被 store 以外的地方共用（server 端 db/queries、db/schema，以及
// app/site/[id] 公開展示頁的 renderer），不是 builder 或 zustand store 的私有實作細節。

export enum ComponentIdEnums {
    text = 'text',
    image = 'image',
    button = 'button',
    container = 'container',
    body = 'body',
}

// 「樣板」跟「組件」是兩回事：組件（ComponentIdEnums）是 schema 裡真的會存在
// 某個元素節點上的 componentId；樣板只是 sidebar 拖曳的入口，放開滑鼠後展開成
// 一整棵由既有組件（container/image/button...）組成的樹，插入 schema 的東西
// 都是貨真價實的既有組件，不會有任何節點的 componentId 是這裡的值。
// 用獨立的 enum、不跟 ComponentIdEnums 混在一起，就不用讓 schema 那邊一堆
// switch/型別聯集為了一個「其實不會真的存在於 schema 裡」的值多開分支。
export enum PresetIdEnums {
    navbar = 'preset-navbar',
}

// 選取狀態用這個值代表選到的是 Body（畫布背景），不是 elements 陣列裡的某個節點。
// 用固定字串而不是擴充 selectedElement 的型別，是因為真正的元素 id 都是 uuid，不會跟它撞到。
export const BODY_ELEMENT_ID = '__body__';

// 樣式屬性，元素跟 Body 共用同一份形狀
export interface StylesSchema {
    width?: string;
    height?: string;
    padding?: string;
    margin?: string;
    backgroundColor?: string;
    color?: string;
    fontSize?: string;
    fontFamily?: string;
    fontWeight?: string;
    [key: string]: string | undefined;
}

// 基礎元素屬性（所有元素共用）
interface BaseElementSchema {
    id: string;
    componentId: ComponentIdEnums;
    order: number;
    position: {
        x: number;
        y: number;
    };
    styles?: StylesSchema;
    className?: string;
    props?: Record<string, any>;
}

// 非 Container 元素（文字、圖片、按鈕）
export interface LeafElementSchema extends BaseElementSchema {
    componentId: ComponentIdEnums.text | ComponentIdEnums.image | ComponentIdEnums.button;
    content?: string;
    // 目前只有 button 會用到。單一欄位同時表達兩種連結模式，用值本身的格式分流，
    // 不用另外存一個 linkType 欄位：'#' 開頭 = 捲動到 id 等於後面那段字串的元素，
    // 其餘視為外部網址——跟 image-size-setting.tsx 用 width 字串後綴判斷 px/% 是同一種做法。
    href?: string;
}

// Container 元素（可包含子元素）
export interface ContainerElementSchema extends BaseElementSchema {
    componentId: ComponentIdEnums.container;
    // undefined = flex 版面（由 justifyContent 控制對齊）；number = grid 版面（欄數），兩者互斥
    columns?: number;
    children: ElementSchema[];
    // 標記這個 container 是從哪個樣板展開來的（目前只有 navbar）。純粹是 UI 開關用的
    // 標籤，不影響渲染——child 結構仍然是普通 container/image/button，使用者可以
    // 隨意增刪調整；只有屬性面板會依這個欄位決定要不要多顯示樣板專屬的控制項
    // （例如 navbar 專屬的導覽列定位），不會出現在一般手動疊出來的 container 上。
    variant?: PresetIdEnums;
}

// 聯合類型：元素可以是 Leaf 或 Container
export type ElementSchema = LeafElementSchema | ContainerElementSchema;

// Body：畫布的根背景層，每份頁面固定只有一個。不進 elements 陣列，
// 不能拖曳新增也不能刪除，只提供背景色／背景圖設定，沿用既有的 BackgroundSetting UI。
export interface BodySchema {
    styles?: StylesSchema;
}

// 主 Schema 類型（Canvas 的完整結構）
export interface CanvasSchema {
    // 此功能上線前存的舊頁面不會有這個欄位，標成 optional，讀取時要自行補預設值。
    body?: BodySchema;
    elements: ElementSchema[];
}
