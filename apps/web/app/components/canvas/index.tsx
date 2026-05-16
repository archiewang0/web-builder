import { Plus } from 'lucide-react';
import { DeviceIdEnums } from '../header/use-header';
import { DeviceType } from '../header/use-header';
import { Dispatch, JSX, SetStateAction, useState } from 'react';
import { ComponentIdEnums } from '../sidebar/use-sidebar';
import { PropertyBar } from './property-bar';
import { ButtonElement, ContainerElement, ImgElement, TextElement } from './elements';
import {
    useSchemaContext,
    ElementSchema,
    ContainerElementSchema,
} from '../../context/schema-context';
import { SchemaElements } from './schema-elements';

interface CanvasProps {
    devices: DeviceType[];
    activeDevice: DeviceIdEnums;

    selectedElement: string | null; // 改為存儲元素 ID
    setSelectedElement: Dispatch<SetStateAction<string | null>>;

    // dragStartTaget: ComponentIdEnums | null;
    // dragEndTaget: ComponentIdEnums | null;
}

export function Canvas({
    devices,
    activeDevice,
    selectedElement,
    setSelectedElement,
    // dragStartTaget,
    // dragEndTaget,
}: CanvasProps) {
    // 使用 Schema Context
    const { schema, setSchema, elementMap } = useSchemaContext();

    const [dragHint, setDragHint] = useState<{ x: number; y: number } | null>(null);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();

        const isLeafDrag = e.dataTransfer.types.includes('application/component-leaf');
        if (isLeafDrag) {
            const insideContainer = (e.target as HTMLElement).closest(
                `[data-component-id="${ComponentIdEnums.container}"]`
            );
            if (!insideContainer) {
                e.dataTransfer.dropEffect = 'none';
                setDragHint({ x: e.clientX, y: e.clientY });
                return;
            }
        }

        e.dataTransfer.dropEffect = 'copy';
        setDragHint(null);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        // Only clear when leaving the canvas entirely
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setDragHint(null);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragHint(null);

        // 守衛：element 重新排序的 drop 由 elementProperty.onDrop + stopPropagation 處理
        // 若 element 被拖到空白 canvas 區域才會到這裡，直接跳過
        const draggedElementId = e.dataTransfer.getData('application/element-id');
        if (draggedElementId) {
            console.log('⏭️ [canvas handleDrop] element drag 落在空白區域，略過', draggedElementId);
            return;
        }

        // 獲取拖曳的組件 ID（來自 sidebar）
        const componentId = e.dataTransfer.getData('text/plain') as ComponentIdEnums;
        const isLeaf =
            componentId === ComponentIdEnums.text ||
            componentId === ComponentIdEnums.image ||
            componentId === ComponentIdEnums.button;

        // 獲取 Canvas 容器的位置資訊
        const canvasRect = e.currentTarget.getBoundingClientRect();

        const dropX = e.clientX - canvasRect.left;
        const dropY = e.clientY - canvasRect.top;

        console.log('====== 拖放事件詳細資訊 ======');
        console.log('拖曳的組件 ID:', componentId);
        console.log('查看 canvasRect: ', canvasRect);
        console.log('e.currentTarget: ', e.currentTarget);
        console.log('e.target: ', e.target);

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
                children: [],
            };
        } else {
            // 其他元素（text, image, button）
            newElement = {
                id: newElementId,
                componentId: componentId as
                    | ComponentIdEnums.text
                    | ComponentIdEnums.image
                    | ComponentIdEnums.button,
                order: schema.elements.length,
                position: { x: dropX, y: dropY },
                content:
                    componentId === ComponentIdEnums.text
                        ? '新增文字'
                        : componentId === ComponentIdEnums.button
                          ? '按鈕'
                          : componentId === ComponentIdEnums.image
                            ? 'https://via.placeholder.com/150'
                            : '',
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

                    setSchema((prevSchema) => {
                        // 深拷貝 schema
                        const newElements = JSON.parse(
                            JSON.stringify(prevSchema.elements)
                        ) as ElementSchema[];

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

                    // 目標在根層級（無父容器），leaf 元素不允許放在這裡
                    if (!nodeParent && isLeaf) {
                        e.dataTransfer.dropEffect = 'none';

                        console.warn('⛔ text / image / button 只能放在 Container 內');
                        return;
                    }

                    console.log('➕ 插入到元素旁邊:', nodeElementId);

                    setSchema((prevSchema) => {
                        const newElements = JSON.parse(
                            JSON.stringify(prevSchema.elements)
                        ) as ElementSchema[];

                        if (nodeParent) {
                            // 有父元素：插入到父元素的 children 中
                            let current: any = newElements;
                            const parentPath = nodePath.slice(0, -1); // 父元素的 path

                            for (let i = 0; i < parentPath.length; i++) {
                                if (i === parentPath.length - 1) {
                                    // 找到父 Container
                                    const parentContainer = current[
                                        parentPath[i]!
                                    ] as ContainerElementSchema;
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

        // 落在空白 canvas（根層級）— leaf 元素不允許
        if (isLeaf) {
            console.warn('⛔ text / image / button 只能放在 Container 內');
            return;
        }

        setSchema((prevSchema) => ({
            ...prevSchema,
            elements: [...prevSchema.elements, newElement],
        }));
    };

    return (
        <main
            className="flex-1 flex flex-col bg-gray-100 overflow-hidden"
            onClick={(e) => {
                e.stopPropagation(); // 防止事件冒泡
                setSelectedElement(null);
            }}
        >
            <div className="flex w-full h-full flex-col">
                {/* 可滾動的 canvas 區域 */}
                <div className="flex-1 overflow-y-auto p-6 flex items-start justify-center">
                    <div
                        className="bg-white shadow-xl rounded-lg transition-all duration-300 overflow-hidden"
                        style={{
                            width: devices.find((d) => d.id === activeDevice)?.width,
                            maxWidth: '100%',
                        }}
                    >
                        {/* 畫布內容區域 */}
                        <div
                            id="canvas"
                            className="p-2 gap-2 flex flex-col relative border-2 border-dashed border-gray-300 rounded-lg min-h-[600px]"
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            {/* 空狀態提示 */}
                            {schema.elements.length === 0 && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="text-center">
                                        <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500 text-lg font-medium">
                                            拖拽組件到這裡開始設計
                                        </p>
                                        <p className="text-gray-400 text-sm mt-2">
                                            或點擊左側組件庫中的元素
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* 渲染 Schema 中的所有元素，wrapper 統一做 element drag 事件委派 */}

                            {schema.elements.length > 0 && (
                                <SchemaElements
                                    selectedElement={selectedElement}
                                    setSelectedElement={setSelectedElement}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* 底部狀態欄 */}
                {/* propertybar 要在最底部 */}
                <PropertyBar selectedElement={selectedElement} activeDevice={activeDevice} />
            </div>
        {dragHint && (
                <div
                    className="fixed z-50 flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded shadow-lg pointer-events-none"
                    style={{ left: dragHint.x + 14, top: dragHint.y + 14 }}
                >
                    <span>🚫</span>
                    <span>只能放在 Container 內</span>
                </div>
            )}
        </main>
    );
}
