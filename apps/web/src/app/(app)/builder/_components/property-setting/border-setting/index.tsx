import { CollapsibleSection } from '../_components/collapsible-section';
import { BorderColor, BorderColorProps } from './border-color';
import { BorderRadiusOptions, BorderRadiusOptionsProps } from './border-radius-options';
import { BorderWidthOptions, BorderWidthOptionsProps } from './border-width-options';

interface BorderSettingProps
    extends BorderWidthOptionsProps,
        BorderRadiusOptionsProps,
        BorderColorProps {
    onReset: () => void;
}

export function BorderSetting({
    borderWidth,
    borderRadius,
    borderColor,
    onWidthChange,
    onRadiusChange,
    onColorChange,
    onReset,
}: BorderSettingProps) {
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
        <CollapsibleSection title="邊框設定" headerExtra={resetButton}>
            <div className="space-y-2 p-2 border border-gray-200 rounded-lg">
                <BorderWidthOptions borderWidth={borderWidth} onWidthChange={onWidthChange} />
                <BorderRadiusOptions borderRadius={borderRadius} onRadiusChange={onRadiusChange} />
                <BorderColor borderColor={borderColor} onColorChange={onColorChange} />
            </div>
        </CollapsibleSection>
    );
}
