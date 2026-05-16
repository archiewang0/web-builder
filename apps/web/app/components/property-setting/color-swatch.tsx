'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { RgbaStringColorPicker } from 'react-colorful';

// #rrggbb or #rrggbbaa → rgba(r, g, b, a)
function hexToRgba(hex: string): string {
    const clean = hex.replace('#', '');
    if (clean.length !== 6 && clean.length !== 8) return hex;
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    const a = clean.length === 8 ? (parseInt(clean.slice(6, 8), 16) / 255).toFixed(2) : '1';
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function toPickerColor(color: string, fallback: string): string {
    if (!color) return fallback;
    if (color.startsWith('#')) return hexToRgba(color);
    if (color.startsWith('rgb')) return color;
    return fallback;
}

function isValidColor(v: string): boolean {
    return (
        /^#[0-9a-fA-F]{6,8}$/.test(v) ||
        /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(\s*,\s*[\d.]+)?\s*\)$/.test(v)
    );
}

export interface ColorSwatchProps {
    label: string;
    value: string;
    fallbackColor: string;
    placeholder: string;
    onCommit: (color: string) => void;
}

export function ColorSwatch({ label, value, fallbackColor, placeholder, onCommit }: ColorSwatchProps) {
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState(value);
    const popoverRef = useRef<HTMLDivElement>(null);
    const commitRef = useRef(onCommit);
    commitRef.current = onCommit;

    // Only sync from parent when picker is closed to avoid render loops
    useEffect(() => {
        if (!open) setDraft(value);
    }, [value, open]);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    // Stable reference so the picker never receives a new onChange prop
    const handlePickerChange = useCallback((rgba: string) => {
        setDraft(rgba);
        commitRef.current(rgba);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setDraft(v);
        if (isValidColor(v)) onCommit(v);
    };

    return (
        <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600 w-12">{label}</span>
            <div className="relative" ref={popoverRef}>
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    className="w-8 h-8 rounded border border-gray-300 cursor-pointer shadow-sm"
                    style={{ backgroundColor: draft || fallbackColor }}
                />
                {open && (
                    <div className="absolute z-50 mt-1 left-0 shadow-xl rounded-lg overflow-hidden">
                        <RgbaStringColorPicker
                            color={toPickerColor(draft, fallbackColor)}
                            onChange={handlePickerChange}
                        />
                    </div>
                )}
            </div>
            <input
                type="text"
                className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-xs font-mono"
                value={draft}
                placeholder={placeholder}
                onChange={handleInputChange}
            />
        </div>
    );
}
