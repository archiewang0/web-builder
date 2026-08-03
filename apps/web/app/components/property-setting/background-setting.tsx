'use client';

import { useRef } from 'react';
import { CollapsibleSection } from './collapsible-section';
import { ColorSwatch } from './color-swatch';
import { StyleChangeHandler } from './types';

export interface BackgroundSettingProps {
    backgroundColor?: string;
    backgroundImage?: string;
    backgroundSize?: string;
    onChange: StyleChangeHandler;
}

const SIZE_OPTIONS: { value: string; label: string }[] = [
    { value: 'cover', label: '滿版 (cover)' },
    { value: 'contain', label: '完整顯示 (contain)' },
    { value: 'auto', label: '原始尺寸 (auto)' },
];

function extractUrl(value?: string): string {
    if (!value) return '';
    const match = value.match(/^url\((['"]?)(.*)\1\)$/);
    return match ? (match[2] ?? '') : value;
}

export function BackgroundSetting({
    backgroundColor = '',
    backgroundImage,
    backgroundSize,
    onChange,
}: BackgroundSettingProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageUrl = extractUrl(backgroundImage);

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

    const resetButton = (
        <button
            type="button"
            onClick={() =>
                onChange({
                    backgroundColor: undefined,
                    backgroundImage: undefined,
                    backgroundPosition: undefined,
                    backgroundRepeat: undefined,
                    backgroundSize: undefined,
                })
            }
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
            Reset
        </button>
    );

    return (
        <CollapsibleSection title="背景設定" headerExtra={resetButton}>
            <div className="space-y-2 p-2 border border-gray-200 rounded-lg">
                <ColorSwatch
                    label="顏色"
                    value={backgroundColor}
                    fallbackColor="rgba(255, 255, 255, 1)"
                    placeholder="#ffffff or rgba(...)"
                    onCommit={(v) => onChange({ backgroundColor: v })}
                />

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

                {imageUrl && (
                    <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-600 w-12">填滿</span>
                        <select
                            className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-xs"
                            value={backgroundSize || 'cover'}
                            onChange={(e) => onChange({ backgroundSize: e.target.value })}
                        >
                            {SIZE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
        </CollapsibleSection>
    );
}
