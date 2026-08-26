import { StyleChangeHandler } from '../../../_types/property-setting-types';

export interface PaddingTopOptionProps {
    paddingTop?: string;
    onPaddingTopChange: StyleChangeHandler;
    classname?: string;
}

const parsePx = (v?: string) => (v ? parseInt(v, 10) || 0 : 0);

export function PaddingTopOption({
    paddingTop,
    onPaddingTopChange,
    classname,
}: PaddingTopOptionProps) {
    return (
        <div className={classname}>
            <label className="block text-xs text-gray-600 mb-1">上內距</label>
            <input
                type="number"
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500"
                value={parsePx(paddingTop)}
                onChange={(e) => onPaddingTopChange({ paddingTop: `${e.target.value}px` })}
            />
        </div>
    );
}
