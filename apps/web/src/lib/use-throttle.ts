import { useCallback, useRef } from 'react';

export function useThrottle<T extends (...args: any[]) => void>(fn: T, delay: number): T {
    const lastRef = useRef<number>(0);
    const fnRef = useRef<T>(fn);
    fnRef.current = fn;

    return useCallback(
        (...args: Parameters<T>) => {
            const now = Date.now();
            if (now - lastRef.current < delay) return;
            lastRef.current = now;
            fnRef.current(...args);
        },
        [delay]
    ) as T;
}
