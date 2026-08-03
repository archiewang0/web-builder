import { CollapsibleSection } from './collapsible-section';
import { StyleChangeHandler } from './types';

interface ImageSizeSettingProps {
    width?: string;
    onChange: StyleChangeHandler;
}

const DEFAULT_SIZE = 100;
const MIN_SIZE = 1;

const parsePercent = (v?: string) => {
    const n = v ? parseInt(v, 10) : NaN;
    return Number.isNaN(n) ? DEFAULT_SIZE : n;
};

export function ImageSizeSetting({ width, onChange }: ImageSizeSettingProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        if (raw === '') return;
        const n = parseInt(raw, 10);
        if (Number.isNaN(n)) return;
        onChange({ width: `${Math.max(MIN_SIZE, n)}%` });
    };

    const resetButton = (
        <button
            type="button"
            onClick={() => onChange({ width: undefined })}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
            Reset
        </button>
    );

    return (
        <CollapsibleSection title="圖片大小" headerExtra={resetButton}>
            <div className="p-2 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-600 w-12">大小</span>
                    <input
                        type="number"
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500"
                        value={parsePercent(width)}
                        min={MIN_SIZE}
                        onChange={handleChange}
                    />
                    <span className="text-xs text-gray-500">%</span>
                </div>
            </div>
        </CollapsibleSection>
    );
}
