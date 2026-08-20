import { useSchemaStore, ElementSchema } from '@/store/use-schema-store';
import classNames from 'classnames';
import React, { JSX, type RefObject } from 'react';
import { ComponentIdEnums } from '../sidebar/use-sidebar';
import { useSelectedElementStore } from '@/store/use-selected-element-store';
import { ButtonElement, ContainerElement, ImgElement, TextElement } from './elements';
import type { LogEvent } from './event-log/use-event-logger';
import { useElementDrag } from './use-element-drag';

interface SchemaElementsProps {
    isPreviewMode?: boolean;
    logEvent: LogEvent;
    draggedIdRef: RefObject<string | null>;
}

export function SchemaElements({ isPreviewMode = false, logEvent, draggedIdRef }: SchemaElementsProps) {
    const updateElement = useSchemaStore((state) => state.updateElement);
    const selectedElement = useSelectedElementStore((state) => state.selectedElement);
    const setSelectedElement = useSelectedElementStore((state) => state.setSelectedElement);

    const {
        draggedId,
        dropTargetId,
        dropPosition,
        shadowElements,
        handleElementDragStart,
        handleElementDragEnd,
        handleElementDragOver,
        handleElementDrop,
    } = useElementDrag(logEvent, draggedIdRef);

    function SchemaElementRender(data: ElementSchema): JSX.Element {
        const isDropTarget = data.id === dropTargetId && data.id !== draggedId;
        const elementProperty = {
            ['data-component-id']: data.componentId,
            ['data-element-id']: data.id,
            ['selected-style']: classNames(
                data.id === selectedElement && 'relative z-10 ring-2 ring-blue-500',
                isDropTarget &&
                    dropPosition === 'inside' &&
                    'relative z-10 ring-2 ring-blue-400 ring-dashed',
                // before/after 是插入線：在 target 的上緣／下緣畫一條粗線，
                // 提示放手後會插在它的前面還是後面，而不是塞進它裡面。
                isDropTarget && dropPosition === 'before' && 'relative border-t-4 border-t-blue-500',
                isDropTarget && dropPosition === 'after' && 'relative border-b-4 border-b-blue-500'
            ),
            draggable: true,
            style: {
                ...(data.styles as React.CSSProperties),
                ...(draggedId === data.id ? { opacity: 0.4 } : {}),
            },
            onClick: (e: React.MouseEvent) => {
                e.stopPropagation();
                setSelectedElement(data.id);
            },
        };

        // 根據元件類型渲染
        switch (data.componentId) {
            case ComponentIdEnums.text:
                return (
                    <TextElement
                        key={data.id}
                        id={data.id}
                        elementProperty={elementProperty}
                        content={data.content}
                        isSelected={data.id === selectedElement}
                        onContentChange={(content) =>
                            updateElement(data.id, { content } as Partial<ElementSchema>)
                        }
                    />
                );

            case ComponentIdEnums.image: {
                const widthValue = data.styles?.width ? parseInt(data.styles.width, 10) : NaN;
                return (
                    <ImgElement
                        key={data.id}
                        id={data.id}
                        elementProperty={elementProperty}
                        content={data.content}
                        widthPercent={Number.isNaN(widthValue) ? 100 : widthValue}
                        onResizeWidth={(percent) =>
                            updateElement(data.id, {
                                styles: { ...data.styles, width: `${percent}%` },
                            } as Partial<ElementSchema>)
                        }
                    />
                );
            }

            case ComponentIdEnums.button:
                return (
                    <ButtonElement
                        key={data.id}
                        id={data.id}
                        elementProperty={elementProperty}
                        content={data.content}
                    />
                );

            case ComponentIdEnums.container:
                return (
                    <ContainerElement
                        key={data.id}
                        id={data.id}
                        elementProperty={elementProperty}
                        columns={data.columns}
                        SchemaElementRender={SchemaElementRender}
                        childrenElements={data.children}
                        isPreviewMode={isPreviewMode}
                    />
                );
        }
    }

    return (
        <div
            className="contents"
            onDragStart={handleElementDragStart}
            onDragEnd={handleElementDragEnd}
            onDragOver={handleElementDragOver}
            onDrop={handleElementDrop}
        >
            {shadowElements.map((element) => SchemaElementRender(element))}
        </div>
    );
}
