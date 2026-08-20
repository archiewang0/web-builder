import { useState, useCallback } from 'react';
import { ElementSchema } from '@/store/use-schema-store';
import type { DropPosition } from '../lib';

export interface DragEventEntry {
    id: number;
    timestamp: string;
    from: string;
    to: string;
    // dragStart/取消拖曳/drop 在 Body 這幾種情況沒有真正的插入位置，留空；
    // 只有成功 reorder 到某個元素上才會帶這個欄位。
    dropPosition?: DropPosition;
    elementsBefore: ElementSchema[];
    elementsAfter: ElementSchema[];
}

export type LogEvent = (
    from: string,
    to: string,
    elementsBefore: ElementSchema[],
    elementsAfter: ElementSchema[],
    dropPosition?: DropPosition
) => void;

export function useEventLogger() {
    const [eventLog, setEventLog] = useState<DragEventEntry[]>([]);

    const logEvent = useCallback(
        (
            from: string,
            to: string,
            elementsBefore: ElementSchema[],
            elementsAfter: ElementSchema[],
            dropPosition?: DropPosition
        ) => {
            const entry: DragEventEntry = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                from,
                to,
                dropPosition,
                elementsBefore,
                elementsAfter,
            };
            setEventLog((prev) => [...prev, entry]);
            console.log('📋 [event logger] recorded:', from, '→', to);
        },
        []
    );

    const clearLog = useCallback(() => setEventLog([]), []);

    const copyAsJSON = useCallback(() => {
        const json = JSON.stringify(eventLog, null, 4);
        navigator.clipboard.writeText(json);
        console.log('📋 copied as JSON');
    }, [eventLog]);

    // 每筆記錄產生一個可直接執行的 Jest test case
    const copyAsTest = useCallback(() => {
        const cases = eventLog
            .map((entry, i) =>
                `
it('drag ${entry.from} → ${entry.to}', () => {
    const elementsBefore = ${JSON.stringify(entry.elementsBefore, null, 8)};
    const map = buildElementMap(elementsBefore);
    const result = computeReorder(elementsBefore, map, '${entry.from}', '${entry.to}', '${entry.dropPosition ?? 'inside'}');
    expect(result).toEqual(${JSON.stringify(entry.elementsAfter, null, 8)});
});`.trim()
            )
            .join('\n\n');

        const output = `import { buildElementMap, computeReorder } from '@/builder/_components/canvas/lib';

describe('drag reorder', () => {
${cases
    .split('\n')
    .map((l) => '    ' + l)
    .join('\n')}
});
`;
        navigator.clipboard.writeText(output);
        console.log('📋 copied as test');
    }, [eventLog]);

    return { eventLog, logEvent, clearLog, copyAsJSON, copyAsTest };
}
