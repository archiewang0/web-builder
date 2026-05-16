import { StyleChangeHandler } from './types';

interface MarginInputsProps {
    marginTop?: string;
    marginBottom?: string;
    marginLeft?: string;
    marginRight?: string;
    onChange: StyleChangeHandler;
}

const parsePx = (v?: string) => (v ? parseInt(v, 10) || 0 : 0);

export function MarginInputs({
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    onChange,
}: MarginInputsProps) {
    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-gray-700">間距設定</label>
                <button
                    type="button"
                    onClick={() =>
                        onChange({
                            marginTop: '0px',
                            marginBottom: '0px',
                            marginLeft: '0px',
                            marginRight: '0px',
                        })
                    }
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                    Reset
                </button>
            </div>
            <div className="  p-2 border border-gray-200 rounded-lg ">
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">上邊距</label>
                        <input
                            type="number"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500"
                            value={parsePx(marginTop)}
                            onChange={(e) => onChange({ marginTop: `${e.target.value}px` })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">下邊距</label>
                        <input
                            type="number"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500"
                            value={parsePx(marginBottom)}
                            onChange={(e) => onChange({ marginBottom: `${e.target.value}px` })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">左邊距</label>
                        <input
                            type="number"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500"
                            value={parsePx(marginLeft)}
                            onChange={(e) => onChange({ marginLeft: `${e.target.value}px` })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">右邊距</label>
                        <input
                            type="number"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500"
                            value={parsePx(marginRight)}
                            onChange={(e) => onChange({ marginRight: `${e.target.value}px` })}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
