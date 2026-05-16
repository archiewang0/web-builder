import classNames from 'classnames';

interface ButtonElementProps {
    id: string;
    content?: string;
    elementProperty: { [key: string]: any };
}

export function ButtonElement({ id, content, elementProperty }: ButtonElementProps) {
    return (
        <div {...elementProperty}>
            <button
                className={classNames(
                    'pointer-events-auto cursor-pointer transition-all hover:opacity-50 rounded px-4 py-2',
                    elementProperty['selected-style']
                )}
            >
                {content || '按鈕'}
            </button>
        </div>
    );
}
