import { ColorSwatch } from '../_components/color-swatch';
import { StyleChangeHandler } from '../../../_types/property-setting-types';

export interface BackgroundColorProps {
    backgroundColor?: string;
    onChange: StyleChangeHandler;
}

export function BackgroundColor({ backgroundColor = '', onChange }: BackgroundColorProps) {
    return (
        <ColorSwatch
            label="顏色"
            value={backgroundColor}
            fallbackColor="rgba(255, 255, 255, 1)"
            placeholder="#ffffff or rgba(...)"
            onCommit={(v) => onChange({ backgroundColor: v })}
        />
    );
}
