import { create } from 'zustand';
import { DeviceIdEnums } from '../components/header/use-header';

interface HeaderStore {
    activeDevice: DeviceIdEnums;
    setActiveDevice: (id: DeviceIdEnums) => void;
    isPreviewMode: boolean;
    setIsPreviewMode: (value: boolean | ((prev: boolean) => boolean)) => void;
}

// Header 現在被提升到 layout 中渲染，與 builder 頁面（Canvas、Sidebar）不再是同一個
// React 子樹，無法再靠 useHeader() 的 local state + props 共享，改用 Zustand 讓兩邊直接讀寫。
export const useHeaderStore = create<HeaderStore>((set) => ({
    activeDevice: DeviceIdEnums.desktop,
    setActiveDevice: (id) => set({ activeDevice: id }),
    isPreviewMode: false,
    setIsPreviewMode: (value) =>
        set((state) => ({
            isPreviewMode: typeof value === 'function' ? value(state.isPreviewMode) : value,
        })),
}));
