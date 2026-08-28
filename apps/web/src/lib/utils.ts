import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// shadcn 元件（components/ui/*）用的 className 合併 helper，跟既有檔案的
// classnames 用法不衝突——舊檔案繼續用 classnames，新的 shadcn 元件統一用這個。
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
