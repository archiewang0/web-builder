import type { CanvasSchema, ElementSchema } from '@/store/use-schema-store';
import { extractBackgroundImageUrl } from '@/builder/_components/property-setting/background-setting/background-image';

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
            const bg = extractBackgroundImageUrl(el.styles?.backgroundImage);
            if (isBlobUrl(bg)) {
                found.add(bg);
            }
            if ('children' in el) {
                visit(el.children);
            }
        }
    }

    visit(schema.elements);
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

            const bg = extractBackgroundImageUrl(next.styles?.backgroundImage);
            if (isBlobUrl(bg) && urlMap.has(bg)) {
                next.styles = { ...next.styles, backgroundImage: `url(${urlMap.get(bg)})` };
            }

            if ('children' in next) {
                next.children = visit(next.children);
            }

            return next;
        });
    }

    return { elements: visit(schema.elements) };
}
