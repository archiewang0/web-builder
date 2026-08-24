import { CollapsibleSection } from '../_components/collapsible-section';
import { StyleChangeHandler } from '../../../_types/property-setting-types';
import { ImageUrlInput } from './image-url-input';
import { ImageSizeSetting } from './image-size-setting';

export interface ImageSettingProps {
    content: string;
    onChange: (content: string) => void;
    width?: string;
    height?: string;
    onStyleChange: StyleChangeHandler;
}

export function ImageSetting({
    content,
    onChange,
    width,
    height,
    onStyleChange,
}: ImageSettingProps) {
    const resetButton = (
        <button
            type="button"
            onClick={() => onChange('')}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
            Reset
        </button>
    );

    return (
        <CollapsibleSection title="圖片設定" headerExtra={resetButton}>
            <div className="space-y-2 p-2 border border-gray-200 rounded-lg">
                <ImageUrlInput value={content} onChange={onChange} />

                <ImageSizeSetting width={width} height={height} onChange={onStyleChange} />
            </div>
        </CollapsibleSection>
    );
}
