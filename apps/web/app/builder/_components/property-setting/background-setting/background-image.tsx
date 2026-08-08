'use client';

import { StyleChangeHandler } from '../types';
import { ImageUrlInput } from '../image-setting/image-url-input';

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

    return <ImageUrlInput value={imageUrl} onChange={commitImageUrl} />;
}
