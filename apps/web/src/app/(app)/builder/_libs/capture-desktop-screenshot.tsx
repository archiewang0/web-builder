import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { DeviceIdEnums } from '@/components/header/devices';
import { resolveStyles } from '@/lib/responsive-styles';
import type { CanvasSchema } from '@/lib/schema';
import { RenderSchemaElements } from '@/app/site/[id]/render-schema';
import { captureScreenshot } from './capture-screenshot';

// 縮圖固定用這個寬度渲染，不吃使用者視窗大小或編輯器目前的裝置預覽寬度，
// 每次存檔拍出來的桌面版縮圖尺寸才會一致。
const DESKTOP_SNAPSHOT_WIDTH = 1440;

// 存檔縮圖一律拍「桌面版」畫面，但又不能直接把使用者正在編輯/預覽的畫面切成
// 桌面模式再截圖——那樣使用者會看到畫面閃一下切裝置。改成借用公開站台
// （site/[id]/render-schema.tsx）那份不含編輯行為的唯讀渲染器，在畫面外
// （left: -10000px）另外掛一份桌面版 DOM，截完立刻拆掉，使用者全程看不到。
export async function captureDesktopScreenshot(schema: CanvasSchema): Promise<Blob> {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '-10000px';
    container.style.width = `${DESKTOP_SNAPSHOT_WIDTH}px`;
    container.style.pointerEvents = 'none';
    document.body.appendChild(container);

    const root = createRoot(container);
    try {
        // 一定要同步 flush——之後馬上要量測/截圖這個節點，不能讓 React 用
        // concurrent rendering 延後 commit，否則截到的會是空容器。
        flushSync(() => {
            root.render(
                <div
                    style={resolveStyles(schema.body?.styles, DeviceIdEnums.desktop) as React.CSSProperties}
                >
                    <RenderSchemaElements elements={schema.elements} />
                </div>
            );
        });

        const node = container.firstElementChild as HTMLElement | null;
        if (!node) throw new Error('Desktop snapshot render failed');

        await waitForImages(node);
        return await captureScreenshot(node);
    } finally {
        root.unmount();
        container.remove();
    }
}

// 這份 DOM 是剛掛上去的，裡面的 <img> 都是全新的 network request，不像編輯器
// 畫布裡的圖片早就載入過——html-to-image 截到還沒載完的圖會整張變空白，
// 所以要先等每一張圖片 load/error 其中之一發生才能截圖。
function waitForImages(node: HTMLElement): Promise<void> {
    const images = Array.from(node.querySelectorAll('img'));
    return Promise.all(
        images.map((img) => {
            if (img.complete) return Promise.resolve();
            return new Promise<void>((resolve) => {
                img.addEventListener('load', () => resolve(), { once: true });
                img.addEventListener('error', () => resolve(), { once: true });
            });
        })
    ).then(() => undefined);
}
