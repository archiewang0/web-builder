import classNames from 'classnames';
import { StyleChangeHandler } from '../types';
import {
    IMG_MIN_WIDTH_PERCENT,
    IMG_MAX_WIDTH_PERCENT,
    IMG_DEFAULT_WIDTH_SIZE,
    IMG_MIN_SIZE_PX,
    IMG_DEFAULT_WIDTH_PX,
    IMG_DEFAULT_HEIGHT_PX,
} from '@/app/(edit-page)/builder/_components/_const/img';

interface ImageSizeSettingProps {
    width?: string;
    height?: string;
    onChange: StyleChangeHandler;
}

// 單位直接從 width 字串的後綴判斷（"80%" vs "300px"），不用另外在 schema 多加一個
// unit 欄位——這兩種格式本來就得存在 styles.width 裡，後綴已經足夠當作單一事實來源。
const isPxUnit = (v?: string) => Boolean(v && v.endsWith('px'));

const parseNumber = (v: string | undefined, fallback: number) => {
    const n = v ? parseInt(v, 10) : NaN;
    return Number.isNaN(n) ? fallback : n;
};

export function ImageSizeSetting({ width, height, onChange }: ImageSizeSettingProps) {
    const usePx = isPxUnit(width);

    // 切換單位一律直接套用該單位的預設值，不沿用切換前的數字——不然像
    // parseInt("100%", 10) 會取到 100，變成 px 模式一開局就帶著 % 模式殘留的
    // 數字（100px），跟 IMG_DEFAULT_WIDTH_PX 完全無關，使用者會覺得很奇怪。
    const handleToggleUnit = (checked: boolean) => {
        if (checked) {
            onChange({
                width: `${IMG_DEFAULT_WIDTH_PX}px`,
                height: `${IMG_DEFAULT_HEIGHT_PX}px`,
            });
        } else {
            // 切回 % 就把 height 清掉——% 模式的高度永遠是 auto，留著舊的 px 值只會是死資料。
            onChange({ width: `${IMG_DEFAULT_WIDTH_SIZE}%`, height: undefined });
        }
    };

    const handlePercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        if (raw === '') return;
        const n = parseInt(raw, 10);
        if (Number.isNaN(n)) return;
        onChange({
            width: `${Math.min(IMG_MAX_WIDTH_PERCENT, Math.max(IMG_MIN_WIDTH_PERCENT, n))}%`,
        });
    };

    const handlePxChange =
        (key: 'width' | 'height') => (e: React.ChangeEvent<HTMLInputElement>) => {
            const raw = e.target.value;
            if (raw === '') return;
            const n = parseInt(raw, 10);
            if (Number.isNaN(n)) return;
            onChange({ [key]: `${Math.max(IMG_MIN_SIZE_PX, n)}px` });
        };

    return (
        <div className="p-2 border border-gray-200 rounded-lg space-y-2">
            <div className=" gap-5 flex items-center">
                <p className="text-xs text-gray-600 mr-5">圖片單位: </p>
                <label
                    className={classNames(
                        ' cursor-pointer border border-gray-400',
                        'flex items-center justify-between text-xs text-gray-600 cursor-pointer',
                        'rounded px-2 py-1 border border-transparent transition-colors',
                        'has-[:checked]:border-blue-400 has-[:checked]:bg-blue-50 has-[:checked]:text-blue-600'
                    )}
                >
                    <span>px</span>
                    <input
                        type="radio"
                        name="unit"
                        checked={usePx}
                        onChange={() => handleToggleUnit(true)}
                        className=" hidden"
                    />
                </label>

                <label
                    className={classNames(
                        ' cursor-pointer',

                        'flex items-center justify-between text-xs text-gray-600 cursor-pointer',
                        'rounded px-2 py-1 border border-transparent transition-colors',
                        'has-[:checked]:border-blue-400 has-[:checked]:bg-blue-50 has-[:checked]:text-blue-600'
                    )}
                >
                    <span>%</span>
                    <input
                        type="radio"
                        name="unit"
                        checked={!usePx}
                        onChange={() => handleToggleUnit(false)}
                        className=" hidden"
                    />
                </label>
            </div>

            {usePx ? (
                <>
                    <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-600 w-12">寬度</span>
                        <input
                            type="number"
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500"
                            value={parseNumber(width, IMG_DEFAULT_WIDTH_PX)}
                            min={IMG_MIN_SIZE_PX}
                            onChange={handlePxChange('width')}
                        />
                        <span className="text-xs text-gray-500">px</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-600 w-12">高度</span>
                        <input
                            type="number"
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500"
                            value={parseNumber(height, IMG_DEFAULT_HEIGHT_PX)}
                            min={IMG_MIN_SIZE_PX}
                            onChange={handlePxChange('height')}
                        />
                        <span className="text-xs text-gray-500">px</span>
                    </div>
                </>
            ) : (
                <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-600 w-12">大小</span>
                    <input
                        type="number"
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500"
                        value={parseNumber(width, IMG_DEFAULT_WIDTH_SIZE)}
                        min={IMG_MIN_WIDTH_PERCENT}
                        max={IMG_MAX_WIDTH_PERCENT}
                        onChange={handlePercentChange}
                    />
                    <span className="text-xs text-gray-500">%</span>
                </div>
            )}
        </div>
    );
}
