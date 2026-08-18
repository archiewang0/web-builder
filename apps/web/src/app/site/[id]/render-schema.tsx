import classNames from 'classnames';
import { ComponentIdEnums } from '@/app/(edit-page)/builder/_components/_types/component-id-enums';
import type { ElementSchema } from '@/store/use-schema-store';

const GRID_COLS: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
};

// 公開展示頁專用的唯讀渲染器：只依 schema 畫出畫面，不帶任何編輯器的拖拽／
// 選取／contentEditable 行為，避免把編輯能力意外洩漏給沒有登入的訪客。
export function RenderSchemaElements({ elements }: { elements: ElementSchema[] }) {
    return (
        <>
            {elements.map((element) => (
                <RenderSchemaElement key={element.id} element={element} />
            ))}
        </>
    );
}

function RenderSchemaElement({ element }: { element: ElementSchema }) {
    const style = element.styles as React.CSSProperties;

    switch (element.componentId) {
        case ComponentIdEnums.text:
            return (
                <div style={style} className="p-2 rounded whitespace-pre-wrap">
                    {element.content || '預設文字'}
                </div>
            );

        case ComponentIdEnums.image:
            return element.content ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={element.content} alt="" style={style} className="rounded" />
            ) : null;

        case ComponentIdEnums.button:
            return (
                <button
                    style={style}
                    className="shadow-md transition-all hover:opacity-80 rounded px-4 py-2"
                >
                    {element.content || '按鈕'}
                </button>
            );

        case ComponentIdEnums.container: {
            const isFlexMode = element.columns === undefined;
            return (
                <div
                    style={style}
                    className={classNames(
                        'relative w-full rounded-lg',
                        isFlexMode && 'flex flex-wrap gap-2',
                        !isFlexMode &&
                            element.columns! > 1 &&
                            `grid gap-2 ${GRID_COLS[element.columns!] ?? 'grid-cols-2'}`
                    )}
                >
                    <RenderSchemaElements elements={element.children} />
                </div>
            );
        }
    }
}
