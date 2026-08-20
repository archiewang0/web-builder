import { ElementSchema } from '@/store/use-schema-store';
import { SchemaElementNode, type DragVisualState } from './schema-element-node';

interface SchemaElementsProps {
    isPreviewMode?: boolean;
    elements: ElementSchema[];
    dragState: DragVisualState;
}

// 純渲染元件——拖曳的協調邏輯統一交給 useCanvasDnd（builder page 層級的
// <DndContext>），這裡只負責把目前的 elements（含拖曳中的即時預覽）畫出來。
export function SchemaElements({ isPreviewMode = false, elements, dragState }: SchemaElementsProps) {
    return (
        <>
            {elements.map((element) => (
                <SchemaElementNode
                    key={element.id}
                    data={element}
                    isPreviewMode={isPreviewMode}
                    dragState={dragState}
                />
            ))}
        </>
    );
}
