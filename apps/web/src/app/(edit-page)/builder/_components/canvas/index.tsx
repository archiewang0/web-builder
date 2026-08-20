import classNames from 'classnames';
import { Plus } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { DEVICES } from '@/components/header/use-header';
import { useHeaderStore } from '@/store/use-header-store';
import { useSchemaStore, BODY_ELEMENT_ID } from '@/store/use-schema-store';
import { useSelectedElementStore } from '@/store/use-selected-element-store';
import { PropertyBar } from './property-bar';
import { SchemaElements } from './schema-elements';
import { useCanvasDrop } from '../_hooks/use-canvas-drop';
import { useEventLogger } from './event-log/use-event-logger';
import { EventLoggerPanel } from './event-log/event-logger-panel';

interface CanvasProps {
    isPreviewMode?: boolean;
}

export function Canvas({ isPreviewMode = false }: CanvasProps) {
    const activeDevice = useHeaderStore((state) => state.activeDevice);
    const schema = useSchemaStore((state) => state.schema);
    const deleteElement = useSchemaStore((state) => state.deleteElement);
    const selectedElement = useSelectedElementStore((state) => state.selectedElement);
    const setSelectedElement = useSelectedElementStore((state) => state.setSelectedElement);
    const { eventLog, logEvent, clearLog, copyAsJSON, copyAsTest } = useEventLogger();
    // 跟 schema-elements.tsx 裡目前正在拖曳的元素 id 同步，讓 useCanvasDrop（drop 在
    // Body 空白處）跟 schema-elements.tsx 的 dragEnd 能判斷「這次拖曳是否已經被記錄」，
    // 不用把 draggedId 整個狀態都提升上來。
    const draggedIdRef = useRef<string | null>(null);
    const { dragHint, handleDragOver, handleDragLeave, handleDrop } = useCanvasDrop(
        logEvent,
        draggedIdRef
    );

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
            className="flex-1 w-full flex flex-col bg-gray-100 overflow-hidden"
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
                            id="canvas"
                            className={classNames(
                                'p-4 py-10 gap-10 flex flex-col relative rounded-lg min-h-[600px]',
                                !isPreviewMode && 'border-2 border-dashed border-gray-300'
                            )}
                            style={schema.body?.styles as React.CSSProperties}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
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
                                    logEvent={logEvent}
                                    draggedIdRef={draggedIdRef}
                                />
                            )}
                        </div>
                    </div>
                </div>
                {!isPreviewMode && <PropertyBar />}
            </div>

            {dragHint && (
                <div
                    className="fixed z-50 flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded shadow-lg pointer-events-none"
                    style={{ left: dragHint.x + 14, top: dragHint.y + 14 }}
                >
                    <span>🚫</span>
                    <span>只能放在 Container 內</span>
                </div>
            )}

            <EventLoggerPanel
                eventLog={eventLog}
                onClear={clearLog}
                onCopyJSON={copyAsJSON}
                onCopyTest={copyAsTest}
            />
        </main>
    );
}
