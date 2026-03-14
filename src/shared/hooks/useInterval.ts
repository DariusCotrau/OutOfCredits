import { useEffect, useRef, useCallback } from 'react';
export function useInterval(
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
    const tick = () => {
      savedCallback.current();
    };
    const id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);
}
export function useControllableInterval(
  callback: () => void,
  delay: number,
  options: {
    autoStart?: boolean;
    immediate?: boolean;
  } = {}
) {
  const { autoStart = true, immediate = false } = options;
  const savedCallback = useRef<() => void>(callback);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const isRunningRef = useRef(autoStart);
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
    isRunningRef.current = false;
  }, []);
  const start = useCallback(() => {
    stop();
    if (immediate) {
      savedCallback.current();
    }
    intervalRef.current = setInterval(() => {
      savedCallback.current();
    }, delay);
    isRunningRef.current = true;
  }, [delay, immediate, stop]);
  const reset = useCallback(() => {
    stop();
    start();
  }, [stop, start]);
  useEffect(() => {
    if (autoStart) {
      start();
    }
    return stop;
  }, [autoStart, start, stop]);
  return {
    start,
    stop,
    reset,
    isRunning: isRunningRef.current,
  };
}
export function useCountdown(
  initialSeconds: number,
  options: {
    autoStart?: boolean;
    onComplete?: () => void;
    onTick?: (seconds: number) => void;
  } = {}
) {
  const { autoStart = false, onComplete, onTick } = options;
  const secondsRef = useRef(initialSeconds);
  const isRunningRef = useRef(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const tick = useCallback(() => {
    if (secondsRef.current <= 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
      isRunningRef.current = false;
      onComplete?.();
      return;
    }
    secondsRef.current -= 1;
    onTick?.(secondsRef.current);
  }, [onComplete, onTick]);
  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
    isRunningRef.current = false;
  }, []);
  const start = useCallback(() => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    intervalRef.current = setInterval(tick, 1000);
  }, [tick]);
  const reset = useCallback(
    (newSeconds?: number) => {
      pause();
      secondsRef.current = newSeconds ?? initialSeconds;
    },
    [pause, initialSeconds]
  );
  useEffect(() => {
    if (autoStart) {
      start();
    }
    return pause;
  }, [autoStart, start, pause]);
  return {
    seconds: secondsRef.current,
    isRunning: isRunningRef.current,
    start,
    pause,
    reset,
  };
}
