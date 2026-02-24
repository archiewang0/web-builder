import { Copy , Trash2 } from "lucide-react";

interface EditSchemaConstructorProps {
    onDelete: () => void;
}

export function EditSchemaConstructor({ onDelete }: EditSchemaConstructorProps) {
    return (
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">屬性設定</h2>
            <div className="flex space-x-1">
                <button className="p-1 hover:bg-gray-100 rounded transition-colors" title="複製">
                    <Copy className="w-4 h-4 text-gray-500" />
                </button>
                <button
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="刪除"
                    onClick={onDelete}
                >
                    <Trash2 className="w-4 h-4 text-gray-500" />
                </button>
            </div>
        </div>
    )
}