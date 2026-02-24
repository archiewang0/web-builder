import { Copy, Settings, Trash2 } from "lucide-react";

export function SelectedNone() {
    return (
        <div className="text-center py-12">
            <Settings className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm mb-2">選擇一個元素來編輯屬性</p>
            <p className="text-gray-400 text-xs">點擊畫布中的任何元素開始編輯</p>
        </div>
    )
}