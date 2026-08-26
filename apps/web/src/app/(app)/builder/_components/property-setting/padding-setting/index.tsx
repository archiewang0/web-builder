import { CollapsibleSection } from '../_components/collapsible-section';
import { PaddingBottomOption, PaddingBottomOptionProps } from './padding-bottom-option';
import { PaddingLeftOption, PaddingLeftOptionProps } from './padding-left-option';
import { PaddingRightOption, PaddingRightOptionProps } from './padding-right-option';
import { PaddingTopOption, PaddingTopOptionProps } from './padding-top-option';

interface PaddingSettingProps
    extends PaddingTopOptionProps,
        PaddingBottomOptionProps,
        PaddingLeftOptionProps,
        PaddingRightOptionProps {
    onReset: () => void;
}

export function PaddingSetting({
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    onPaddingTopChange,
    onPaddingBottomChange,
    onPaddingLeftChange,
    onPaddingRightChange,
    onReset,
}: PaddingSettingProps) {
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
        <CollapsibleSection title="內距設定" headerExtra={resetButton}>
            <div className="p-2 border border-gray-200 rounded-lg">
                <div className="grid grid-cols-2 gap-2">
                    <PaddingTopOption
                        paddingTop={paddingTop}
                        onPaddingTopChange={onPaddingTopChange}
                    />
                    <PaddingBottomOption
                        paddingBottom={paddingBottom}
                        onPaddingBottomChange={onPaddingBottomChange}
                    />
                    <PaddingLeftOption
                        paddingLeft={paddingLeft}
                        onPaddingLeftChange={onPaddingLeftChange}
                    />
                    <PaddingRightOption
                        paddingRight={paddingRight}
                        onPaddingRightChange={onPaddingRightChange}
                    />
                </div>
            </div>
        </CollapsibleSection>
    );
}
