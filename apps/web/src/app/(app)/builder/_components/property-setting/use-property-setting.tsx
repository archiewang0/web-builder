import { useEffect, useRef, useState } from 'react';
import { useSchemaStore } from '@/store/use-schema-store';
import {
    ElementTypeEnums,
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

// 「隱藏」用 styles.display = 'none' 表示（這個欄位目前沒有其他功能在用，
// 版面的 flex/grid 是靠 Tailwind class 決定，不是 inline style）。取消隱藏
// 不能只是把 display 寫回 undefined——buildResponsiveCss 會把值是
// undefined 的屬性直接濾掉、不產生任何 CSS 覆寫規則，沒辦法蓋掉「更外層裝置
// 已經設過 display:none」的情況（例如桌面隱藏、手機才顯示）。所以顯示時要寫
// 一個跟這個元素目前版面一致的具體值，才蓋得過去、editor 跟正式站台才會一致。
function getNaturalDisplay(element: ElementSchema | null): string {
    if (!element) return 'block';
    if (element.elementType === ElementTypeEnums.container) {
        if (element.columns === undefined) return 'flex';
        if (element.columns > 1) return 'grid';
        return 'block';
    }
    // button／dropdownMenu 的觸發鈕、image 都是內容撐開大小的元素，用
    // inline-block 而不是 block，避免顯示回來後突然被撐成滿版寬度。
    if (
        element.elementType === ElementTypeEnums.button ||
        element.elementType === ElementTypeEnums.dropdownMenu ||
        element.elementType === ElementTypeEnums.image
    ) {
        return 'inline-block';
    }
    return 'block';
}

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

    // columns（grid）與 justifyContent（flex）互斥：切換其中一個時，另一個自動清成 undefined。
    // 如果目前這層的 display 是「顯示用」的具體值（不是 hidden 開關寫的 'none'），
    // 版面模式改變後這個值要一起同步，不然會變成孤兒設定跟新版面衝突
    // （見上面 getNaturalDisplay 的說明）。
    const syncedDisplay = (nextElement: ElementSchema) =>
        localStyles.display && localStyles.display !== 'none'
            ? getNaturalDisplay(nextElement)
            : localStyles.display;

    const handleColumnsChange = (columns: number) => {
        if (!selectedElement || !element) return;
        const display = syncedDisplay({ ...element, columns } as ElementSchema);
        setLocalStyles({ ...localStyles, justifyContent: undefined, display });
        const newStyles = writeStyles(element?.styles, activeDevice, {
            justifyContent: undefined,
            display,
        });
        lastWrittenStylesRef.current = newStyles;
        lastWrittenDeviceRef.current = activeDevice;
        updateElement(selectedElement, {
            columns,
            styles: newStyles,
        } as Partial<ContainerElementSchema>);
    };

    const handleFlexAlignChange = (justifyContent: string) => {
        if (!selectedElement || !element) return;
        const display = syncedDisplay({ ...element, columns: undefined } as ElementSchema);
        setLocalStyles({ ...localStyles, justifyContent, display });
        const newStyles = writeStyles(element?.styles, activeDevice, { justifyContent, display });
        lastWrittenStylesRef.current = newStyles;
        lastWrittenDeviceRef.current = activeDevice;
        updateElement(selectedElement, {
            columns: undefined,
            styles: newStyles,
        } as Partial<ContainerElementSchema>);
    };

    // 顯示/隱藏開關：隱藏永遠寫 'none'；顯示要寫一個跟目前版面一致的具體值
    // （不能寫 undefined，理由見上面 getNaturalDisplay 的註解）。
    const handleVisibilityChange = (hidden: boolean) => {
        handleStyleChange({ display: hidden ? 'none' : getNaturalDisplay(element) });
    };

    const elementType = isBodySelected ? ElementTypeEnums.body : element ? element.elementType : null;
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
        activeDevice,
        handleDelete,
        handleContentChange,
        handleContentValueChange,
        handleStyleChange,
        handleHrefChange,
        handleColumnsChange,
        handleFlexAlignChange,
        handleVisibilityChange,
    };
}
