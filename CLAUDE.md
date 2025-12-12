# Web Builder 專案架構文件

> 本文件為 Web Builder 專案的完整架構說明，提供給 AI 助理（如 Claude）理解專案結構、技術棧和開發流程。

## 專案概述

Web Builder 是一個基於 **Turborepo Monorepo** 架構的現代化網站建構工具，提供拖拽式編輯器，讓使用者能夠視覺化地建立和設計網站。

### 核心特性

- 🎨 **拖拽式編輯器**：支援文字、圖片、按鈕、容器等組件
- 📱 **響應式預覽**：桌面、平板、手機三種裝置視圖
- ⚡ **即時編輯**：屬性面板即時修改組件樣式
- 🌲 **結構樹狀視圖**：清晰呈現頁面元素層級
- ↩️ **撤銷/重做**：完整的操作歷史記錄
- 🎯 **元素選擇高亮**：視覺化選中元素

---

## 技術棧

### 核心框架

| 技術 | 版本 | 說明 |
|------|------|------|
| **Next.js** | 15.3.0 | React 框架，支援 App Router 和 Turbopack |
| **React** | 19.1.0 | UI 組件庫 |
| **TypeScript** | 5.8.2 | 靜態類型系統 |
| **Tailwind CSS** | 3.3.0 | Utility-first CSS 框架 |
| **Turborepo** | 2.5.3 | Monorepo 建置系統 |
| **PNPM** | 9.0.0 | 套件管理工具 |

### UI 與樣式

- **Tailwind CSS 3.3.0** - 主要樣式框架
- **PostCSS** - CSS 後處理
- **Autoprefixer** - 自動添加 CSS 前綴
- **Lucide React 0.511.0** - 現代化圖示庫
- **CSS Modules** - 組件級樣式隔離

### 開發工具

- **ESLint 9.26.0** - 程式碼品質檢查
- **Prettier 3.5.3** - 程式碼格式化
- **@turbo/gen** - 代碼生成工具

---

## 專案結構

```
web-builder/
├── apps/
│   ├── web/                    # 主要應用：Web Builder 編輯器
│   │   ├── app/
│   │   │   ├── page.tsx        # 首頁
│   │   │   ├── layout.tsx      # 根佈局
│   │   │   ├── globals.css     # 全域樣式 + Tailwind
│   │   │   ├── page.module.css # 頁面樣式 (CSS Modules)
│   │   │   ├── builder/        # 獨立編輯器頁面
│   │   │   │   ├── page.tsx    # Builder 路由頁面
│   │   │   │   └── web-builder.tsx # 核心編輯器組件 (50 行)
│   │   │   └── components/     # 編輯器組件模組
│   │   │       ├── header/     # 頂部工具欄模組
│   │   │       │   ├── index.tsx      # Header 組件 (70 行)
│   │   │       │   └── useHeader.tsx  # Header Hook (32 行)
│   │   │       ├── sidebar/    # 左側組件面板模組
│   │   │       │   ├── index.tsx      # Sidebar 組件 (49 行)
│   │   │       │   └── useSidebar.tsx # Sidebar Hook (30 行)
│   │   │       ├── canvas/     # 中央畫布模組
│   │   │       │   ├── index.tsx      # Canvas 組件 (95 行)
│   │   │       │   └── useCanvas.tsx  # Canvas Hook (16 行)
│   │   │       ├── property-setting/ # 右側屬性面板模組
│   │   │       │   └── index.tsx      # PropertySetting 組件 (176 行)
│   │   │       ├── toggle.tsx         # 切換開關組件
│   │   │       ├── password-input.tsx # 密碼輸入組件
│   │   │       ├── components.tsx     # 組件定義
│   │   │       └── test.tsx           # 測試組件
│   │   ├── public/             # 靜態資源
│   │   └── package.json
│   └── docs/                   # 文檔展示應用
│       ├── app/
│       └── package.json
├── packages/
│   ├── ui/                     # 共享 UI 組件庫
│   │   ├── src/
│   │   │   ├── button.tsx      # 按鈕組件
│   │   │   ├── card.tsx        # 卡片組件
│   │   │   └── code.tsx        # 程式碼展示組件
│   │   ├── turbo/generators/   # Turbo 代碼生成器
│   │   └── package.json
│   ├── eslint-config/          # 共享 ESLint 配置
│   │   ├── base.js
│   │   ├── next.js
│   │   └── react-internal.js
│   ├── typescript-config/      # 共享 TypeScript 配置
│   │   ├── base.json
│   │   ├── nextjs.json
│   │   └── react-library.json
│   └── example/                # 示例工具庫
│       └── src/index.ts
├── turbo.json                  # Turborepo 配置
├── pnpm-workspace.yaml         # PNPM Workspace 配置
├── package.json                # 根 package.json
└── tsconfig.json               # 根 TypeScript 配置
```

---

## 核心模組說明

### 1. Web Builder 編輯器 (`/apps/web`)

#### 主編輯器組件

**檔案位置**: `/apps/web/app/web-builder.tsx` (391 行)

**功能模組**:

1. **組件面板** (左側)
   - 文字組件 (Type icon)
   - 圖片組件 (Image icon)
   - 按鈕組件 (Square icon)
   - 容器組件 (Layout icon)
   - 支援拖拽到畫布

2. **畫布區域** (中間)
   - 響應式預覽框
   - 拖放目標區域
   - 元素選擇高亮
   - 視覺化編輯

3. **屬性面板** (右側)
   - 元素屬性編輯
   - 樣式調整
   - 內容修改

4. **頁面結構** (右側下方)
   - 樹狀結構視圖
   - 元素層級展示
   - 快速選擇元素

5. **裝置預覽切換** (頂部)
   - 桌面 (100% width)
   - 平板 (768px width)
   - 手機 (375px width)

**狀態管理**:
```typescript
- selectedElement: 當前選中的元素
- activeDevice: 當前預覽裝置類型
```

#### 路由結構

- `/` - 主頁，顯示 Web Builder 編輯器
- `/builder` - 獨立編輯器頁面

#### 樣式架構

**全域樣式** (`globals.css`, 73 行):
- Tailwind CSS directives
- 深色模式支援
- 自定義組件類別:
  - `.drag-handle` - 拖拽手把樣式
  - `.element-selected` - 選中元素高亮

**頁面樣式** (`page.module.css`, 188 行):
- CSS Modules 方式
- 頁面特定樣式

**Tailwind 配置** (`tailwind.config.cjs`):
- 內容路徑：app、pages、components、UI 包
- 自定義主色調 (藍色系列)
- 自定義字體：Inter、Nunito

### 2. UI 組件庫 (`/packages/ui`)

**共享組件**:

1. **Button** (`button.tsx`, 20 行)
   - 用戶端組件 (`"use client"`)
   - 支援自定義 className 和 appName
   - 點擊事件處理

2. **Card** (`card.tsx`, 27 行)
   - 卡片容器組件
   - 支援標題、內容、連結

3. **Code** (`code.tsx`, 11 行)
   - 程式碼展示組件
   - 支援自定義樣式

**導出配置**:
```json
{
  "exports": {
    "./*": "./src/*.tsx"
  }
}
```

**使用方式**:
```typescript
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
```

### 3. 共享配置套件

#### TypeScript 配置 (`/packages/typescript-config`)

- **base.json** - 基礎配置
  ```json
  {
    "compilerOptions": {
      "lib": ["es2022", "DOM", "DOM.Iterable"],
      "module": "NodeNext",
      "moduleResolution": "NodeNext",
      "strict": true,
      "target": "ES2022"
    }
  }
  ```

- **nextjs.json** - Next.js 應用配置
  - 繼承 base.json
  - App Router 支援

- **react-library.json** - React 庫配置
  - JSX 處理：react-jsx

#### ESLint 配置 (`/packages/eslint-config`)

- **base.js** - 基礎 ESLint + TypeScript 配置
- **next.js** - Next.js + React 完整配置
- **react-internal.js** - React 特定配置

**集成插件**:
- @eslint/js
- typescript-eslint
- eslint-plugin-turbo
- eslint-plugin-react
- eslint-plugin-react-hooks
- @next/eslint-plugin-next
- eslint-config-prettier
- eslint-plugin-only-warn

---

## Turborepo 配置

### 任務配置 (`turbo.json`)

```json
{
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "check-types": {
      "dependsOn": ["^check-types"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

**任務說明**:
- **build** - 建置所有應用，自動處理依賴順序
- **dev** - 開發模式，不使用快取，持續運行
- **lint** - ESLint 檢查，依賴順序執行
- **check-types** - TypeScript 類型檢查

---

## 開發工作流

### 常用指令

#### 根目錄指令

```bash
# 啟動所有應用（開發模式）
pnpm dev

# 建置所有應用
pnpm build

# ESLint 檢查
pnpm lint

# Prettier 格式化
pnpm format

# TypeScript 類型檢查（所有專案）
pnpm check-types

# TypeScript 類型檢查（僅 Web 應用）
pnpm check-type:web
```

#### 針對特定應用執行

```bash
# 啟動 Web 應用（port 3000，使用 Turbopack）
pnpm --filter web dev

# 建置 Web 應用
pnpm --filter web build

# 生產模式啟動 Web 應用
pnpm --filter web start

# Web 應用 ESLint 檢查
pnpm --filter web lint

# Web 應用類型檢查
pnpm --filter web check-types
```

#### UI 組件開發

```bash
# 生成新的 UI 組件（使用 Turbo Generator）
pnpm --filter ui generate:component
```

### 開發模式啟動流程

1. 確保 Node.js >= 18
2. 安裝依賴：`pnpm install`
3. 啟動開發伺服器：`pnpm dev`
4. 開啟瀏覽器：`http://localhost:3000`

### 建置流程

```bash
# 1. 類型檢查
pnpm check-types

# 2. ESLint 檢查
pnpm lint

# 3. 建置
pnpm build

# 4. 啟動生產伺服器
pnpm --filter web start
```

---

## 依賴關係圖

```
apps/web
├── @repo/ui (共享 UI 組件)
├── @repo/example (示例套件)
├── @repo/eslint-config (ESLint 配置)
└── @repo/typescript-config (TypeScript 配置)

apps/docs
├── @repo/ui (共享 UI 組件)
├── @repo/eslint-config (ESLint 配置)
└── @repo/typescript-config (TypeScript 配置)

packages/ui
├── @repo/eslint-config (ESLint 配置)
├── @repo/typescript-config (TypeScript 配置)
└── @turbo/gen (代碼生成器)
```

---

## 代碼生成工具

### Turbo Generator

**位置**: `/packages/ui/turbo/generators/`

**功能**: 自動生成 React 組件模板

**使用方式**:
```bash
pnpm --filter ui generate:component
```

**生成內容**:
- 組件檔案 (`src/[component-name].tsx`)
- 自動更新 `package.json` 的 exports 欄位

**模板檔案**: `component.hbs` (Handlebars 模板)

---

## 環境配置

### Node.js 版本需求

```json
{
  "engines": {
    "node": ">=18"
  }
}
```

### 套件管理器

**PNPM 9.0.0**

優勢：
- 快速安裝速度
- 節省磁碟空間（符號連結機制）
- 嚴格的依賴管理

### Workspace 配置

**`pnpm-workspace.yaml`**:
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

---

## 程式碼風格與規範

### Prettier 配置

**位置**: 根目錄 (隱式配置或 `.prettierrc`)

**作用**: 統一程式碼格式化

### ESLint 配置

**使用方式**:
```javascript
// apps/web/eslint.config.js
import { nextJsConfig } from "@repo/eslint-config/next-js";
export default nextJsConfig;
```

**檢查項目**:
- TypeScript 類型錯誤
- React Hooks 規則
- Next.js 最佳實踐
- 程式碼風格問題
- Turborepo 特定規則

### VS Code 設定

**`.vscode/settings.json`**:
```json
{
  "eslint.workingDirectories": [
    { "mode": "auto" }
  ]
}
```

---

## 檔案與組件清單

### 核心檔案

| 檔案路徑 | 類型 | 行數 | 說明 |
|---------|------|------|------|
| `/apps/web/app/web-builder.tsx` | React Component | 391 | 主編輯器組件 |
| `/apps/web/app/globals.css` | CSS | 73 | 全域樣式 |
| `/apps/web/app/page.module.css` | CSS Modules | 188 | 頁面樣式 |
| `/apps/web/components/toggle.tsx` | React Component | 112 | 切換開關 |
| `/apps/web/components/password-input.tsx` | React Component | 46 | 密碼輸入 |

### UI 組件庫

| 檔案路徑 | 類型 | 行數 | 說明 |
|---------|------|------|------|
| `/packages/ui/src/button.tsx` | React Component | 20 | 按鈕組件 |
| `/packages/ui/src/card.tsx` | React Component | 27 | 卡片組件 |
| `/packages/ui/src/code.tsx` | React Component | 11 | 程式碼展示 |

### 配置檔案

| 檔案路徑 | 說明 |
|---------|------|
| `/turbo.json` | Turborepo 任務配置 |
| `/pnpm-workspace.yaml` | PNPM Workspace 配置 |
| `/packages/typescript-config/base.json` | TypeScript 基礎配置 |
| `/packages/typescript-config/nextjs.json` | Next.js TS 配置 |
| `/packages/eslint-config/next.js` | Next.js ESLint 配置 |

---

## 架構優勢

### 1. Monorepo 架構
- **代碼共享**: UI 組件、配置、工具跨應用共享
- **統一管理**: 單一 git repo，統一版本控制
- **依賴管理**: PNPM workspace 高效管理

### 2. Turborepo 優化
- **增量建置**: 只重建變更的部分
- **快取機制**: 任務結果快取，加速 CI/CD
- **並行執行**: 自動識別依賴，並行執行任務
- **任務依賴**: 自動處理任務執行順序

### 3. 類型安全
- **TypeScript**: 全專案使用 TypeScript
- **嚴格模式**: 啟用 strict 模式
- **共享配置**: 統一的 tsconfig 配置

### 4. 代碼品質
- **ESLint**: 統一的程式碼檢查規則
- **Prettier**: 自動格式化
- **Only Warn**: ESLint 錯誤顯示為警告，不阻斷開發

### 5. 開發體驗
- **Turbopack**: Next.js 15 內建，極快的 HMR
- **代碼生成**: Turbo Generator 快速生成組件
- **工作區命令**: 輕鬆針對特定應用執行指令

---

## 擴展指南

### 新增應用

1. 在 `/apps` 目錄建立新資料夾
2. 初始化 `package.json`
3. 添加依賴：`@repo/ui`, `@repo/eslint-config`, `@repo/typescript-config`
4. 執行 `pnpm install`

### 新增共享套件

1. 在 `/packages` 目錄建立新資料夾
2. 建立 `package.json`，設定 `name` 為 `@repo/[package-name]`
3. 在需要使用的應用中添加依賴
4. 執行 `pnpm install`

### 新增 UI 組件

```bash
pnpm --filter ui generate:component
```

或手動建立：
1. 在 `/packages/ui/src` 建立 `[component-name].tsx`
2. 更新 `package.json` 的 `exports` 欄位
3. 在應用中匯入使用

---

## 常見問題排除

### 類型檢查錯誤

```bash
# 檢查所有專案
pnpm check-types

# 僅檢查 Web 應用
pnpm check-type:web
```

### ESLint 錯誤

```bash
# 執行 ESLint 檢查
pnpm lint

# 自動修復
pnpm --filter web lint --fix
```

### 建置失敗

```bash
# 清除 Turbo 快取
rm -rf .turbo

# 清除 Next.js 快取
rm -rf apps/web/.next

# 重新安裝依賴
rm -rf node_modules
pnpm install

# 重新建置
pnpm build
```

### 開發伺服器問題

```bash
# 僅啟動 Web 應用
pnpm --filter web dev

# 檢查 port 3000 是否被佔用
lsof -i :3000

# 使用不同 port
PORT=3001 pnpm --filter web dev
```

---

## Git 資訊

### 當前狀態

- **分支**: `main`
- **狀態**: 乾淨（無未提交變更）

### 最近提交

```
634d45e feat: add web components
c70787f feat: add web builder page
da5f5d5 feat(create-turbo): install dependencies
0d0dfab feat(create-turbo): apply pnpm-eslint transform
1120870 feat(create-turbo): apply official-starter transform
```

### Gitignore 配置

```
node_modules/
.next/
dist/
.env*
.turbo/
.vercel/
```

---

## 部署建議

### Vercel 部署（推薦）

**Web 應用**:
```bash
# 設定 Root Directory: apps/web
# 設定 Build Command: cd ../.. && pnpm build --filter web
# 設定 Output Directory: .next
```

**環境變數**:
- `NODE_VERSION`: 18 或以上

### 其他平台部署

1. 確保安裝 PNPM: `npm install -g pnpm@9`
2. 設定 Build Command: `pnpm build --filter web`
3. 設定 Start Command: `pnpm --filter web start`

---

## 效能優化建議

### 建置優化

- 使用 Turborepo 快取
- 啟用增量建置
- 並行執行獨立任務

### 開發優化

- 使用 Turbopack（Next.js 15 預設）
- 僅啟動需要的應用
- 啟用 Fast Refresh

### 代碼優化

- Code Splitting（Next.js 自動處理）
- 圖片優化（使用 Next.js Image 組件）
- Lazy Loading（按需載入組件）

---

## 參考資源

- [Turborepo 文檔](https://turbo.build/repo)
- [Next.js 文檔](https://nextjs.org/docs)
- [PNPM 文檔](https://pnpm.io/)
- [Tailwind CSS 文檔](https://tailwindcss.com/docs)
- [TypeScript 文檔](https://www.typescriptlang.org/docs)

---

## 更新紀錄

### 2025-12-02
- 建立專案架構文件
- 記錄核心組件和功能
- 說明開發工作流和指令

---

**文件版本**: 1.0.0
**最後更新**: 2025-12-02
**維護者**: Archie
