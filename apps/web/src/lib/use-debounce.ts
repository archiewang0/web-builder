import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Debounce a value
 * 當 value 變化後，延遲 delay 毫秒才更新 debouncedValue
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounceValue(searchTerm, 300);
 *
 * useEffect(() => {
 *   // 只有當用戶停止輸入 300ms 後才會執行搜尋
 *   fetchSearchResults(debouncedSearch);
 * }, [debouncedSearch]);
 */
export function useDebounceValue<T>(value: T, delay: number = 300): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Debounce a callback function
 * 回傳一個 debounced 版本的 callback，在 delay 時間內重複呼叫只會執行最後一次
 *
 * @example
 * const handleSearch = useDebouncedCallback((query: string) => {
 *   fetchSearchResults(query);
 * }, 300);
 *
 * <input onChange={(e) => handleSearch(e.target.value)} />
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
    callback: T,
    delay: number = 300
): (...args: Parameters<T>) => void {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const callbackRef = useRef(callback);

    // 保持 callback 最新
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    // 清理 timer
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return useCallback((...args: Parameters<T>) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            callbackRef.current(...args);
        }, delay);
    }, [delay]);
}

/**
 * 純函數版本的 debounce（非 hook）
 * 適合用在非 React 環境或 class component
 *
 * @example
 * const debouncedSave = debounce((data) => saveToServer(data), 500);
 * debouncedSave(formData);
 */
export function debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number = 300
): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
            fn(...args);
        }, delay);
    };
}
