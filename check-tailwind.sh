#!/bin/bash

echo "🔧 檢查 Tailwind CSS 配置..."

cd apps/web

# 檢查文件是否存在
if [ -f "tailwind.config.mjs" ]; then
    echo "✅ tailwind.config.mjs 存在"
else
    echo "❌ tailwind.config.mjs 不存在"
fi

if [ -f "postcss.config.mjs" ]; then
    echo "✅ postcss.config.mjs 存在"
else
    echo "❌ postcss.config.mjs 不存在"
fi

# 檢查 package.json 中的依賴
echo "📦 檢查依賴..."
if pnpm list tailwindcss > /dev/null 2>&1; then
    echo "✅ tailwindcss 已安裝"
else
    echo "❌ tailwindcss 未安裝，正在安裝..."
    pnpm add -D tailwindcss postcss autoprefixer
fi

echo "🚀 嘗試啟動開發伺服器..."
echo "如果沒有錯誤，配置就是正確的！"
