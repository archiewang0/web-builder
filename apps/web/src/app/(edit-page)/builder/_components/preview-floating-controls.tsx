import { EyeOff } from 'lucide-react';
import { useHeaderStore } from '@/store/use-header-store';
import { DeviceSwitcher } from './device-switcher';
import { SaveButton } from './save-button';
import { useSavePage } from './sidebar/use-save-page';

// 預覽模式下 header／sidebar／property-bar 都收起來，
// 只留這顆浮動小工具負責「返回編輯」跟「儲存」，畫面才不會被常駐 UI 壓縮。
// 存檔成功後另開分頁看發布結果的行為，統一放在 useSavePage 裡（Toolbar 的儲存按鈕也共用）。
export function PreviewFloatingControls() {
    const setIsPreviewMode = useHeaderStore((state) => state.setIsPreviewMode);
    const { status, handleSave } = useSavePage();

    return (
        <div className="fixed top-4 left-4 z-50 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-1.5">
            <DeviceSwitcher className="pb-3 border-b border-gray-300" />

            <div className="flex gap-2 mt-2">
                <button
                    onClick={() => setIsPreviewMode(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    <EyeOff className="w-4 h-4" />
                    <span>返回編輯</span>
                </button>
                <SaveButton status={status} onClick={handleSave} className="rounded-md shadow-sm" />
            </div>
        </div>
    );
}
