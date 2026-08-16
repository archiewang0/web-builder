'use client';

import { useEffect, useState } from 'react';

export interface ImageMeta {
    width: number;
    height: number;
    format: string;
}

function extractFormat(value: string): string {
    const dataUrlMatch = value.match(/^data:image\/([^;]+);/);
    if (dataUrlMatch) {
        return dataUrlMatch[1]!.split('+')[0]!.toUpperCase();
    }
    const extMatch = value.match(/\.([a-zA-Z0-9]+)(?:[?#].*)?$/);
    return extMatch ? extMatch[1]!.toUpperCase() : '';
}

export function useImageMeta(value: string): ImageMeta | null {
    const [meta, setMeta] = useState<ImageMeta | null>(null);

    useEffect(() => {
        if (!value) {
            setMeta(null);
            return;
        }
        const img = new Image();
        img.onload = () => {
            setMeta({
                width: img.naturalWidth,
                height: img.naturalHeight,
                format: extractFormat(value),
            });
        };
        img.onerror = () => {
            setMeta(null);
        };
        img.src = value;

        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [value]);

    return meta;
}
