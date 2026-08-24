import { toPng } from 'html-to-image';

const THUMBNAIL_WIDTH = 960;
const THUMBNAIL_HEIGHT = 540;
const MAX_BYTES = 500 * 1024;
const MIN_QUALITY = 0.3;

// 把畫布 DOM 轉成固定 960x540 的縮圖：先用 html-to-image 原尺寸截圖，
// 再用 canvas 依比例縮放並「置中裁切、頂部對齊」（畫面通常比 16:9 更長，
// 對齊頂部才能保留最有代表性的頁首內容），最後用 JPEG 品質遞減確保檔案不超過 500KB。
export async function captureScreenshot(node: HTMLElement): Promise<Blob> {
    // 不能傳 backgroundColor 選項——html-to-image 會拿它直接覆寫截圖節點（也就是
    // Body 元素）本身的 background-color，把使用者設定的 Body 背景色蓋成白色。
    // 下面 canvas 合成階段自己已經有一層白底 fillRect 兜底，不需要靠這個選項防透明。
    const dataUrl = await toPng(node, { pixelRatio: 1 });
    const image = await loadImage(dataUrl);

    const canvas = document.createElement('canvas');
    canvas.width = THUMBNAIL_WIDTH;
    canvas.height = THUMBNAIL_HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not supported');

    const scale = Math.max(THUMBNAIL_WIDTH / image.width, THUMBNAIL_HEIGHT / image.height);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;
    const offsetX = (THUMBNAIL_WIDTH - drawWidth) / 2;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);
    ctx.drawImage(image, offsetX, 0, drawWidth, drawHeight);

    let quality = 0.9;
    let blob = await canvasToJpegBlob(canvas, quality);
    while (blob.size > MAX_BYTES && quality > MIN_QUALITY) {
        quality -= 0.1;
        blob = await canvasToJpegBlob(canvas, quality);
    }
    return blob;
}

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Failed to load captured screenshot'));
        image.src = src;
    });
}

function canvasToJpegBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))),
            'image/jpeg',
            quality
        );
    });
}
