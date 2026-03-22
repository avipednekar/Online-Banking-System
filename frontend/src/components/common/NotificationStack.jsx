export function NotificationStack({ notifications, onDismiss }) {
  return (
    <div className="notification-stack" aria-live="polite">
      {notifications.map((notification) => (
        <article key={notification.id} className={`notification-card ${notification.type}`}>
          <div className="notification-header">
            <div>
              <strong>{notification.title}</strong>
              <p>{notification.message}</p>
            </div>
            <button
              type="button"
              className="notification-close"
              onClick={() => onDismiss(notification.id)}
            >
              Close
            </button>
          </div>
          {notification.details?.length ? (
            <ul className="notification-list">
              {notification.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          ) : null}
        </article>
      ))}
    </div>
  );
}
