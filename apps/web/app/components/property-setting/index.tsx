import { useState, useEffect } from "react";
import { useSchemaContext, ElementSchema } from "../../context/schema-context";
import { ComponentIdEnums } from "../sidebar/use-sidebar";
import { SelectedNone } from "./selected-none";
import { EditSchemaConstructor } from "./edit-schema";
import { useDebouncedCallback } from "@/app/lib/use-debounce";
import { ContentTextarea } from "./content-textarea";
import { FontSizeOptions } from "./font-size-options";
import { ElementId } from "./element-id";
import { ComponentId } from "./component-id";
import { FontColor } from "./font-color";
import { MarginInputs } from "./margin-inputs";
import { AlignButtons } from "./align-buttons";
import { BorderInputs } from "./border-inputs";

interface PropertySettingProps {
    selectedElement: string | null
}



export function PropertySetting({ selectedElement }: PropertySettingProps) {
    const { getElementById, updateElement, deleteElement } = useSchemaContext();

    // 獲取選中的元素資料
    const element = selectedElement ? getElementById(selectedElement) : null;

    // 本地內容狀態（用於即時顯示輸入）
    const [localContent, setLocalContent] = useState<string>('');

    // 當選中元素變更時，同步本地狀態
    useEffect(() => {
        if (element && 'content' in element) {
            setLocalContent(element.content || '');
        } else {
            setLocalContent('');
        }
    }, [selectedElement, element]);

    // 處理刪除
    const handleDelete = () => {
        if (selectedElement) {
            deleteElement(selectedElement);
        }
    };

    // Debounced 更新 schema
    const updateContent = useDebouncedCallback((id: string, content: string) => {
        updateElement(id, { content } as Partial<ElementSchema>);
    }, 300);

    // 處理內容更新
    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;

        // 立即更新本地狀態（保持輸入流暢）
        setLocalContent(newValue);

        // Debounced 更新 schema
        if (selectedElement) {
            updateContent(selectedElement, newValue);
        }
    };

    return (
        <aside className="w-80 bg-white border-l border-gray-200 overflow-y-auto shadow-sm">
            
            <div className="p-4">

                <EditSchemaConstructor onDelete={handleDelete} />

                {element ? (
                    <div className="space-y-4">
                        <ElementId id={element.id} />
                        <ComponentId componentId={element.componentId} />
                        {/* 只有非 Container 元素才顯示內容編輯 */}
                        {element.componentId !== ComponentIdEnums.container && 'content' in element && (
                            <ContentTextarea 
                                context={localContent} 
                                handleContentChange={handleContentChange} />
                        )}
                        <FontSizeOptions />
                        <FontColor />
                        <MarginInputs />
                        <AlignButtons />
                        <BorderInputs />
                    </div>
                ) : (
                    <SelectedNone />
                )}
            </div>
        
        </aside>
    );
}