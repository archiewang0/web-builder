'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { upload } from '@vercel/blob/client';
import { useSchemaStore } from '@/store/use-schema-store';
import { usePendingUploadStore } from '@/store/use-pending-upload-store';
import { usePageTitleStore } from '@/store/use-page-title-store';
import { usePageVisibilityStore } from '@/store/use-page-visibility-store';
import { collectBlobUrls, replaceBlobUrls } from '@/lib/resolve-pending-images';
import { validatePageTitle } from '@/lib/validate-page-title';
import { captureScreenshot } from '@/lib/capture-screenshot';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export const SAVE_LABEL: Record<SaveStatus, string> = {
    idle: '儲存',
    saving: '儲存中...',
    saved: '已儲存',
    error: '儲存失敗',
};

export function useSavePage() {
    const params = useParams<{ id: string }>();
    const [status, setStatus] = useState<SaveStatus>('idle');
    const [titleError, setTitleError] = useState<string | null>(null);

    // 存檔成功/失敗的提示只需要短暫顯示，之後自動回到 idle
    useEffect(() => {
        if (status !== 'saved' && status !== 'error') return;
        const timer = setTimeout(() => setStatus('idle'), 1500);
        return () => clearTimeout(timer);
    }, [status]);

    // 回傳是否真的存檔成功，讓呼叫端能判斷要不要接著做後續動作，而不是存檔失敗還誤以為成功。
    const handleSave = async (): Promise<boolean> => {
        const title = usePageTitleStore.getState().title.trim();
        const invalidTitleMessage = validatePageTitle(title);
        if (invalidTitleMessage) {
            setTitleError(invalidTitleMessage);
            return false;
        }
        setTitleError(null);

        setStatus('saving');
        try {
            const schema = useSchemaStore.getState().schema;
            const pending = usePendingUploadStore.getState().pending;
            const isPublic = usePageVisibilityStore.getState().isPublic;

            // 把 schema 裡還沒真的上傳的 blob: 預覽網址，全部換成真正的 Blob 網址。
            // 任何一張上傳失敗就整個中斷（全有全無）——不會存進一半真網址一半死掉的 blob 網址。
            const blobUrls = collectBlobUrls(schema).filter((url) => pending.has(url));
            const urlMap = new Map<string, string>();
            await Promise.all(
                blobUrls.map(async (blobUrl) => {
                    const file = pending.get(blobUrl)!;
                    const blob = await upload(file.name, file, {
                        access: 'private',
                        handleUploadUrl: '/api/upload',
                    });
                    urlMap.set(blobUrl, `/api/image?pathname=${encodeURIComponent(blob.pathname)}`);
                })
            );

            const resolvedSchema = urlMap.size > 0 ? replaceBlobUrls(schema, urlMap) : schema;

            // 截圖失敗不該讓整個存檔失敗——拿不到縮圖就不帶 thumbnailPath，
            // 後端會保留舊縮圖不動（見 upsertPageSchema）。
            let thumbnailPath: string | undefined;
            try {
                const canvasNode = document.getElementById('canvas');
                if (canvasNode) {
                    const screenshot = await captureScreenshot(canvasNode);
                    const blob = await upload(`screenshots/${params.id}.jpg`, screenshot, {
                        access: 'private',
                        handleUploadUrl: '/api/upload',
                        contentType: 'image/jpeg',
                    });
                    thumbnailPath = blob.pathname;
                }
            } catch {
                thumbnailPath = undefined;
            }

            const res = await fetch(`/api/pages/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ schema: resolvedSchema, title, isPublic, thumbnailPath }),
            });
            if (!res.ok) throw new Error('Save failed');

            // 整個存檔動作確定成功後，才把本地狀態換成真網址、釋放 blob 預覽資源。
            useSchemaStore.getState().setSchema(resolvedSchema);
            const removePending = usePendingUploadStore.getState().remove;
            blobUrls.forEach((blobUrl) => {
                URL.revokeObjectURL(blobUrl);
                removePending(blobUrl);
            });

            setStatus('saved');

            // 公開頁面存檔成功後，另開一個分頁直接看發布結果（/site/[id]，跟公開頁共用同一份唯讀渲染）。
            // 私密頁面訪問 /site/[id] 只會看到「尚未公開」，開了也沒意義，所以不開。
            if (isPublic) {
                const newTab = window.open('about:blank', '_blank');
                if (newTab) newTab.location.href = `/site/${params.id}`;
            }

            return true;
        } catch {
            setStatus('error');
            return false;
        }
    };

    return { status, handleSave, titleError };
}
