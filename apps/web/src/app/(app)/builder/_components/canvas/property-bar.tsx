import { useHeaderStore } from '@/store/use-header-store';
import { useSelectedElementStore } from '@/store/use-selected-element-store';

export function PropertyBar() {
    const activeDevice = useHeaderStore((state) => state.activeDevice);
    const selectedElement = useSelectedElementStore((state) => state.selectedElement);
    return (
        <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
                <span>
                    {activeDevice === 'desktop'
                        ? '1920 x 1080'
                        : activeDevice === 'tablet'
                          ? '768 x 1024'
                          : '375 x 812'}
                </span>
            </div>
            <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">已選擇: {selectedElement || '無'}</span>
            </div>
        </div>
    );
}
