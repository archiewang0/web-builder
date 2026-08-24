import { StyleChangeHandler } from '../../../_types/property-setting-types';

export interface FontWeightOptionsProps {
    fontWeight?: string;
    onFontWeightChange: StyleChangeHandler;
    classname?: string;
}

const DEFAULT_WEIGHT = '400';

const WEIGHT_OPTIONS = [
    { label: '細 (300)', value: '300' },
    { label: '正常 (400)', value: '400' },
    { label: '中等 (500)', value: '500' },
    { label: '半粗體 (600)', value: '600' },
    { label: '粗體 (700)', value: '700' },
];

export function FontWeightOptions({
    fontWeight,
    onFontWeightChange,
    classname,
}: FontWeightOptionsProps) {
    return (
        <div className={classname}>
            <label className="block text-xs font-medium text-gray-700 mb-2">字重</label>
            <select
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                value={fontWeight || DEFAULT_WEIGHT}
                onChange={(e) => onFontWeightChange({ fontWeight: e.target.value })}
            >
                {WEIGHT_OPTIONS.map((weight) => (
                    <option
                        key={weight.value}
                        value={weight.value}
                        style={{ fontWeight: weight.value }}
                    >
                        {weight.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
