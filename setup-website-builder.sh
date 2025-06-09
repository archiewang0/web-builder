#!/bin/bash

# Website Builder Turborepo 設置腳本
echo "🚀 開始設置 Website Builder for Turborepo..."

# 進入 web app 目錄
cd apps/web

# 安裝 Tailwind CSS 相關依賴
echo "📦 安裝 Tailwind CSS 依賴..."
pnpm add -D tailwindcss postcss autoprefixer

echo "✅ 設置完成！"
echo ""
echo "🎉 Website Builder 已經準備就緒！"
echo ""
echo "下一步："
echo "1. 執行 'pnpm dev' 啟動開發伺服器"
echo "2. 打開 http://localhost:3000 查看 Website Builder"
echo "3. 或訪問 http://localhost:3000/builder 單獨查看編輯器"
echo ""
echo "📁 專案結構："
echo "  apps/web/app/web-builder.tsx     - 主要編輯器組件"
echo "  apps/web/app/builder/page.tsx    - 獨立頁面"
echo "  apps/web/tailwind.config.js      - Tailwind 配置"
echo "  apps/web/postcss.config.js       - PostCSS 配置"
