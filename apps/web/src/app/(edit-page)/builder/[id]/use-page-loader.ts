'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSchemaStore } from '@/store/use-schema-store';
import { useSelectedElementStore } from '@/store/use-selected-element-store';
import { usePageTitleStore } from '@/store/use-page-title-store';
import { usePageVisibilityStore } from '@/store/use-page-visibility-store';

type LoadStatus = 'loading' | 'error' | 'ready';

// 切換 /builder/[id] 時，useSchemaStore 是全域 store，不會因為換頁自動清空，
// 所以要在這裡主動用抓回來的資料覆蓋 schema，並清掉上一份頁面殘留的選取狀態。
export function usePageLoader() {
    const params = useParams<{ id: string }>();
    const setSchema = useSchemaStore((state) => state.setSchema);
    const setSelectedElement = useSelectedElementStore((state) => state.setSelectedElement);
    const setTitle = usePageTitleStore((state) => state.setTitle);
    const setIsPublic = usePageVisibilityStore((state) => state.setIsPublic);
    const [status, setStatus] = useState<LoadStatus>('loading');

    useEffect(() => {
        let ignore = false;
        setStatus('loading');
        setSelectedElement(null);

        fetch(`/api/pages/${params.id}`)
            .then(async (res) => {
                if (ignore) return;

                // 404：這個 id 是前端自己生成的，還沒存過檔，屬於正常的「全新頁面」，
                // 不是錯誤——用空白 schema 蓋掉 store 裡可能殘留的上一份頁面內容。
                if (res.status === 404) {
                    setSchema({ elements: [] });
                    setTitle('未命名頁面');
                    setIsPublic(false);
                    setStatus('ready');
                    return;
                }
                if (!res.ok) throw new Error('Failed to load page');

                const data = await res.json();
                if (ignore) return;
                setSchema(data.page.schema);
                setTitle(data.page.title);
                setIsPublic(data.page.isPublic);
                setStatus('ready');
            })
            .catch(() => {
                if (!ignore) setStatus('error');
            });

        return () => {
            ignore = true;
        };
    }, [params.id, setSchema, setSelectedElement, setTitle, setIsPublic]);

    return { status };
}
