import React from 'react';
import { CheckCircle2, Clock, XCircle, ShieldBan } from 'lucide-react';

export default function StatusBadge({ status, size = 'md' }) {
  const normalized = (status || '').toLowerCase();

  const configs = {
    successful: {
      label: 'Successful',
      icon: CheckCircle2,
      className: 'badge-status-successful',
    },
    pending: {
      label: 'Pending',
      icon: Clock,
      className: 'badge-status-pending',
    },
    failed: {
      label: 'Failed',
      icon: XCircle,
      className: 'badge-status-failed',
    },
    blocked: {
      label: 'Blocked',
      icon: ShieldBan,
      className: 'badge-status-blocked',
    },
  };

  const config = configs[normalized] || {
    label: status || 'Unknown',
    icon: Clock,
    className: 'badge-status-pending',
  };

  const Icon = config.icon;
  const sizeClass = size === 'sm' ? 'badge-sm' : 'badge-md';

  return (
    <span className={`status-badge ${config.className} ${sizeClass}`}>
      <Icon className="status-badge-icon" size={size === 'sm' ? 12 : 14} />
      <span>{config.label}</span>
    </span>
  );
}
