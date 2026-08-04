import { ComponentIdEnums } from '../sidebar/use-sidebar';
import { SelectedNone } from './selected-none';
import { EditSchemaConstructor } from './edit-schema';
import { ContentTextarea } from './content-textarea';
import { ElementId } from './element-id';
import { ComponentId } from './component-id';
import { MarginInputs } from './margin-inputs';
import { FlexAlignSetting } from './flex-align-setting';
import { BorderInputs } from './border-inputs';
import { StyleChangeHandler } from './types';
import { FontSetting } from './font-setting';
import { CollapsibleSection } from './collapsible-section';
import { ColumnOptions } from './column-options';
import { BackgroundSetting } from './background-setting';
import { ImageSizeSetting } from './image-size-setting';
import { usePropertySetting } from './use-property-setting';

export type { StyleChangeHandler };

export function PropertySetting() {
    const {
        element,
        elementType,
        containerColumns,
        localContent,
        localStyles,
        handleDelete,
        handleContentChange,
        handleStyleChange,
        handleColumnsChange,
        handleFlexAlignChange,
    } = usePropertySetting();

    return (
        <aside className="w-80 bg-white border-l border-gray-200 overflow-y-auto shadow-sm">
            <div className="p-4 ">
                <EditSchemaConstructor onDelete={handleDelete} />

                {element ? (
                    <div className="space-y-6">
                        <ElementId id={element.id} />
                        <ComponentId componentId={element.componentId} />
                        {elementType !== ComponentIdEnums.container && 'content' in element && (
                            <ContentTextarea
                                context={localContent}
                                handleContentChange={handleContentChange}
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
                            <ImageSizeSetting
                                width={localStyles.width}
                                onChange={handleStyleChange}
                            />
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
                            <>
                                <CollapsibleSection title="欄位設定">
                                    <div className="p-2 border border-gray-200 rounded-lg">
                                        <ColumnOptions
                                            value={containerColumns}
                                            onChange={handleColumnsChange}
                                        />
                                    </div>
                                </CollapsibleSection>
                                <FlexAlignSetting
                                    value={localStyles.justifyContent}
                                    onChange={handleFlexAlignChange}
                                />
                            </>
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
            </div>
        </aside>
    );
}
