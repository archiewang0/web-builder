import { Header } from '@/components/header';

// 這個 route group 只包含「網站建構工具」本身的頁面（首頁、gallery、member、builder）。
// /site/[id] 是使用者發布出去的「真實網頁」，刻意放在這個 group 之外，
// 這樣公開頁面就不會被套上 Header，看起來才會像一個獨立的真實網站，而不是還在編輯器裡。
export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Header />
            {children}
        </>
    );
}
