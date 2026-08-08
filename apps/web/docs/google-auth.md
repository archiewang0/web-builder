# Google 登入（Auth.js / NextAuth v5）

登入功能用 [Auth.js](https://authjs.dev)（`next-auth@beta`，也就是 v5）接 Google OAuth，session 用 JWT 存在加密 cookie 裡，**沒有用資料庫**。

## 環境變數

`apps/web/.env.local`：

```
GOOGLE_CLIENT_ID="....apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-..."
AUTH_SECRET="任意一段隨機字串，用來加密 JWT"
```

`AUTH_SECRET` 可以用 `openssl rand -base64 33` 產生。三個變數本地跟正式站（Vercel 專案的 Environment Variables）都要各設一次。

### 申請 Google OAuth 憑證

1. [Google Cloud Console](https://console.cloud.google.com/) 建立/選一個專案。
2. **APIs & Services → OAuth consent screen**：User type 選 External，填基本資料，狀態留在 Testing，把自己的 Google 帳號加進 **Test users**（否則登入會被 Google 擋下來）。
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**：
   - Application type：Web application
   - Authorized JavaScript origins：`http://localhost:4000`
   - Authorized redirect URIs：`http://localhost:4000/api/auth/callback/google`
4. 拿到 Client ID / Client secret，填進 `.env.local`。
5. 部署到正式站時，回這裡**再加一組**正式網域的 origin/redirect URI（`https://你的網域/api/auth/callback/google`），本地跟正式站的網址不一樣要分開加，不然會出現 `redirect_uri_mismatch`。

## 架構

```
使用者按「使用 Google 帳號登入」
  │  signIn('google')  ── next-auth/react
  ▼
POST /api/auth/signin/google  （帶 CSRF token）
  │
  ▼
302 導到 accounts.google.com（Google 的登入/同意畫面）
  │  使用者同意授權
  ▼
Google 導回 /api/auth/callback/google?code=...
  │
  ▼
auth.ts 的 jwt callback：把 profile 裡的 given_name/family_name/... 存進 token
  │
  ▼
JWT 加密後存進 cookie（session strategy: 'jwt'，沒有資料庫）
  │
  ▼
之後每次請求，session callback 把 token 裡的欄位組回 session.user
  │
  ▼
useSession() / auth() 讀到的 session.user 就有完整 Google 資料
```

`middleware.ts` 會在每個請求先跑一次 `auth()`：`/builder` 沒登入就直接 307 導回 `/member`，不會讓頁面渲染出來，這是 server-side 的擋法，跟頁面自己判斷 `isLoggedIn` 不一樣（頁面渲染前就擋掉了）。

## 涉及的檔案

| 檔案 | 做什麼 |
|---|---|
| `app/lib/auth.ts` | Auth.js 設定：Google provider、JWT session、`jwt`/`session` callback（把 Google profile 的欄位搬進 session） |
| `app/api/auth/[...nextauth]/route.ts` | Auth.js 的標準 catch-all route，處理 `/api/auth/signin`、`/api/auth/callback/google`、`/api/auth/session` 等所有內建端點 |
| `middleware.ts` | `/builder` 的 server-side 登入檢查，沒登入導去 `/member` |
| `app/layout.tsx` | 包一層 `<SessionProvider>`，讓底下所有 client component 都能用 `useSession()` |
| `next-auth.d.ts` | TypeScript module augmentation，讓 `session.user` 多出 `given_name`/`family_name`/`email_verified`/`locale` 這幾個欄位的型別 |
| `app/components/header/index.tsx` | 右上角登入/登出按鈕、頭像 |
| `app/member/page.tsx` | 會員頁：沒登入顯示登入按鈕，登入後顯示完整 Google 帳號資料 |

## 如何在新的頁面/元件用登入狀態

**Client component：**

```tsx
'use client';
import { useSession, signIn, signOut } from 'next-auth/react';

function SomeComponent() {
    const { data: session, status } = useSession(); // status: 'loading' | 'authenticated' | 'unauthenticated'
    const user = session?.user; // { name, email, image, given_name, family_name, email_verified, locale }

    if (!session) {
        return <button onClick={() => signIn('google')}>登入</button>;
    }
    return <button onClick={() => signOut()}>登出（{user?.name}）</button>;
}
```

**Server component / route handler / middleware：**

```ts
import { auth } from '@/lib/auth';

const session = await auth();
if (!session) {
    // 沒登入
}
```

**要保護新的路由**：在 `middleware.ts` 的 `matcher` 陣列加上路徑就好，不需要在頁面裡各自判斷：

```ts
export const config = {
    matcher: ['/builder', '/新路徑'],
};
```

## ⚠️ 目前沒有做的事（之後要注意）

- **`/api/image/route.ts` 還沒有權限檢查**：現在只要知道 blob 的 `pathname` 任何人都能讀到圖片內容。之後應該在那條 route 裡加 `const session = await auth(); if (!session) return 401`（或更細的擁有者檢查）。
- **沒有資料庫、沒有使用者建立的網頁列表**：`member/page.tsx` 裡「我的網頁」那塊還是靜態的 TODO，要接資料庫才能真的列出使用者建立過的頁面。
- **只有 JWT session，沒有 remember-me / 多裝置登出等進階功能**：這些通常需要資料庫存 session 才好做，目前不需要就先不做。

## 常見問題

- **`Server error / problem with server configuration`**：這是 Auth.js 把很多種內部錯誤都包成同一個通用訊息，真正原因要看 **執行 `pnpm dev` 那個終端機視窗** 的 log（不是瀏覽器畫面）。常見原因：`AUTH_SECRET` 沒設、`GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` 是空的或打錯、`callbacks` 裡的程式碼丟出例外。
- **Google 頁面顯示 `redirect_uri_mismatch`**：Google Cloud Console 裡的 Authorized redirect URIs 跟目前網址對不上，檢查通訊協定（http/https）、port、路徑是否完全一致。
- **改了 `.env.local` 沒有生效**：Next.js 只在啟動時讀取 `.env.local`，改完要重啟 `pnpm dev`。
