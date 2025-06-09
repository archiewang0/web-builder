# Website Builder - Turborepo Edition

這是一個基於 React、Next.js 和 Tailwind CSS 的現代化網站編輯器，部署在 Turborepo monorepo 架構中。

## 🏗️ 專案架構

```
my-turborepo/
├── apps/
│   └── web/                          # Next.js 應用
│       ├── app/
│       │   ├── web-builder.tsx       # 主要編輯器組件
│       │   ├── builder/
│       │   │   └── page.tsx          # 獨立編輯器頁面
│       │   ├── globals.css           # 全域樣式 + Tailwind
│       │   └── page.tsx              # 主頁面
│       ├── tailwind.config.js        # Tailwind 配置
│       └── postcss.config.js         # PostCSS 配置
└── packages/                         # 共享套件
```

## 🚀 安裝與啟動

### 1. 安裝依賴

在 monorepo 根目錄執行：

```bash
# 安裝所有依賴
pnpm install

# 或者只為 web app 安裝 Tailwind
pnpm --filter web add -D tailwindcss postcss autoprefixer
```

### 2. 啟動開發伺服器

```bash
# 在根目錄啟動所有應用
pnpm dev

# 或只啟動 web app
pnpm --filter web dev
```

### 3. 訪問應用

- 主頁面 (包含 Website Builder): http://localhost:3000
- 獨立編輯器頁面: http://localhost:3000/builder

## ✨ 功能特色

### 🎨 編輯器功能
- **拖拽式組件庫**: 支援文字、圖片、按鈕、容器組件
- **響應式預覽**: 桌面、平板、手機三種裝置檢視
- **即時屬性編輯**: 文字、顏色、間距、對齊方式等
- **頁面結構樹**: 清楚的元素層級管理
- **撤銷/重做**: 操作歷史記錄

### 🎯 UI/UX 設計
- **現代化介面**: 使用 Tailwind CSS 的專業設計
- **直觀操作**: 滑鼠懸停效果和視覺回饋
- **響應式佈局**: 適應不同螢幕尺寸
- **美觀動畫**: 流暢的過渡效果

## 🛠️ 技術棧

- **Frontend**: React 19, Next.js 15
- **樣式**: Tailwind CSS 3.3
- **圖示**: Lucide React
- **建構工具**: Turborepo
- **套件管理**: pnpm
- **TypeScript**: 完整型別支援

## 📦 Monorepo 架構優勢

### 依賴共享
```bash
# 為特定 app 安裝套件
pnpm --filter web add <package-name>

# 安裝開發依賴
pnpm --filter web add -D <package-name>
```

### Turbo 快取
- 快速建構和測試
- 增量建構支援
- 智慧快取機制

### 共享 UI 組件
- `@repo/ui` 套件提供共享組件
- 一致的設計系統
- 跨專案重用

## 🎨 客製化

### 修改 Tailwind 主題
編輯 `apps/web/tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          // 自定義主色調
        }
      }
    }
  }
}
```

### 添加新組件
1. 在 `packages/ui/src/` 創建新組件
2. 在 `web-builder.tsx` 中引入使用
3. 更新組件庫列表

### 自定義樣式
在 `globals.css` 中添加 CSS 類別：

```css
@layer components {
  .custom-button {
    @apply bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded;
  }
}
```

## 🚦 開發指南

### 添加新功能
1. 在 `web-builder.tsx` 中添加 state 和處理函數
2. 更新相關的 UI 組件
3. 測試響應式行為

### 元件狀態管理
```typescript
// 範例：添加新的編輯器狀態
const [selectedElement, setSelectedElement] = useState<string | null>(null);
const [canvasElements, setCanvasElements] = useState<ElementType[]>([]);
```

### 樣式最佳實踐
- 使用 Tailwind 的 utility classes
- 保持一致的間距系統
- 適當使用 hover 和 focus 狀態

## 🧪 測試

```bash
# 執行所有測試
pnpm test

# 執行特定 app 的測試
pnpm --filter web test

# 型別檢查
pnpm check-types
```

## 📈 效能優化

- **程式碼分割**: Next.js 自動分割
- **圖片優化**: Next.js Image 組件
- **CSS 優化**: Tailwind CSS 移除未使用樣式
- **快取策略**: Turborepo 智慧快取

## 🔧 故障排除

### 常見問題

1. **Tailwind 樣式不生效**
   - 確認 `tailwind.config.js` 的 content 路徑正確
   - 檢查 `globals.css` 是否包含 Tailwind directives

2. **組件無法拖拽**
   - 確認瀏覽器支援 Drag and Drop API
   - 檢查事件處理函數是否正確綁定

3. **建構錯誤**
   - 執行 `pnpm install` 重新安裝依賴
   - 清除 `.next` 和 `.turbo` 快取資料夾

## 🤝 貢獻

歡迎提交 Pull Request 和 Issue！

## 📄 授權

MIT License
