'use client';

import { useState } from 'react';
import { DragEventEntry } from './use-event-logger';

interface EventLoggerPanelProps {
    eventLog: DragEventEntry[];
    onCopyJSON: () => void;
    onCopyTest: () => void;
    onClear: () => void;
}

export function EventLoggerPanel({
    eventLog,
    onCopyJSON,
    onCopyTest,
    onClear,
}: EventLoggerPanelProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState<'json' | 'test' | null>(null);

    if (process.env.NODE_ENV !== 'development') return null;

    const handleCopy = (type: 'json' | 'test') => {
        type === 'json' ? onCopyJSON() : onCopyTest();
        setCopied(type);
        setTimeout(() => setCopied(null), 1500);
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 font-mono text-xs">
            {/* 收合按鈕 */}
            <button
                onClick={() => setIsOpen((v) => !v)}
                className="mb-1 flex items-center gap-1 rounded bg-gray-800 px-2 py-1 text-white shadow hover:bg-gray-700"
            >
                📋 Event Log
                <span className="ml-1 rounded bg-blue-500 px-1">{eventLog.length}</span>
                <span className="ml-1 text-gray-400">{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
                <div className="w-80 rounded border border-gray-700 bg-gray-900 text-white shadow-xl">
                    {/* 工具列 */}
                    <div className="flex gap-1 border-b border-gray-700 p-2">
                        <button
                            onClick={() => handleCopy('json')}
                            className="rounded bg-gray-700 px-2 py-0.5 hover:bg-gray-600"
                        >
                            {copied === 'json' ? '✅ copied' : 'Copy JSON'}
                        </button>
                        <button
                            onClick={() => handleCopy('test')}
                            className="rounded bg-gray-700 px-2 py-0.5 hover:bg-gray-600"
                        >
                            {copied === 'test' ? '✅ copied' : 'Copy as Test'}
                        </button>
                        <button
                            onClick={onClear}
                            className="ml-auto rounded bg-red-900 px-2 py-0.5 hover:bg-red-800"
                        >
                            Clear
                        </button>
                    </div>

                    {/* Log 列表 */}
                    <div className="max-h-60 overflow-y-auto">
                        {eventLog.length === 0 ? (
                            <p className="p-3 text-gray-500">No events yet. Start dragging.</p>
                        ) : (
                            [...eventLog].reverse().map((entry, i) => (
                                <div
                                    key={entry.id}
                                    className="border-b border-gray-800 p-2 hover:bg-gray-800"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">
                                            #{eventLog.length - i}
                                        </span>
                                        <span className="text-gray-600">
                                            {entry.timestamp.slice(11, 19)}
                                        </span>
                                    </div>
                                    <div className="mt-0.5">
                                        <span className="text-green-400">{entry.from}</span>
                                        <span className="mx-1 text-gray-500">→</span>
                                        <span className="text-blue-400">{entry.to}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
