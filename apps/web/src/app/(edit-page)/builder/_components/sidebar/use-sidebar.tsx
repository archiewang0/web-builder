import { Image, Layout, Square, Type } from 'lucide-react';
import { ComponentIdEnums } from '../_types/component-id-enums';

export { ComponentIdEnums };

export interface Component {
    id: ComponentIdEnums;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    category: string;
}

export function useSidebar() {
    const components: Component[] = [
        { id: ComponentIdEnums.text, name: '文字', icon: Type, category: '基礎' },
        { id: ComponentIdEnums.image, name: '圖片', icon: Image, category: '基礎' },
        { id: ComponentIdEnums.button, name: '按鈕', icon: Square, category: '基礎' },
        { id: ComponentIdEnums.container, name: '容器', icon: Layout, category: '佈局' },
    ];

    return { components };
}
