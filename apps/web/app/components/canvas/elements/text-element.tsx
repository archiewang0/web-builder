import classNames from "classnames";


interface TextElementProps {
    id: string;
    content?: string
    elementProperty: {[key : string]: any}
}


export function TextElement({
    id, content , elementProperty
}: TextElementProps) {
    return <div
        key={id}
        {...elementProperty}
        className={classNames(
            "pointer-events-auto cursor-pointer p-2 rounded transition-all",
            elementProperty['selected-style']
        )}
    >
        {content || '預設文字'}
    </div>
}