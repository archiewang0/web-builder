import { create } from 'zustand';
import type { ReactNode } from 'react';

export interface DialogOptions {
    title: string;
    description?: string;
    /** description 下面、按鈕列上面的自訂內容（例如可點擊的發布連結）。 */
    content?: ReactNode;
    /** loading 模式：只顯示 spinner + title/description，沒有叉叉/按鈕，不能手動關閉——
     *  呼叫端要自己再呼叫一次 open() 換成最終畫面才會離開這個狀態。 */
    loading?: boolean;
    confirmText?: string;
    cancelText?: string;
    /** 右上角叉叉，預設顯示（loading 模式下永遠不顯示） */
    showClose?: boolean;
    /** 取消按鈕，預設顯示（loading 模式下永遠不顯示） */
    showCancel?: boolean;
    /** 確認按鈕改用紅色（危險操作，例如刪除） */
    danger?: boolean;
    onConfirm?: () => void | Promise<void>;
    onCancel?: () => void;
    onClose?: () => void;
}

interface DialogStore {
    options: DialogOptions | null;
    isConfirming: boolean;
    open: (options: DialogOptions) => void;
    handleConfirm: () => Promise<void>;
    handleCancel: () => void;
    handleClose: () => void;
}

// 任何地方都能直接 useDialogStore.getState().open({...}) 叫出彈窗，不用各自 import
// 一個 Dialog component、維護 isOpen/isDeleting 這類重複的 local state；
// GlobalDialog 統一掛在 root layout，全站共用同一顆彈窗實例。
export const useDialogStore = create<DialogStore>((set, get) => ({
    options: null,
    isConfirming: false,
    open: (options) => set({ options, isConfirming: false }),
    // onConfirm 丟出的 Error 會被接住，直接換成一顆「發生錯誤」的提示彈窗重新 open；
    // 沒丟出例外就視為成功，直接關閉——onConfirm 自己要負責成功後的導頁等後續動作。
    handleConfirm: async () => {
        const { options } = get();
        if (!options) return;
        set({ isConfirming: true });
        try {
            await options.onConfirm?.();
            set({ options: null, isConfirming: false });
        } catch (err) {
            const message = err instanceof Error ? err.message : '發生未知錯誤，請稍後再試';
            set({
                isConfirming: false,
                options: {
                    title: '發生錯誤',
                    description: message,
                    confirmText: '確認',
                    showCancel: false,
                },
            });
        }
    },
    handleCancel: () => {
        const { options } = get();
        options?.onCancel?.();
        set({ options: null, isConfirming: false });
    },
    handleClose: () => {
        const { options } = get();
        options?.onClose?.();
        set({ options: null, isConfirming: false });
    },
}));
