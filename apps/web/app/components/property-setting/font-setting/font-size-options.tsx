import { StyleChangeHandler } from '../types';

const SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px'];

export interface FontSizeOptionsProps {
    fontSize?: string;
    onSizeChange: StyleChangeHandler;
    classname?: string;
}

export function FontSizeOptions({ fontSize, onSizeChange, classname }: FontSizeOptionsProps) {
    return (
        <div className={classname}>
            <label className="block text-xs font-medium text-gray-700 mb-2">字體大小</label>
            <select
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                value={fontSize || SIZES[0]}
                onChange={(e) => onSizeChange({ fontSize: e.target.value })}
            >
                <option value="">請選擇</option>
                {SIZES.map((size) => (
                    <option key={size} value={size}>
                        {size}
                    </option>
                ))}
            </select>
        </div>
    );
}
