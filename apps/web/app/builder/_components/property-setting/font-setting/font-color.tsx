import { ColorSwatch } from '../color-swatch';
import { StyleChangeHandler } from '../types';

export interface FontColorProps {
    color?: string;
    onColorChange: StyleChangeHandler;
    classname?: string;
}

export function FontColor({ color = '', onColorChange, classname }: FontColorProps) {
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
        </div>
    );
}
