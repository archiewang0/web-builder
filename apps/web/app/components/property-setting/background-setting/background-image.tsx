'use client';

import { useRef } from 'react';
import { StyleChangeHandler } from '../types';

export interface BackgroundImageProps {
    backgroundImage?: string;
    backgroundSize?: string;
    onChange: StyleChangeHandler;
}

export function extractBackgroundImageUrl(value?: string): string {
    if (!value) return '';
    const match = value.match(/^url\((['"]?)(.*)\1\)$/);
    return match ? (match[2] ?? '') : value;
}

export function BackgroundImage({
    backgroundImage,
    backgroundSize,
    onChange,
}: BackgroundImageProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageUrl = extractBackgroundImageUrl(backgroundImage);

    const commitImageUrl = (url: string) => {
        if (!url) {
            onChange({
                backgroundImage: undefined,
                backgroundPosition: undefined,
                backgroundRepeat: undefined,
            });
            return;
        }
        onChange({
            backgroundImage: `url(${url})`,
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: backgroundSize || 'cover',
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                commitImageUrl(reader.result);
            }
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    return (
        <>
            <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-600 w-12">圖片</span>
                <input
                    type="text"
                    className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-xs font-mono"
                    value={imageUrl}
                    placeholder="https://... 圖片網址"
                    onChange={(e) => commitImageUrl(e.target.value)}
                />
            </div>

            <div className="flex items-center space-x-2 pl-14">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                >
                    上傳圖片
                </button>
                {imageUrl && (
                    <button
                        type="button"
                        onClick={() => commitImageUrl('')}
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
        </>
    );
}
