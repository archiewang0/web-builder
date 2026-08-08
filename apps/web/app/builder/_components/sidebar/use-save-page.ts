'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSchemaStore } from '@/store/use-schema-store';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useSavePage() {
    const params = useParams<{ id: string }>();
    const [status, setStatus] = useState<SaveStatus>('idle');

    // 存檔成功/失敗的提示只需要短暫顯示，之後自動回到 idle
    useEffect(() => {
        if (status !== 'saved' && status !== 'error') return;
        const timer = setTimeout(() => setStatus('idle'), 1500);
        return () => clearTimeout(timer);
    }, [status]);

    const handleSave = async () => {
        setStatus('saving');
        try {
            const schema = useSchemaStore.getState().schema;
            const res = await fetch(`/api/pages/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ schema }),
            });
            if (!res.ok) throw new Error('Save failed');
            setStatus('saved');
        } catch {
            setStatus('error');
        }
    };

    return { status, handleSave };
}
