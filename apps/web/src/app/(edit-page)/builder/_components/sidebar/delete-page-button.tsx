import { Trash2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { usePageTitleStore } from '@/store/use-page-title-store';
import { useDialogStore } from '@/store/use-dialog-store';
import { deletePageRequest } from '@/lib/delete-page';

// 跟 member 列表的刪除邏輯共用同一支 API（見 lib/delete-page）跟同一顆全域 GlobalDialog，
// 差別只在刪的是「正在編輯的這一份」，刪除成功後畫面已經沒東西可編輯，直接導回會員中心。
export function DeletePageButton() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const title = usePageTitleStore((state) => state.title);

    const handleClick = () => {
        useDialogStore.getState().open({
            title: '刪除網頁',
            description: `確定要刪除「${title}」嗎？此操作無法復原。`,
            confirmText: '確定刪除',
            danger: true,
            // 成功就導頁離開；失敗丟出 Error，讓 GlobalDialog 接住訊息、留在原地讓使用者重試。
            onConfirm: async () => {
                const result = await deletePageRequest(params.id);
                if (!result.ok) {
                    // 頁面本來就不存在（例如已經被刪過），沒東西可留在原地重試，直接導回列表。
                    if (result.error === 'Not found') {
                        router.push('/member');
                        return;
                    }
                    throw new Error(result.error);
                }
                router.push('/member');
            },
        });
    };

    return (
        <button
            onClick={handleClick}
            className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
        >
            <Trash2 className="w-4 h-4" />
            <span>刪除此網頁</span>
        </button>
    );
}
