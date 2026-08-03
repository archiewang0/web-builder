import { CollapsibleSection } from './collapsible-section';

interface FlexAlignSettingProps {
    value?: string;
    onChange: (justifyContent: string) => void;
}

const ALIGN_OPTIONS = [
    { label: '左對齊', css: 'flex-start' },
    { label: '置中', css: 'center' },
    { label: '右對齊', css: 'flex-end' },
];

export function FlexAlignSetting({ value, onChange }: FlexAlignSettingProps) {
    return (
        <CollapsibleSection title="對齊方式 (Flex)">
            <div className="p-2 border border-gray-200 rounded-lg">
                <p className="text-xs text-gray-400 mb-2">
                    選擇後容器將切換為 Flex 版面，並清除欄位設定
                </p>
                <div className="flex space-x-1">
                    {ALIGN_OPTIONS.map(({ label, css }) => (
                        <button
                            key={label}
                            type="button"
                            onClick={() => onChange(css)}
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
        </CollapsibleSection>
    );
}
