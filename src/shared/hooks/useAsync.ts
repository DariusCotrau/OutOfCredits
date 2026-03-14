import { useState, useCallback, useEffect, useRef } from 'react';
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}
export interface UseAsyncReturn<T, Args extends unknown[]> extends AsyncState<T> {
  execute: (...args: Args) => Promise<T | null>;
  reset: () => void;
  setData: (data: T | null) => void;
}
export function useAsync<T, Args extends unknown[] = []>(
  asyncFunction: (...args: Args) => Promise<T>,
  immediate = false,
  initialArgs?: Args
): UseAsyncReturn<T, Args> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });
  const mountedRef = useRef(true);

  const reset = () => setState({ data: null, loading: false, error: null });
  const setData = (data: T | null) => setState((prev) => ({ ...prev, data }));

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const result = await asyncFunction(...args);
        if (mountedRef.current) {
          setState({ data: result, loading: false, error: null });
        }
        return result;
      } catch (error) {
        if (mountedRef.current) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }
        return null;
      }
    },
    [asyncFunction]
  );
  useEffect(() => {
    mountedRef.current = true;
    if (immediate && initialArgs) {
      execute(...initialArgs);
    } else if (immediate) {
      execute(...([] as unknown as Args));
    }
    return () => {
      mountedRef.current = false;
    };
  }, [immediate]);
  return {
    ...state,
    execute,
    reset,
    setData,
  };
}
export function useFetch<T>(
  asyncFunction: () => Promise<T>,
  deps: React.DependencyList = []
): AsyncState<T> & { refetch: () => Promise<T | null> } {
  const { data, loading, error, execute } = useAsync(asyncFunction, true);
  useEffect(() => {
    execute();
  }, deps);
  return { data, loading, error, refetch: execute };
}
export function useMutation<T, Args extends unknown[] = []>(
  mutationFn: (...args: Args) => Promise<T>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    onSettled?: () => void;
  } = {}
) {
  const { onSuccess, onError, onSettled } = options;
  const [state, setState] = useState<{
    loading: boolean;
    error: Error | null;
    data: T | null;
  }>({
    loading: false,
    error: null,
    data: null,
  });
  const mutate = useCallback(
    async (...args: Args): Promise<T | null> => {
      setState({ loading: true, error: null, data: null });
      try {
        const result = await mutationFn(...args);
        setState({ loading: false, error: null, data: result });
        onSuccess?.(result);
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setState({ loading: false, error: err, data: null });
        onError?.(err);
        return null;
      } finally {
        onSettled?.();
      }
    },
    [mutationFn, onSuccess, onError, onSettled]
  );
  const reset = () => setState({ loading: false, error: null, data: null });
  return {
    mutate,
    reset,
    ...state,
  };
}
export function useLazyQuery<T, Args extends unknown[] = []>(
  queryFn: (...args: Args) => Promise<T>
): [(...args: Args) => Promise<T | null>, AsyncState<T>] {
  const { data, loading, error, execute } = useAsync(queryFn, false);
  return [execute, { data, loading, error }];
}
