

interface FontColorProps {

}

export function FontColor({} : FontColorProps) {
    return(
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">顏色設定</label>
            <div className="space-y-2">
                <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-600 w-12">文字</span>
                    <div className="w-8 h-8 bg-gray-800 rounded border cursor-pointer"></div>
                    <input 
                        type="text" 
                        className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-xs"
                        defaultValue="#1f2937"
                        />
            </div>
            <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-600 w-12">背景</span>
                <div className="w-8 h-8 bg-blue-50 rounded border cursor-pointer"></div>
                <input 
                type="text" 
                className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-xs"
                defaultValue="#eff6ff"
                />
            </div>
            </div>
        </div>
    )
}