import { Eye, EyeOff, Globe, Lock } from 'lucide-react';
import { useHeaderStore } from '@/store/use-header-store';
import { usePageTitleStore } from '@/store/use-page-title-store';
import { usePageVisibilityStore } from '@/store/use-page-visibility-store';
import { DeviceSwitcher } from './device-switcher';
import { SaveButton } from './save-button';
import { useSavePage } from './use-save-page';

// 裝置切換／預覽／儲存：builder 專屬功能，常駐工具列。
// /builder 整條路由已經由 middleware 做登入檢查，這裡不用再擋一次。
export function Toolbar() {
    const isPreviewMode = useHeaderStore((state) => state.isPreviewMode);
    const setIsPreviewMode = useHeaderStore((state) => state.setIsPreviewMode);
    const title = usePageTitleStore((state) => state.title);
    const setTitle = usePageTitleStore((state) => state.setTitle);
    const isPublic = usePageVisibilityStore((state) => state.isPublic);
    const setIsPublic = usePageVisibilityStore((state) => state.setIsPublic);
    const { status, handleSave, titleError } = useSavePage();

    return (
        <div className="p-3 border-b border-gray-100 space-y-2">
            <div>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="網頁名稱（必填）"
                    className={`w-full px-2 py-1.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400 ${
                        titleError ? 'border-red-400' : 'border-gray-200'
                    }`}
                />
                {titleError && <p className="mt-1 text-xs text-red-500">{titleError}</p>}
            </div>
            <div className="flex items-center justify-between gap-2 px-1">
                <span className="flex items-center gap-1 text-xs text-gray-500">
                    {isPublic ? (
                        <Globe className="w-3.5 h-3.5" />
                    ) : (
                        <Lock className="w-3.5 h-3.5" />
                    )}
                    {isPublic ? '公開頁面' : '私密頁面'}
                </span>
                <button
                    type="button"
                    role="switch"
                    aria-checked={isPublic}
                    onClick={() => setIsPublic(!isPublic)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        isPublic ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isPublic ? 'translate-x-4' : 'translate-x-1'
                        }`}
                    />
                </button>
            </div>
            <DeviceSwitcher />
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setIsPreviewMode((prev) => !prev)}
                    className={`flex-1 flex items-center justify-center space-x-1.5 px-2 py-1.5 rounded-lg text-sm transition-colors ${
                        isPreviewMode
                            ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                >
                    {isPreviewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span>{isPreviewMode ? '編輯' : '預覽'}</span>
                </button>
                <SaveButton
                    status={status}
                    onClick={handleSave}
                    className="flex-1 rounded-lg shadow-md"
                />
            </div>
        </div>
    );
}
