import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Home() {
    return (
        <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
            <div className="max-w-2xl mx-auto px-6 text-center">
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                    用拖拉，打造你的網站
                </h1>
                <p className="mt-4 text-lg text-gray-500">
                    不用寫一行程式碼。把文字、圖片、按鈕、容器拖進畫布就完成排版，
                    即時切換桌面、平板、手機三種裝置預覽，所見即所得。
                </p>
                <Link
                    href="/builder"
                    className="mt-8 inline-flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-3 font-medium text-white shadow-md transition-colors hover:bg-blue-600"
                >
                    開始建立網站
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}
