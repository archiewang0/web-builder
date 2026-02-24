


export function MarginInputs(){
    return (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">間距設定</label>
            
            <div className="grid grid-cols-2 gap-2">

                <div>
                    <label className="block text-xs text-gray-600 mb-1">上邊距</label>
                    <input 
                    type="number" 
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500"
                    defaultValue="24"
                    />
                </div>

                <div>
                    <label className="block text-xs text-gray-600 mb-1">下邊距</label>
                    <input 
                    type="number" 
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500"
                    defaultValue="24"
                    />
                </div>

                <div>
                    <label className="block text-xs text-gray-600 mb-1">左邊距</label>
                    <input 
                    type="number" 
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500"
                    defaultValue="24"
                    />
                </div>

                <div>
                    <label className="block text-xs text-gray-600 mb-1">右邊距</label>
                    <input 
                    type="number" 
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500"
                    defaultValue="24"
                    />
                </div>

            </div>
        </div>
    )
}