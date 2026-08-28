import classNames from 'classnames';
import { ChevronDown } from 'lucide-react';
import { ElementTypeEnums, type ElementSchema, type StylesSchema } from '@/lib/schema';
import { DeviceIdEnums } from '@/components/header/devices';
import { buildResponsiveCss, resolveStyles } from '@/lib/responsive-styles';
import {
    BUTTON_BASE_CLASSNAME,
    IMAGE_BASE_CLASSNAME,
    TEXT_BASE_CLASSNAME,
    getContainerBaseClassName,
} from '@/lib/element-base-class';
import { DropdownMenuWidget } from './dropdown-menu-widget';

// page.tsx 的 Body 背景層外面那個 <div> 要用這個 id，buildResponsiveCss
// 產生的 @media 規則才選得到它。
export const BODY_STYLE_ID = '__page-body__';

// 正式站台沒有裝置切換器，是瀏覽器真實視窗尺寸在變化，不能像編輯器那樣用
// activeDevice 這個 JS 狀態去 cascade 合併——tablet/mobile 的覆寫要編譯成
// 真正的 @media CSS 規則才會在瀏覽器裡生效，細節見 lib/responsive-styles.ts
// 的 buildResponsiveCss。這裡只負責把整棵 schema 樹（+ Body）走一遍收集規則，
// 不做任何渲染；呼叫端（page.tsx）把回傳的字串塞進一個 <style> 就好。
// isFixed 的隱形佔位 clone（assignIds=false）沒有真正的 id，收集不到、也就
// 不會有 @media 規則——它只是用來撐版面高度的佔位，不必是斷點精準。
export function collectResponsiveCss(elements: ElementSchema[], bodyStyles?: StylesSchema): string {
    const rules: string[] = [];
    if (bodyStyles) rules.push(buildResponsiveCss(BODY_STYLE_ID, bodyStyles));

    function visit(list: ElementSchema[]) {
        for (const element of list) {
            if (element.styles) rules.push(buildResponsiveCss(element.id, element.styles));
            if ('children' in element) visit(element.children);
        }
    }
    visit(elements);

    return rules.filter(Boolean).join('\n');
}

// 公開展示頁專用的唯讀渲染器：只依 schema 畫出畫面，不帶任何編輯器的拖拽／
// 選取／contentEditable 行為，避免把編輯能力意外洩漏給沒有登入的訪客。
export function RenderSchemaElements({
    elements,
    assignIds = true,
}: {
    elements: ElementSchema[];
    assignIds?: boolean;
}) {
    return (
        <>
            {elements.map((element) => (
                <RenderSchemaElement key={element.id} element={element} assignIds={assignIds} />
            ))}
        </>
    );
}

function RenderSchemaElement({
    element,
    assignIds = true,
}: {
    element: ElementSchema;
    assignIds?: boolean;
}) {
    // 這裡只解析出 base（桌面）當 inline style——跟編輯器不同，正式站台不會
    // 用 JS 判斷裝置，tablet/mobile 是靠上面 collectResponsiveCss 產生的
    // @media 規則在瀏覽器裡覆蓋掉這份 inline style。
    const style = resolveStyles(element.styles, DeviceIdEnums.desktop) as React.CSSProperties;
    // fixed navbar 的隱形佔位 clone（見下方 container case）需要整棵子樹重渲染
    // 一次來撐出正確高度，但不能讓子孫元素的 id 也跟著複製一份——否則
    // document.getElementById／#anchor 連結會對到重複 id 裡的其中一個，
    // 可能剛好選到看不見的那份。assignIds=false 時整棵子樹都不掛真正的 id。
    const id = assignIds ? element.id : undefined;

    // 每個元素的最外層節點都掛上 id={element.id}——這樣按鈕的「捲動至元素」
    // 連結（href="#elementId"）才有實際的錨點可以跳，瀏覽器原生錨點導覽
    // 本身就會處理捲動，不用自己寫 scrollIntoView。
    switch (element.elementType) {
        case ElementTypeEnums.text:
            return (
                <div id={id} style={style} className={TEXT_BASE_CLASSNAME}>
                    {element.content || '預設文字'}
                </div>
            );

        case ElementTypeEnums.image:
            // 沒設圖片時不能整個回傳 null——這個節點還是佔著版面上的一格
            // （grid 欄位、flex 排版旁邊的元素），直接消失會讓旁邊的元素跟著
            // 移位、grid 欄數對不起來。至少渲染一個套用相同 styles（含寬高）
            // 的空 div 撐住版面，只是沒有圖可以顯示而已。
            return element.content ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    id={id}
                    src={element.content}
                    alt=""
                    style={style}
                    className={classNames(IMAGE_BASE_CLASSNAME, 'object-cover')}
                />
            ) : (
                <div id={id} style={style} className={IMAGE_BASE_CLASSNAME} />
            );

        case ElementTypeEnums.button: {
            const buttonClassName = classNames(BUTTON_BASE_CLASSNAME, 'shadow-md hover:opacity-80');
            const href = element.href;

            if (!href) {
                return (
                    <button id={id} style={style} className={buttonClassName}>
                        {element.content || '按鈕'}
                    </button>
                );
            }

            // '#' 開頭 = 捲動到頁面上另一個元素，同分頁原生錨點跳轉；其餘當外部
            // 網址，開新分頁——避免使用者點出去就整個離開這個單頁網站。
            const isScrollLink = href.startsWith('#');
            return (
                <a
                    id={id}
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

        case ElementTypeEnums.container: {
            const isFlexMode = element.columns === undefined;
            const containerClassName = classNames(
                getContainerBaseClassName({ isFlexMode, columns: element.columns }),
                'rounded-lg'
            );
            const isFixed = style?.position === 'fixed';

            return (
                <>
                    {isFixed && (
                        // fixed 元素脫離文件排版，下方內容會被蓋住。這裡不用 JS 量高度
                        // （公開頁是 SSR，訪客第一次看到畫面時 JS 可能都還沒 hydrate），
                        // 改成直接把同一份內容再渲染一次、拿掉 fixed 定位、隱藏成不可見
                        // 也不可互動（aria-hidden + inert），純粹用它自己撐出的高度去
                        // 佔位，把後面的內容往下推。高度天生就會跟真正的 navbar 一致，
                        // 響應式換行也會一起同步變動，不用另外處理。
                        <div
                            aria-hidden="true"
                            inert
                            style={{
                                ...style,
                                position: 'static',
                                top: undefined,
                                left: undefined,
                                right: undefined,
                                bottom: undefined,
                                zIndex: undefined,
                                visibility: 'hidden',
                            }}
                            className={containerClassName}
                        >
                            <RenderSchemaElements elements={element.children} assignIds={false} />
                        </div>
                    )}
                    <div id={id} style={style} className={containerClassName}>
                        <RenderSchemaElements elements={element.children} assignIds={assignIds} />
                    </div>
                </>
            );
        }

        case ElementTypeEnums.dropdownMenu: {
            const buttonClassName = classNames(
                BUTTON_BASE_CLASSNAME,
                'inline-flex items-center gap-1 shadow-md hover:opacity-80'
            );
            return (
                <DropdownMenuWidget
                    trigger={
                        <button id={id} style={style} className={buttonClassName}>
                            {element.content || '選單'}
                            <ChevronDown className="size-4" />
                        </button>
                    }
                    panel={<RenderSchemaElements elements={element.children} assignIds={assignIds} />}
                />
            );
        }
    }
}
