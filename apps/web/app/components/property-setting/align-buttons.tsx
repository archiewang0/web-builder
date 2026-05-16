import { StyleChangeHandler } from './types';

interface AlignButtonsProps {
    value?: string;
    onChange: StyleChangeHandler;
}

const ALIGN_OPTIONS = [
    { label: '左對齊', css: 'flex-start' },
    { label: '置中', css: 'center' },
    { label: '右對齊', css: 'flex-end' },
];

export function AlignButtons({ value, onChange }: AlignButtonsProps) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">對齊方式</label>
            <div className=" p-2 border border-gray-200 rounded-lg ">
                <div className="flex space-x-1">
                    {ALIGN_OPTIONS.map(({ label, css }) => (
                        <button
                            key={label}
                            onClick={() => onChange({ justifyContent: css })}
                            className={`flex-1 py-2 px-2 text-xs border rounded transition-colors ${
                                value === css
                                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
