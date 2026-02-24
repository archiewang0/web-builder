'use client';
import { createContext, useContext, useState, useMemo, ReactNode, useCallback } from 'react';
import { ComponentIdEnums } from '../components/sidebar/use-sidebar';
import { buildElementMap, ElementMapNode } from '../components/canvas/lib';

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
    oneCol: boolean;
    children: ElementSchema[];
}

// 聯合類型：元素可以是 Leaf 或 Container
export type ElementSchema = LeafElementSchema | ContainerElementSchema;

// 主 Schema 類型（Canvas 的完整結構）
export interface CanvasSchema {
    elements: ElementSchema[];
}

// Context 值類型
interface SchemaContextValue {
    schema: CanvasSchema;
    setSchema: React.Dispatch<React.SetStateAction<CanvasSchema>>;
    elementMap: Map<string, ElementMapNode>;

    // 輔助方法
    getElementById: (id: string) => ElementSchema | null;
    updateElement: (id: string, updates: Partial<ElementSchema>) => void;
    deleteElement: (id: string) => void;
    addElement: (element: ElementSchema, parentId?: string) => void;
}

// 預設 Schema
const defaultSchema: CanvasSchema = {
    elements: [
        {
            id: 'container-1',
            componentId: ComponentIdEnums.container,
            order: 0,
            oneCol: true,
            position: { x: 24, y: 24 },
            children: [
                {
                    id: 'text-1-1',
                    componentId: ComponentIdEnums.text,
                    order: 0,
                    position: { x: 0, y: 0 },
                    content: '歡迎使用 Website Builder',
                },
                {
                    id: 'text-1-2',
                    componentId: ComponentIdEnums.text,
                    order: 1,
                    position: { x: 0, y: 50 },
                    content: '這是一個功能強大的網站編輯器，讓您輕鬆創建美麗的網站',
                }
            ]
        },
        {
            id: 'container-2',
            componentId: ComponentIdEnums.container,
            order: 1,
            oneCol: true,
            position: { x: 24, y: 160 },
            children: [
                {
                    id: 'text-2-1',
                    componentId: ComponentIdEnums.text,
                    order: 0,
                    position: { x: 0, y: 0 },
                    content: '內容區塊',
                },
                {
                    id: 'text-2-2',
                    componentId: ComponentIdEnums.text,
                    order: 1,
                    position: { x: 0, y: 40 },
                    content: '您可以在這裡添加任何內容，包括文字、圖片、按鈕等等。',
                },
                {
                    id: 'button-2-1',
                    componentId: ComponentIdEnums.button,
                    order: 2,
                    position: { x: 0, y: 100 },
                    content: '了解更多',
                }
            ]
        },
        {
            id: 'container-3',
            componentId: ComponentIdEnums.container,
            order: 3,
            oneCol: true,
            position: { x: 24, y: 160 },
            children: [
                {
                    id: 'container-4',
                    componentId: ComponentIdEnums.container,
                    order: 0,
                    position: { x: 0, y: 0 },
                    oneCol: true,
                    children: [
                        {
                            id: 'text-3-1-1',
                            componentId: ComponentIdEnums.text,
                            order: 1,
                            position: { x: 0, y: 40 },
                            content: '您可以在這裡添加任何內容，包括文字、圖片、按鈕等等。',
                        },
                        {
                            id: 'button-3-1-2',
                            componentId: ComponentIdEnums.button,
                            order: 2,
                            position: { x: 0, y: 100 },
                            content: '了解更多',
                        }
                    ]
                },
                {
                    id: 'container-5',
                    componentId: ComponentIdEnums.container,
                    order: 0,
                    oneCol: true,
                    position: { x: 0, y: 0 },
                    children: [
                        {
                            id: 'text-3-2-1',
                            componentId: ComponentIdEnums.text,
                            order: 0,
                            position: { x: 0, y: 0 },
                            content: '內容區塊',
                        },
                        {
                            id: 'text-3-2-2',
                            componentId: ComponentIdEnums.text,
                            order: 1,
                            position: { x: 0, y: 40 },
                            content: '您可以在這裡添加任何內容，包括文字、圖片、按鈕等等。',
                        },
                        {
                            id: 'button-3-2-3',
                            componentId: ComponentIdEnums.button,
                            order: 2,
                            position: { x: 0, y: 100 },
                            content: '了解更多',
                        }
                    ]
                },
                {
                    id: 'container-6',
                    componentId: ComponentIdEnums.container,
                    order: 0,
                    oneCol: true,
                    position: { x: 0, y: 0 },
                    children: [
                        {
                            id: 'text-3-3-1',
                            componentId: ComponentIdEnums.text,
                            order: 0,
                            position: { x: 0, y: 0 },
                            content: '內容區塊',
                        },
                        {
                            id: 'text-3-3-2',
                            componentId: ComponentIdEnums.text,
                            order: 1,
                            position: { x: 0, y: 40 },
                            content: '您可以在這裡添加任何內容，包括文字、圖片、按鈕等等。',
                        },
                        {
                            id: 'button-3-3-3',
                            componentId: ComponentIdEnums.button,
                            order: 2,
                            position: { x: 0, y: 100 },
                            content: '了解更多',
                        }
                    ]
                },
            ]
        }
    ]
};

// 創建 Context
const SchemaContext = createContext<SchemaContextValue | null>(null);

// Provider 組件
interface SchemaProviderProps {
    children: ReactNode;
    initialSchema?: CanvasSchema;
}

export function SchemaProvider({ children, initialSchema }: SchemaProviderProps) {
    const [schema, setSchema] = useState<CanvasSchema>(initialSchema || defaultSchema);

    // 建立 Map 索引
    const elementMap = useMemo(() => {
        return buildElementMap(schema.elements);
    }, [schema.elements]);

    // 根據 ID 獲取元素
    const getElementById = useCallback((id: string): ElementSchema | null => {
        const node = elementMap.get(id);
        return node?.element || null;
    }, [elementMap]);

    // 更新元素
    const updateElement = useCallback((id: string, updates: Partial<ElementSchema>) => {
        const node = elementMap.get(id);
        if (!node) return;

        setSchema(prevSchema => {
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

            return { elements: newElements };
        });
    }, [elementMap]);

    // 刪除元素
    const deleteElement = useCallback((id: string) => {
        const node = elementMap.get(id);
        if (!node) return;

        setSchema(prevSchema => {
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

            return { elements: newElements };
        });
    }, [elementMap]);

    // 新增元素
    const addElement = useCallback((element: ElementSchema, parentId?: string) => {
        if (parentId) {
            const parentNode = elementMap.get(parentId);
            if (parentNode && parentNode.element.componentId === ComponentIdEnums.container) {
                setSchema(prevSchema => {
                    const newElements = JSON.parse(JSON.stringify(prevSchema.elements)) as ElementSchema[];
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
            }
        } else {
            // 加到根層級
            setSchema(prevSchema => ({
                elements: [...prevSchema.elements, element]
            }));
        }
    }, [elementMap]);

    const value: SchemaContextValue = {
        schema,
        setSchema,
        elementMap,
        getElementById,
        updateElement,
        deleteElement,
        addElement,
    };

    return (
        <SchemaContext.Provider value={value}>
            {children}
        </SchemaContext.Provider>
    );
}

// Hook
export function useSchemaContext() {
    const context = useContext(SchemaContext);
    if (!context) {
        throw new Error('useSchema must be used within a SchemaProvider');
    }
    return context;
}
