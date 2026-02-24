import classNames from "classnames";
import { ReactElement , JSX } from "react";
import { ElementSchema } from "..";


interface ContainerElementProps {
    id: string;
    elementProperty: {[key : string]: any}
    oneCol: boolean
    childrenElements?: ElementSchema[]
    SchemaElementRender: (data: ElementSchema) => JSX.Element
}


export function ContainerElement({
    id, elementProperty , oneCol , childrenElements , SchemaElementRender
}: ContainerElementProps) {

    // if ( oneCol ) 
    return   (
        <div
            key={id}
            {...elementProperty}
            className={classNames(
                {
                    "relative w-full pointer-events-auto rounded-lg p-5 border-2 border-dashed hover:shadow-md cursor-pointer transition-all": oneCol
                },
                {
                    "relative gap-2 flex w-full pointer-events-auto rounded-lg p-1 border-2 border-dashed hover:shadow-md cursor-pointer transition-all": !oneCol
                },
                elementProperty['selected-style'] || "border-gray-200"
            )}
        >
            {/* 顯示id */}
            <span className=" absolute top-0 left-0 bg-gray-200">{id}</span>

            {/* 遞歸渲染子元素 */}
            {childrenElements?.map((child ) => SchemaElementRender(child))}
        </div>
    ) 

    // return (
    //     <div
    //         key={id}
    //         {...elementProperty}
    //         className={classNames(
    //             "relative gap-2 flex w-full pointer-events-auto rounded-lg p-1 border-2 border-dashed hover:shadow-md cursor-pointer transition-all",
    //             elementProperty['selected-style'] || "border-gray-200"
    //         )}
    //     >
    //         {/* 顯示id */}
    //         <span className=" absolute top-0 left-0  bg-gray-200">{id}</span>
            
    //         {/* 遞歸渲染子元素 */}
    //         {children?.map((child) => SchemaElementRender(child))}
    //     </div>
    // )
}