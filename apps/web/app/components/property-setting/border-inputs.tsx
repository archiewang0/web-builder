



export function BorderInputs() {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">邊框設定</label>
            <div className="space-y-2">
            <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-600 w-12">寬度</span>
                <input 
                type="number" 
                className="w-16 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500"
                defaultValue="2"
                min="0"
                />
                <span className="text-xs text-gray-500">px</span>
            </div>
            <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-600 w-12">圓角</span>
                <input 
                type="number" 
                className="w-16 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500"
                defaultValue="8"
                min="0"
                />
                <span className="text-xs text-gray-500">px</span>
            </div>
            </div>
        </div>
    )
}