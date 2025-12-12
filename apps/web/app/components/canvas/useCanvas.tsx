import { useState } from "react";


export enum ElementEnums {
    header = 'header',
    content = 'content'
}

export function useCanvas () {
    const [ selectedElement , setSelectedElement ] = useState<ElementEnums | null>(null);
    
    return {
        selectedElement,
        setSelectedElement
    }
}