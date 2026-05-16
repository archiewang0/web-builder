import { ColorSwatch } from './color-swatch';
import { StyleChangeHandler } from './types';

interface FontColorProps {
    color?: string;
    backgroundColor?: string;
    onChange: StyleChangeHandler;
}

export function FontColor({ color = '', backgroundColor = '', onChange }: FontColorProps) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">顏色設定</label>
            <div className="space-y-2 p-2 border border-gray-200 rounded-lg">
                <ColorSwatch
                    label="文字"
                    value={color}
                    fallbackColor="rgba(31, 41, 55, 1)"
                    placeholder="#1f2937 or rgba(...)"
                    onCommit={(v) => onChange({ color: v })}
                />
                <ColorSwatch
                    label="背景"
                    value={backgroundColor}
                    fallbackColor="rgba(239, 246, 255, 1)"
                    placeholder="#eff6ff or rgba(...)"
                    onCommit={(v) => onChange({ backgroundColor: v })}
                />
            </div>
        </div>
    );
}
