import React from 'react';
import {
  Search,
  Bell,
  Shield,
  X,
  QrCode,
  Home,
  Clock,
  Gift,
  User,
} from 'lucide-react';

export default function TopHeader({
  user,
  searchQuery,
  onSearchChange,
  onOpenNotifications,
  unreadCount = 0,
  onOpenProfile,
  activeTab = 'home',
  onSelectTab,
  onScanClick,
}) {
  return (
    <header className="upi-top-header">
      <div className="upi-header-inner-container">
        {/* Left: Brand Logo & Hackathon Pill */}
        <div className="upi-brand-block" onClick={() => onSelectTab?.('home')} role="button" tabIndex={0}>
          <div className="upi-logo-symbol">
            <Shield size={22} className="upi-logo-icon" />
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

        {/* Center: Search Bar */}
        <div className="upi-header-search-wrap">
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
        </div>

        {/* Right: Desktop Navigation Tabs & Actions */}
        <div className="upi-header-actions">
          {/* Desktop Navigation Links (Visible on Tablet/Laptop >= 900px) */}
          <nav className="desktop-header-nav" aria-label="Main Navigation">
            <button
              type="button"
              className={`desktop-nav-link ${activeTab === 'home' ? 'nav-link-active' : ''}`}
              onClick={() => onSelectTab?.('home')}
            >
              <Home size={17} />
              <span>Home</span>
            </button>

            <button
              type="button"
              className={`desktop-nav-link ${activeTab === 'history' ? 'nav-link-active' : ''}`}
              onClick={() => onSelectTab?.('history')}
            >
              <Clock size={17} />
              <span>History</span>
            </button>

            <button
              type="button"
              className={`desktop-nav-link ${activeTab === 'rewards' ? 'nav-link-active' : ''}`}
              onClick={() => onSelectTab?.('rewards')}
            >
              <Gift size={17} />
              <span>Rewards</span>
            </button>

            <button
              type="button"
              className={`desktop-nav-link ${activeTab === 'profile' ? 'nav-link-active' : ''}`}
              onClick={() => onSelectTab?.('profile')}
            >
              <User size={17} />
              <span>Profile</span>
            </button>
          </nav>

          {/* Quick Scan Action Button on Desktop */}
          {onScanClick && (
            <button
              type="button"
              className="desktop-scan-btn"
              onClick={onScanClick}
              title="Scan any UPI QR Code"
            >
              <QrCode size={16} />
              <span>Scan & Pay</span>
            </button>
          )}

          {/* Notifications button */}
          <button
            type="button"
            className="upi-icon-btn"
            onClick={onOpenNotifications}
            aria-label="View notifications"
          >
            <Bell size={19} />
            {unreadCount > 0 && <span className="upi-badge-count">{unreadCount}</span>}
          </button>

          {/* User profile avatar / pill */}
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
            <div className="desktop-user-meta">
              <span className="desktop-user-name">{user?.name || 'Bhaskar Rao'}</span>
              <span className="desktop-user-upi">{user?.upiId || 'bhaskar@paypilot'}</span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
