// 純字串解析，不依賴瀏覽器 API，可以放心在 server（route handler）跟 client 元件共用。
export function extractBackgroundImageUrl(value?: string): string {
    if (!value) return '';
    const match = value.match(/^url\((['"]?)(.*)\1\)$/);
    return match ? (match[2] ?? '') : value;
}
