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

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

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

    const handleSave = async () => {
        const title = usePageTitleStore.getState().title.trim();
        const invalidTitleMessage = validatePageTitle(title);
        if (invalidTitleMessage) {
            setTitleError(invalidTitleMessage);
            return;
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
        } catch {
            setStatus('error');
        }
    };

    return { status, handleSave, titleError };
}
