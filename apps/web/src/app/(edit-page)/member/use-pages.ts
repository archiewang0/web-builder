'use client';

import { useEffect, useState } from 'react';
import { deletePageRequest } from '@/lib/delete-page';

export interface PageSummary {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    thumbnailPath: string | null;
}

// 列表只會出現「至少存過一次檔」的頁面——建立新頁面不打 API，
// 純粹是前端生一個 uuid 換網址，直到使用者按儲存才會真的寫進 DB。
export function usePages(enabled: boolean) {
    const [pages, setPages] = useState<PageSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!enabled) return;
        setIsLoading(true);
        fetch('/api/pages')
            .then((res) => res.json())
            .then((data) => setPages(data.pages ?? []))
            .finally(() => setIsLoading(false));
    }, [enabled]);

    // 打失敗就丟出例外，讓呼叫端交給 GlobalDialog 的 onConfirm 接住、顯示錯誤並留在原地。
    const deletePage = async (id: string) => {
        const result = await deletePageRequest(id);
        if (!result.ok) throw new Error(result.error);
        setPages((prev) => prev.filter((page) => page.id !== id));
    };

    return { pages, isLoading, deletePage };
}
