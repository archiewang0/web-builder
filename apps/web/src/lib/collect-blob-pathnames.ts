import type { CanvasSchema, ElementSchema } from '@/lib/schema';
import { extractBackgroundImageUrl } from '@/lib/extract-background-image-url';
import { getAllStyleLayers } from '@/lib/responsive-styles';

const IMAGE_API_PREFIX = '/api/image?pathname=';

function extractPathname(value: string | undefined): string | null {
    if (!value || !value.startsWith(IMAGE_API_PREFIX)) return null;
    try {
        return decodeURIComponent(value.slice(IMAGE_API_PREFIX.length));
    } catch {
        return null;
    }
}

// 找出 schema（圖片內容 + 背景圖片）跟縮圖裡，所有指向 Blob store 的 pathname。
// 存檔／刪除頁面時用來跟前一份比對，找出不再被引用、該清掉的孤兒檔案。
export function collectBlobPathnames(
    schema: CanvasSchema,
    thumbnailPath?: string | null
): string[] {
    const found = new Set<string>();

    function visit(elements: ElementSchema[]) {
        for (const el of elements) {
            if ('content' in el) {
                const pathname = extractPathname(el.content);
                if (pathname) found.add(pathname);
            }
            // 每一層（base/tablet/mobile）都要查——使用者可能在不同裝置設了
            // 不同的背景圖，只看 base 會漏掉其他層還在用的檔案。
            for (const layer of getAllStyleLayers(el.styles)) {
                const bgPathname = extractPathname(extractBackgroundImageUrl(layer.backgroundImage));
                if (bgPathname) found.add(bgPathname);
            }
            if ('children' in el) {
                visit(el.children);
            }
        }
    }

    visit(schema.elements);

    for (const layer of getAllStyleLayers(schema.body?.styles)) {
        const bodyBgPathname = extractPathname(extractBackgroundImageUrl(layer.backgroundImage));
        if (bodyBgPathname) found.add(bodyBgPathname);
    }

    if (thumbnailPath) found.add(thumbnailPath);
    return [...found];
}
