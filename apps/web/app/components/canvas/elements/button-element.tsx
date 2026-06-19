import classNames from 'classnames';

interface ButtonElementProps {
    id: string;
    content?: string;
    elementProperty: { [key: string]: any };
}

export function ButtonElement({ id, content, elementProperty }: ButtonElementProps) {
    const { style, onClick, 'selected-style': selectedStyle, ...divProps } = elementProperty;

    return (
        <div {...divProps}>
            <button
                style={style}
                onClick={onClick}
                className={classNames(
                    ' shadow-md pointer-events-auto cursor-pointer transition-all hover:opacity-50 rounded px-4 py-2',
                    selectedStyle
                )}
            >
                {content || '按鈕'}
            </button>
        </div>
    );
}
