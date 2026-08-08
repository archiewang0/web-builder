# Vercel Blob 圖片上傳

專案裡的圖片（`ImageContentSetting` 上傳圖片、`BackgroundSetting` 的背景圖片）都是透過 Vercel Blob 的 **private access + client upload** 方式儲存，不是存成 base64 塞進 schema。

## 環境變數

`apps/web/.env.local`：

```
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
```

在 [Vercel Dashboard](https://vercel.com/dashboard) 的專案 → Storage 分頁建立一個 Blob store，會自動幫你產生這個 token。本地開發跟正式部署（Vercel 專案的 Environment Variables）都要各設一次。

## 架構

```
瀏覽器選檔案
  │
  ▼
use-image-upload.ts ──upload()──▶ Vercel Blob 儲存空間（直接上傳，不經過我們的 server）
  │                                        │
  │ (先跟 /api/upload 換一次性 token)        │ access: 'private'
  ▼                                        ▼
/api/upload/route.ts                  回傳 { pathname, url, ... }
(用 BLOB_READ_WRITE_TOKEN 簽發 token)        │
                                              ▼
                             content = /api/image?pathname=<pathname>
                                              │
                                              ▼
                                    <img src="/api/image?pathname=...">
                                              │
                                              ▼
                                    /api/image/route.ts
                                    用 get(pathname, {access:'private'}) 讀回來 stream 給瀏覽器
```

**為什麼是 client upload（瀏覽器直接傳到 Blob，不經過我們的 API）？**
Vercel Function 的 request body 上限是 4.5MB，圖片檔案很容易超過。Client upload 讓瀏覽器直接把檔案傳到 Blob 儲存空間，我們的 server 只負責「簽發一次性上傳授權」，不會經手檔案內容，不受這個限制。

**為什麼是 private access（不是直接用 Blob 的 CDN 網址）？**
Private blob 的網址無法被瀏覽器直接讀取，一定要經過我們自己的 server（用 `BLOB_READ_WRITE_TOKEN`）才能讀到內容。所以 `content`/`backgroundImage` 存的不是 Blob 原始網址，而是我們自己的 `/api/image?pathname=...`，畫面上的 `<img>` 打的也是這條路由，由它去跟 Blob 拿檔案再轉發回來。

## 涉及的檔案

| 檔案 | 做什麼 |
|---|---|
| `app/api/upload/route.ts` | `handleUpload()`：驗證/簽發客戶端上傳授權（限制檔案類型為圖片） |
| `app/api/image/route.ts` | `get(pathname, {access:'private'})`：把私有 blob 的內容 stream 回瀏覽器 |
| `app/builder/_components/property-setting/image-setting/use-image-upload.ts` | 客戶端 hook，呼叫 `upload()` 直接把檔案送到 Blob，成功後回傳 `/api/image?pathname=...` |
| `app/builder/_components/property-setting/image-setting/image-url-input.tsx` | UI：網址輸入框 + 上傳按鈕（`上傳中...`/錯誤訊息），背景圖片跟圖片元件共用這個元件 |
| `app/builder/_components/property-setting/image-setting/use-image-meta.ts` | 讀圖算出寬高跟格式，顯示在輸入框下面 |

## 如何在新的地方接上傳圖片功能

如果之後要在別的地方（例如某個新元件）也做「上傳圖片 / 貼網址」：

```tsx
import { ImageUrlInput } from '@/builder/_components/property-setting/image-setting/image-url-input';

<ImageUrlInput
    value={someUrl}
    onChange={(url) => setSomeUrl(url)} // url 可能是 https://... 或 /api/image?pathname=...
/>
```

`ImageUrlInput` 內部已經包好了 `useImageUpload`（上傳）跟 `useImageMeta`（顯示尺寸/格式），不需要自己重新兜一套上傳邏輯。

如果要在別的 API route 也需要讀某個 private blob 的內容（不是透過 `<img>`），直接呼叫 `@vercel/blob` 的 `get(pathname, { access: 'private' })`，拿到的 `result.stream` 是 `ReadableStream`，可以直接塞進 `new Response(stream, {...})`（`/api/image/route.ts` 就是這樣做的）。

## ⚠️ 目前沒有做的事（之後要注意）

- **權限驗證**：`/api/image/route.ts` 目前只要知道 `pathname` 就能讀到內容，沒有檢查呼叫者是不是圖片的擁有者。等有真正的登入 session（見 `google-auth.md`）之後，應該在這裡加一段 `auth()` 檢查。
- **刪除孤兒檔案**：使用者換圖或刪除元素時，舊的 blob 不會被清掉，長期會佔用 storage 空間。之後要在「存檔」那個時間點做差異比對，把不再被引用的 blob 呼叫 `del()` 清掉。
- **重複上傳去重**：同一張圖片被上傳多次會產生多份 blob。之後可以用檔案內容的 hash 當作 `pathname`，上傳前先檢查是否已存在。

## 常見問題

- **上傳按鈕卡在「上傳中...」不動 / 一開始就失敗**：先確認 `BLOB_READ_WRITE_TOKEN` 有正確設在 `apps/web/.env.local`（注意是放在 `apps/web/` 底下，不是 repo 根目錄），並重啟 dev server 讓新的環境變數生效。
- **圖片一直讀不出來（`/api/image` 回 404）**：`pathname` 可能打錯或圖片已經被刪除，檢查 `content`/`backgroundImage` 裡存的 `pathname` 跟 Vercel Dashboard 裡 Blob store 實際的檔案是否對得上。
