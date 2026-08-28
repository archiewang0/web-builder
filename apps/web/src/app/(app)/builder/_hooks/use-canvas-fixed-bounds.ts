import { useLayoutEffect, useState } from 'react';

interface CanvasFixedBounds {
    top: number;
    left: number;
    width: number;
}

// editmode 的畫布捲動發生在 #device-wrapper 內部（<main> 鎖高度、裝置外框
// #device-frame 撐滿它），previewmode 沒有裝置外框以外的常駐 UI，<main> 沒鎖
// 高度，捲動的其實是整個瀏覽器視窗。以前用 transform: translateZ(0) 把裝置外框
// 變成 fixed 子孫的 containing block，結果「fixed」變成貼著外框本身定位，
// 外框一旦被捲出可視範圍，貼在它上面的東西就跟著捲走、不再是視覺上的
// 「固定」。改成量測外框目前在視窗中的實際位置（getBoundingClientRect），
// top 夾在 0 以上，捲過頭時就貼齊真正的視窗頂端，模擬原生 fixed 的效果，
// left/width 則跟著外框走，裝置切換（手機／平板寬度）也能貼齊，不會跑版到
// 真正的瀏覽器視窗寬度。
//
// 兩種模式的捲動來源不一樣，這裡兩邊的 listener 都掛上去，哪個實際在捲動
// 就哪個觸發，呼叫端不用自己判斷目前是編輯還是預覽模式。同一時間只有其中
// 一個會真的有非 0 的捲動量（editmode 是 #device-wrapper 自己 scrollTop，
// previewmode 是整個視窗 window.scrollY），兩個相加就是目前實際捲動量，
// 不用另外判斷現在是哪個模式。
//
// 從一開始捲動（0px）就即時對應到 navbar 往上收起的量，最多收 MAX_HIDE_OFFSET_PX、
// 不再增加；往回捲這段收起量會等量減少，捲回 0 就完全回到原點——這是直接
// 用「實際捲動量」算，不是「已經超出貼齊頂端多少」。後者會讓收起效果要等
// 外框先自然捲到貼齊視窗頂端（可能已經捲了不少距離）才開始啟動，跟捲動量
// 對不上。
//
// 最終的 top 不能夾在 0 以上就好——top 是相對「真正的瀏覽器視窗」，這個 App
// 自己的外層 <header>（components/header/index.tsx）就佔掉視窗最上面那一段
// 高度，top:0 剛好會疊到它上面去。真正的下限要是 header 目前實際渲染出來的
// 高度，不是寫死的 0 或某個數字——header 在 previewmode 會直接不渲染
// （isPreviewMode 時回傳 null），這時候下限自然變回 0、貼真正的視窗頂端，
// 兩種模式不用另外分支處理。
const MAX_HIDE_OFFSET_PX = 50;

export function useCanvasFixedBounds(enabled: boolean) {
    const [bounds, setBounds] = useState<CanvasFixedBounds | null>(null);

    useLayoutEffect(() => {
        if (!enabled) {
            setBounds(null);
            return;
        }

        const box = document.getElementById('device-frame');
        if (!box) return;

        const deviceWrapper = document.getElementById('device-wrapper');

        const update = () => {
            const rect = box.getBoundingClientRect();
            const scrollAmount = (deviceWrapper?.scrollTop ?? 0) + window.scrollY;
            const hideOffset = Math.min(Math.max(scrollAmount, 0), MAX_HIDE_OFFSET_PX);
            const headerHeight = document.querySelector('header')?.getBoundingClientRect().height ?? 0;
            setBounds({
                top: Math.max(rect.top - hideOffset, headerHeight),
                left: rect.left,
                width: rect.width,
            });
        };

        update();

        deviceWrapper?.addEventListener('scroll', update);
        window.addEventListener('scroll', update);
        window.addEventListener('resize', update);

        const observer = new ResizeObserver(update);
        observer.observe(box);

        return () => {
            deviceWrapper?.removeEventListener('scroll', update);
            window.removeEventListener('scroll', update);
            window.removeEventListener('resize', update);
            observer.disconnect();
        };
    }, [enabled]);

    return bounds;
}
