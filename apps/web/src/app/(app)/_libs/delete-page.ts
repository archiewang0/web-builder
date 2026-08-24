export type DeletePageResult = { ok: true } | { ok: false; error: string };

// member 列表的垃圾桶按鈕、builder 側欄的刪除按鈕都打同一支 API，抽成共用函式避免重複。
// 失敗時把後端回傳的錯誤訊息帶回去，讓呼叫端可以丟給 GlobalDialog 顯示。
export async function deletePageRequest(id: string): Promise<DeletePageResult> {
    const res = await fetch(`/api/pages/${id}`, { method: 'DELETE' });
    if (res.ok) return { ok: true };

    const body = await res.json().catch(() => null);
    return { ok: false, error: body?.error ?? '刪除失敗，請稍後再試' };
}
