


import classNames from "classnames";


interface ImgElementProps {
    id: string;
    content?: string
    elementProperty: {[key : string]: any}
}


export function ImgElement({
    id, content , elementProperty
}: ImgElementProps) {
    return <img
        key={id}
        {...elementProperty}
        src={content || 'https://via.placeholder.com/150'}
        alt="元件圖片"
        className={classNames(
            "pointer-events-auto cursor-pointer rounded transition-all",
            elementProperty['selected-style']
        )}
    />
}