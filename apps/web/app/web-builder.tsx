'use client';

import React, { useState } from 'react';
import { 
  Type, 
  Image, 
  Square, 
  Layout, 
  Smartphone, 
  Monitor, 
  Tablet,
  Eye,
  Save,
  Download,
  Undo,
  Redo,
  Play,
  Settings,
  Layers,
  Palette,
  Move,
  Copy,
  Trash2,
  Plus
} from 'lucide-react';

interface Component {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
}

interface Device {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  width: string;
}

const WebsiteBuilderEditor = () => {
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [activeDevice, setActiveDevice] = useState<string>('desktop');
  
  const components: Component[] = [
    { id: 'text', name: '文字', icon: Type, category: '基礎' },
    { id: 'image', name: '圖片', icon: Image, category: '基礎' },
    { id: 'button', name: '按鈕', icon: Square, category: '基礎' },
    { id: 'container', name: '容器', icon: Layout, category: '佈局' },
  ];

  const devices: Device[] = [
    { id: 'desktop', name: '桌面', icon: Monitor, width: '100%' },
    { id: 'tablet', name: '平板', icon: Tablet, width: '768px' },
    { id: 'mobile', name: '手機', icon: Smartphone, width: '375px' },
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 頂部工具欄 */}
      <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-800">Website Builder</h1>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="撤銷">
              <Undo className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="重做">
              <Redo className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {devices.map((device) => (
            <button
              key={device.id}
              onClick={() => setActiveDevice(device.id)}
              className={`p-2 rounded-lg transition-colors ${
                activeDevice === device.id 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title={device.name}
            >
              <device.icon className="w-4 h-4" />
            </button>
          ))}
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            <Eye className="w-4 h-4" />
            <span className="text-sm">預覽</span>
          </button>
          <button className="flex items-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-md">
            <Save className="w-4 h-4" />
            <span className="text-sm">儲存</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* 左側組件面板 */}
        <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto shadow-sm">
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">組件庫</h2>
            
            <div className="space-y-1">
              {components.map((component) => (
                <div
                  key={component.id}
                  draggable
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-grab active:cursor-grabbing border border-gray-100 transition-all hover:shadow-sm"
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', component.id);
                  }}
                >
                  <component.icon className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-700">{component.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">頁面結構</h2>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer">
                <Layers className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Header</span>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 ml-4 cursor-pointer">
                <Type className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">標題文字</span>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer">
                <Layout className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Main Content</span>
              </div>
            </div>
          </div>
        </aside>

        {/* 中央畫布區域 */}
        <main className="flex-1 flex flex-col bg-gray-100">
          <div className="p-6 flex-1 flex items-center justify-center">
            <div 
              className="bg-white shadow-xl rounded-lg transition-all duration-300 min-h-[600px] overflow-hidden"
              style={{ 
                width: devices.find(d => d.id === activeDevice)?.width,
                maxWidth: '100%'
              }}
            >
              {/* 畫布內容區域 */}
              <div 
                className="relative h-full border-2 border-dashed border-gray-300 rounded-lg min-h-[600px]"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const componentId = e.dataTransfer.getData('text/plain');
                  console.log('Dropped component:', componentId);
                  // 這裡可以添加創建新元素的邏輯
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg font-medium">拖拽組件到這裡開始設計</p>
                    <p className="text-gray-400 text-sm mt-2">或點擊左側組件庫中的元素</p>
                  </div>
                </div>
                
                {/* 示例元素 */}
                <div className="absolute top-6 left-6 right-6 pointer-events-auto">
                  <div 
                    className={`bg-gradient-to-r from-blue-50 to-indigo-50 border-2 rounded-lg p-6 cursor-pointer transition-all hover:shadow-md ${
                      selectedElement === 'header' 
                        ? 'border-blue-400 shadow-lg ring-2 ring-blue-200' 
                        : 'border-blue-200 hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedElement('header')}
                  >
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">歡迎使用 Website Builder</h1>
                    <p className="text-gray-600">這是一個功能強大的網站編輯器，讓您輕鬆創建美麗的網站</p>
                  </div>
                </div>
                
                {/* 第二個示例元素 */}
                <div className="absolute top-40 left-6 right-6 pointer-events-auto">
                  <div 
                    className={`bg-white border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedElement === 'content' 
                        ? 'border-green-400 shadow-lg ring-2 ring-green-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedElement('content')}
                  >
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">內容區塊</h2>
                    <p className="text-gray-600 mb-4">您可以在這裡添加任何內容，包括文字、圖片、按鈕等等。</p>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                      了解更多
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 底部狀態欄 */}
          <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>100% 縮放</span>
              <span>•</span>
              <span>{activeDevice === 'desktop' ? '1920 x 1080' : activeDevice === 'tablet' ? '768 x 1024' : '375 x 812'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">已選擇: {selectedElement || '無'}</span>
            </div>
          </div>
        </main>

        {/* 右側屬性面板 */}
        <aside className="w-80 bg-white border-l border-gray-200 overflow-y-auto shadow-sm">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
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
      </div>
    </div>
  );
};

export default WebsiteBuilderEditor;
