import { useState } from "react";

const NOTIFICATION_TIMEOUT_MS = 5000;

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);

  function dismissNotification(id) {
    setNotifications((current) => current.filter((notification) => notification.id !== id));
  }

  function showNotification(type, title, message, details = []) {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setNotifications((current) => [...current, { id, type, title, message, details }]);
    window.setTimeout(() => dismissNotification(id), NOTIFICATION_TIMEOUT_MS);
  }

  return {
    notifications,
    showNotification,
    dismissNotification
  };
}
