import { Eye, Monitor, Redo, Save, Smartphone, Tablet, Undo } from "lucide-react";
import { Dispatch , SetStateAction } from "react";
import { DeviceIdEnums } from "./useHeader";


export interface Device {
  id: DeviceIdEnums;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  width: string;
}

interface HeaderProps {
    activeDevice: DeviceIdEnums
    setActiveDevice: Dispatch<SetStateAction<DeviceIdEnums>>
    devices: Device[]
}

// 頂部工具欄
export function Header ({ activeDevice , setActiveDevice , devices}: HeaderProps){
    
    return (
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
    )
}