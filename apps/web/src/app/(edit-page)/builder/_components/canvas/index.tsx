import classNames from 'classnames';
import { Plus } from 'lucide-react';
import { useEffect } from 'react';
import { DEVICES } from '@/components/header/use-header';
import { useHeaderStore } from '@/store/use-header-store';
import { useSchemaStore } from '@/store/use-schema-store';
import { useSelectedElementStore } from '@/store/use-selected-element-store';
import { PropertyBar } from './property-bar';
import { SchemaElements } from './schema-elements';
import { useCanvasDrop } from './use-canvas-drop';

interface CanvasProps {
    isPreviewMode?: boolean;
}

export function Canvas({ isPreviewMode = false }: CanvasProps) {
    const activeDevice = useHeaderStore((state) => state.activeDevice);
    const schema = useSchemaStore((state) => state.schema);
    const deleteElement = useSchemaStore((state) => state.deleteElement);
    const selectedElement = useSelectedElementStore((state) => state.selectedElement);
    const setSelectedElement = useSelectedElementStore((state) => state.setSelectedElement);
    const { dragHint, handleDragOver, handleDragLeave, handleDrop } = useCanvasDrop();

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
                                'p-2 gap-2 flex flex-col relative rounded-lg min-h-[600px]',
                                !isPreviewMode && 'border-2 border-dashed border-gray-300'
                            )}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
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
                                <SchemaElements isPreviewMode={isPreviewMode} />
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
        </main>
    );
}
