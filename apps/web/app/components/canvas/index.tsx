import { Plus } from "lucide-react";
import { DeviceIdEnums } from "../header/useHeader";
import { DeviceType } from "../header/useHeader";
import { ElementEnums } from "./useCanvas";
import { Dispatch, JSX, SetStateAction, useState, createContext, useContext, useMemo } from "react";
import { ComponentIdEnums } from "../sidebar/useSidebar";
import { PropertyBar } from "./property-bar";
import { buildElementMap } from "./lib";


interface CanvasProps {
    devices: DeviceType[]
    activeDevice: DeviceIdEnums

    selectedElement: ElementEnums | null
    setSelectedElement: Dispatch<SetStateAction<ElementEnums | null>>
    
    dragStartTaget: ComponentIdEnums | null
    dragEndTaget: ComponentIdEnums | null

}

// 基礎元素屬性（所有元素共用）
interface BaseElementSchema {
    id: string;                      // 唯一識別碼（例如：'elem-1', 'elem-2'）
    componentId: ComponentIdEnums;   // 元件類型（text, image, button, container）
    order: number;                   // 排序順序（0, 1, 2, ...）
    position: {                      // 位置資訊
        x: number;
        y: number;
    };
    styles?: {                       // 樣式設定（可選）
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
    props?: Record<string, any>;     // 元件特定屬性（可選）
}

// 非 Container 元素（文字、圖片、按鈕）
interface LeafElementSchema extends BaseElementSchema {
    componentId: ComponentIdEnums.text | ComponentIdEnums.image | ComponentIdEnums.button;
    content?: string;                // 元素內容（文字或圖片 URL）
}

// Container 元素（可包含子元素）
export interface ContainerElementSchema extends BaseElementSchema {
    componentId: ComponentIdEnums.container;
    oneCol: boolean
    children: ElementSchema[];       // 遞歸：子元素可以是任何類型（包括 Container）
}

// 聯合類型：元素可以是 Leaf 或 Container
export type ElementSchema = LeafElementSchema | ContainerElementSchema;

// 主 Schema 類型（Canvas 的完整結構）
interface CanvasSchema {
    elements: ElementSchema[];       // 根層級元素列表
}





// 創建 Context 用於傳遞元素資料
// const ElementContext = createContext<ElementSchema | null>(null);

export function Canvas ({ devices , activeDevice , selectedElement , setSelectedElement , dragStartTaget , dragEndTaget }: CanvasProps) {

    console.log('😍canvas dragStartTaget: ' ,dragStartTaget)
    console.log('😍canvas dragEndTaget: ' ,dragEndTaget)

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        // 允許放置
        e.dataTransfer.dropEffect = 'copy';
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();

        // 獲取拖曳的組件 ID
        const componentId = e.dataTransfer.getData('text/plain') as ComponentIdEnums;

        // 獲取 Canvas 容器的位置資訊
        const canvasRect = e.currentTarget.getBoundingClientRect();

        const dropX = e.clientX - canvasRect.left;
        const dropY = e.clientY - canvasRect.top;

        console.log('====== 拖放事件詳細資訊 ======');
        console.log('拖曳的組件 ID:', componentId);
        console.log('查看 canvasRect: ' , canvasRect)
        console.log('e.currentTarget: ' , e.currentTarget)
        console.log('e.target: ' , e.target)

        // 生成唯一 ID
        const newElementId = `${componentId}-${Date.now()}`;

        // 根據不同的 componentId 創建對應的元素
        let newElement: ElementSchema;

        if (componentId === ComponentIdEnums.container) {
            // Container 元素（需要 children 屬性）
            newElement = {
                id: newElementId,
                componentId: ComponentIdEnums.container,
                order: schema.elements.length,
                oneCol: true,
                position: { x: dropX, y: dropY },
                children: []
            };
        } else {
            // 其他元素（text, image, button）
            newElement = {
                id: newElementId,
                componentId: componentId as ComponentIdEnums.text | ComponentIdEnums.image | ComponentIdEnums.button,
                order: schema.elements.length,
                position: { x: dropX, y: dropY },
                content: componentId === ComponentIdEnums.text ? '新增文字' :
                         componentId === ComponentIdEnums.button ? '按鈕' :
                         componentId === ComponentIdEnums.image ? 'https://via.placeholder.com/150' : ''
            };
        }


        // 使用 Map 索引快速查找放置目標
        const targetElement = e.target as HTMLElement;
        const targetElementId = targetElement.getAttribute('data-element-id');


        if (targetElementId) {
            // 從 Map 中 O(1) 快速查找
            const targetNode = elementMap.get(targetElementId);

            if (targetNode) {
                console.log('🎯 使用 Map 索引找到目標元素:');
                console.log('  - 元素 ID:', targetNode.element.id);
                console.log('  - 元素類型:', targetNode.element.componentId);
                console.log('  - 父元素 ID:', targetNode.parent?.id || 'null (根層級)');
                console.log('  - 路徑:', targetNode.path);
                console.log('  - 深度:', targetNode.depth);

                // 在 setSchema 外部先保存需要的屬性，避免 TypeScript 類型推斷問題
                const nodePath = targetNode.path;
                const nodeParent = targetNode.parent;
                const nodeComponentId = targetNode.element.componentId;
                const nodeElementId = targetNode.element.id;

                // 判斷目標元素類型，決定如何插入
                if (nodeComponentId === ComponentIdEnums.container) {
                    // 情況 1: 放在 Container 上 → 加入到該 Container 的 children
                    console.log('➕ 將元素加入到 Container:', nodeElementId);

                    setSchema(prevSchema => {
                        // 深拷貝 schema
                        const newElements = JSON.parse(JSON.stringify(prevSchema.elements)) as ElementSchema[];

                        // 使用 path 定位到目標 Container（支援深層嵌套）
                        let current: any = newElements;
                        for (let i = 0; i < nodePath.length; i++) {
                            if (i === nodePath.length - 1) {
                                // 最後一層：找到目標 Container，加入到 children
                                const container = current[nodePath[i]!] as ContainerElementSchema;
                                container.children = [...container.children, newElement];
                            } else {
                                // 中間層：往下一層 children 找
                                current = current[nodePath[i]!];
                                if ('children' in current) {
                                    current = current.children;
                                }
                            }
                        }

                        return { elements: newElements };
                    });

                    console.log('✅ 已加入到 Container 的 children');
                    return;

                } else {
                    // 情況 2: 放在其他元素上（text, button, image）→ 插入到同層級的後面
                    console.log('➕ 插入到元素旁邊:', nodeElementId);

                    setSchema(prevSchema => {
                        const newElements = JSON.parse(JSON.stringify(prevSchema.elements)) as ElementSchema[];

                        if (nodeParent) {
                            // 有父元素：插入到父元素的 children 中
                            let current: any = newElements;
                            const parentPath = nodePath.slice(0, -1); // 父元素的 path

                            for (let i = 0; i < parentPath.length; i++) {
                                if (i === parentPath.length - 1) {
                                    // 找到父 Container
                                    const parentContainer = current[parentPath[i]!] as ContainerElementSchema;
                                    const insertIndex = nodePath[nodePath.length - 1]! + 1;
                                    parentContainer.children.splice(insertIndex, 0, newElement);
                                } else {
                                    current = current[parentPath[i]!];
                                    if ('children' in current) {
                                        current = current.children;
                                    }
                                }
                            }
                        } else {
                            // 沒有父元素：插入到根層級
                            const insertIndex = nodePath[0]! + 1;
                            newElements.splice(insertIndex, 0, newElement);
                        }

                        return { elements: newElements };
                    });

                    console.log('✅ 已插入到同層級');
                    return;
                }

            } else {
                console.log('⚠️ 在 Map 中找不到目標元素:', targetElementId);
            }
        } 


        // 更新 schema，新增元素
        setSchema(prevSchema => ({
            ...prevSchema,
            elements: [...prevSchema.elements, newElement]
        }));
    };

    const [ schema , setSchema ] = useState<CanvasSchema>({
        elements: [

            // 第一個容器：包含標題文字和描述文字
            {
                id: 'container-1',
                componentId: ComponentIdEnums.container,
                order: 0,
                oneCol: true,
                position: { x: 24, y: 24 },
                children: [
                    // 標題文字
                    {
                        id: 'text-1-1',
                        componentId: ComponentIdEnums.text,
                        order: 0,
                        position: { x: 0, y: 0 },
                        content: '歡迎使用 Website Builder',
                    },
                    // 描述文字
                    {
                        id: 'text-1-2',
                        componentId: ComponentIdEnums.text,
                        order: 1,
                        position: { x: 0, y: 50 },
                        content: '這是一個功能強大的網站編輯器，讓您輕鬆創建美麗的網站',
                    }
                ]
            },

            // 第二個容器：包含標題文字、內容文字和按鈕
            {
                id: 'container-2',
                componentId: ComponentIdEnums.container,
                order: 1,
                oneCol: true,
                position: { x: 24, y: 160 },
                children: [
                    // 標題
                    {
                        id: 'text-2-1',
                        componentId: ComponentIdEnums.text,
                        order: 0,
                        position: { x: 0, y: 0 },
                        content: '內容區塊',
                    },
                    // 內容描述
                    {
                        id: 'text-2-2',
                        componentId: ComponentIdEnums.text,
                        order: 1,
                        position: { x: 0, y: 40 },
                        content: '您可以在這裡添加任何內容，包括文字、圖片、按鈕等等。',
                    },
                    // 按鈕
                    {
                        id: 'button-2-1',
                        componentId: ComponentIdEnums.button,
                        order: 2,
                        position: { x: 0, y: 100 },
                        content: '了解更多',
                    }
                ]
            },

            // 第三個容器：包含標題文字、內容文字和按鈕
            {
                id: 'container-3',
                componentId: ComponentIdEnums.container,
                order: 3,
                oneCol: false,
                position: { x: 24, y: 160 },
                children: [
                    // 標題
                    {
                        id: 'container-4',
                        componentId: ComponentIdEnums.container,
                        order: 0,
                        position: { x: 0, y: 0 },
                        oneCol: true,
                        // content: '內容區塊',
                        children: [
                            // 內容描述
                            {
                                id: 'text-2-2',
                                componentId: ComponentIdEnums.text,
                                order: 1,
                                position: { x: 0, y: 40 },
                                content: '您可以在這裡添加任何內容，包括文字、圖片、按鈕等等。',
                            },
                            // 按鈕
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
                        id: 'container-5',
                        componentId: ComponentIdEnums.container,
                        order: 0,
                        oneCol: true,
                        position: { x: 0, y: 0 },
                        // content: '內容區塊',
                        children: [
                            {
                                id: 'text-2-1',
                                componentId: ComponentIdEnums.text,
                                order: 0,
                                position: { x: 0, y: 0 },
                                content: '內容區塊',
                            },
                            // 內容描述
                            {
                                id: 'text-2-2',
                                componentId: ComponentIdEnums.text,
                                order: 1,
                                position: { x: 0, y: 40 },
                                content: '您可以在這裡添加任何內容，包括文字、圖片、按鈕等等。',
                            },
                            // 按鈕
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
                        id: 'container-6',
                        componentId: ComponentIdEnums.container,
                        order: 0,
                        oneCol: true,
                        position: { x: 0, y: 0 },
                        // content: '內容區塊',
                        children: [
                            {
                                id: 'text-2-1',
                                componentId: ComponentIdEnums.text,
                                order: 0,
                                position: { x: 0, y: 0 },
                                content: '內容區塊',
                            },
                            // 內容描述
                            {
                                id: 'text-2-2',
                                componentId: ComponentIdEnums.text,
                                order: 1,
                                position: { x: 0, y: 40 },
                                content: '您可以在這裡添加任何內容，包括文字、圖片、按鈕等等。',
                            },
                            // 按鈕
                            {
                                id: 'button-2-1',
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
    })

    // 使用 useMemo 建立 Map 索引（當 schema 變化時自動重建
    // 把 dom 的資料的存取起來, 變成map 方便取用,

    const elementMap = useMemo(() => {
        const map = buildElementMap(schema.elements);
        return map;
    }, [schema.elements]);

    function SchemaElementRender(data: ElementSchema): JSX.Element {
        // 將樣式物件轉換為 React style 物件
        const styleObj = data.styles || {};

        // 共用的定位和基礎樣式
        const baseStyle: React.CSSProperties = {
            ...styleObj
        };

        // 根據元件類型渲染
        switch (data.componentId) {
            case ComponentIdEnums.text:
                return (
                    <div
                        key={data.id}
                        data-component-id={data.componentId}
                        data-element-id={data.id}
                        // style={baseStyle}
                        className="pointer-events-auto"
                    >
                        {data.content || '預設文字'}
                    </div>
                );

            case ComponentIdEnums.image:
                return (
                    <img
                        key={data.id}
                        data-component-id={data.componentId}
                        data-element-id={data.id}
                        src={data.content || 'https://via.placeholder.com/150'}
                        alt="元件圖片"
                        // style={baseStyle}
                        className="pointer-events-auto"
                    />
                );

            case ComponentIdEnums.button:
                return (
                    <button
                        key={data.id}
                        data-component-id={data.componentId}
                        data-element-id={data.id}
                        // style={baseStyle}
                        className="pointer-events-auto cursor-pointer transition-all hover:opacity-50"
                    >
                        {data.content || '按鈕'}
                    </button>
                );

            case ComponentIdEnums.container:

                return data.oneCol ?  (
                    <div
                        key={data.id}
                        data-component-id={data.componentId}
                        data-element-id={data.id}
                        // style={baseStyle}
                        className=" relative w-full pointer-events-auto rounded-lg p-1 border-2 border-gray-200 border-dashed hover:shadow-md cursor-pointer transition-all"
                        // className="pointer-events-auto"
                    >
                        <span className=" absolute top-0 left-0 bg-gray-200">{data.id}</span>

                        {/* 遞歸渲染子元素 */}
                        {data.children?.map((child) => SchemaElementRender(child))}
                    </div>
                ) : (
                    <div
                        key={data.id}
                        data-component-id={data.componentId}
                        data-element-id={data.id}
                        // style={baseStyle}
                        className=" relative gap-2 flex w-full pointer-events-auto rounded-lg p-1 border-2 border-gray-200 border-dashed hover:shadow-md cursor-pointer transition-all"
                    >
                        <span className=" absolute top-0 left-0  bg-gray-200">{data.id}</span>
                        {/* 遞歸渲染子元素 */}
                        {data.children?.map((child) => SchemaElementRender(child))}
                    </div>
                )
        }
    }

    return  <main className="flex-1 flex flex-col bg-gray-100">
        <div className="p-6 flex-1 flex items-center justify-center">
            <div
                className="bg-white shadow-xl rounded-lg transition-all duration-300 min-h-[600px] overflow-hidden"
                style={{
                    width: devices.find(d => d.id === activeDevice)?.width,
                    maxWidth: '100%'
                }}>

                {/* 畫布內容區域 */}
                <div
                    id="canvas"
                    className=" p-2 gap-2 flex flex-col  relative h-full border-2 border-dashed border-gray-300 rounded-lg min-h-[600px]"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    >

                    {/* 空狀態提示 */}
                    {
                        schema.elements.length === 0 &&
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                                <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg font-medium">拖拽組件到這裡開始設計</p>
                                <p className="text-gray-400 text-sm mt-2">或點擊左側組件庫中的元素</p>
                            </div>
                        </div>
                    }

                    {/* 渲染 Schema 中的所有元素 */}
                    {
                        schema.elements.map((element) => SchemaElementRender(element))
                    }

                    
                    {/* 示例元素 */}
                    {/* <div className="absolute top-6 left-6 right-6 pointer-events-auto">
                        <div 
                        className={`bg-gradient-to-r from-blue-50 to-indigo-50 border-2 rounded-lg p-6 cursor-pointer transition-all hover:shadow-md ${
                            selectedElement ===  ElementEnums.header 
                            ? 'border-blue-400 shadow-lg ring-2 ring-blue-200' 
                            : 'border-blue-200 hover:border-blue-300'
                        }`}
                        onClick={() => setSelectedElement(  ElementEnums.header  )}
                        >
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">歡迎使用 Website Builder</h1>
                        <p className="text-gray-600">這是一個功能強大的網站編輯器，讓您輕鬆創建美麗的網站</p>
                        </div>
                    </div> */}
                    
                    {/* 第二個示例元素 */}
                    {/* <div className="absolute top-40 left-6 right-6 pointer-events-auto">
                        <div 
                        className={`bg-white border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                            selectedElement === ElementEnums.content 
                            ? 'border-green-400 shadow-lg ring-2 ring-green-200' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedElement( ElementEnums.content )}
                        >
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">內容區塊</h2>
                        <p className="text-gray-600 mb-4">您可以在這裡添加任何內容，包括文字、圖片、按鈕等等。</p>
                        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                            了解更多
                        </button>
                        </div>
                    </div> */}

                </div>
            </div>
        </div>
        
        {/* 底部狀態欄 */}
        <PropertyBar 
            selectedElement={selectedElement} 
            activeDevice={activeDevice}/>
    </main>
}