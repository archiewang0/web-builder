import { ColorSwatch } from '../_components/color-swatch';
import { StyleChangeHandler } from '../../../_types/property-setting-types';

export interface BorderColorProps {
    borderColor?: string;
    onColorChange: StyleChangeHandler;
    classname?: string;
}

export function BorderColor({ borderColor = '', onColorChange, classname }: BorderColorProps) {
    return (
        <div className={classname}>
            <ColorSwatch
                label="顏色"
                value={borderColor}
                fallbackColor="rgba(0, 0, 0, 1)"
                placeholder="#000000 or rgba(...)"
                onCommit={(v) => onColorChange({ borderColor: v })}
            />
        </div>
    );
}
