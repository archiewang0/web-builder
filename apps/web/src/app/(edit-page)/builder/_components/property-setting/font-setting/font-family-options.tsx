import { StyleChangeHandler } from '../types';

export interface FontFamilyOptionsProps {
    fontFamily?: string;
    onFontFamilyChange: StyleChangeHandler;
    classname?: string;
}

const FONT_OPTIONS = [
    { label: 'Inter', value: 'var(--font-inter), sans-serif' },
    { label: 'Roboto', value: 'var(--font-roboto), sans-serif' },
    { label: 'Poppins', value: 'var(--font-poppins), sans-serif' },
    { label: 'Playfair Display', value: 'var(--font-playfair-display), serif' },
    { label: 'Montserrat', value: 'var(--font-montserrat), sans-serif' },
];

export function FontFamilyOptions({
    fontFamily,
    onFontFamilyChange,
    classname,
}: FontFamilyOptionsProps) {
    return (
        <div className={classname}>
            <label className="block text-xs font-medium text-gray-700 mb-2">字型</label>
            <select
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                value={fontFamily || ''}
                onChange={(e) => onFontFamilyChange({ fontFamily: e.target.value || undefined })}
                style={{ fontFamily: fontFamily || undefined }}
            >
                <option value="">預設</option>
                {FONT_OPTIONS.map((font) => (
                    <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                        {font.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
