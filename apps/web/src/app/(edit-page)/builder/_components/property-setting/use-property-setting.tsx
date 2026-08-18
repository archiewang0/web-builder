import { useEffect, useRef, useState } from 'react';
import {
    useSchemaStore,
    ElementSchema,
    ContainerElementSchema,
    StylesSchema,
    BODY_ELEMENT_ID,
} from '@/store/use-schema-store';
import { ComponentIdEnums } from '../sidebar/use-sidebar';
import { useSelectedElementStore } from '@/store/use-selected-element-store';
import { useDebouncedCallback } from '@/lib/use-debounce';
import { StyleChangeHandler } from './types';

export function usePropertySetting() {
    const getElementById = useSchemaStore((state) => state.getElementById);
    const updateElement = useSchemaStore((state) => state.updateElement);
    const deleteElement = useSchemaStore((state) => state.deleteElement);
    const updateBodyStyles = useSchemaStore((state) => state.updateBodyStyles);
    const bodyStyles = useSchemaStore((state) => state.schema.body?.styles);
    // 訂閱 elementMap：canvas 端（拖拉圖片把手、文字 contentEditable）
    // 是直接呼叫 store 的 updateElement，不會經過這個 hook。若不訂閱，
    // 這個元件不會因為那些外部寫入而重新 render，面板就會顯示舊值。
    useSchemaStore((state) => state.elementMap);
    const selectedElement = useSelectedElementStore((state) => state.selectedElement);

    const isBodySelected = selectedElement === BODY_ELEMENT_ID;
    const element = selectedElement && !isBodySelected ? getElementById(selectedElement) : null;

    const [localContent, setLocalContent] = useState<string>('');
    const [localStyles, setLocalStyles] = useState<StylesSchema>({});

    // 記錄「這個面板自己最後寫入 store 的值」，用來分辨 element 參照變動是
    // 自己 debounce 回寫的 echo，還是外部變動（例如畫布拖拉調整圖片寬度）。
    // 只有外部變動才需要同步覆蓋本地狀態，否則會在打字中途被舊值蓋掉。
    const lastWrittenContentRef = useRef<string | undefined>(undefined);
    const lastWrittenStylesRef = useRef<StylesSchema | undefined>(undefined);

    useEffect(() => {
        lastWrittenContentRef.current = undefined;
        lastWrittenStylesRef.current = undefined;
    }, [selectedElement]);

    useEffect(() => {
        if (isBodySelected) {
            setLocalContent('');
            if (bodyStyles !== lastWrittenStylesRef.current) {
                setLocalStyles(bodyStyles || {});
            }
            return;
        }
        if (!element) {
            setLocalContent('');
            setLocalStyles({});
            return;
        }
        const content = 'content' in element ? element.content || '' : '';
        if (content !== lastWrittenContentRef.current) {
            setLocalContent(content);
        }
        if (element.styles !== lastWrittenStylesRef.current) {
            setLocalStyles(element.styles || {});
        }
    }, [selectedElement, element, isBodySelected, bodyStyles]);

    // Body 是固定的畫布根節點，不能被刪除，這裡直接擋掉。
    const handleDelete = () => {
        if (selectedElement && !isBodySelected) {
            deleteElement(selectedElement);
        }
    };

    const updateContent = useDebouncedCallback((id: string, content: string) => {
        lastWrittenContentRef.current = content;
        updateElement(id, { content } as Partial<ElementSchema>);
    }, 300);

    const handleContentValueChange = (newValue: string) => {
        setLocalContent(newValue);
        if (selectedElement) {
            updateContent(selectedElement, newValue);
        }
    };

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        handleContentValueChange(e.target.value);
    };

    const updateStyles = useDebouncedCallback((id: string, styles: StylesSchema) => {
        lastWrittenStylesRef.current = styles;
        updateElement(id, { styles } as Partial<ElementSchema>);
    }, 300);

    const updateBodyStylesDebounced = useDebouncedCallback((styles: StylesSchema) => {
        lastWrittenStylesRef.current = styles;
        updateBodyStyles(styles);
    }, 300);

    const handleStyleChange: StyleChangeHandler = (partial) => {
        const newStyles = { ...localStyles, ...partial };
        setLocalStyles(newStyles);
        if (isBodySelected) {
            updateBodyStylesDebounced(newStyles);
        } else if (selectedElement) {
            updateStyles(selectedElement, newStyles);
        }
    };

    // columns（grid）與 justifyContent（flex）互斥：切換其中一個時，另一個自動清成 undefined
    const handleColumnsChange = (columns: number) => {
        if (!selectedElement) return;
        const newStyles = { ...localStyles, justifyContent: undefined };
        setLocalStyles(newStyles);
        lastWrittenStylesRef.current = newStyles;
        updateElement(selectedElement, {
            columns,
            styles: newStyles,
        } as Partial<ContainerElementSchema>);
    };

    const handleFlexAlignChange = (justifyContent: string) => {
        if (!selectedElement) return;
        const newStyles = { ...localStyles, justifyContent };
        setLocalStyles(newStyles);
        lastWrittenStylesRef.current = newStyles;
        updateElement(selectedElement, {
            columns: undefined,
            styles: newStyles,
        } as Partial<ContainerElementSchema>);
    };

    const elementType = isBodySelected
        ? ComponentIdEnums.body
        : element
          ? ComponentIdEnums[element.componentId]
          : null;
    const containerColumns =
        element && 'columns' in element ? (element as ContainerElementSchema).columns : undefined;

    return {
        element,
        elementType,
        isBodySelected,
        containerColumns,
        localContent,
        localStyles,
        handleDelete,
        handleContentChange,
        handleContentValueChange,
        handleStyleChange,
        handleColumnsChange,
        handleFlexAlignChange,
    };
}
