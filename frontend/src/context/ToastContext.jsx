import { createContext, useContext, useMemo, useState } from "react";

const TOAST_TIMEOUT_MS = 5000;

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  function dismissToast(id) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  function showToast(type, title, message, details = []) {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((current) => [...current, { id, type, title, message, details }]);
    window.setTimeout(() => dismissToast(id), TOAST_TIMEOUT_MS);
  }

  const value = useMemo(
    () => ({
      toasts,
      dismissToast,
      showToast
    }),
    [toasts]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToastContext() {
  const value = useContext(ToastContext);
  if (!value) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }
  return value;
}
