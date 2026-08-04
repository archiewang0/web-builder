import { useState } from 'react';
import { useSchemaContext, ElementSchema, ContainerElementSchema } from '../../context/schema-context';
import { ComponentIdEnums } from '../sidebar/use-sidebar';
import { createElement } from './lib';

export function useCanvasDrop() {
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
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setDragHint(null);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragHint(null);

        const draggedElementId = e.dataTransfer.getData('application/element-id');
        if (draggedElementId) return;

        const componentId = e.dataTransfer.getData('text/plain') as ComponentIdEnums;
        const isLeaf =
            componentId === ComponentIdEnums.text ||
            componentId === ComponentIdEnums.image ||
            componentId === ComponentIdEnums.button;

        const canvasRect = e.currentTarget.getBoundingClientRect();
        const newElement = createElement(
            componentId,
            { x: e.clientX - canvasRect.left, y: e.clientY - canvasRect.top },
            schema.elements.length
        );

        const targetElementId = (e.target as HTMLElement).getAttribute('data-element-id');
        if (targetElementId) {
            const targetNode = elementMap.get(targetElementId);
            if (!targetNode) return;

            const { path: nodePath, parent: nodeParent, element: { componentId: nodeComponentId, id: nodeElementId } } = targetNode;

            if (nodeComponentId === ComponentIdEnums.container) {
                setSchema((prev) => {
                    const elements = JSON.parse(JSON.stringify(prev.elements)) as ElementSchema[];
                    let cur: any = elements;
                    for (let i = 0; i < nodePath.length; i++) {
                        if (i === nodePath.length - 1) {
                            (cur[nodePath[i]!] as ContainerElementSchema).children.push(newElement);
                        } else {
                            cur = cur[nodePath[i]!];
                            if ('children' in cur) cur = cur.children;
                        }
                    }
                    return { elements };
                });
                return;
            }

            if (!nodeParent && isLeaf) return;

            setSchema((prev) => {
                const elements = JSON.parse(JSON.stringify(prev.elements)) as ElementSchema[];
                if (nodeParent) {
                    const parentPath = nodePath.slice(0, -1);
                    let cur: any = elements;
                    for (let i = 0; i < parentPath.length; i++) {
                        if (i === parentPath.length - 1) {
                            (cur[parentPath[i]!] as ContainerElementSchema).children.splice(
                                nodePath[nodePath.length - 1]! + 1,
                                0,
                                newElement
                            );
                        } else {
                            cur = cur[parentPath[i]!];
                            if ('children' in cur) cur = cur.children;
                        }
                    }
                } else {
                    elements.splice(nodePath[0]! + 1, 0, newElement);
                }
                return { elements };
            });
            return;
        }

        if (isLeaf) return;

        setSchema((prev) => ({ elements: [...prev.elements, newElement] }));
    };

    return { dragHint, handleDragOver, handleDragLeave, handleDrop };
}
