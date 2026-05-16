import { useSchemaContext } from '@/app/context/schema-context';
import { ElementSchema } from '@/app/context/schema-context';
import React, { Dispatch, JSX, SetStateAction, useMemo, useState } from 'react';
import { ComponentIdEnums } from '../sidebar/use-sidebar';
import { ButtonElement, ContainerElement, ImgElement, TextElement } from './elements';
import { computeReorder } from './lib';
import { useEventLogger } from './use-event-logger';
import { EventLoggerPanel } from './event-logger-panel';
import { useThrottle } from '@/app/lib/use-throttle';

interface SchemaElementsProps {
    // schema:
    setSelectedElement: Dispatch<SetStateAction<string | null>>;
    selectedElement: string | null; // 改為存儲元素 ID
}

export function SchemaElements({
    // schema
    setSelectedElement,
    selectedElement,
}: SchemaElementsProps) {
    const { schema, setSchema, elementMap } = useSchemaContext();
    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [dropTargetId, setDropTargetId] = useState<string | null>(null);
    const { eventLog, logEvent, clearLog, copyAsJSON, copyAsTest } = useEventLogger();

    // dragOver 時即時推導預覽畫面，只有 dropTargetId 換人才重算
    const shadowElements = useMemo(() => {
        if (!draggedId || !dropTargetId || draggedId === dropTargetId) {
            return schema.elements;
        }
        return computeReorder(schema.elements, elementMap, draggedId, dropTargetId);
    }, [schema.elements, elementMap, draggedId, dropTargetId]);

    function SchemaElementRender(data: ElementSchema): JSX.Element {
        const elementProperty = {
            ['data-component-id']: data.componentId,
            ['data-element-id']: data.id,
            ['selected-style']: data.id === selectedElement ? 'ring-2 ring-blue-500' : '',
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
                    />
                );

            case ComponentIdEnums.image:
                return (
                    <ImgElement
                        key={data.id}
                        id={data.id}
                        elementProperty={elementProperty}
                        content={data.content || 'https://via.placeholder.com/150'}
                    />
                );

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
                        oneCol={data.oneCol}
                        SchemaElementRender={SchemaElementRender}
                        childrenElements={data.children}
                    />
                );
        }
    }

    // --- Element drag 事件委派 handlers ---
    const handleElementDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        const el = (e.target as HTMLElement).closest('[data-element-id]');
        const id = el?.getAttribute('data-element-id');
        if (!id) return;
        e.dataTransfer.setData('application/element-id', id);
        e.dataTransfer.effectAllowed = 'move';
        setDraggedId(id);
        setSelectedElement(id);
        console.log('🟢 [element drag] dragStart:', id);
    };

    const handleElementDragEnd = (_e: React.DragEvent<HTMLDivElement>) => {
        // drop 沒有發生（拖到無效區域）時還原預覽
        setDraggedId(null);
        setDropTargetId(null);
        console.log('🔴 [element drag] dragEnd');
    };

    const throttledUpdateTarget = useThrottle((e: React.DragEvent<HTMLDivElement>) => {
        const el = (e.target as HTMLElement).closest('[data-element-id]');
        const id = el?.getAttribute('data-element-id');
        // draggedId 本身不能是 drop target
        if (id && id !== dropTargetId && id !== draggedId) {
            setDropTargetId(id);
            console.log('🟡 [element drag] dragOver target:', id);
        }
    }, 50);

    const handleElementDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        if (!e.dataTransfer.types.includes('application/element-id')) return;
        // preventDefault / stopPropagation 每次都要執行，瀏覽器才允許 drop
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';
        throttledUpdateTarget(e);
    };

    const handleElementDrop = (e: React.DragEvent<HTMLDivElement>) => {
        const id = e.dataTransfer.getData('application/element-id');
        if (!id) return;
        e.preventDefault();
        e.stopPropagation();

        // 記錄此次互動，再 commit
        if (draggedId && dropTargetId) {
            logEvent(draggedId, dropTargetId, schema.elements, shadowElements);
        }
        setSchema({ elements: shadowElements });
        setDraggedId(null);
        setDropTargetId(null);
        console.log('🔵 [element drag] drop committed');
    };

    return (
        <>
            <div
                className="contents"
                onDragStart={handleElementDragStart}
                onDragEnd={handleElementDragEnd}
                onDragOver={handleElementDragOver}
                onDrop={handleElementDrop}
            >
                {shadowElements.map((element) => SchemaElementRender(element))}
            </div>
            <EventLoggerPanel
                eventLog={eventLog}
                onCopyJSON={copyAsJSON}
                onCopyTest={copyAsTest}
                onClear={clearLog}
            />
        </>
    );
}
