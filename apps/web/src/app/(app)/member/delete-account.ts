export type DeleteAccountResult = { ok: true } | { ok: false; error: string };

// member 頁面的「刪除帳號」按鈕打這支 API，成功後由呼叫端負責 signOut 並導頁。
export async function deleteAccountRequest(): Promise<DeleteAccountResult> {
    const res = await fetch('/api/user', { method: 'DELETE' });
    if (res.ok) return { ok: true };

    const body = await res.json().catch(() => null);
    return { ok: false, error: body?.error ?? '刪除失敗，請稍後再試' };
}
