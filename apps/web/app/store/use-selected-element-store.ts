import { create } from 'zustand';

interface SelectedElementStore {
    selectedElement: string | null;
    setSelectedElement: (id: string | null) => void;
}

// 每次點擊元素都會變動，且被畫布、屬性面板、結構樹等多層元件共用，
// 用 Zustand 讓深層元件可以直接訂閱，不必再逐層透過 props 傳遞。
export const useSelectedElementStore = create<SelectedElementStore>((set) => ({
    selectedElement: null,
    setSelectedElement: (id) => set({ selectedElement: id }),
}));
