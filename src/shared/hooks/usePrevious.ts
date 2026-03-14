import { useRef, useEffect } from 'react';
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
export function usePreviousWithInitial<T>(value: T, initialValue: T): T {
  const ref = useRef<T>(initialValue);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
export function useHasChanged<T>(value: T): boolean {
  const prevValue = usePrevious(value);
  return prevValue !== value;
}
export function useValueChange<T>(
  value: T,
  callback: (newValue: T, oldValue: T | undefined) => void
): void {
  const prevValue = usePrevious(value);
  useEffect(() => {
    if (prevValue !== value) {
      callback(value, prevValue);
    }
  }, [value, prevValue, callback]);
}
export function useChangeDirection(
  value: number
): 'up' | 'down' | 'same' | null {
  const prevValue = usePrevious(value);
  if (prevValue === undefined) {
    return null;
  }
  if (value > prevValue) {
    return 'up';
  }
  if (value < prevValue) {
    return 'down';
  }
  return 'same';
}
export function useValueHistory<T>(value: T, maxLength = 10): T[] {
  const historyRef = useRef<T[]>([]);
  useEffect(() => {
    historyRef.current = [value, ...historyRef.current].slice(0, maxLength);
  }, [value, maxLength]);
  return historyRef.current;
}
