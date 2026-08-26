import { useEffect, useRef, useState } from 'react';
import { useSchemaStore } from '@/store/use-schema-store';
import {
    ComponentIdEnums,
    ElementSchema,
    ContainerElementSchema,
    StylesSchema,
    StyleProps,
    BODY_ELEMENT_ID,
} from '@/lib/schema';
import { useSelectedElementStore } from '@/store/use-selected-element-store';
import { useHeaderStore } from '@/store/use-header-store';
import { useDebouncedCallback } from '@/app/(app)/builder/_hooks/use-debounce';
import { resolveStyles, writeStyles } from '@/lib/responsive-styles';
import { StyleChangeHandler } from '../../_types/property-setting-types';

export function usePropertySetting() {
    const activeDevice = useHeaderStore((state) => state.activeDevice);
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
    // 面板顯示／編輯的一律是「目前 activeDevice 解析後的攤平樣式」，不是
    // 巢狀的 StylesSchema——巢狀結構只存在 store 裡。
    const [localStyles, setLocalStyles] = useState<StyleProps>({});
    const [localHref, setLocalHref] = useState<string>('');

    // 記錄「這個面板自己最後寫入 store 的值／裝置」，用來分辨 element 參照
    // 變動是自己 debounce 回寫的 echo，還是外部變動（例如畫布拖拉調整圖片寬度、
    // 或使用者切換了 activeDevice）。只有外部變動才需要同步覆蓋本地狀態，
    // 否則會在打字中途被舊值蓋掉。裝置切換不算「自己寫入的 echo」，一定要
    // 重新 resolve，不然切到 tablet/mobile 還是顯示上一個裝置的值。
    const lastWrittenContentRef = useRef<string | undefined>(undefined);
    const lastWrittenStylesRef = useRef<StylesSchema | undefined>(undefined);
    const lastWrittenDeviceRef = useRef<typeof activeDevice | undefined>(undefined);
    const lastWrittenHrefRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        lastWrittenContentRef.current = undefined;
        lastWrittenStylesRef.current = undefined;
        lastWrittenDeviceRef.current = undefined;
        lastWrittenHrefRef.current = undefined;
    }, [selectedElement]);

    useEffect(() => {
        const isEcho = (styles: StylesSchema | undefined) =>
            styles === lastWrittenStylesRef.current && activeDevice === lastWrittenDeviceRef.current;

        if (isBodySelected) {
            setLocalContent('');
            setLocalHref('');
            if (!isEcho(bodyStyles)) {
                setLocalStyles(resolveStyles(bodyStyles, activeDevice));
            }
            return;
        }
        if (!element) {
            setLocalContent('');
            setLocalStyles({});
            setLocalHref('');
            return;
        }
        const content = 'content' in element ? element.content || '' : '';
        if (content !== lastWrittenContentRef.current) {
            setLocalContent(content);
        }
        if (!isEcho(element.styles)) {
            setLocalStyles(resolveStyles(element.styles, activeDevice));
        }
        const href = 'href' in element ? element.href || '' : '';
        if (href !== lastWrittenHrefRef.current) {
            setLocalHref(href);
        }
    }, [selectedElement, element, isBodySelected, bodyStyles, activeDevice]);

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

    const updateHref = useDebouncedCallback((id: string, href: string) => {
        lastWrittenHrefRef.current = href;
        updateElement(id, { href: href || undefined } as Partial<ElementSchema>);
    }, 300);

    const handleHrefChange = (newValue: string) => {
        setLocalHref(newValue);
        if (selectedElement) {
            updateHref(selectedElement, newValue);
        }
    };

    const updateStyles = useDebouncedCallback((id: string, styles: StylesSchema) => {
        lastWrittenStylesRef.current = styles;
        lastWrittenDeviceRef.current = activeDevice;
        updateElement(id, { styles } as Partial<ElementSchema>);
    }, 300);

    const updateBodyStylesDebounced = useDebouncedCallback((styles: StylesSchema) => {
        lastWrittenStylesRef.current = styles;
        lastWrittenDeviceRef.current = activeDevice;
        updateBodyStyles(styles);
    }, 300);

    const handleStyleChange: StyleChangeHandler = (partial) => {
        setLocalStyles({ ...localStyles, ...partial });
        if (isBodySelected) {
            updateBodyStylesDebounced(writeStyles(bodyStyles, activeDevice, partial));
        } else if (selectedElement) {
            updateStyles(selectedElement, writeStyles(element?.styles, activeDevice, partial));
        }
    };

    // columns（grid）與 justifyContent（flex）互斥：切換其中一個時，另一個自動清成 undefined
    const handleColumnsChange = (columns: number) => {
        if (!selectedElement) return;
        setLocalStyles({ ...localStyles, justifyContent: undefined });
        const newStyles = writeStyles(element?.styles, activeDevice, { justifyContent: undefined });
        lastWrittenStylesRef.current = newStyles;
        lastWrittenDeviceRef.current = activeDevice;
        updateElement(selectedElement, {
            columns,
            styles: newStyles,
        } as Partial<ContainerElementSchema>);
    };

    const handleFlexAlignChange = (justifyContent: string) => {
        if (!selectedElement) return;
        setLocalStyles({ ...localStyles, justifyContent });
        const newStyles = writeStyles(element?.styles, activeDevice, { justifyContent });
        lastWrittenStylesRef.current = newStyles;
        lastWrittenDeviceRef.current = activeDevice;
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
        localHref,
        handleDelete,
        handleContentChange,
        handleContentValueChange,
        handleStyleChange,
        handleHrefChange,
        handleColumnsChange,
        handleFlexAlignChange,
    };
}
