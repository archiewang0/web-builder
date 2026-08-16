import { StyleChangeHandler } from '../types';

export interface BackgroundSizeProps {
    backgroundSize?: string;
    onChange: StyleChangeHandler;
}

const SIZE_OPTIONS: { value: string; label: string }[] = [
    { value: 'cover', label: '滿版 (cover)' },
    { value: 'contain', label: '完整顯示 (contain)' },
    { value: 'auto', label: '原始尺寸 (auto)' },
];

export function BackgroundSize({ backgroundSize, onChange }: BackgroundSizeProps) {
    return (
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
    );
}
