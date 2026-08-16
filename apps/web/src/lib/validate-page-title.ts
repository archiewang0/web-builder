// 網頁名稱規則：中英文、數字、- 或 _，不允許空白或其他特殊符號。
// 前後端都要擋（API route 也會呼叫這個函式），避免有人跳過畫面直接打 API。
export const PAGE_TITLE_PATTERN = /^[\p{L}\p{N}_-]+$/u;

export function validatePageTitle(title: string): string | null {
    const trimmed = title.trim();
    if (!trimmed) return '網頁名稱為必填';
    if (!PAGE_TITLE_PATTERN.test(trimmed)) {
        return '網頁名稱只能使用中英文、數字、- 或 _，不能有空白或其他符號';
    }
    return null;
}
