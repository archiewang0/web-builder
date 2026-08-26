import { CollapsibleSection } from '../_components/collapsible-section';
import { MarginBottomOption, MarginBottomOptionProps } from './margin-bottom-option';
import { MarginLeftOption, MarginLeftOptionProps } from './margin-left-option';
import { MarginRightOption, MarginRightOptionProps } from './margin-right-option';
import { MarginTopOption, MarginTopOptionProps } from './margin-top-option';

interface MarginSettingProps
    extends MarginTopOptionProps,
        MarginBottomOptionProps,
        MarginLeftOptionProps,
        MarginRightOptionProps {
    onReset: () => void;
}

export function MarginSetting({
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    onMarginTopChange,
    onMarginBottomChange,
    onMarginLeftChange,
    onMarginRightChange,
    onReset,
}: MarginSettingProps) {
    const resetButton = (
        <button
            type="button"
            onClick={onReset}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
            Reset
        </button>
    );

    return (
        <CollapsibleSection title="邊距設定" headerExtra={resetButton}>
            <div className="p-2 border border-gray-200 rounded-lg">
                <div className="grid grid-cols-2 gap-2">
                    <MarginTopOption marginTop={marginTop} onMarginTopChange={onMarginTopChange} />
                    <MarginBottomOption
                        marginBottom={marginBottom}
                        onMarginBottomChange={onMarginBottomChange}
                    />
                    <MarginLeftOption
                        marginLeft={marginLeft}
                        onMarginLeftChange={onMarginLeftChange}
                    />
                    <MarginRightOption
                        marginRight={marginRight}
                        onMarginRightChange={onMarginRightChange}
                    />
                </div>
            </div>
        </CollapsibleSection>
    );
}
