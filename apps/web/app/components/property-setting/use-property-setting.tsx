import { useEffect, useState } from 'react';
import {
    useSchemaContext,
    ElementSchema,
    ContainerElementSchema,
} from '../../context/schema-context';
import { ComponentIdEnums } from '../sidebar/use-sidebar';
import { useSelectedElementStore } from '../../store/use-selected-element-store';
import { useDebouncedCallback } from '@/app/lib/use-debounce';
import { StyleChangeHandler } from './types';

export function usePropertySetting() {
    const { getElementById, updateElement, deleteElement } = useSchemaContext();
    const selectedElement = useSelectedElementStore((state) => state.selectedElement);

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

    return {
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
    };
}
