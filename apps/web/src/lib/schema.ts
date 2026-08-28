// Canvas schema 的核心領域型別／enum。跟 useSchemaStore（zustand store 本身）分開放，
// 因為這些型別被 store 以外的地方共用（server 端 db/queries、db/schema，以及
// app/site/[id] 公開展示頁的 renderer），不是 builder 或 zustand store 的私有實作細節。

export enum ElementTypeEnums {
    text = 'text',
    image = 'image',
    button = 'button',
    container = 'container',
    dropdownMenu = 'dropdown-menu',
    body = 'body',
}

// 「樣板」跟「組件」是兩回事：組件（ElementTypeEnums）是 schema 裡真的會存在
// 某個元素節點上的 elementType；樣板只是 sidebar 拖曳的入口，放開滑鼠後展開成
// 一整棵由既有組件（container/image/button...）組成的樹，插入 schema 的東西
// 都是貨真價實的既有組件，不會有任何節點的 elementType 是這裡的值。
// 用獨立的 enum、不跟 ElementTypeEnums 混在一起，就不用讓 schema 那邊一堆
// switch/型別聯集為了一個「其實不會真的存在於 schema 裡」的值多開分支。
export enum PresetIdEnums {
    navbar = 'preset-navbar',
}

// 選取狀態用這個值代表選到的是 Body（畫布背景），不是 elements 陣列裡的某個節點。
// 用固定字串而不是擴充 selectedElement 的型別，是因為真正的元素 id 都是 uuid，不會跟它撞到。
export const BODY_ELEMENT_ID = '__body__';

// 單一裝置的樣式屬性，元素跟 Body 共用同一份形狀
export interface StyleProps {
    width?: string;
    height?: string;
    padding?: string;
    margin?: string;
    backgroundColor?: string;
    boxShadow?: string;
    color?: string;
    fontSize?: string;
    fontFamily?: string;
    fontWeight?: string;
    [key: string]: string | undefined;
}

// 響應式樣式：base 是桌面版（也是預設值），tablet/mobile 只存跟前一層不同的
// 屬性，畫面呈現時用 cascade 疊加（跟 CSS max-width media query 疊加順序一致：
// base → tablet 覆寫 → mobile 覆寫）。編輯器切換裝置時要讀寫哪一層、畫布渲染
// 的疊加、正式站台的 @media 產生，一律透過 lib/responsive-styles.ts 的
// resolveStyles／writeStyles／buildResponsiveCss，不要在別處手動疊值，
// 才不會三個地方（editor cascade／site media query／面板顯示）各寫一套邏輯、
// 行為兜不起來。
//
// 舊版（改版前）存的頁面 styles 是攤平的 StyleProps，沒有 base 這個 key；
// resolveStyles／writeStyles 內部的 normalizeStyles 會自動把它當成 base
// 處理，讀取端不用另外判斷資料是新是舊。
export interface StylesSchema {
    base: StyleProps;
    tablet?: Partial<StyleProps>;
    mobile?: Partial<StyleProps>;
}

// 基礎元素屬性（所有元素共用）
interface BaseElementSchema {
    id: string;
    elementType: ElementTypeEnums;
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
    elementType: ElementTypeEnums.text | ElementTypeEnums.image | ElementTypeEnums.button;
    content?: string;
    // 目前只有 button 會用到。單一欄位同時表達兩種連結模式，用值本身的格式分流，
    // 不用另外存一個 linkType 欄位：'#' 開頭 = 捲動到 id 等於後面那段字串的元素，
    // 其餘視為外部網址——跟 image-size-setting.tsx 用 width 字串後綴判斷 px/% 是同一種做法。
    href?: string;
}

// Container 元素（可包含子元素）
export interface ContainerElementSchema extends BaseElementSchema {
    elementType: ElementTypeEnums.container;
    // undefined = flex 版面（由 justifyContent 控制對齊）；number = grid 版面（欄數），兩者互斥
    columns?: number;
    children: ElementSchema[];
    // 標記這個 container 是從哪個樣板展開來的（目前只有 navbar）。純粹是 UI 開關用的
    // 標籤，不影響渲染——child 結構仍然是普通 container/image/button，使用者可以
    // 隨意增刪調整；只有屬性面板會依這個欄位決定要不要多顯示樣板專屬的控制項
    // （例如 navbar 專屬的導覽列定位），不會出現在一般手動疊出來的 container 上。
    variant?: PresetIdEnums;
}

// Dropdown Menu 元件：外殼（觸發鈕＋開合互動）是固定的，交給正式站台的
// Radix DropdownMenu 處理；children 是使用者自由拖拽進來的內容（button/text/
// container 都可以），編輯器裡永遠展開可編輯，只有正式站台才會真的收合。
export interface DropdownMenuElementSchema extends BaseElementSchema {
    elementType: ElementTypeEnums.dropdownMenu;
    // 觸發鈕文字，跟 button 的 content 是同一種用法，沿用既有 ContentTextarea。
    content?: string;
    children: ElementSchema[];
}

// 聯合類型：元素可以是 Leaf、Container 或 DropdownMenu
export type ElementSchema = LeafElementSchema | ContainerElementSchema | DropdownMenuElementSchema;

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
