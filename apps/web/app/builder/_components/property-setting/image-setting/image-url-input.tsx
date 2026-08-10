'use client';

import { useImageUpload } from './use-image-upload';
import { useImageMeta } from './use-image-meta';

export interface ImageUrlInputProps {
    value: string;
    onChange: (url: string) => void;
    label?: string;
    placeholder?: string;
}

export function ImageUrlInput({
    value,
    onChange,
    label = '圖片',
    placeholder = 'https://... 圖片網址',
}: ImageUrlInputProps) {
    const { fileInputRef, openFileDialog, handleFileChange, error } = useImageUpload(onChange);
    const meta = useImageMeta(value);

    return (
        <>
            <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-600 w-12">{label}</span>
                <input
                    type="text"
                    className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-xs font-mono"
                    value={value}
                    placeholder={placeholder}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>

            <div className="flex items-center space-x-2 pl-14">
                <button
                    type="button"
                    onClick={openFileDialog}
                    className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                >
                    上傳圖片
                </button>
                {value && (
                    <button
                        type="button"
                        onClick={() => onChange('')}
                        className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 text-red-600"
                    >
                        清除圖片
                    </button>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>

            {meta && (
                <div className="pl-14 text-xs text-gray-500">
                    {meta.width} × {meta.height} px
                    {meta.format && ` · ${meta.format}`}
                </div>
            )}

            {error && <div className="pl-14 text-xs text-red-600">{error}</div>}
        </>
    );
}
