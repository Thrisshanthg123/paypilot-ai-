import React from 'react';
import {
  X,
  Bell,
  CheckCircle2,
  ShieldAlert,
  Info,
  CheckCheck,
} from 'lucide-react';

export default function NotificationsModal({
  isOpen,
  onClose,
  notifications = [],
  onMarkAllRead,
  onDismiss,
}) {
  if (!isOpen) return null;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'security':
        return <ShieldAlert size={18} className="text-rose" />;
      case 'payment':
        return <CheckCircle2 size={18} className="text-emerald" />;
      default:
        return <Info size={18} className="text-blue" />;
    }
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="upi-modal-overlay" onClick={onClose}>
      <div className="upi-modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="upi-modal-header">
          <div className="upi-modal-title-group">
            <h3 className="upi-modal-main-title">Notifications & Security Alerts</h3>
            {unreadCount > 0 && <span className="unread-count-pill">{unreadCount} New</span>}
          </div>
          <button type="button" className="upi-modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="upi-modal-body">
          {unreadCount > 0 && (
            <div className="notif-top-actions">
              <button type="button" className="mark-all-read-btn" onClick={onMarkAllRead}>
                <CheckCheck size={14} />
                <span>Mark all as read</span>
              </button>
            </div>
          )}

          <div className="notif-modal-list">
            {notifications.length === 0 ? (
              <div className="text-center py-6 text-gray">
                <Bell size={32} className="mb-2" />
                <p>No notifications at the moment</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`upi-notif-card ${n.unread ? 'notif-card-unread' : ''}`}>
                  <div className="notif-card-icon">{getTypeIcon(n.type)}</div>
                  <div className="notif-card-body">
                    <div className="notif-card-header">
                      <span className="notif-card-title">{n.title}</span>
                      <span className="notif-card-time">{n.time}</span>
                    </div>
                    <p className="notif-card-msg">{n.message}</p>
                  </div>
                  <button
                    type="button"
                    className="notif-card-dismiss"
                    onClick={() => onDismiss(n.id)}
                    title="Dismiss"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="upi-modal-footer">
          <button type="button" className="upi-secondary-btn w-full" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
