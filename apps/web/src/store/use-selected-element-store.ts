import { create } from 'zustand';

interface SelectedElementStore {
    selectedElement: string | null;
    setSelectedElement: (id: string | null) => void;
    // 文字元件的「選取（外層 outline）」跟「編輯（內層 focus 打字）」是兩個獨立狀態：
    // 選取只顯示外框、可以按 Delete 刪掉整個元素；要再點一次已選取的文字才會進入
    // editingElement，真正 focus 進去打字。跟 selectedElement 分開存，才能讓
    // text-element.tsx 判斷「這次點擊是要選取還是要進入編輯」。
    editingElement: string | null;
    setEditingElement: (id: string | null) => void;
}

// 每次點擊元素都會變動，且被畫布、屬性面板、結構樹等多層元件共用，
// 用 Zustand 讓深層元件可以直接訂閱，不必再逐層透過 props 傳遞。
export const useSelectedElementStore = create<SelectedElementStore>((set) => ({
    selectedElement: null,
    setSelectedElement: (id) =>
        set((state) => ({
            selectedElement: id,
            // 選到別的元素（或清空選取）時，殘留的編輯焦點要一起清掉，不然舊的文字
            // 元素還留在 contentEditable 狀態。id 沒變（重複點同一個已選取的元素）
            // 才保留原本的 editingElement。
            editingElement: id === state.editingElement ? state.editingElement : null,
        })),
    editingElement: null,
    setEditingElement: (id) => set({ editingElement: id }),
}));
