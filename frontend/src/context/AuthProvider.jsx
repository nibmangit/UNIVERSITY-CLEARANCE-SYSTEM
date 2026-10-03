import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthContext } from './AuthContext';
import { authService } from '../services/authService';
import { setAuthFailureHandler, tokenStorage } from '../services/apiClient';

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(() =>
    tokenStorage.hasSession() ? 'loading' : 'unauthenticated',
  );
  const [attempt, setAttempt] = useState(0);

  // If the refresh token stops working, the API client calls this and the UI logs out.
  useEffect(() => {
    setAuthFailureHandler(() => {
      setUser(null);
      setStatus('unauthenticated');
    });
    return () => setAuthFailureHandler(null);
  }, []);

  // On page load, restore the session if there are stored tokens.
  useEffect(() => {
    if (!tokenStorage.hasSession()) return undefined;

    const controller = new AbortController();

    authService
      .me({ signal: controller.signal })
      .then((currentUser) => {
        setUser(currentUser);
        setStatus('authenticated');
      })
      .catch((error) => {
        if (error?.name === 'AbortError') return;
        // A 401 has already cleared the session through the handler above.
        if (error?.status !== 401) setStatus('error');
      });

    return () => controller.abort();
  }, [attempt]);

  const login = useCallback(async (credentials) => {
    const currentUser = await authService.login(credentials);
    setUser(currentUser);
    setStatus('authenticated');
    return currentUser;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const retry = useCallback(() => {
    setStatus('loading');
    setAttempt((value) => value + 1);
  }, []);

  const value = useMemo(
    () => ({
      user,
      role: user?.role ?? null,
      status,
      isAuthenticated: status === 'authenticated',
      login,
      logout,
      retry,
    }),
    [user, status, login, logout, retry],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}