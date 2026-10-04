import { useCallback, useEffect, useState } from 'react';

export function useApi(fetcher) {
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState({ fetcher: null, key: -1, data: null, error: null });

  useEffect(() => {
    const controller = new AbortController();

    fetcher({ signal: controller.signal })
      .then((data) => {
        setResult({ fetcher, key: reloadKey, data, error: null });
      })
      .catch((error) => {
        if (error?.name === 'AbortError') return;
        setResult((previous) => ({
          fetcher,
          key: reloadKey,
          // Keep the last good data only when this is the same query being reloaded.
          data: previous.fetcher === fetcher ? previous.data : null,
          error,
        }));
      });

    return () => controller.abort();
  }, [fetcher, reloadKey]);

  const loading = result.fetcher !== fetcher || result.key !== reloadKey;
  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  return {
    data: result.data,
    error: loading ? null : result.error,
    loading,
    reload,
  };
}