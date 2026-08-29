'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { upload } from '@vercel/blob/client';
import { useSchemaStore } from '@/store/use-schema-store';
import { usePendingUploadStore } from '@/store/use-pending-upload-store';
import { usePageTitleStore } from '@/store/use-page-title-store';
import { usePageVisibilityStore } from '@/store/use-page-visibility-store';
import { useDialogStore } from '@/store/use-dialog-store';
import { collectBlobUrls, replaceBlobUrls } from '@/app/(app)/builder/_libs/resolve-pending-images';
import { validatePageTitle } from '@/lib/validate-page-title';
import { captureDesktopScreenshot } from '@/app/(app)/builder/_libs/capture-desktop-screenshot';

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
        // 全螢幕遮罩 + loading dialog：儲存/上傳整段期間都蓋住畫面，不能手動關掉，
        // 結束後（成功或失敗）再呼叫一次 open() 換成最終畫面，見下面兩處。
        useDialogStore.getState().open({ title: '正在儲存...', loading: true });
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
            // 後端會保留舊縮圖不動（見 upsertPageSchema）。縮圖一律拍桌面版畫面，
            // 用畫面外離屏渲染（見 capture-desktop-screenshot.tsx），不會動到
            // 使用者正在編輯/預覽的裝置模式，也就不會有切裝置的畫面閃動。
            let thumbnailPath: string | undefined;
            try {
                const screenshot = await captureDesktopScreenshot(resolvedSchema);
                const blob = await upload(`screenshots/${params.id}.jpg`, screenshot, {
                    access: 'private',
                    handleUploadUrl: '/api/upload',
                    contentType: 'image/jpeg',
                });
                thumbnailPath = blob.pathname;
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

            // 公開頁面存檔成功後在 dialog 上直接顯示發布網址（/site/[id]，跟公開頁
            // 共用同一份唯讀渲染），使用者自己點連結開新分頁看，不用自動幫他跳頁。
            // 私密頁面訪問 /site/[id] 只會看到「尚未公開」，不顯示連結，只提示上傳成功。
            if (isPublic) {
                const siteUrl = `${window.location.origin}/site/${params.id}`;
                useDialogStore.getState().open({
                    title: '已發布成功',
                    description: '你的網頁已經上線，點擊下方連結查看：',
                    content: (
                        <a
                            href={siteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 block truncate rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-blue-600 hover:underline"
                        >
                            {siteUrl}
                        </a>
                    ),
                    confirmText: '完成',
                    showCancel: false,
                });
            } else {
                useDialogStore.getState().open({
                    title: '上傳成功',
                    description: '這個頁面目前是私密狀態，只有你自己看得到。',
                    confirmText: '完成',
                    showCancel: false,
                });
            }

            return true;
        } catch {
            setStatus('error');
            useDialogStore.getState().open({
                title: '儲存失敗',
                description: '請稍後再試一次。',
                confirmText: '確定',
                showCancel: false,
            });
            return false;
        }
    };

    return { status, handleSave, titleError };
}
