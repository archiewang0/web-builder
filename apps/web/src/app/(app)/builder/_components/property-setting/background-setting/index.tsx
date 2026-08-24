import { CollapsibleSection } from '../_components/collapsible-section';
import { StyleChangeHandler } from '../../../_types/property-setting-types';
import { BackgroundColor } from './background-color';
import { BackgroundImage } from './background-image';
import { extractBackgroundImageUrl } from '@/lib/extract-background-image-url';
import { BackgroundSize } from './background-size';

export interface BackgroundSettingProps {
    backgroundColor?: string;
    backgroundImage?: string;
    backgroundSize?: string;
    onChange: StyleChangeHandler;
}

export function BackgroundSetting({
    backgroundColor,
    backgroundImage,
    backgroundSize,
    onChange,
}: BackgroundSettingProps) {
    const hasImage = Boolean(extractBackgroundImageUrl(backgroundImage));

    const resetButton = (
        <button
            type="button"
            onClick={() =>
                onChange({
                    backgroundColor: undefined,
                    backgroundImage: undefined,
                    backgroundPosition: undefined,
                    backgroundRepeat: undefined,
                    backgroundSize: undefined,
                })
            }
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
            Reset
        </button>
    );

    return (
        <CollapsibleSection title="背景設定" headerExtra={resetButton}>
            <div className="space-y-2 p-2 border border-gray-200 rounded-lg">
                <BackgroundColor backgroundColor={backgroundColor} onChange={onChange} />
                <BackgroundImage
                    backgroundImage={backgroundImage}
                    backgroundSize={backgroundSize}
                    onChange={onChange}
                />
                {hasImage && <BackgroundSize backgroundSize={backgroundSize} onChange={onChange} />}
            </div>
        </CollapsibleSection>
    );
}
