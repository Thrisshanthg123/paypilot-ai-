import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  User,
  Plus,
  Cpu,
  Shield,
  Menu,
  ChevronDown,
  LogOut,
  Settings,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

export default function TopNavbar({
  user,
  searchQuery,
  onSearchChange,
  notifications,
  onMarkAllRead,
  onClearNotification,
  onOpenNewPayment,
  onOpenAiScan,
  onToggleSidebar,
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="top-navbar">
      <div className="navbar-left">
        {/* Mobile Hamburger Menu */}
        <button
          type="button"
          className="mobile-nav-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        {/* Global Live Search Box */}
        <div className="global-search-container">
          <Search size={16} className="search-lead-icon" />
          <input
            type="text"
            placeholder="Search transactions, customers, IDs, risk indicators..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="global-search-input"
          />
          <span className="search-shortcut-badge">⌘K</span>
        </div>
      </div>

      <div className="navbar-right">
        {/* Quick Action: AI Scan */}
        <button
          type="button"
          className="navbar-ai-scan-btn"
          onClick={onOpenAiScan}
          title="Run Neural Risk & Fraud Scan"
        >
          <Cpu size={15} className="text-blue-500 animate-pulse" />
          <span className="hide-on-mobile">AI Threat Scan</span>
        </button>

        {/* Quick Action: New Payment */}
        <button
          type="button"
          className="navbar-primary-btn"
          onClick={onOpenNewPayment}
          title="Dispatch New Payment"
        >
          <Plus size={16} />
          <span className="hide-on-mobile">New Payment</span>
        </button>

        {/* Notifications Icon with Dropdown */}
        <div className="dropdown-relative" ref={notifRef}>
          <button
            type="button"
            className={`navbar-icon-btn ${showNotifications ? 'btn-active' : ''}`}
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="unread-dot-badge">{unreadCount}</span>}
          </button>

          <NotificationDropdown
            notifications={notifications}
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
            onMarkAllRead={onMarkAllRead}
            onClearNotification={onClearNotification}
          />
        </div>

        <div className="nav-divider hide-on-mobile" />

        {/* Profile Dropdown */}
        <div className="dropdown-relative" ref={profileRef}>
          <button
            type="button"
            className="navbar-profile-btn"
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            aria-label="User Profile"
          >
            <div className="profile-avatar-circle">
              {user?.avatarInitials || 'BR'}
            </div>
            <div className="profile-info-text hide-on-mobile">
              <span className="profile-name">{user?.name || 'Bhaskar Rao'}</span>
              <span className="profile-role">{user?.role || 'Chief Risk Officer'}</span>
            </div>
            <ChevronDown size={14} className="profile-chevron hide-on-mobile" />
          </button>

          {showProfileMenu && (
            <div className="profile-dropdown-menu">
              <div className="profile-menu-header">
                <span className="p-name">{user?.name || 'Bhaskar Rao'}</span>
                <span className="p-email">{user?.email || 'bhaskar@paypilot.ai'}</span>
                <span className="org-badge">{user?.org || 'PayPilot Enterprise'}</span>
              </div>

              <div className="profile-menu-items">
                <button type="button" className="profile-menu-item" onClick={() => setShowProfileMenu(false)}>
                  <User size={15} />
                  <span>Executive Profile</span>
                </button>
                <button type="button" className="profile-menu-item" onClick={() => setShowProfileMenu(false)}>
                  <Shield size={15} />
                  <span>Security & Keys (2FA Active)</span>
                </button>
                <button type="button" className="profile-menu-item" onClick={() => setShowProfileMenu(false)}>
                  <Settings size={15} />
                  <span>Treasury Settings</span>
                </button>
                <button type="button" className="profile-menu-item" onClick={() => setShowProfileMenu(false)}>
                  <HelpCircle size={15} />
                  <span>API Documentation</span>
                  <ExternalLink size={12} className="ml-auto opacity-50" />
                </button>
              </div>

              <div className="profile-menu-footer">
                <button
                  type="button"
                  className="profile-menu-item text-rose"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
