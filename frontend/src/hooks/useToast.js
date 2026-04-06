import { useCallback, useMemo } from "react";
import { useToastContext } from "../context/ToastContext";

export function useToast() {
  const { showToast, dismissToast, toasts } = useToastContext();

  const notifySuccess = useCallback(
    (title, message, details) => {
      showToast("success", title, message, details);
    },
    [showToast]
  );

  const notifyError = useCallback(
    (title, message, details) => {
      showToast("error", title, message, details);
    },
    [showToast]
  );

  const notifyInfo = useCallback(
    (title, message, details) => {
      showToast("info", title, message, details);
    },
    [showToast]
  );

  return useMemo(
    () => ({
      toasts,
      dismissToast,
      notifySuccess,
      notifyError,
      notifyInfo
    }),
    [dismissToast, notifyError, notifyInfo, notifySuccess, toasts]
  );
}
