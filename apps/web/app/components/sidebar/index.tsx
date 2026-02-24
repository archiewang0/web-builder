import { Component } from "./use-sidebar";
import { Dispatch, SetStateAction } from "react";
import { ComponentIdEnums } from "./use-sidebar";
import { useSchemaContext } from "@/app/context/schema-context";
import { TreeNode } from "./tree-node";

interface SidebarProps {
    components: Component[]
    selectedElement: string | null
    setSelectedElement: Dispatch<SetStateAction<string | null>>
    setDragStartTaget: Dispatch<SetStateAction<ComponentIdEnums | null>>
    setDragEndTaget: Dispatch<SetStateAction<ComponentIdEnums | null>>
}


export function Sidebar ({ components , selectedElement, setSelectedElement, setDragStartTaget , setDragEndTaget }: SidebarProps) {
    const { schema } = useSchemaContext();

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, component: Component) => {
        e.dataTransfer.setData('text/plain', component.id);
        setDragStartTaget(component.id)
    };

    const handleDragEnd = (_e: React.DragEvent<HTMLDivElement>, component: Component) => {
        setDragEndTaget(component.id)
    };

    // 渲染 Schema 樹
    const renderSchemaTree = () => {
        if (schema.elements.length === 0) {
            return (
                <p className="text-xs text-gray-400 text-center py-4">
                    尚無元素
                </p>
            );
        }

        return schema.elements.map((element) => (
            <TreeNode
                key={element.id}
                element={element}
                depth={0}
                selectedElement={selectedElement}
                onSelect={setSelectedElement}
            />
        ));
    };


    return  <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto shadow-sm">
        <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">組件庫</h2>

            <div className="space-y-1">
                {components.map((component) => (
                    <div
                        key={component.id}
                        draggable
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-grab active:cursor-grabbing border border-gray-100 transition-all hover:shadow-sm"
                        onDragStart={(e) => handleDragStart(e, component)}
                        onDragEnd={(e) => handleDragEnd(e, component)}
                    >
                        <component.icon className="w-5 h-5 text-gray-500" />
                        <span className="text-sm text-gray-700">{component.name}</span>
                    </div>
                ))}
            </div>
        </div>
        
        {/* 頁面結構樹 */}
        <div className="p-4 border-t border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">頁面結構</h2>
            <div className="space-y-0.5">
                { renderSchemaTree() }
            </div>
        </div>
    </aside>
}