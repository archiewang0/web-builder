import { CollapsibleSection } from '../_components/collapsible-section';
import { StyleChangeHandler } from '../../../_types/property-setting-types';
import { ShadowColor } from './shadow-color';
import { ShadowSizeOptions } from './shadow-size-options';

interface ShadowSettingProps {
    boxShadow?: string;
    onChange: StyleChangeHandler;
    onReset: () => void;
}

export function ShadowSetting({ boxShadow, onChange, onReset }: ShadowSettingProps) {
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
        <CollapsibleSection title="陰影設定" headerExtra={resetButton}>
            <div className="space-y-2 p-2 border border-gray-200 rounded-lg">
                <ShadowSizeOptions boxShadow={boxShadow} onChange={onChange} />
                <ShadowColor boxShadow={boxShadow} onChange={onChange} />
            </div>
        </CollapsibleSection>
    );
}
