import { create } from 'zustand';

interface PageVisibilityStore {
    isPublic: boolean;
    setIsPublic: (isPublic: boolean) => void;
}

export const usePageVisibilityStore = create<PageVisibilityStore>((set) => ({
    isPublic: false,
    setIsPublic: (isPublic) => set({ isPublic }),
}));
