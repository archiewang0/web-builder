import { create } from 'zustand';

// Google OAuth（OpenID Connect）userinfo 常見回傳欄位
export interface GoogleUserProfile {
    name: string;
    given_name: string;
    family_name: string;
    email: string;
    email_verified: boolean;
    picture: string;
    locale: string;
}

interface AuthStore {
    isLoggedIn: boolean;
    user: GoogleUserProfile | null;
    login: () => void;
    logout: () => void;
}

// TODO: 目前 login() 是假資料，之後接上真的 Google OAuth 時，
// 改成從 id token 或 userinfo endpoint 拿到的實際資料即可，欄位形狀不需要變。
const MOCK_GOOGLE_USER: GoogleUserProfile = {
    name: '王小明',
    given_name: '小明',
    family_name: '王',
    email: 'test@gmail.com',
    email_verified: true,
    picture: 'https://i.pravatar.cc/150?u=test@gmail.com',
    locale: 'zh-TW',
};

// 是否登入的全域狀態。Header 提升到 layout 中，裝置切換/預覽/儲存等功能只在登入後才顯示。
export const useAuthStore = create<AuthStore>((set) => ({
    isLoggedIn: false,
    user: null,
    login: () => set({ isLoggedIn: true, user: MOCK_GOOGLE_USER }),
    logout: () => set({ isLoggedIn: false, user: null }),
}));
