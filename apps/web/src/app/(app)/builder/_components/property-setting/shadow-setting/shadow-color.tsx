import { ColorSwatch } from '../_components/color-swatch';
import { StyleChangeHandler } from '../../../_types/property-setting-types';
import { buildShadow, parseShadow } from './shadow-value';

export interface ShadowColorProps {
    boxShadow?: string;
    onChange: StyleChangeHandler;
    classname?: string;
}

// 使用者可能還沒調過大小就直接選顏色——size 還是 0（=沒有陰影）的話，選色不該
// 沒有任何視覺回饋，所以這裡補一個看得出效果的預設大小。
const DEFAULT_SHADOW_SIZE = 8;

export function ShadowColor({ boxShadow, onChange, classname }: ShadowColorProps) {
    const { size, color } = parseShadow(boxShadow);

    return (
        <div className={classname}>
            <ColorSwatch
                label="顏色"
                value={color}
                fallbackColor="rgba(0, 0, 0, 0.25)"
                placeholder="#000000 or rgba(...)"
                onCommit={(v) =>
                    onChange({ boxShadow: buildShadow({ size: size || DEFAULT_SHADOW_SIZE, color: v }) })
                }
            />
        </div>
    );
}
