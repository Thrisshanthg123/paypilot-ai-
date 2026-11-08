import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  ShieldAlert,
  CreditCard,
  Users,
  FileCheck2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';

export default function Sidebar({
  activeNav = 'dashboard',
  onSelectNav,
  collapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight, badge: 'Live' },
    { id: 'risk', label: 'AI Risk & Fraud', icon: ShieldAlert, badge: 'Shield' },
    { id: 'analytics', label: 'Analytics & Trends', icon: TrendingUp, badge: null },
    { id: 'rails', label: 'Settlement Rails', icon: CreditCard, badge: null },
    { id: 'customers', label: 'Accounts & KYC', icon: Users, badge: null },
    { id: 'compliance', label: 'AML & Auditing', icon: FileCheck2, badge: null },
    { id: 'settings', label: 'Platform Config', icon: Settings, badge: null },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="sidebar-mobile-overlay"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`app-sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${
          isMobileOpen ? 'sidebar-mobile-open' : ''
        }`}
      >
        {/* Brand Header */}
        <div className="sidebar-brand-header">
          <div className="brand-logo-wrap">
            <div className="brand-icon-shield">
              <Shield className="brand-shield-icon" size={20} />
              <div className="brand-inner-glow" />
            </div>
            {!collapsed && (
              <div className="brand-text-block">
                <div className="brand-name-row">
                  <span className="brand-title">PayPilot</span>
                  <span className="brand-ai-badge">AI</span>
                </div>
                <span className="brand-tagline">FINTECH INTELLIGENCE</span>
              </div>
            )}
          </div>

          {/* Desktop collapse button */}
          <button
            type="button"
            className="sidebar-toggle-btn hide-on-mobile"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation List */}
        <div className="sidebar-nav-container">
          <div className="nav-section-label">{!collapsed && 'CORE PLATFORM'}</div>
          <nav className="nav-items-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`nav-link-btn ${isActive ? 'nav-link-active' : ''}`}
                  onClick={() => {
                    onSelectNav(item.id);
                    if (isMobileOpen && onCloseMobile) onCloseMobile();
                  }}
                  title={collapsed ? item.label : undefined}
                >
                  <div className="nav-icon-box">
                    <Icon size={18} />
                  </div>
                  {!collapsed && <span className="nav-label">{item.label}</span>}
                  {!collapsed && item.badge && (
                    <span
                      className={`nav-badge ${
                        item.badge === 'Live' ? 'badge-live' : 'badge-shield'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* AI System Status widget in sidebar */}
        {!collapsed && (
          <div className="sidebar-engine-card">
            <div className="engine-card-header">
              <div className="engine-indicator-dot" />
              <span className="engine-label">AI Neural Shield v4.2</span>
            </div>
            <p className="engine-desc">Autonomous threat quarantine is active. 0 zero-day leaks.</p>
            <div className="engine-metrics-bar">
              <div className="engine-metric">
                <span className="m-val">99.82%</span>
                <span className="m-lbl">Integrity</span>
              </div>
              <div className="engine-metric">
                <span className="m-val">14ms</span>
                <span className="m-lbl">Latency</span>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="user-mini-card">
            <div className="user-mini-avatar">BR</div>
            {!collapsed && (
              <div className="user-mini-meta">
                <span className="user-mini-name">Bhaskar Rao</span>
                <span className="user-mini-role">Chief Risk Officer</span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
