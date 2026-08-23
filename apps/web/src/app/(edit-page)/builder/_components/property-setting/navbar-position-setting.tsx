import classNames from 'classnames';
import { StyleChangeHandler } from './types';

export interface NavbarPositionSettingProps {
    position?: string;
    onChange: StyleChangeHandler;
}

type PositionMode = 'none' | 'sticky' | 'fixed';

// 跟 button-link-setting.tsx／image-size-setting.tsx 同一套做法：模式直接從
// styles.position 現有的值判斷，不用另外存一個欄位。
const getMode = (position?: string): PositionMode =>
    position === 'sticky' || position === 'fixed' ? position : 'none';

const STICKY_Z_INDEX = '50';

const MODE_LABEL: Record<PositionMode, string> = {
    none: '無',
    sticky: 'Sticky',
    fixed: 'Fixed',
};

const toggleClassName = (checked: boolean) =>
    classNames(
        'flex-1 text-center text-xs cursor-pointer rounded px-2 py-1 border border-transparent transition-colors',
        'has-[:checked]:border-blue-400 has-[:checked]:bg-blue-50 has-[:checked]:text-blue-600',
        !checked && 'text-gray-600'
    );

export function NavbarPositionSetting({ position, onChange }: NavbarPositionSettingProps) {
    const mode = getMode(position);

    const navbarHandleModeChange = (next: PositionMode) => {
        if (next === 'none') {
            onChange({ position: undefined, top: undefined, zIndex: undefined });
            return;
        }
        onChange({ position: next, top: '0px', left: '0px', zIndex: STICKY_Z_INDEX });
    };

    return (
        <div className="p-2 border border-gray-200 rounded-lg space-y-2">
            <label className="block text-xs font-medium text-gray-700">導覽列定位</label>

            <div className="flex items-center gap-2">
                {(['none', 'sticky', 'fixed'] as const).map((option) => (
                    <label key={option} className={toggleClassName(mode === option)}>
                        <input
                            type="radio"
                            name="navbar-position-mode"
                            className="hidden"
                            checked={mode === option}
                            onChange={() => navbarHandleModeChange(option)}
                        />
                        {MODE_LABEL[option]}
                    </label>
                ))}
            </div>

            {mode === 'sticky' && (
                <p className="text-xs text-gray-400">
                    Sticky：頁面往下捲動、捲到這個元素頂端時會黏住不再往上跑，還是佔著原本的排版位置。
                </p>
            )}
            {mode === 'fixed' && (
                <p className="text-xs text-gray-400">
                    Fixed：永遠固定在畫面頂端，會脫離文件排版，下方內容可能被蓋住，需要自行留意間距。
                </p>
            )}
        </div>
    );
}
