import { Image, Layout, PanelTop, Square, Type } from 'lucide-react';
import { ElementTypeEnums, PresetIdEnums } from '@/lib/schema';

// 樣板（PresetIdEnums）跟一般組件（ElementTypeEnums）在 sidebar 上長得一樣、
// 共用同一份 Component 清單跟同一顆 PaletteItem，只有拖曳時要組出什麼東西不同
// （見 component-palette.tsx／use-canvas-dnd.tsx），所以 id 型別在這裡先聯集起來。
export interface Component {
    id: ElementTypeEnums | PresetIdEnums;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    category: string;
}

export function isPresetId(id: Component['id']): id is PresetIdEnums {
    return Object.values(PresetIdEnums).includes(id as PresetIdEnums);
}

export function useSidebar() {
    const components: Component[] = [
        { id: ElementTypeEnums.text, name: '文字', icon: Type, category: '基礎' },
        { id: ElementTypeEnums.image, name: '圖片', icon: Image, category: '基礎' },
        { id: ElementTypeEnums.button, name: '按鈕', icon: Square, category: '基礎' },
        { id: ElementTypeEnums.container, name: '容器', icon: Layout, category: '佈局' },
        { id: PresetIdEnums.navbar, name: '導覽列', icon: PanelTop, category: '版面樣板' },
    ];

    return { components };
}
