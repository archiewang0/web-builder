import classNames from 'classnames';
import { Save } from 'lucide-react';
import { SAVE_LABEL, type SaveStatus } from './use-save-page';

interface SaveButtonProps {
    status: SaveStatus;
    onClick: () => void;
    className?: string;
}

// Toolbar（編輯模式）跟 PreviewFloatingControls（預覽模式）的儲存按鈕狀態文字／行為一致，
// 差別只在 onClick（後者存檔成功後還要另開分頁）跟外觀尺寸，共用同一顆按鈕、各自傳 handler／className 進來。
// className 只放版型相關（rounded-*／shadow-*／flex-1），跟 base 的屬性不重疊，才不會有 Tailwind class 覆蓋順序的問題。
export function SaveButton({ status, onClick, className }: SaveButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={status === 'saving'}
            className={classNames(
                'flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                className
            )}
        >
            <Save className="w-4 h-4" />
            <span>{SAVE_LABEL[status]}</span>
        </button>
    );
}
