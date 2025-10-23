import { useCallback, useRef } from 'react';

export function useDebouncedUpdater<T>(callback: (value: T) => void, delay = 500) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedFn = useCallback(
    (value: T) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => callback(value), delay);
    },
    [callback, delay]
  );

  return debouncedFn;
}
