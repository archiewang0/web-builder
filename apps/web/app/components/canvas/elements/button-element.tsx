import classNames from "classnames";

interface ButtonElementProps {
    id: string;
    content?: string
    elementProperty: {[key : string]: any}
}

export function ButtonElement({
    id, 
    content ,
    elementProperty
}: ButtonElementProps) {
    console.log('check button id : ', id)

    return <button
        {...elementProperty}
        className={classNames(
            "pointer-events-auto cursor-pointer transition-all hover:opacity-50 rounded px-4 py-2",
            elementProperty['selected-style']
        )}
    >
        {content || '按鈕'}
    </button>
}