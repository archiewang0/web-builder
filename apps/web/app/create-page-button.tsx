'use client';

import { ArrowRight } from 'lucide-react';
import { useCreatePage } from '@/lib/use-create-page';

export function CreatePageButton() {
    const createPage = useCreatePage();

    return (
        <button
            onClick={createPage}
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-3 font-medium text-white shadow-md transition-colors hover:bg-blue-600"
        >
            開始建立網站
            <ArrowRight className="w-4 h-4" />
        </button>
    );
}
