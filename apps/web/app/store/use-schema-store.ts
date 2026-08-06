import { create } from 'zustand';
import { ComponentIdEnums } from '@/builder/_components/sidebar/use-sidebar';
import { buildElementMap, ElementMapNode } from '@/builder/_components/canvas/lib';

// 基礎元素屬性（所有元素共用）
interface BaseElementSchema {
    id: string;
    componentId: ComponentIdEnums;
    order: number;
    position: {
        x: number;
        y: number;
    };
    styles?: {
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
    };
    className?: string;
    props?: Record<string, any>;
}

// 非 Container 元素（文字、圖片、按鈕）
export interface LeafElementSchema extends BaseElementSchema {
    componentId: ComponentIdEnums.text | ComponentIdEnums.image | ComponentIdEnums.button;
    content?: string;
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

// 主 Schema 類型（Canvas 的完整結構）
export interface CanvasSchema {
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
}

// schema 變動頻繁，且被畫布、屬性面板、結構樹等多層元件共用。
// 用 Zustand 讓各元件用 selector 只訂閱自己需要的欄位，
// 避免舊版 Context 那種「value 物件每次 render 都重建，導致所有 consumer 全部重渲染」的問題。
export const useSchemaStore = create<SchemaStore>((set, get) => ({
    schema: { elements: [] },
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
            const newElements = JSON.parse(
                JSON.stringify(prevSchema.elements)
            ) as ElementSchema[];
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

            return { elements: newElements };
        });
    },

    deleteElement: (id) => {
        const node = get().elementMap.get(id);
        if (!node) return;

        get().setSchema((prevSchema) => {
            const newElements = JSON.parse(
                JSON.stringify(prevSchema.elements)
            ) as ElementSchema[];
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

            return { elements: newElements };
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

                return { elements: newElements };
            });
        } else {
            // 加到根層級
            get().setSchema((prevSchema) => ({
                elements: [...prevSchema.elements, element],
            }));
        }
    },
}));
