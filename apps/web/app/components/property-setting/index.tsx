import { Copy, Settings, Trash2 } from "lucide-react";
import { ElementEnums } from "../canvas/useCanvas";


interface PropertySettingProps {
    selectedElement:  ElementEnums | null

}

export function PropertySetting( {
        selectedElement
    } :PropertySettingProps){

    return <aside className="w-80 bg-white border-l border-gray-200 overflow-y-auto shadow-sm">
        <div className="p-4">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">屬性設定</h2>
            <div className="flex space-x-1">
            <button className="p-1 hover:bg-gray-100 rounded transition-colors" title="複製">
                <Copy className="w-4 h-4 text-gray-500" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded transition-colors" title="刪除">
                <Trash2 className="w-4 h-4 text-gray-500" />
            </button>
            </div>
        </div>
        
        {selectedElement ? (
            <div className="space-y-4">
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">元素類型</label>
                <div className="bg-gray-50 px-3 py-2 rounded border text-sm">
                {selectedElement === 'header' ? '標題區塊 (Header)' : '內容區塊 (Content)'}
                </div>
            </div>
            
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">文字內容</label>
                <textarea 
                    className="w-full px-3 py-2 bg-transparent border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                    rows={3}
                    defaultValue={selectedElement === 'header' ? '歡迎使用 Website Builder' : '內容區塊'}
                />
            </div>
            
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">字體大小</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm">
                <option>12px</option>
                <option>14px</option>
                <option>16px</option>
                <option>18px</option>
                <option>20px</option>
                <option>24px</option>
                <option>28px</option>
                <option>32px</option>
                <option>36px</option>
                </select>
            </div>
            
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
            </div>
        ) : (
            <div className="text-center py-12">
            <Settings className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm mb-2">選擇一個元素來編輯屬性</p>
            <p className="text-gray-400 text-xs">點擊畫布中的任何元素開始編輯</p>
            </div>
        )}
        </div>
    </aside>
}