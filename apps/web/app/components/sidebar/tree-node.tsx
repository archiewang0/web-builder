import { ElementSchema } from "@/app/context/schema-context";
import { useState } from "react";
import { ComponentIdEnums } from "./use-sidebar";
import { ChevronDown, ChevronRight, Image, Layers, MousePointer2, Square, Type } from "lucide-react";


// 樹節點組件
interface TreeNodeProps {
    element: ElementSchema;
    depth: number;
    selectedElement: string | null;
    onSelect: (id: string) => void;
}

// 根據元素類型獲取對應圖標
function getElementIcon(componentId: ComponentIdEnums) {
    switch (componentId) {
        case ComponentIdEnums.text:
            return Type;
        case ComponentIdEnums.image:
            return Image;
        case ComponentIdEnums.button:
            return MousePointer2;
        case ComponentIdEnums.container:
            return Layers;
        default:
            return Square;
    }
}

// 根據元素類型獲取顯示名稱
function getElementName(element: ElementSchema): string {
    switch (element.componentId) {
        case ComponentIdEnums.text:
            return '文字';
        case ComponentIdEnums.image:
            return '圖片';
        case ComponentIdEnums.button:
            return '按鈕';
        case ComponentIdEnums.container:
            return '容器';
        default:
            return '元素';
    }
}

export function TreeNode({ element, depth, selectedElement, onSelect }: TreeNodeProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const Icon = getElementIcon(element.componentId);
    const hasChildren = element.componentId === ComponentIdEnums.container &&
                        'children' in element &&
                        element.children.length > 0;
    const isSelected = selectedElement === element.id;

    return (
        <div>
            <div
                className={`flex items-center space-x-1 p-1.5 rounded cursor-pointer transition-colors ${
                    isSelected
                        ? 'bg-blue-50 text-blue-700'
                        : 'hover:bg-gray-50 text-gray-700'
                }`}
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
                onClick={(e) => {
                    e.stopPropagation();
                    onSelect(element.id);
                }}
            >
                {/* 展開/收合按鈕 */}
                {hasChildren ? (
                    <button
                        className="p-0.5 hover:bg-gray-200 rounded"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsExpanded(!isExpanded);
                        }}
                    >
                        {isExpanded
                            ? <ChevronDown className="w-3 h-3" />
                            : <ChevronRight className="w-3 h-3" />
                        }
                    </button>
                ) : (
                    <span className="w-4" /> // 佔位
                )}

                <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                <span className="text-xs truncate">{getElementName(element)}</span>
            </div>

            {/* 遞歸渲染子元素 */}
            {hasChildren && isExpanded && 'children' in element && (
                <div>
                    {element.children.map((child) => (
                        <TreeNode
                            key={child.id}
                            element={child}
                            depth={depth + 1}
                            selectedElement={selectedElement}
                            onSelect={onSelect}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}