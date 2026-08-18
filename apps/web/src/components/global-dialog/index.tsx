'use client';

import classNames from 'classnames';
import { X } from 'lucide-react';
import { useDialogStore } from '@/store/use-dialog-store';

// 掛在 root layout，全站共用；平時 options 是 null 直接回傳 null，
// 不會多渲染任何 DOM，只有呼叫 useDialogStore.getState().open() 之後才出現。
// 需要 'use client' 是因為要讀取 zustand store 的即時狀態，但這只影響這個檔案本身
// 會被打進 client bundle——它的 parent（layout.tsx）仍然是 Server Component，
// Server Component 本來就可以把 Client Component 當子節點渲染，不會被「傳染」變成 client。
export function GlobalDialog() {
    const options = useDialogStore((state) => state.options);
    const isConfirming = useDialogStore((state) => state.isConfirming);
    const handleConfirm = useDialogStore((state) => state.handleConfirm);
    const handleCancel = useDialogStore((state) => state.handleCancel);
    const handleClose = useDialogStore((state) => state.handleClose);

    if (!options) return null;

    const {
        title,
        description,
        confirmText = '確定',
        cancelText = '取消',
        showClose = true,
        showCancel = true,
        danger = false,
    } = options;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            role="dialog"
            aria-modal="true"
            onClick={handleCancel}
        >
            <div
                className="relative bg-white rounded-lg shadow-lg border border-gray-200 p-6 w-full max-w-sm"
                onClick={(e) => e.stopPropagation()}
            >
                {showClose && (
                    <button
                        onClick={handleClose}
                        aria-label="關閉"
                        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}

                <h3 className="text-base font-semibold text-gray-800 pr-6">{title}</h3>
                {description && <p className="mt-2 text-sm text-gray-500">{description}</p>}

                <div className="mt-6 flex justify-end gap-2">
                    {showCancel && (
                        <button
                            onClick={handleCancel}
                            disabled={isConfirming}
                            className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        onClick={handleConfirm}
                        disabled={isConfirming}
                        className={classNames(
                            'text-sm px-3 py-1.5 rounded-lg text-white transition-colors disabled:opacity-50',
                            danger ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                        )}
                    >
                        {isConfirming ? '處理中...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
