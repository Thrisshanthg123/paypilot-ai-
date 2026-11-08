import React from 'react';
import {
  Copy,
  QrCode,
  Building2,
  ShieldCheck,
  Lock,
} from 'lucide-react';

export default function ProfileView({ user, onCopyUpi, onCheckBalance }) {
  return (
    <div className="upi-profile-container">
      {/* User Header Profile Card */}
      <div className="upi-profile-card">
        <div className="profile-top-flex">
          <div className="profile-big-avatar">
            {user?.avatar || 'BR'}
          </div>
          <div className="profile-main-meta">
            <h2 className="profile-name">{user?.name || 'Bhaskar Rao'}</h2>
            <span className="profile-phone">{user?.phone || '+91 98450 12345'}</span>
            <div className="profile-upi-pill">
              <span className="upi-val">{user?.upiId || 'bhaskar@paypilot'}</span>
              <button
                type="button"
                className="upi-copy-btn"
                onClick={() => onCopyUpi(user?.upiId)}
                title="Copy UPI ID"
              >
                <Copy size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* User QR Code Box */}
        <div className="profile-qr-box">
          <div className="qr-badge-title">
            <QrCode size={15} />
            <span>My Receiving QR Code</span>
          </div>
          <div className="qr-image-wrapper">
            <img
              src={user?.qrCodeUrl}
              alt="My UPI QR Code"
              className="user-qr-img"
            />
          </div>
          <span className="qr-scan-hint">Scan with any UPI app to pay Bhaskar Rao</span>
        </div>
      </div>

      {/* Linked Bank Accounts */}
      <div className="upi-profile-section">
        <div className="section-title-row">
          <h3 className="section-title">Linked Bank Accounts</h3>
          <span className="section-meta-tag">{user?.linkedAccounts?.length || 0} Accounts</span>
        </div>

        <div className="profile-accounts-list">
          {user?.linkedAccounts?.map((acc) => (
            <div key={acc.id} className="profile-account-item">
              <div className="account-icon-box" style={{ backgroundColor: acc.logoColor || '#1a73e8' }}>
                <Building2 size={16} color="#fff" />
              </div>
              <div className="account-details">
                <div className="acc-name-row">
                  <span className="acc-bank-title">{acc.bankName}</span>
                  {acc.isPrimary && <span className="primary-tag">Primary</span>}
                </div>
                <span className="acc-masked-num">{acc.accountNumberMasked} • {acc.type}</span>
              </div>
              <button
                type="button"
                className="acc-check-btn"
                onClick={onCheckBalance}
              >
                <span>Check</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* PayPal AI Hackathon Sandbox Card */}
      <div className="upi-profile-section">
        <div className="paypal-hackathon-card">
          <div className="hackathon-card-header">
            <div className="hackathon-icon-box">
              <ShieldCheck size={20} className="text-emerald" />
            </div>
            <div>
              <div className="hackathon-title">PayPal AI Hackathon Engine</div>
              <div className="hackathon-status">Developer Sandbox: Connected • Active</div>
            </div>
          </div>

          <p className="hackathon-desc">
            PayPilot AI integrates simulated UPI payment rails with the <strong>PayPal Sandbox & AI Threat Intelligence Model</strong> to detect zero-day phishing, credential tampering, and synthetic identity fraud.
          </p>

          <div className="hackathon-chips-grid">
            <div className="hackathon-chip">
              <span className="chip-key">Sandbox Env</span>
              <strong className="chip-val">sandbox.paypal.com</strong>
            </div>
            <div className="hackathon-chip">
              <span className="chip-key">AI Model Guard</span>
              <strong className="chip-val">Active (v4.2)</strong>
            </div>
            <div className="hackathon-chip">
              <span className="chip-key">Cross-Border Rail</span>
              <strong className="chip-val">USD / INR Bridge</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Security & Preferences */}
      <div className="upi-profile-section">
        <h3 className="section-title mb-2">Safety & App Settings</h3>
        <div className="profile-settings-list">
          <div className="settings-item">
            <div className="settings-label">
              <Lock size={16} className="text-slate" />
              <span>Biometric & Screen Lock</span>
            </div>
            <span className="status-enabled-tag">Enabled</span>
          </div>

          <div className="settings-item">
            <div className="settings-label">
              <ShieldCheck size={16} className="text-emerald" />
              <span>AI Real-time Phishing Interceptor</span>
            </div>
            <span className="status-enabled-tag">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
