import { Layers, Layout, Type } from "lucide-react";
import { Component } from "./useSidebar";
import { Dispatch, SetStateAction } from "react";
import { ComponentIdEnums } from "./useSidebar";

interface SidebarProps {
    components: Component[]

    setDragStartTaget: Dispatch<SetStateAction<ComponentIdEnums | null>>
    setDragEndTaget: Dispatch<SetStateAction<ComponentIdEnums | null>>
}

export function Sidebar ({ components , setDragStartTaget , setDragEndTaget }: SidebarProps) {

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, component: Component) => {
        e.dataTransfer.setData('text/plain', component.id);
        console.log('開始拖拽組件:', {
            id: component.id,
            name: component.name,
            category: component.category
        });

        setDragStartTaget(component.id)
    };

    const handleDragEnd = (_e: React.DragEvent<HTMLDivElement>, component: Component) => {
        console.log('結束拖拽組件:', component.name);
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
        
        <div className="p-4 border-t border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">頁面結構</h2>
        <div className="space-y-2">
            <div className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer">
            <Layers className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">Header</span>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 ml-4 cursor-pointer">
            <Type className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">標題文字</span>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer">
            <Layout className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">Main Content</span>
            </div>
        </div>
        </div>
    </aside>
}