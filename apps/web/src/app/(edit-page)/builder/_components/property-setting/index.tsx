import classNames from 'classnames';
import { useResizablePanel } from '@/lib/use-resizable-panel';
import { ComponentIdEnums } from '../sidebar/use-sidebar';
import { PresetIdEnums } from '../_types/preset-id-enums';
import { SelectedNone } from './selected-none';
import { EditSchemaConstructor } from './edit-schema';
import { ContentTextarea } from './content-textarea';
import { ElementId } from './element-id';
import { ComponentId } from './component-id';
import { MarginInputs } from './margin-inputs';
import { BorderInputs } from './border-inputs';
import { StyleChangeHandler } from './types';
import { FontSetting } from './font-setting';
import { LayoutSetting } from './layout-setting';
import { BackgroundSetting } from './background-setting';
import { ImageSetting } from './image-setting';
import { ButtonLinkSetting } from './button-link-setting';
import { NavbarPositionSetting } from './navbar-position-setting';
import { usePropertySetting } from './use-property-setting';

export type { StyleChangeHandler };

export function PropertySetting() {
    const {
        element,
        elementType,
        isBodySelected,
        containerColumns,
        localContent,
        localStyles,
        localHref,
        handleDelete,
        handleContentChange,
        handleContentValueChange,
        handleStyleChange,
        handleHrefChange,
        handleColumnsChange,
        handleFlexAlignChange,
    } = usePropertySetting();
    // edge: 'right' 跟 Sidebar 鏡像——面板貼在螢幕右側，把手在左邊（緊貼畫布那一側）。
    // maxWidth 320 對應原本寫死的 w-80。
    const { panelRef, width, handleResizeStart, isCollapsed } = useResizablePanel({
        edge: 'right',
        minWidth: 10,
        maxWidth: 320,
    });

    return (
        <aside ref={panelRef} style={{ width }} className="relative shrink-0 overflow-hidden">
            {/* 內層固定 w-80（320px），對齊面板最左側，也就是把手、緊貼畫布那一側；
                外層寬度縮小時只裁切內層，不會擠壓裡面的表單欄位 */}
            <div className="absolute left-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-sm overflow-y-auto">
                <div className="p-4">
                    {/* Body 是固定的畫布根節點，只提供背景設定，沒有刪除/內容/字型等其他屬性可調。 */}
                    {isBodySelected ? (
                        <div className="space-y-6">
                            <h2 className="text-sm font-semibold text-gray-700">頁面背景設定</h2>
                            <BackgroundSetting
                                backgroundColor={localStyles.backgroundColor}
                                backgroundImage={localStyles.backgroundImage}
                                backgroundSize={localStyles.backgroundSize}
                                onChange={handleStyleChange}
                            />
                        </div>
                    ) : (
                        <>
                            <EditSchemaConstructor onDelete={handleDelete} />

                            {element ? (
                                <div className="space-y-6">
                                    <ElementId id={element.id} />
                                    <ComponentId componentId={element.componentId} />
                                    {elementType !== ComponentIdEnums.container &&
                                        elementType !== ComponentIdEnums.image &&
                                        'content' in element && (
                                            <ContentTextarea
                                                context={localContent}
                                                handleContentChange={handleContentChange}
                                            />
                                        )}

                                    {elementType === ComponentIdEnums.button && (
                                        <ButtonLinkSetting
                                            elementId={element.id}
                                            href={localHref}
                                            onChange={handleHrefChange}
                                        />
                                    )}

                                    {(elementType === ComponentIdEnums.text ||
                                        elementType === ComponentIdEnums.button) && (
                                        <>
                                            <FontSetting
                                                fontSize={localStyles.fontSize}
                                                color={localStyles.color}
                                                fontFamily={localStyles.fontFamily}
                                                fontWeight={localStyles.fontWeight}
                                                onSizeChange={handleStyleChange}
                                                onColorChange={handleStyleChange}
                                                onFontFamilyChange={handleStyleChange}
                                                onFontWeightChange={handleStyleChange}
                                                onReset={() =>
                                                    handleStyleChange({
                                                        fontSize: undefined,
                                                        color: undefined,
                                                        fontFamily: undefined,
                                                        fontWeight: undefined,
                                                    })
                                                }
                                            />
                                        </>
                                    )}

                                    {elementType === ComponentIdEnums.image && (
                                        <>
                                            <ImageSetting
                                                content={localContent}
                                                onChange={handleContentValueChange}
                                                width={localStyles.width}
                                                height={localStyles.height}
                                                onStyleChange={handleStyleChange}
                                            />
                                        </>
                                    )}

                                    {(elementType === ComponentIdEnums.container ||
                                        elementType === ComponentIdEnums.text ||
                                        elementType === ComponentIdEnums.button) && (
                                        <BackgroundSetting
                                            backgroundColor={localStyles.backgroundColor}
                                            backgroundImage={localStyles.backgroundImage}
                                            backgroundSize={localStyles.backgroundSize}
                                            onChange={handleStyleChange}
                                        />
                                    )}

                                    <MarginInputs
                                        marginTop={localStyles.marginTop}
                                        marginBottom={localStyles.marginBottom}
                                        marginLeft={localStyles.marginLeft}
                                        marginRight={localStyles.marginRight}
                                        onChange={handleStyleChange}
                                    />
                                    {elementType === ComponentIdEnums.container && (
                                        <LayoutSetting
                                            columns={containerColumns}
                                            onColumnsChange={handleColumnsChange}
                                            justifyContent={localStyles.justifyContent}
                                            onJustifyContentChange={handleFlexAlignChange}
                                        />
                                    )}
                                    {elementType === ComponentIdEnums.container &&
                                        'variant' in element &&
                                        element.variant === PresetIdEnums.navbar && (
                                            <NavbarPositionSetting
                                                position={localStyles.position}
                                                onChange={handleStyleChange}
                                            />
                                        )}
                                    <BorderInputs
                                        borderWidth={localStyles.borderWidth}
                                        borderRadius={localStyles.borderRadius}
                                        borderColor={localStyles.borderColor}
                                        onChange={handleStyleChange}
                                    />
                                </div>
                            ) : (
                                <SelectedNone />
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* 左邊緣拖拉把手：跟 Sidebar 鏡像，貼在畫布那一側；拖到最窄收合隱藏，拖到最寬回到 w-80 */}
            <div
                onMouseDown={handleResizeStart}
                className={classNames(
                    'absolute inset-y-0 left-0 z-20 w-1.5 cursor-grab hover:bg-blue-400/40 active:cursor-grabbing',
                    isCollapsed && 'bg-blue-400/40'
                )}
            />
        </aside>
    );
}
