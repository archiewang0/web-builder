import { create } from 'zustand';

interface PendingUploadStore {
    // blob: 預覽網址 → 對應的原始檔案。純粹是儲存時要用的暫存清單，
    // 不屬於 schema（File 物件無法序列化），所以獨立成一個 store。
    pending: Map<string, File>;
    register: (blobUrl: string, file: File) => void;
    remove: (blobUrl: string) => void;
}

export const usePendingUploadStore = create<PendingUploadStore>((set) => ({
    pending: new Map(),

    register: (blobUrl, file) =>
        set((state) => {
            const next = new Map(state.pending);
            next.set(blobUrl, file);
            return { pending: next };
        }),

    remove: (blobUrl) =>
        set((state) => {
            const next = new Map(state.pending);
            next.delete(blobUrl);
            return { pending: next };
        }),
}));
