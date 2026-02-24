import { DeviceIdEnums } from "../header/use-header"


interface PropertyBarProps {
    activeDevice: DeviceIdEnums
    selectedElement: string | null
}

export function PropertyBar ({ activeDevice , selectedElement }: PropertyBarProps){
    return (
        <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
                <span>100% 縮放</span>
                <span>•</span>
                <span>{activeDevice === 'desktop' ? '1920 x 1080' : activeDevice === 'tablet' ? '768 x 1024' : '375 x 812'}</span>
            </div>
            <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">已選擇: { selectedElement || '無'}</span>
            </div>
        </div>
    )
}