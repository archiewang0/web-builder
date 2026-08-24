import { CollapsibleSection } from '../_components/collapsible-section';
import { FontColor, FontColorProps } from './font-color';
import { FontFamilyOptions, FontFamilyOptionsProps } from './font-family-options';
import { FontSizeOptions, FontSizeOptionsProps } from './font-size-options';
import { FontWeightOptions, FontWeightOptionsProps } from './font-weight-options';

interface FontSettingProps
    extends FontSizeOptionsProps,
        FontColorProps,
        FontFamilyOptionsProps,
        FontWeightOptionsProps {
    onReset: () => void;
}

export function FontSetting({
    fontSize,
    color,
    fontFamily,
    fontWeight,
    onColorChange,
    onSizeChange,
    onFontFamilyChange,
    onFontWeightChange,
    onReset,
}: FontSettingProps) {
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
        <CollapsibleSection title="字體設定" headerExtra={resetButton}>
            <div className="space-y-2 p-2 border border-gray-200 rounded-lg">
                <FontFamilyOptions
                    fontFamily={fontFamily}
                    onFontFamilyChange={onFontFamilyChange}
                    classname="mb-5"
                />
                <FontSizeOptions
                    fontSize={fontSize}
                    onSizeChange={onSizeChange}
                    classname=" mb-5"
                />
                <FontWeightOptions
                    fontWeight={fontWeight}
                    onFontWeightChange={onFontWeightChange}
                    classname="mb-5"
                />
                <FontColor color={color} onColorChange={onColorChange} />
            </div>
        </CollapsibleSection>
    );
}
