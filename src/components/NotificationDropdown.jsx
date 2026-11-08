import React from 'react';
import {
  CheckCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';

export default function NotificationDropdown({
  notifications = [],
  isOpen,
  onMarkAllRead,
  onClearNotification,
}) {
  if (!isOpen) return null;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'critical':
        return <ShieldAlert size={16} className="text-rose" />;
      case 'success':
        return <CheckCircle2 size={16} className="text-emerald" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-amber" />;
      default:
        return <Info size={16} className="text-blue" />;
    }
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="notifications-dropdown-menu">
      <div className="notif-header">
        <div className="notif-title-row">
          <span className="notif-title">Alerts & System Feeds</span>
          {unreadCount > 0 && (
            <span className="notif-unread-count-pill">{unreadCount} new</span>
          )}
        </div>
        <div className="notif-actions">
          {unreadCount > 0 && (
            <button
              type="button"
              className="notif-action-btn"
              onClick={onMarkAllRead}
              title="Mark all as read"
            >
              <CheckCheck size={14} />
              <span>Mark all read</span>
            </button>
          )}
        </div>
      </div>

      <div className="notif-list-scroll">
        {notifications.length === 0 ? (
          <div className="notif-empty">No current notifications</div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className={`notif-item ${item.unread ? 'notif-unread' : ''}`}
            >
              <div className="notif-icon-col">{getTypeIcon(item.type)}</div>
              <div className="notif-content-col">
                <div className="notif-item-title-row">
                  <span className="notif-item-title">{item.title}</span>
                  <span className="notif-time">{item.timestamp}</span>
                </div>
                <p className="notif-msg">{item.message}</p>
              </div>
              <button
                type="button"
                className="notif-dismiss-btn"
                onClick={() => onClearNotification(item.id)}
                title="Dismiss"
              >
                <X size={12} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="notif-footer">
        <span className="notif-engine-tag">PayPilot Event Bus • Encrypted Stream</span>
      </div>
    </div>
  );
}
