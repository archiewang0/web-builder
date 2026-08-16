import { create } from 'zustand';

interface PageTitleStore {
    title: string;
    setTitle: (title: string) => void;
}

export const usePageTitleStore = create<PageTitleStore>((set) => ({
    title: '',
    setTitle: (title) => set({ title }),
}));
