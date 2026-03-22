import { useToastContext } from "../context/ToastContext";

export function useToast() {
  const { showToast, dismissToast, toasts } = useToastContext();

  return {
    toasts,
    dismissToast,
    notifySuccess(title, message, details) {
      showToast("success", title, message, details);
    },
    notifyError(title, message, details) {
      showToast("error", title, message, details);
    },
    notifyInfo(title, message, details) {
      showToast("info", title, message, details);
    }
  };
}
