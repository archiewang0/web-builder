import type { CanvasSchema, ElementSchema } from '@/lib/schema';
import { extractBackgroundImageUrl } from '@/lib/extract-background-image-url';
import { getAllStyleLayers, mapStyleLayers } from '@/lib/responsive-styles';

function isBlobUrl(value: string | undefined): value is string {
    return typeof value === 'string' && value.startsWith('blob:');
}

// 找出 schema 裡所有還指向本地 blob: 預覽網址的欄位（圖片內容 + 背景圖片），
// 存檔前要先把這些換成真正上傳後的網址。
export function collectBlobUrls(schema: CanvasSchema): string[] {
    const found = new Set<string>();

    function visit(elements: ElementSchema[]) {
        for (const el of elements) {
            if ('content' in el && isBlobUrl(el.content)) {
                found.add(el.content);
            }
            // 每一層（base/tablet/mobile）都要查——使用者可能在不同裝置設了
            // 不同的背景圖，只看 base 會漏掉其他層還沒上傳的 blob。
            for (const layer of getAllStyleLayers(el.styles)) {
                const bg = extractBackgroundImageUrl(layer.backgroundImage);
                if (isBlobUrl(bg)) found.add(bg);
            }
            if ('children' in el) {
                visit(el.children);
            }
        }
    }

    visit(schema.elements);

    for (const layer of getAllStyleLayers(schema.body?.styles)) {
        const bodyBg = extractBackgroundImageUrl(layer.backgroundImage);
        if (isBlobUrl(bodyBg)) found.add(bodyBg);
    }

    return [...found];
}

// 依照 urlMap（blob 網址 → 真正網址）把 schema 換成新的一份，不會動到原本的物件。
export function replaceBlobUrls(schema: CanvasSchema, urlMap: Map<string, string>): CanvasSchema {
    function visit(elements: ElementSchema[]): ElementSchema[] {
        return elements.map((el) => {
            const next = { ...el };

            if ('content' in next && isBlobUrl(next.content) && urlMap.has(next.content)) {
                next.content = urlMap.get(next.content);
            }

            // 用 mapStyleLayers 逐層檢查置換——base/tablet/mobile 各自可能有
            // 不同的背景圖 blob url，只換 base 會漏掉其他層。
            if (next.styles) {
                next.styles = mapStyleLayers(next.styles, (layer) => {
                    const bg = extractBackgroundImageUrl(layer.backgroundImage);
                    return isBlobUrl(bg) && urlMap.has(bg)
                        ? { ...layer, backgroundImage: `url(${urlMap.get(bg)})` }
                        : null;
                });
            }

            if ('children' in next) {
                next.children = visit(next.children);
            }

            return next;
        });
    }

    const body = schema.body?.styles
        ? {
              ...schema.body,
              styles: mapStyleLayers(schema.body.styles, (layer) => {
                  const bg = extractBackgroundImageUrl(layer.backgroundImage);
                  return isBlobUrl(bg) && urlMap.has(bg)
                      ? { ...layer, backgroundImage: `url(${urlMap.get(bg)})` }
                      : null;
              }),
          }
        : schema.body;

    return { body, elements: visit(schema.elements) };
}
