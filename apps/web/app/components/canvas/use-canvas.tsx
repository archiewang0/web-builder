import { useState } from "react";


export enum ElementEnums {
    header = 'header',
    content = 'content'
}

export function useCanvas () {
    // 儲存element id
    const [ selectedElement , setSelectedElement ] = useState<string | null>(null);
    
    return {
        selectedElement,
        setSelectedElement
    }
}