'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Component } from './use-sidebar';

interface ComponentPaletteProps {
    components: Component[];
}

// 左側組件庫：拖曳組件到畫布上新增元素
export function ComponentPalette({ components }: ComponentPaletteProps) {
    return (
        <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">組件庫</h2>

            <div className="space-y-1">
                {components.map((component) => (
                    <PaletteItem key={component.id} component={component} />
                ))}
            </div>
        </div>
    );
}

function PaletteItem({ component }: { component: Component }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `palette:${component.id}`,
        data: { type: 'new-component' as const, componentId: component.id },
    });

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            style={{
                transform: transform ? CSS.Translate.toString(transform) : undefined,
                opacity: isDragging ? 0.4 : 1,
            }}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-grab active:cursor-grabbing border border-gray-100 transition-all hover:shadow-sm"
        >
            <component.icon className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-700">{component.name}</span>
        </div>
    );
}
