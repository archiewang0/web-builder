import { create } from 'zustand';
import { ComponentIdEnums } from '@/app/(edit-page)/builder/_components/sidebar/use-sidebar';
import { buildElementMap, ElementMapNode } from '@/app/(edit-page)/builder/_components/canvas/lib';

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

interface SchemaStore {
    schema: CanvasSchema;
    elementMap: Map<string, ElementMapNode>;
    setSchema: (updater: CanvasSchema | ((prev: CanvasSchema) => CanvasSchema)) => void;

    // 輔助方法
    getElementById: (id: string) => ElementSchema | null;
    updateElement: (id: string, updates: Partial<ElementSchema>) => void;
    deleteElement: (id: string) => void;
    addElement: (element: ElementSchema, parentId?: string) => void;
    updateBodyStyles: (styles: StylesSchema) => void;
}

// schema 變動頻繁，且被畫布、屬性面板、結構樹等多層元件共用。
// 用 Zustand 讓各元件用 selector 只訂閱自己需要的欄位，
// 避免舊版 Context 那種「value 物件每次 render 都重建，導致所有 consumer 全部重渲染」的問題。
export const useSchemaStore = create<SchemaStore>((set, get) => ({
    schema: { body: {}, elements: [] },
    elementMap: new Map(),

    setSchema: (updater) => {
        set((state) => {
            const newSchema = typeof updater === 'function' ? updater(state.schema) : updater;
            return { schema: newSchema, elementMap: buildElementMap(newSchema.elements) };
        });
    },

    getElementById: (id) => {
        return get().elementMap.get(id)?.element || null;
    },

    updateElement: (id, updates) => {
        const node = get().elementMap.get(id);
        if (!node) return;

        get().setSchema((prevSchema) => {
            const newElements = JSON.parse(JSON.stringify(prevSchema.elements)) as ElementSchema[];
            const path = node.path;

            // 使用 path 定位並更新元素
            let current: any = newElements;
            for (let i = 0; i < path.length; i++) {
                if (i === path.length - 1) {
                    current[path[i]!] = { ...current[path[i]!], ...updates };
                } else {
                    current = current[path[i]!];
                    if ('children' in current) {
                        current = current.children;
                    }
                }
            }

            return { ...prevSchema, elements: newElements };
        });
    },

    deleteElement: (id) => {
        const node = get().elementMap.get(id);
        if (!node) return;

        get().setSchema((prevSchema) => {
            const newElements = JSON.parse(JSON.stringify(prevSchema.elements)) as ElementSchema[];
            const path = node.path;

            if (path.length === 1) {
                // 根層級元素，直接刪除
                newElements.splice(path[0]!, 1);
            } else {
                // 嵌套元素，找到父 Container 並從 children 中刪除
                let current: any = newElements;
                for (let i = 0; i < path.length - 1; i++) {
                    current = current[path[i]!];
                    if ('children' in current) {
                        current = current.children;
                    }
                }
                current.splice(path[path.length - 1]!, 1);
            }

            return { ...prevSchema, elements: newElements };
        });
    },

    addElement: (element, parentId) => {
        if (parentId) {
            const parentNode = get().elementMap.get(parentId);
            if (!parentNode || parentNode.element.componentId !== ComponentIdEnums.container) {
                return;
            }

            get().setSchema((prevSchema) => {
                const newElements = JSON.parse(
                    JSON.stringify(prevSchema.elements)
                ) as ElementSchema[];
                const path = parentNode.path;

                let current: any = newElements;
                for (let i = 0; i < path.length; i++) {
                    if (i === path.length - 1) {
                        const container = current[path[i]!] as ContainerElementSchema;
                        container.children.push(element);
                    } else {
                        current = current[path[i]!];
                        if ('children' in current) {
                            current = current.children;
                        }
                    }
                }

                return { ...prevSchema, elements: newElements };
            });
        } else {
            // 加到根層級
            get().setSchema((prevSchema) => ({
                ...prevSchema,
                elements: [...prevSchema.elements, element],
            }));
        }
    },

    updateBodyStyles: (styles) => {
        get().setSchema((prevSchema) => ({
            ...prevSchema,
            body: { ...prevSchema.body, styles },
        }));
    },
}));

declare global {
    interface Window {
        printSchema: () => void;
    }
}

// 開發除錯用：在 console 打 window.printSchema() 印出目前的 schema。
if (typeof window !== 'undefined') {
    window.printSchema = () => {
        console.log(JSON.parse(JSON.stringify(useSchemaStore.getState().schema)));
    };
}
