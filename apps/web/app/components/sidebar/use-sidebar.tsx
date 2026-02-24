import { Image, Layout, Square, Type } from "lucide-react";
import { useEffect, useState } from "react";

export interface Component {
  id: ComponentIdEnums;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
}

export enum ComponentIdEnums {
    text = 'text',
    image = 'image',
    button = 'button',
    container = 'container'
}

export function useSidebar () {
    const components: Component[] = [
        { id: ComponentIdEnums.text , name: '文字', icon: Type, category: '基礎' },
        { id: ComponentIdEnums.image , name: '圖片', icon: Image, category: '基礎' },
        { id: ComponentIdEnums.button , name: '按鈕', icon: Square, category: '基礎' },
        { id: ComponentIdEnums.container, name: '容器', icon: Layout, category: '佈局' },
    ];
    const [ dragStartTaget , setDragStartTaget] = useState<ComponentIdEnums| null>(null)
    const [ dragEndTaget , setDragEndTaget] = useState<ComponentIdEnums| null>(null)
    
    useEffect(()=>{
        if ( !dragStartTaget || !dragEndTaget) return;
        
        // 代表元件抓放都完成了
        if ( dragStartTaget === dragEndTaget){
            setDragStartTaget(null)
            setDragEndTaget(null)
        }
    },[ dragStartTaget , dragEndTaget])

    return {
        components,

        dragStartTaget,
        setDragStartTaget,
        dragEndTaget,
        setDragEndTaget
    }
}