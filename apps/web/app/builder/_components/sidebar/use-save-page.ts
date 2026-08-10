'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { upload } from '@vercel/blob/client';
import { useSchemaStore } from '@/store/use-schema-store';
import { usePendingUploadStore } from '@/store/use-pending-upload-store';
import { collectBlobUrls, replaceBlobUrls } from '@/lib/resolve-pending-images';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useSavePage() {
    const params = useParams<{ id: string }>();
    const [status, setStatus] = useState<SaveStatus>('idle');

    // 存檔成功/失敗的提示只需要短暫顯示，之後自動回到 idle
    useEffect(() => {
        if (status !== 'saved' && status !== 'error') return;
        const timer = setTimeout(() => setStatus('idle'), 1500);
        return () => clearTimeout(timer);
    }, [status]);

    const handleSave = async () => {
        setStatus('saving');
        try {
            const schema = useSchemaStore.getState().schema;
            const pending = usePendingUploadStore.getState().pending;

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

            const res = await fetch(`/api/pages/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ schema: resolvedSchema }),
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

    return { status, handleSave };
}
