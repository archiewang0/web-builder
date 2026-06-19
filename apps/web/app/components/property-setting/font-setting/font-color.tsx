import { ColorSwatch } from '../color-swatch';
import { StyleChangeHandler } from '../types';

export interface FontColorProps {
    color?: string;
    backgroundColor?: string;
    onColorChange: StyleChangeHandler;
    classname?: string;
}

export function FontColor({
    color = '',
    backgroundColor = '',
    onColorChange,
    classname,
}: FontColorProps) {
    return (
        <div className={classname}>
            <label className="block text-xs font-medium text-gray-700 mb-2">顏色設定</label>
            <ColorSwatch
                label="文字"
                value={color}
                fallbackColor="rgba(31, 41, 55, 1)"
                placeholder="#1f2937 or rgba(...)"
                onCommit={(v) => onColorChange({ color: v })}
            />
            <ColorSwatch
                label="背景"
                value={backgroundColor}
                fallbackColor="rgba(239, 246, 255, 1)"
                placeholder="#eff6ff or rgba(...)"
                onCommit={(v) => onColorChange({ backgroundColor: v })}
            />
        </div>
    );
}
