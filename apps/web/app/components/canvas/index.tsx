import { Plus } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';
import { DeviceIdEnums, DeviceType } from '../header/use-header';
import { useSchemaContext } from '../../context/schema-context';
import { PropertyBar } from './property-bar';
import { SchemaElements } from './schema-elements';
import { useCanvasDrop } from './use-canvas-drop';

interface CanvasProps {
    devices: DeviceType[];
    activeDevice: DeviceIdEnums;
    selectedElement: string | null;
    setSelectedElement: Dispatch<SetStateAction<string | null>>;
}

export function Canvas({ devices, activeDevice, selectedElement, setSelectedElement }: CanvasProps) {
    const { schema } = useSchemaContext();
    const { dragHint, handleDragOver, handleDragLeave, handleDrop } = useCanvasDrop();

    return (
        <main
            className="flex-1 flex flex-col bg-gray-100 overflow-hidden"
            onClick={(e) => {
                e.stopPropagation();
                setSelectedElement(null);
            }}
        >
            <div className="flex w-full h-full flex-col">
                <div className="flex-1 overflow-y-auto p-6 flex items-start justify-center">
                    <div
                        className="bg-white shadow-xl rounded-lg transition-all duration-300 overflow-hidden"
                        style={{
                            width: devices.find((d) => d.id === activeDevice)?.width,
                            maxWidth: '100%',
                        }}
                    >
                        <div
                            id="canvas"
                            className="p-2 gap-2 flex flex-col relative border-2 border-dashed border-gray-300 rounded-lg min-h-[600px]"
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
                                <SchemaElements
                                    selectedElement={selectedElement}
                                    setSelectedElement={setSelectedElement}
                                />
                            )}
                        </div>
                    </div>
                </div>
                <PropertyBar selectedElement={selectedElement} activeDevice={activeDevice} />
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
