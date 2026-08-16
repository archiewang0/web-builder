'use client';

import { useRouter } from 'next/navigation';

// 建立新網頁不打 API，純粹在瀏覽器生一個 uuid 換頁，
// 直到使用者在 builder 裡按儲存才會真的把資料寫進 DB。
// 這個 uuid 必須在點擊當下才生成——寫死成靜態 href 的話，
// 靜態頁面（例如首頁）會在 build time 把 uuid 凍住，變成所有訪客共用同一個 id。
export function useCreatePage() {
    const router = useRouter();

    return function createPage() {
        router.push(`/builder/${crypto.randomUUID()}`);
    };
}
