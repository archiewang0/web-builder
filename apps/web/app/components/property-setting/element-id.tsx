
interface ElementIdProps {
    id: string;
}

export function ElementId({ id }: ElementIdProps) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">元素 ID</label>
            <div className="bg-gray-50 px-3 py-2 rounded border text-sm text-gray-600">
                {id}
            </div>
        </div>
    )
}