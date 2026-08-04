import { useEffect, useState } from 'react';
import { useDebouncedCallback } from '@/app/lib/use-debounce';
import { StyleChangeHandler } from '../types';

export interface FontSizeOptionsProps {
    fontSize?: string;
    onSizeChange: StyleChangeHandler;
    classname?: string;
}

const DEFAULT_SIZE = 16;
const MIN_SIZE = 0;

const parseSize = (v?: string) => {
    const n = v ? parseInt(v, 10) : NaN;
    return Number.isNaN(n) ? DEFAULT_SIZE : n;
};

export function FontSizeOptions({ fontSize, onSizeChange, classname }: FontSizeOptionsProps) {
    const [localValue, setLocalValue] = useState<number | undefined>(() => parseSize(fontSize));

    useEffect(() => {
        setLocalValue(parseSize(fontSize));
    }, [fontSize]);

    const debouncedSizeChange = useDebouncedCallback((n: number) => {
        onSizeChange({ fontSize: `${n}px` });
    }, 500);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const digitsOnly = e.target.value.replace(/\D/g, '');
        if (digitsOnly === '') {
            // 允許清空輸入，不強迫立即補值，讓使用者可以重新輸入
            setLocalValue(undefined);
            return;
        }
        const n = Math.max(MIN_SIZE, parseInt(digitsOnly, 10));
        setLocalValue(n);
        debouncedSizeChange(n);
    };

    return (
        <div className={classname}>
            <label className="block text-xs font-medium text-gray-700 mb-2">字體大小</label>
            <div className="flex items-center space-x-2">
                <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                    value={localValue ?? ''}
                    onChange={handleChange}
                />
                <span className="text-xs text-gray-500">px</span>
            </div>
        </div>
    );
}
