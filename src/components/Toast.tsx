import type { Notification } from '../types';

interface ToastProps {
  notifications: Notification[];
  onDismiss: (id: number) => void;
}

export function Toast({ notifications, onDismiss }: ToastProps) {
  if (notifications.length === 0) return null;

  return (
    <div className="toast-container">
      {notifications.map(n => (
        <div
          key={n.id}
          className={`notification notification-${n.type}`}
          onClick={() => onDismiss(n.id)}
        >
          {n.message}
        </div>
      ))}
    </div>
  );
}
