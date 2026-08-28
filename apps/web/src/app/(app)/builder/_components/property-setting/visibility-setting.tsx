import classNames from 'classnames';
import { EyeOff } from 'lucide-react';
import { DEVICES, DeviceIdEnums } from '@/components/header/devices';

export interface VisibilitySettingProps {
    display?: string;
    activeDevice: DeviceIdEnums;
    onChange: (hidden: boolean) => void;
}

type VisibilityMode = 'visible' | 'hidden';

// 跟 navbar-position-setting.tsx 同一套做法：模式直接從 styles.display
// 現有的值判斷（是不是剛好等於 'none'），不用另外存一個欄位。
const getMode = (display?: string): VisibilityMode => (display === 'none' ? 'hidden' : 'visible');

const MODE_LABEL: Record<VisibilityMode, string> = {
    visible: '顯示',
    hidden: '隱藏',
};

const toggleClassName = (checked: boolean) =>
    classNames(
        'flex-1 text-center text-xs cursor-pointer rounded px-2 py-1 border border-transparent transition-colors',
        'has-[:checked]:border-blue-400 has-[:checked]:bg-blue-50 has-[:checked]:text-blue-600',
        !checked && 'text-gray-600'
    );

// 適用於所有元素類型（不像 NavbarPositionSetting 只在 navbar 樣板上顯示），
// 每個裝置分頁各自獨立設定——這裡只讀寫「目前 activeDevice 那一層」，切到
// 別的裝置分頁會顯示/寫入另一層，機制跟其他樣式設定一致，見
// use-property-setting.tsx 的 handleVisibilityChange 註解。
export function VisibilitySetting({ display, activeDevice, onChange }: VisibilitySettingProps) {
    const mode = getMode(display);
    const deviceName = DEVICES.find((d) => d.id === activeDevice)?.name ?? activeDevice;

    return (
        <div className="p-2 border border-gray-200 rounded-lg space-y-2">
            <label className="block text-xs font-medium text-gray-700">
                顯示狀態（{deviceName}）
            </label>

            <div className="flex items-center gap-2">
                {(['visible', 'hidden'] as const).map((option) => (
                    <label key={option} className={toggleClassName(mode === option)}>
                        <input
                            type="radio"
                            name="visibility-mode"
                            className="hidden"
                            checked={mode === option}
                            onChange={() => onChange(option === 'hidden')}
                        />
                        {MODE_LABEL[option]}
                    </label>
                ))}
            </div>

            {mode === 'hidden' && (
                <p className="flex items-center gap-1 text-xs text-gray-400">
                    <EyeOff className="size-3 shrink-0" />
                    只在「{deviceName}」隱藏，切換上方裝置頁籤可以個別設定其他裝置。
                </p>
            )}
        </div>
    );
}
