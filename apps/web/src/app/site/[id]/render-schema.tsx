import classNames from 'classnames';
import { ComponentIdEnums, type ElementSchema } from '@/lib/schema';

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

    // 每個元素的最外層節點都掛上 id={element.id}——這樣按鈕的「捲動至元素」
    // 連結（href="#elementId"）才有實際的錨點可以跳，瀏覽器原生錨點導覽
    // 本身就會處理捲動，不用自己寫 scrollIntoView。
    switch (element.componentId) {
        case ComponentIdEnums.text:
            return (
                <div id={element.id} style={style} className="p-2 rounded whitespace-pre-wrap">
                    {element.content || '預設文字'}
                </div>
            );

        case ComponentIdEnums.image:
            // 沒設圖片時不能整個回傳 null——這個節點還是佔著版面上的一格
            // （grid 欄位、flex 排版旁邊的元素），直接消失會讓旁邊的元素跟著
            // 移位、grid 欄數對不起來。至少渲染一個套用相同 styles（含寬高）
            // 的空 div 撐住版面，只是沒有圖可以顯示而已。
            return element.content ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    id={element.id}
                    src={element.content}
                    alt=""
                    style={style}
                    className="rounded"
                />
            ) : (
                <div id={element.id} style={style} className="rounded" />
            );

        case ComponentIdEnums.button: {
            const buttonClassName = 'shadow-md transition-all hover:opacity-80 rounded px-4 py-2';
            const href = element.href;

            if (!href) {
                return (
                    <button id={element.id} style={style} className={buttonClassName}>
                        {element.content || '按鈕'}
                    </button>
                );
            }

            // '#' 開頭 = 捲動到頁面上另一個元素，同分頁原生錨點跳轉；其餘當外部
            // 網址，開新分頁——避免使用者點出去就整個離開這個單頁網站。
            const isScrollLink = href.startsWith('#');
            return (
                <a
                    id={element.id}
                    href={href}
                    style={style}
                    className={classNames('inline-block text-center no-underline', buttonClassName)}
                    target={isScrollLink ? undefined : '_blank'}
                    rel={isScrollLink ? undefined : 'noopener noreferrer'}
                >
                    {element.content || '按鈕'}
                </a>
            );
        }

        case ComponentIdEnums.container: {
            const isFlexMode = element.columns === undefined;
            return (
                <div
                    id={element.id}
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
