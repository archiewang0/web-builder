import { StyleChangeHandler } from './types';

const SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px'];

interface FontSizeOptionsProps {
    value?: string;
    onChange: StyleChangeHandler;
}

export function FontSizeOptions({ value, onChange }: FontSizeOptionsProps) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">字體大小</label>
            <div className="  p-2 border border-gray-200 rounded-lg">
                <select
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                    value={value || SIZES[0]}
                    onChange={(e) => onChange({ fontSize: e.target.value })}
                >
                    <option value="">請選擇</option>
                    {SIZES.map((size) => (
                        <option key={size} value={size}>
                            {size}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
