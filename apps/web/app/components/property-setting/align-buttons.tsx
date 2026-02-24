



export function AlignButtons() {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">對齊方式</label>
            <div className="flex space-x-1">
            {['左對齊', '置中', '右對齊'].map((align, index) => (
                <button
                key={align}
                className={`flex-1 py-2 px-2 text-xs border rounded transition-colors ${
                    index === 0 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
                >
                {align}
                </button>
            ))}
            </div>
        </div>
    )
}