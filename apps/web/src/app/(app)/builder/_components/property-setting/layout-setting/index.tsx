import { CollapsibleSection } from '../_components/collapsible-section';
import { ColumnOptions } from './column-options';
import { FlexAlignSetting } from './flex-align-setting';

export interface LayoutSettingProps {
    columns?: number;
    onColumnsChange: (columns: number) => void;
    justifyContent?: string;
    onJustifyContentChange: (justifyContent: string) => void;
}

// Grid 欄位數跟 Flex 對齊方式互斥（切換其中一個，另一個會被清成 undefined），
// 放在同一個 CollapsibleSection 裡呈現這個關聯，而不是分開兩塊。
export function LayoutSetting({
    columns,
    onColumnsChange,
    justifyContent,
    onJustifyContentChange,
}: LayoutSettingProps) {
    return (
        <CollapsibleSection title="版面設定">
            <div className="space-y-3">
                <div className="p-2 border border-gray-200 rounded-lg">
                    <p className="text-xs text-gray-600 mb-2">欄位數量（Grid）</p>
                    <ColumnOptions value={columns} onChange={onColumnsChange} />
                </div>

                <div className="p-2 border border-gray-200 rounded-lg">
                    <p className="text-xs text-gray-400 mb-2">
                        對齊方式（Flex）— 選擇後會切換為 Flex 版面，並清除欄位設定
                    </p>
                    <FlexAlignSetting value={justifyContent} onChange={onJustifyContentChange} />
                </div>
            </div>
        </CollapsibleSection>
    );
}
