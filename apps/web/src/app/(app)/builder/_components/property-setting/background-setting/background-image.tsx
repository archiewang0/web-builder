'use client';

import { StyleChangeHandler } from '../../../_types/property-setting-types';
import { ImageUrlInput } from '../image-setting/image-url-input';
import { extractBackgroundImageUrl } from '@/lib/extract-background-image-url';

export interface BackgroundImageProps {
    backgroundImage?: string;
    backgroundSize?: string;
    onChange: StyleChangeHandler;
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
