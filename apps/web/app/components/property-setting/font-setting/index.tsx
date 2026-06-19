import { CollapsibleSection } from '../collapsible-section';
import { FontColor, FontColorProps } from './font-color';
import { FontSizeOptions, FontSizeOptionsProps } from './font-size-options';

interface FontSettingProps extends FontSizeOptionsProps, FontColorProps {}

export function FontSetting({
    fontSize,
    color,
    backgroundColor,
    onColorChange,
    onSizeChange,
}: FontSettingProps) {
    return (
        <CollapsibleSection title="字體設定">
            <div className="space-y-2 p-2 border border-gray-200 rounded-lg">
                <FontSizeOptions fontSize={fontSize} onSizeChange={onSizeChange} classname=" mb-5" />
                <FontColor
                    color={color}
                    backgroundColor={backgroundColor}
                    onColorChange={onColorChange}
                />
            </div>
        </CollapsibleSection>
    );
}
