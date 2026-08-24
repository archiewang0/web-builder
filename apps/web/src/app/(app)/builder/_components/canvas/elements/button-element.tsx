import classNames from 'classnames';

interface ButtonElementProps {
    id: string;
    content?: string;
    elementProperty: { [key: string]: any };
    href?: string;
    isPreviewMode?: boolean;
}

// '#' 開頭 = 捲動到元素；跟 store 欄位註解、button-link-setting.tsx 是同一套判斷。
const isScrollHref = (href: string) => href.startsWith('#');

export function ButtonElement({
    id,
    content,
    elementProperty,
    href,
    isPreviewMode,
}: ButtonElementProps) {
    const { style, onClick, 'selected-style': selectedStyle, ...divProps } = elementProperty;

    // preview 模式下模擬公開頁的真實點擊行為，不再只是選取元素。
    // 編輯器畫布的節點只有 data-element-id（沒有原生 id 屬性，id 是保留給公開頁
    // 的錨點導覽用），沒辦法靠瀏覽器原生 <a href="#..."> 跳轉，用
    // querySelector + scrollIntoView 自己找目標節點捲過去。外部網址則開新分頁，
    // 避免在編輯器裡點一下就把整個分頁導航走、弄丟正在編輯的頁面。
    const handlePreviewClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!href) return;
        if (isScrollHref(href)) {
            const targetId = href.slice(1);
            document
                .querySelector(`[data-element-id="${targetId}"]`)
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }
        window.open(href, '_blank', 'noopener,noreferrer');
    };

    const handleClick = isPreviewMode && href ? handlePreviewClick : onClick;

    return (
        <div {...divProps}>
            <button
                style={style}
                onClick={handleClick}
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
