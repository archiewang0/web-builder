import { StyleChangeHandler } from '../../../_types/property-setting-types';

export interface BorderRadiusOptionsProps {
    borderRadius?: string;
    onRadiusChange: StyleChangeHandler;
    classname?: string;
}

const parsePx = (v?: string) => (v ? parseInt(v, 10) || 0 : 0);

export function BorderRadiusOptions({
    borderRadius,
    onRadiusChange,
    classname,
}: BorderRadiusOptionsProps) {
    return (
        <div className={classname}>
            <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-600 w-12">圓角</span>
                <input
                    type="number"
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500"
                    value={parsePx(borderRadius)}
                    min="0"
                    onChange={(e) => onRadiusChange({ borderRadius: `${e.target.value}px` })}
                />
                <span className="text-xs text-gray-500">px</span>
            </div>
        </div>
    );
}
