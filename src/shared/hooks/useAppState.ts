import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
export function useAppState(): AppStateStatus {
  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState
  );
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      setAppState(nextAppState);
    });
    return () => {
      subscription.remove();
    };
  }, []);
  return appState;
}
export function useIsAppActive(): boolean {
  const appState = useAppState();
  return appState === 'active';
}
export function useIsAppBackground(): boolean {
  const appState = useAppState();
  return appState === 'background';
}
export function useOnAppActive(callback: () => void): void {
  const savedCallback = useRef(callback);
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        savedCallback.current();
      }
    });
    return () => {
      subscription.remove();
    };
  }, []);
}
export function useOnAppBackground(callback: () => void): void {
  const savedCallback = useRef(callback);
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background') {
        savedCallback.current();
      }
    });
    return () => {
      subscription.remove();
    };
  }, []);
}
export function useAppStateTransition(callbacks: {
  onActive?: () => void;
  onBackground?: () => void;
  onInactive?: () => void;
}): void {
  const { onActive, onBackground, onInactive } = callbacks;
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      switch (nextAppState) {
        case 'active':
          onActive?.();
          break;
        case 'background':
          onBackground?.();
          break;
        case 'inactive':
          onInactive?.();
          break;
      }
    });
    return () => {
      subscription.remove();
    };
  }, [onActive, onBackground, onInactive]);
}
export function useSessionDuration(): number {
  const [duration, setDuration] = useState(0);
  const startTimeRef = useRef(Date.now());
  const isActive = useIsAppActive();
  useEffect(() => {
    if (!isActive) return;
    startTimeRef.current = Date.now();
    const interval = setInterval(() => {
      setDuration(Date.now() - startTimeRef.current);
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive]);
  return duration;
}
export function useOnReturnFromBackground(
  callback: () => void,
  minBackgroundTime = 0
): void {
  const backgroundTimeRef = useRef<number | null>(null);
  const savedCallback = useRef(callback);
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background') {
        backgroundTimeRef.current = Date.now();
      } else if (nextAppState === 'active' && backgroundTimeRef.current) {
        const timeInBackground = Date.now() - backgroundTimeRef.current;
        if (timeInBackground >= minBackgroundTime) {
          savedCallback.current();
        }
        backgroundTimeRef.current = null;
      }
    });
    return () => {
      subscription.remove();
    };
  }, [minBackgroundTime]);
}
