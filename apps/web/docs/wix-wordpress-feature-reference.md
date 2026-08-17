# Wix / WordPress 功能參考

整理 Wix 和 WordPress（含 Gutenberg）裡值得參考的功能，作為未來規劃 Web Builder 新功能時的參考清單，不是要照抄，是拿來對照「別人怎麼解類似的問題」。每項附上大致對應到目前專案的哪個模組，方便評估切入點。

## 版面編輯

### 區塊式編輯 + 智慧對齊（Wix）
畫布拆成 Section，元素在區塊內拖曳時會自動吸附對齊（跟其他元素邊緣、間距對齊），比純自由定位更容易排出整齊版面。
對應：`builder/_components/canvas`、`use-canvas-drop.tsx`。

### 每裝置獨立樣式覆寫（Wix）
桌面/平板/手機三種預覽各自可以微調樣式，不是單純等比縮放，而是每個 breakpoint 有自己的一份樣式覆寫。
對應：`property-setting`、目前的 `activeDevice` 狀態；需要擴充 schema 讓每個元素的樣式可以依裝置分層儲存。

### 可重複使用區塊 / Patterns（WordPress Gutenberg）
使用者可以把一組元件（例如一個 Header 區塊）存成模板，之後在其他頁面重複插入，编辑其中一個複本不影響其他複本；另有「synced pattern」是所有複本連動更新。
對應：`sidebar/page-structure.tsx`、`use-save-page.ts`；需要額外的「範本庫」schema 和儲存位置。

### Repeater / 動態清單綁定資料（Wix）
一個容器可以綁定一組資料（例如商品列表），容器內的排版套用到每一筆資料上，而不用手動複製貼上元素。
對應：目前 `ContainerElementSchema` 是靜態 children，這個功能需要引入「資料來源」概念，複雜度較高，適合排在後面評估。

## 樣式系統

### 全站設計 Token（WordPress `theme.json` 全站樣式）
色票、字級、間距定義成全站共用的 token，套用到所有元素的預設值，改一個 token 全站跟著變，而不是每個元素各自寫死顏色。
對應：`font-setting`、`background-setting`、`color-swatch.tsx`；目前顏色/字型是每個元素各自選色，可以考慮加一層「全站色票」讓元素優先選 token 而不是自訂色。

## 互動與動效

### 進場動畫 / 捲動觸發動效（Wix）
元素進入可視範圍時觸發淡入、滑入等動畫，設定介面通常是「選動畫類型 + 選觸發時機」的下拉選單。
對應：可以在 `property-setting` 新增一個「動效」分頁，實際渲染時對應到 CSS animation/Intersection Observer。

## SEO 與發布

### 單頁 SEO 設定面板（Wix / WordPress SEO 外掛慣例）
每個頁面可以個別設定 meta title、description、OG 圖片、網址 slug，不用改程式碼。
對應：`site/[id]/page.tsx` 的 `generateMetadata`、`lib/db/schema.ts` 的 `pages` table；目前 title 已經有欄位，缺 description / OG image / 自訂 slug。

### 網站版本歷史 / 還原（Wix 網站歷史、WordPress 修訂版本）
每次儲存都留一份快照，可以瀏覽並還原到之前的版本。
對應：`use-save-page.ts`；目前應該是直接覆寫 `schema`，要做版本歷史需要另開一張 table 存歷史快照。

## 表單與資料收集

### 內建表單元件（Wix Forms / WordPress Contact Form 7）
拖曳一個「表單」元件到頁面上，可以設定欄位（文字、Email、下拉選單），送出後蒐集到後台或轉寄 Email，不用自己接第三方表單服務。
對應：目前元件只有文字/圖片/按鈕/容器，表單是全新的元件類型，且需要一張新的 table 存送出的內容。

## 範本與快速起始

### 範本庫 / AI 快速產生頁面（Wix ADI、WordPress 佈景主題起始範本）
使用者建立新頁面時，可以從一批現成範本挑一個開始改，而不是從空白畫布開始。
對應：`gallery/page.tsx`、`create-page-button.tsx`；概念上是「複製一份範本 schema 當作新頁面的初始 schema」，實作成本相對低，可以優先評估。

---

## 排優先順序時的判斷方式

- **複雜度低、對現有 schema 改動小**：全站設計 Token、單頁 SEO 欄位、範本庫快速起始 —— 這幾個可以先做。
- **複雜度中，需要擴充 schema 結構**：每裝置獨立樣式覆寫、可重複使用區塊、版本歷史。
- **複雜度高，需要新的資料模型或渲染邏輯**：Repeater 動態清單、表單元件、捲動動效。

實際要做哪個，還是取決於當下使用者最需要什麼，這份清單只是列出「有這些選項可以考慮」。
