import { StyleChangeHandler } from '../../../_types/property-setting-types';

export interface MarginBottomOptionProps {
    marginBottom?: string;
    onMarginBottomChange: StyleChangeHandler;
    classname?: string;
}

const parsePx = (v?: string) => (v ? parseInt(v, 10) || 0 : 0);

export function MarginBottomOption({
    marginBottom,
    onMarginBottomChange,
    classname,
}: MarginBottomOptionProps) {
    return (
        <div className={classname}>
            <label className="block text-xs text-gray-600 mb-1">下邊距</label>
            <input
                type="number"
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500"
                value={parsePx(marginBottom)}
                onChange={(e) => onMarginBottomChange({ marginBottom: `${e.target.value}px` })}
            />
        </div>
    );
}
