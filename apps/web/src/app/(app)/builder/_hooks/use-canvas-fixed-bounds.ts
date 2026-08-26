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
// 就哪個觸發，呼叫端不用自己判斷目前是編輯還是預覽模式。
export function useCanvasFixedBounds(enabled: boolean) {
    const [bounds, setBounds] = useState<CanvasFixedBounds | null>(null);

    useLayoutEffect(() => {
        if (!enabled) {
            setBounds(null);
            return;
        }

        const box = document.getElementById('device-frame');
        if (!box) return;

        const update = () => {
            const rect = box.getBoundingClientRect();
            setBounds({
                top: Math.max(rect.top, 0),
                left: rect.left,
                width: rect.width,
            });
        };

        update();

        const deviceWrapper = document.getElementById('device-wrapper');
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
