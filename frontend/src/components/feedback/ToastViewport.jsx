import { memo } from "react";
import { useToast } from "../../hooks/useToast";

export const ToastViewport = memo(function ToastViewport() {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="notification-stack" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <article key={toast.id} className={`notification-card ${toast.type}`}>
          <div className="notification-header">
            <div>
              <strong>{toast.title}</strong>
              <p>{toast.message}</p>
            </div>
            <button
              type="button"
              className="notification-close"
              onClick={() => dismissToast(toast.id)}
            >
              Dismiss
            </button>
          </div>
          {toast.details?.length ? (
            <ul className="notification-list">
              {toast.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          ) : null}
        </article>
      ))}
    </div>
  );
});
