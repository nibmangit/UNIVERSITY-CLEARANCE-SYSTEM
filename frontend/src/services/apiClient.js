import { ApiError, NETWORK_MESSAGE, parseApiError } from '../utils/errors';

// Comes from .env (VITE_API_BASE_URL). Falls back to "/api" if it is not set.
const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace(/\/+$/, '');

const ACCESS_KEY = 'clearance.access';
const REFRESH_KEY = 'clearance.refresh';

function readStorage(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    if (value) window.localStorage.setItem(key, value);
    else window.localStorage.removeItem(key);
  } catch {
    // Storage can be unavailable (private mode). The session just won't persist.
  }
}

export const tokenStorage = {
  getAccess: () => readStorage(ACCESS_KEY),
  getRefresh: () => readStorage(REFRESH_KEY),
  hasSession: () => Boolean(readStorage(ACCESS_KEY) || readStorage(REFRESH_KEY)),
  set({ access, refresh }) {
    if (access) writeStorage(ACCESS_KEY, access);
    if (refresh) writeStorage(REFRESH_KEY, refresh);
  },
  clear() {
    writeStorage(ACCESS_KEY, null);
    writeStorage(REFRESH_KEY, null);
  },
};

let onAuthFailure = null;

/** The auth context (step 4) registers this so a dead session logs the user out of the UI. */
export function setAuthFailureHandler(handler) {
  onAuthFailure = handler;
}

function endSession() {
  tokenStorage.clear();
  if (onAuthFailure) onAuthFailure();
}

function networkError() {
  return new ApiError({ message: NETWORK_MESSAGE, status: 0 });
}

async function send(path, { method, body, signal, token, responseType }) {
  const wantsFile = responseType === 'blob';

  // The backend only accepts a request whose Accept header includes a format it can render (JSON).
  // So a file request lists JSON too, which is also how an error comes back readable.
  const headers = { Accept: wantsFile ? 'application/pdf, application/json' : 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw networkError();
  }

  // A successful file request returns the raw file. Anything else (an error) is read as JSON text.
  if (wantsFile && response.ok) {
    return { response, data: await response.blob() };
  }

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null; // e.g. an HTML error page
    }
  }

  return { response, data };
}

// Several requests can hit a 401 at the same moment. They all share one refresh call.
let refreshPromise = null;

function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refresh = tokenStorage.getRefresh();
      if (!refresh) throw new Error('No refresh token');

      // No Authorization header here: an expired token would make this endpoint return 401.
      const { response, data } = await send('/auth/token/refresh/', {
        method: 'POST',
        body: { refresh },
      });

      if (!response.ok || !data?.access) throw new Error('Refresh rejected');

      tokenStorage.set({ access: data.access, refresh: data.refresh });
      return data.access;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function request(method, path, { body, auth = true, signal, responseType } = {}) {
  let token = auth ? tokenStorage.getAccess() : null;
  let { response, data } = await send(path, { method, body, signal, token, responseType });

  if (response.status === 401 && auth && tokenStorage.getRefresh()) {
    try {
      token = await refreshAccessToken();
    } catch (error) {
      // Network problem while refreshing: keep the session, just report the error.
      if (error instanceof ApiError || error?.name === 'AbortError') throw error;
      endSession();
      throw new ApiError({ ...parseApiError(null, 401), status: 401 });
    }
    ({ response, data } = await send(path, { method, body, signal, token, responseType }));
  }

  if (!response.ok) {
    if (response.status === 401 && auth) endSession();
    const { message, fieldErrors } = parseApiError(data, response.status);
    throw new ApiError({ message, status: response.status, data, fieldErrors });
  }

  return data;
}

export const api = {
  get: (path, options) => request('GET', path, options),
  post: (path, body, options) => request('POST', path, { ...options, body }),
  patch: (path, body, options) => request('PATCH', path, { ...options, body }),
  put: (path, body, options) => request('PUT', path, { ...options, body }),
  delete: (path, options) => request('DELETE', path, options),

  /** Downloads a file as a Blob. Errors still come back as an ApiError with a readable message. */
  getBlob: (path, options) => request('GET', path, { ...options, responseType: 'blob' }),
};
