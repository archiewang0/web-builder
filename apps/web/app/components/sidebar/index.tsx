import { Component } from "./use-sidebar";
import { Dispatch, SetStateAction, useState } from "react";
import { ComponentIdEnums } from "./use-sidebar";
import { useSchemaContext } from "@/app/context/schema-context";
import { TreeNode } from "./tree-node";
import { ChevronsDownUp, ChevronsUpDown } from "lucide-react";

interface SidebarProps {
    components: Component[]
    selectedElement: string | null
    setSelectedElement: Dispatch<SetStateAction<string | null>>
    setDragStartTaget: Dispatch<SetStateAction<ComponentIdEnums | null>>
    setDragEndTaget: Dispatch<SetStateAction<ComponentIdEnums | null>>
}


export function Sidebar ({ components , selectedElement, setSelectedElement, setDragStartTaget , setDragEndTaget }: SidebarProps) {
    const { schema } = useSchemaContext();
    const [treeExpanded, setTreeExpanded] = useState(true);
    // New object reference on every click so TreeNode's useEffect always fires
    const [expandSignal, setExpandSignal] = useState<{ expand: boolean } | null>(null);

    const toggleAll = () => {
        const next = !treeExpanded;
        setTreeExpanded(next);
        setExpandSignal({ expand: next });
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, component: Component) => {
        e.dataTransfer.setData('text/plain', component.id);
        // Readable via e.dataTransfer.types during dragOver (values are blocked by browser for security)
        if (component.id !== ComponentIdEnums.container) {
            e.dataTransfer.setData('application/component-leaf', '1');
        }
        setDragStartTaget(component.id);
    };

    const handleDragEnd = (_e: React.DragEvent<HTMLDivElement>, component: Component) => {
        setDragEndTaget(component.id)
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
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-700">頁面結構</h2>
                <button
                    type="button"
                    onClick={toggleAll}
                    title={treeExpanded ? '全部收合' : '全部展開'}
                    className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    {treeExpanded
                        ? <ChevronsDownUp className="w-3.5 h-3.5" />
                        : <ChevronsUpDown className="w-3.5 h-3.5" />
                    }
                </button>
            </div>
            <div className="space-y-0.5">
                {schema.elements.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">尚無元素</p>
                ) : (
                    schema.elements.map((element) => (
                        <TreeNode
                            key={element.id}
                            element={element}
                            depth={0}
                            selectedElement={selectedElement}
                            onSelect={setSelectedElement}
                            expandSignal={expandSignal}
                        />
                    ))
                )}
            </div>
        </div>
    </aside>
}