import { Eye, EyeOff, Save } from 'lucide-react';
import { DEVICES } from '@/components/header/use-header';
import { useHeaderStore } from '@/store/use-header-store';
import { useSavePage } from './use-save-page';

const SAVE_LABEL: Record<string, string> = {
    idle: '儲存',
    saving: '儲存中...',
    saved: '已儲存',
    error: '儲存失敗',
};

// 裝置切換／預覽／儲存：builder 專屬功能，常駐工具列。
// /builder 整條路由已經由 middleware 做登入檢查，這裡不用再擋一次。
export function Toolbar() {
    const activeDevice = useHeaderStore((state) => state.activeDevice);
    const setActiveDevice = useHeaderStore((state) => state.setActiveDevice);
    const isPreviewMode = useHeaderStore((state) => state.isPreviewMode);
    const setIsPreviewMode = useHeaderStore((state) => state.setIsPreviewMode);
    const { status, handleSave } = useSavePage();

    return (
        <div className="p-3 border-b border-gray-100 space-y-2">
            <div className="justify-center flex items-center gap-1">
                {DEVICES.map((device) => (
                    <button
                        key={device.id}
                        onClick={() => setActiveDevice(device.id)}
                        className={`p-2 rounded-lg transition-colors ${
                            activeDevice === device.id
                                ? 'bg-blue-500 text-white shadow-md'
                                : 'hover:bg-gray-100 text-gray-600'
                        }`}
                        title={device.name}
                    >
                        <device.icon className="w-4 h-4" />
                    </button>
                ))}
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setIsPreviewMode((prev) => !prev)}
                    className={`flex-1 flex items-center justify-center space-x-1.5 px-2 py-1.5 rounded-lg text-sm transition-colors ${
                        isPreviewMode
                            ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                >
                    {isPreviewMode ? (
                        <EyeOff className="w-4 h-4" />
                    ) : (
                        <Eye className="w-4 h-4" />
                    )}
                    <span>{isPreviewMode ? '編輯' : '預覽'}</span>
                </button>
                <button
                    onClick={handleSave}
                    disabled={status === 'saving'}
                    className="flex-1 flex items-center justify-center space-x-1.5 px-2 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save className="w-4 h-4" />
                    <span>{SAVE_LABEL[status]}</span>
                </button>
            </div>
        </div>
    );
}
