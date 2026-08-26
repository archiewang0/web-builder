import classNames from 'classnames';

// 三種渲染模式（builder 編輯模式／builder 預覽模式／公開 site）共用的「內容本身
// 視覺樣式」集中定義在這裡，builder（container-element.tsx 等）跟公開頁
// （site/[id]/render-schema.tsx）都從這裡 import。判斷規則：只要是從這裡輸出的
// class，三種模式看起來一定一樣；不是從這裡來的 class（例如 container-element.tsx
// 裡那些被 `!isPreviewMode &&` 包住的部分），一律是編輯器專屬的 UI chrome
// （拖曳外框、選取樣式、id 標籤...），只會出現在編輯模式，不會流到 preview／site。
//
// 這份清單目前只收「現有程式碼裡 builder／site 兩邊字面上完全一致」的 class，
// 沒有幫忙決定「兩邊本來就不一致的地方該以哪邊為準」——那些暫時留在各自檔案裡
// 維持現狀（例如 button 的 hover 透明度、shadow-md 有無、container 的 rounded-lg
// 在 preview 模式是否該出現），是已知的 edit/preview/site 視覺落差，需要另外決定
// 要不要統一，不在這次抽取的範圍內。

export const TEXT_BASE_CLASSNAME = 'p-2 rounded whitespace-pre-wrap';

export const IMAGE_BASE_CLASSNAME = 'rounded';

export const BUTTON_BASE_CLASSNAME = 'transition-all rounded px-4 py-2';

const CONTAINER_GRID_COLS: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
};

export function getContainerBaseClassName({
    isFlexMode,
    columns,
}: {
    isFlexMode: boolean;
    columns?: number;
}) {
    return classNames(
        'relative w-full',
        isFlexMode && 'flex flex-wrap gap-2',
        !isFlexMode &&
            columns !== undefined &&
            columns > 1 &&
            `grid gap-2 ${CONTAINER_GRID_COLS[columns] ?? 'grid-cols-2'}`
    );
}
