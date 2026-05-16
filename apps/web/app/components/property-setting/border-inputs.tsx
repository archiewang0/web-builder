import { ColorSwatch } from './color-swatch';
import { StyleChangeHandler } from './types';

interface BorderInputsProps {
    borderWidth?: string;
    borderRadius?: string;
    borderColor?: string;
    onChange: StyleChangeHandler;
}

const parsePx = (v?: string) => (v ? parseInt(v, 10) || 0 : 0);

export function BorderInputs({
    borderWidth,
    borderRadius,
    borderColor = '',
    onChange,
}: BorderInputsProps) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">邊框設定</label>
            <div className=" p-2 border border-gray-200 rounded-lg  ">
                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-600 w-12">寬度</span>
                        <input
                            type="number"
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500"
                            value={parsePx(borderWidth)}
                            min="0"
                            onChange={(e) => onChange({ borderWidth: `${e.target.value}px` })}
                        />
                        <span className="text-xs text-gray-500">px</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-600 w-12">圓角</span>
                        <input
                            type="number"
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500"
                            value={parsePx(borderRadius)}
                            min="0"
                            onChange={(e) => onChange({ borderRadius: `${e.target.value}px` })}
                        />
                        <span className="text-xs text-gray-500">px</span>
                    </div>
                    <ColorSwatch
                        label="顏色"
                        value={borderColor}
                        fallbackColor="rgba(0, 0, 0, 1)"
                        placeholder="#000000 or rgba(...)"
                        onCommit={(v) => onChange({ borderColor: v })}
                    />
                </div>
            </div>
        </div>
    );
}
