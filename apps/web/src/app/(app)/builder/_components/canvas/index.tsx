import classNames from 'classnames';
import { Plus } from 'lucide-react';
import { useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { DEVICES } from '@/components/header/devices';
import { useHeaderStore } from '@/store/use-header-store';
import { useSchemaStore } from '@/store/use-schema-store';
import { BODY_ELEMENT_ID } from '@/lib/schema';
import { resolveStyles } from '@/lib/responsive-styles';
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
                !isPreviewMode && ' h-[calc(100vh-50px)]',
                'flex-1 w-full flex flex-col bg-gray-100  '
            )}
            onClick={(e) => {
                e.stopPropagation();
                setSelectedElement(null);
            }}
        >
            <div className="flex w-full h-full flex-col">
                {/* 這層只負責 padding（視覺留白）跟水平置中，本身不能捲動、不能是
                    fixed 的 containing block——如果讓這層（滿版寬）負責捲動/transform，
                    裝置外框在非桌面寬度時是用 justify-content: center 置中在裡面的，
                    跟這層自己的左邊界不是同一個位置，fixed 元素的 left:0 會對齊到
                    這層的左邊界，比置中後的裝置外框更靠左，兩者就對不齊。 */}

                <div
                    id="device-wrapper"
                    className={classNames('flex-1 overflow-y-auto', !isPreviewMode && 'p-6')}
                >
                    <div
                        id="device-frame"
                        className=" bg-white shadow-xl rounded-lg transition-all duration-300 m-auto overflow-hidden"
                        style={{
                            width: DEVICES.find((d) => d.id === activeDevice)?.width,
                            maxWidth: '100%',
                        }}
                    >
                        <div
                            ref={setBodyDropRef}
                            id="canvas"
                            className={classNames(
                                // 不能加 padding——Body 自己是 fixed navbar 的祖先，只要
                                // Body 跟裝置外框（containing block）之間有任何 padding，
                                // position: fixed 的子孫就會直接無視它、緊貼裝置外框對齊，
                                // 但一般排版內容還是會被這個 padding 往內推，兩邊就對不齊
                                // （見這次修的 bug）。preview 模式跟正式站台
                                // （site/[id]/render-schema.tsx）本來就沒有這個 padding，
                                // 這裡拿掉才能讓編輯模式的排版基準跟正式站台一致。
                                !isPreviewMode &&
                                    'gap-10 flex flex-col relative rounded-lg min-h-[600px] border-2 border-dashed border-gray-300 p-5 z-0 '
                            )}
                            style={
                                resolveStyles(
                                    schema.body?.styles,
                                    activeDevice
                                ) as React.CSSProperties
                            }
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
