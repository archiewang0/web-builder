import classNames from 'classnames';
import { Plus } from 'lucide-react';
import { useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { DEVICES } from '@/components/header/use-header';
import { useHeaderStore } from '@/store/use-header-store';
import { useSchemaStore, BODY_ELEMENT_ID } from '@/store/use-schema-store';
import { useSelectedElementStore } from '@/store/use-selected-element-store';
import { PropertyBar } from './property-bar';
import { SchemaElements } from './schema-elements';
import type { DragVisualState } from './schema-element-node';

interface CanvasProps {
    isPreviewMode?: boolean;
    dragState: DragVisualState;
}

export function Canvas({ isPreviewMode = false, dragState }: CanvasProps) {
    const activeDevice = useHeaderStore((state) => state.activeDevice);
    const schema = useSchemaStore((state) => state.schema);
    const deleteElement = useSchemaStore((state) => state.deleteElement);
    const selectedElement = useSelectedElementStore((state) => state.selectedElement);
    const setSelectedElement = useSelectedElementStore((state) => state.setSelectedElement);

    // #canvas 本身是「根層級」的 drop 目標——既有元素拖到這裡（沒有落在任何元素上）、
    // 或 sidebar 新元件拖到空白處，都會落到這個 droppable，交給 useCanvasDnd 判斷。
    const { setNodeRef: setBodyDropRef } = useDroppable({ id: BODY_ELEMENT_ID });

    useEffect(() => {
        if (!selectedElement) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Delete' && e.key !== 'Backspace') return;

            const target = e.target as HTMLElement;
            const isEditingText =
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable;
            if (isEditingText) return;

            deleteElement(selectedElement);
            setSelectedElement(null);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedElement, deleteElement, setSelectedElement]);

    return (
        <main
            className={classNames(
                ' h-[calc(100vh-50px)]',
                'flex-1 w-full flex flex-col bg-gray-100  '
            )}
            onClick={(e) => {
                e.stopPropagation();
                setSelectedElement(null);
            }}
        >
            <div className="flex w-full h-full flex-col">
                <div
                    className={classNames(
                        'flex-1 overflow-y-auto flex items-start justify-center',
                        !isPreviewMode && 'p-6'
                    )}
                >
                    <div
                        className="bg-white shadow-xl rounded-lg transition-all duration-300 overflow-hidden"
                        style={{
                            width: DEVICES.find((d) => d.id === activeDevice)?.width,
                            maxWidth: '100%',
                        }}
                    >
                        <div
                            ref={setBodyDropRef}
                            id="canvas"
                            className={classNames(
                                'z-0',
                                'p-4 py-10 gap-10 flex flex-col relative rounded-lg min-h-[600px]',
                                !isPreviewMode && 'border-2 border-dashed border-gray-300'
                            )}
                            style={schema.body?.styles as React.CSSProperties}
                            // 點在畫布空白處（沒有點到任何 schema 元素，那些元素自己的 onClick
                            // 會先 stopPropagation）代表點到的是 Body 本身，選取 Body 而不是
                            // 讓事件繼續冒泡到 <main> 把選取清空。
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedElement(BODY_ELEMENT_ID);
                            }}
                        >
                            {schema.elements.length === 0 && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="text-center">
                                        <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500 text-lg font-medium">
                                            拖拽組件到這裡開始設計
                                        </p>
                                        <p className="text-gray-400 text-sm mt-2">
                                            或點擊左側組件庫中的元素
                                        </p>
                                    </div>
                                </div>
                            )}
                            {schema.elements.length > 0 && (
                                <SchemaElements
                                    isPreviewMode={isPreviewMode}
                                    elements={schema.elements}
                                    dragState={dragState}
                                />
                            )}
                        </div>
                    </div>
                </div>
                {!isPreviewMode && <PropertyBar />}
            </div>
        </main>
    );
}
