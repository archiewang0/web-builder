'use client';

import { useRef, useState } from 'react';
import { usePendingUploadStore } from '@/store/use-pending-upload-store';

const MAX_FILE_SIZE = 500 * 1024;

// 選檔案只做本地預覽（URL.createObjectURL），不會馬上打 API 上傳。
// 真正的上傳要等使用者按「儲存」才會發生（見 use-save-page.ts），
// 避免使用者選了圖片卻沒存檔、或反覆試了好幾張圖，卻每一張都真的傳上 Blob storage。
export function useImageUpload(onUpload: (url: string) => void) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);
    const registerPending = usePendingUploadStore((state) => state.register);

    const openFileDialog = () => fileInputRef.current?.click();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;

        setError(null);
        if (file.size > MAX_FILE_SIZE) {
            setError(`檔案大小不能超過 500KB（目前 ${Math.ceil(file.size / 1024)}KB）`);
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        registerPending(previewUrl, file);
        onUpload(previewUrl);
    };

    return { fileInputRef, openFileDialog, handleFileChange, error };
}
