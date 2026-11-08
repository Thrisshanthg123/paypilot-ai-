import React from 'react';
import { Search, Bell, Shield, X } from 'lucide-react';

export default function TopHeader({
  user,
  searchQuery,
  onSearchChange,
  onOpenNotifications,
  unreadCount = 0,
  onOpenProfile,
}) {
  return (
    <header className="upi-top-header">
      {/* Brand & Profile Top Bar */}
      <div className="upi-header-top-row">
        <div className="upi-brand-block">
          <div className="upi-logo-symbol">
            <Shield size={20} className="upi-logo-icon" />
          </div>
          <div className="upi-brand-text">
            <div className="upi-brand-title">
              <span>PayPilot</span>
              <span className="upi-brand-ai">AI</span>
            </div>
            <div className="paypal-hackathon-pill" title="PayPal AI Hackathon - Sandbox & AI Guard Active">
              <span className="hackathon-dot" />
              <span>PayPal Sandbox • AI Guard</span>
            </div>
          </div>
        </div>

        <div className="upi-header-actions">
          {/* Notifications button */}
          <button
            type="button"
            className="upi-icon-btn"
            onClick={onOpenNotifications}
            aria-label="View notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="upi-badge-count">{unreadCount}</span>}
          </button>

          {/* User profile avatar */}
          <button
            type="button"
            className="upi-avatar-btn"
            onClick={onOpenProfile}
            aria-label="View Profile"
            title="My Profile & UPI ID"
          >
            <div className="upi-header-avatar">
              {user?.avatar || 'BR'}
            </div>
          </button>
        </div>
      </div>

      {/* Modern Search Bar */}
      <div className="upi-search-box">
        <Search size={18} className="upi-search-icon" />
        <input
          type="text"
          placeholder="Search people, UPI ID or mobile number"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="upi-search-input"
        />
        {searchQuery && (
          <button
            type="button"
            className="upi-search-clear"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </header>
  );
}
