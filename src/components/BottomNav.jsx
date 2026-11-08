import React from 'react';
import { Home, Clock, QrCode, Gift, User } from 'lucide-react';

export default function BottomNav({ activeTab, onSelectTab, onScanClick }) {
  return (
    <nav className="upi-bottom-nav">
      {/* Home */}
      <button
        type="button"
        className={`bottom-nav-item ${activeTab === 'home' ? 'nav-item-active' : ''}`}
        onClick={() => onSelectTab('home')}
      >
        <Home size={22} className="nav-icon" />
        <span className="nav-text">Home</span>
      </button>

      {/* History */}
      <button
        type="button"
        className={`bottom-nav-item ${activeTab === 'history' ? 'nav-item-active' : ''}`}
        onClick={() => onSelectTab('history')}
      >
        <Clock size={22} className="nav-icon" />
        <span className="nav-text">History</span>
      </button>

      {/* Elevated Central Scan Button */}
      <div className="center-scan-wrapper">
        <button
          type="button"
          className="elevated-scan-btn"
          onClick={onScanClick}
          aria-label="Scan any QR code"
        >
          <div className="scan-btn-inner">
            <QrCode size={26} className="scan-qr-icon" />
          </div>
          <span className="scan-pulse-ring" />
        </button>
        <span className="scan-label-text">Scan & Pay</span>
      </div>

      {/* Rewards */}
      <button
        type="button"
        className={`bottom-nav-item ${activeTab === 'rewards' ? 'nav-item-active' : ''}`}
        onClick={() => onSelectTab('rewards')}
      >
        <Gift size={22} className="nav-icon" />
        <span className="nav-text">Rewards</span>
      </button>

      {/* Profile */}
      <button
        type="button"
        className={`bottom-nav-item ${activeTab === 'profile' ? 'nav-item-active' : ''}`}
        onClick={() => onSelectTab('profile')}
      >
        <User size={22} className="nav-icon" />
        <span className="nav-text">Profile</span>
      </button>
    </nav>
  );
}
