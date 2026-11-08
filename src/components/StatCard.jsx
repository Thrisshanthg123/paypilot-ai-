import React from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';

export default function StatCard({
  title,
  value,
  change,
  isPositive,
  comparison,
  breakdown,
  icon: Icon,
  accentColor = 'blue',
  isActive = false,
  onClick,
  badgeText,
}) {
  const accentClasses = {
    blue: 'accent-blue',
    green: 'accent-green',
    purple: 'accent-purple',
    amber: 'accent-amber',
    rose: 'accent-rose',
  };

  const accent = accentClasses[accentColor] || accentClasses.blue;

  return (
    <div
      className={`stat-card ${accent} ${isActive ? 'stat-card-active' : ''} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        <div className="stat-icon-wrapper">
          {Icon && <Icon size={20} className="stat-icon" />}
        </div>
      </div>

      <div className="stat-card-body">
        <div className="stat-value-row">
          <span className="stat-value">{value}</span>
          {badgeText && <span className="stat-pill-badge">{badgeText}</span>}
        </div>

        <div className="stat-card-meta">
          {typeof change !== 'undefined' && (
            <span className={`stat-trend ${isPositive ? 'trend-up' : 'trend-down'}`}>
              {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              <span>{change > 0 ? `+${change}%` : `${change}%`}</span>
            </span>
          )}
          {comparison && <span className="stat-comparison">{comparison}</span>}
        </div>
      </div>

      {breakdown && (
        <div className="stat-card-footer">
          <span className="stat-breakdown-text">{breakdown}</span>
          {onClick && (
            <span className="stat-filter-hint">
              Filter <ArrowUpRight size={12} />
            </span>
          )}
        </div>
      )}
    </div>
  );
}
