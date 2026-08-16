import { Dispatch, SetStateAction } from 'react';
import { Component, ComponentIdEnums } from './use-sidebar';

interface ComponentPaletteProps {
    components: Component[];
    setDragStartTaget: Dispatch<SetStateAction<ComponentIdEnums | null>>;
    setDragEndTaget: Dispatch<SetStateAction<ComponentIdEnums | null>>;
}

// 左側組件庫：拖曳組件到畫布上新增元素
export function ComponentPalette({
    components,
    setDragStartTaget,
    setDragEndTaget,
}: ComponentPaletteProps) {
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, component: Component) => {
        e.dataTransfer.setData('text/plain', component.id);
        // Readable via e.dataTransfer.types during dragOver (values are blocked by browser for security)
        if (component.id !== ComponentIdEnums.container) {
            e.dataTransfer.setData('application/component-leaf', '1');
        }
        setDragStartTaget(component.id);
    };

    const handleDragEnd = (_e: React.DragEvent<HTMLDivElement>, component: Component) => {
        setDragEndTaget(component.id);
    };

    return (
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
    );
}
