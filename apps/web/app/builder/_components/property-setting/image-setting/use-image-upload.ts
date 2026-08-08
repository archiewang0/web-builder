'use client';

import { useRef, useState } from 'react';
import { upload } from '@vercel/blob/client';

export function useImageUpload(onUpload: (url: string) => void) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const openFileDialog = () => fileInputRef.current?.click();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;

        setIsUploading(true);
        setError(null);
        try {
            const blob = await upload(file.name, file, {
                access: 'private',
                handleUploadUrl: '/api/upload',
            });
            onUpload(`/api/image?pathname=${encodeURIComponent(blob.pathname)}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : '上傳失敗');
        } finally {
            setIsUploading(false);
        }
    };

    return { fileInputRef, openFileDialog, handleFileChange, isUploading, error };
}
