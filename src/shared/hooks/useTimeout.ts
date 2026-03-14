import { useEffect, useRef, useCallback } from 'react';
export function useTimeout(
  callback: () => void,
  delay: number | null
): void {
  const savedCallback = useRef<() => void>(callback);
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  useEffect(() => {
    if (delay === null) {
      return;
    }
    const id = setTimeout(() => {
      savedCallback.current();
    }, delay);
    return () => clearTimeout(id);
  }, [delay]);
}
export function useControllableTimeout(
  callback: () => void,
  delay: number
) {
  const savedCallback = useRef<() => void>(callback);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const isActiveRef = useRef(false);
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  const stop = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    isActiveRef.current = false;
  }, []);
  const start = useCallback(() => {
    stop();
    isActiveRef.current = true;
    timeoutRef.current = setTimeout(() => {
      isActiveRef.current = false;
      savedCallback.current();
    }, delay);
  }, [delay, stop]);
  const reset = useCallback(() => {
    start();
  }, [start]);
  useEffect(() => {
    return stop;
  }, [stop]);
  return {
    start,
    stop,
    reset,
    isActive: isActiveRef.current,
  };
}
export function useTimeoutAfterMount(
  callback: () => void,
  delay: number
): void {
  const hasMounted = useRef(false);
  useEffect(() => {
    if (hasMounted.current) return;
    hasMounted.current = true;
    const id = setTimeout(callback, delay);
    return () => clearTimeout(id);
  }, [callback, delay]);
}
export function useDelayedAction(
  delay: number
): [(callback: () => void) => void, () => void] {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);
  const trigger = useCallback(
    (callback: () => void) => {
      cancel();
      timeoutRef.current = setTimeout(callback, delay);
    },
    [delay, cancel]
  );
  useEffect(() => {
    return cancel;
  }, [cancel]);
  return [trigger, cancel];
}
