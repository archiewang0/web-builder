import { StyleChangeHandler } from '../../../_types/property-setting-types';
import { buildShadow, parseShadow } from './shadow-value';

export interface ShadowSizeOptionsProps {
    boxShadow?: string;
    onChange: StyleChangeHandler;
    classname?: string;
}

export function ShadowSizeOptions({ boxShadow, onChange, classname }: ShadowSizeOptionsProps) {
    const { size, color } = parseShadow(boxShadow);

    return (
        <div className={classname}>
            <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-600 w-12">大小</span>
                <input
                    type="number"
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500"
                    value={size}
                    min="0"
                    onChange={(e) => {
                        const nextSize = Math.max(0, parseInt(e.target.value, 10) || 0);
                        onChange({ boxShadow: buildShadow({ size: nextSize, color }) });
                    }}
                />
                <span className="text-xs text-gray-500">px</span>
            </div>
        </div>
    );
}
