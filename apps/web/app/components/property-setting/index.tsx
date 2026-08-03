import { useState, useEffect } from 'react';
import {
    useSchemaContext,
    ElementSchema,
    ContainerElementSchema,
} from '../../context/schema-context';
import { ComponentIdEnums } from '../sidebar/use-sidebar';
import { SelectedNone } from './selected-none';
import { EditSchemaConstructor } from './edit-schema';
import { useDebouncedCallback } from '@/app/lib/use-debounce';
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

export type { StyleChangeHandler };

interface PropertySettingProps {
    selectedElement: string | null;
}

export function PropertySetting({ selectedElement }: PropertySettingProps) {
    const { getElementById, updateElement, deleteElement } = useSchemaContext();

    const element = selectedElement ? getElementById(selectedElement) : null;

    const [localContent, setLocalContent] = useState<string>('');
    const [localStyles, setLocalStyles] = useState<NonNullable<ElementSchema['styles']>>({});

    useEffect(() => {
        if (element && 'content' in element) {
            setLocalContent(element.content || '');
        } else {
            setLocalContent('');
        }
        setLocalStyles(element?.styles || {});
    }, [selectedElement, element]);

    const handleDelete = () => {
        if (selectedElement) {
            deleteElement(selectedElement);
        }
    };

    const updateContent = useDebouncedCallback((id: string, content: string) => {
        updateElement(id, { content } as Partial<ElementSchema>);
    }, 300);

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setLocalContent(newValue);
        if (selectedElement) {
            updateContent(selectedElement, newValue);
        }
    };

    const updateStyles = useDebouncedCallback(
        (id: string, styles: NonNullable<ElementSchema['styles']>) => {
            updateElement(id, { styles } as Partial<ElementSchema>);
        },
        300
    );

    const handleStyleChange: StyleChangeHandler = (partial) => {
        const newStyles = { ...localStyles, ...partial };
        setLocalStyles(newStyles);
        if (selectedElement) {
            updateStyles(selectedElement, newStyles);
        }
    };

    // columns（grid）與 justifyContent（flex）互斥：切換其中一個時，另一個自動清成 undefined
    const handleColumnsChange = (columns: number) => {
        if (!selectedElement) return;
        const newStyles = { ...localStyles, justifyContent: undefined };
        setLocalStyles(newStyles);
        updateElement(selectedElement, {
            columns,
            styles: newStyles,
        } as Partial<ContainerElementSchema>);
    };

    const handleFlexAlignChange = (justifyContent: string) => {
        if (!selectedElement) return;
        const newStyles = { ...localStyles, justifyContent };
        setLocalStyles(newStyles);
        updateElement(selectedElement, {
            columns: undefined,
            styles: newStyles,
        } as Partial<ContainerElementSchema>);
    };

    const elementType = element ? ComponentIdEnums[element.componentId] : null;
    const containerColumns =
        element && 'columns' in element ? (element as ContainerElementSchema).columns : undefined;

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
                                    onSizeChange={handleStyleChange}
                                    onColorChange={handleStyleChange}
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
