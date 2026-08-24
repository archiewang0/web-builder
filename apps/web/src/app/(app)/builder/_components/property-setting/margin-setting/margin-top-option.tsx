import { StyleChangeHandler } from '../../../_types/property-setting-types';

export interface MarginTopOptionProps {
    marginTop?: string;
    onMarginTopChange: StyleChangeHandler;
    classname?: string;
}

const parsePx = (v?: string) => (v ? parseInt(v, 10) || 0 : 0);

export function MarginTopOption({ marginTop, onMarginTopChange, classname }: MarginTopOptionProps) {
    return (
        <div className={classname}>
            <label className="block text-xs text-gray-600 mb-1">上邊距</label>
            <input
                type="number"
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500"
                value={parsePx(marginTop)}
                onChange={(e) => onMarginTopChange({ marginTop: `${e.target.value}px` })}
            />
        </div>
    );
}
