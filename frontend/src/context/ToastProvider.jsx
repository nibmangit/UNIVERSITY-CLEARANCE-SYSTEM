import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Toast from '../components/ui/Toast';
import { ToastContext } from './ToastContext';

const DURATION = { success: 4000, info: 5000, warning: 6000, error: 8000 };
const MAX_VISIBLE = 4;

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());
  const nextId = useRef(1);

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    ({ tone = 'info', title, message }) => {
      const id = nextId.current++;
      setToasts((current) => [...current.slice(-(MAX_VISIBLE - 1)), { id, tone, title, message }]);
      timers.current.set(id, setTimeout(() => dismiss(id), DURATION[tone] ?? 5000));
      return id;
    },
    [dismiss],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => clearTimeout(timer));
  }, []);

  const api = useMemo(
    () => ({
      show,
      dismiss,
      success: (message, title) => show({ tone: 'success', title, message }),
      error: (message, title) => show({ tone: 'error', title, message }),
      info: (message, title) => show({ tone: 'info', title, message }),
      warning: (message, title) => show({ tone: 'warning', title, message }),
    }),
    [show, dismiss],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-end gap-2 px-4 sm:inset-x-auto sm:right-4 sm:w-96 sm:px-0"
      >
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onDismiss={() => dismiss(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}