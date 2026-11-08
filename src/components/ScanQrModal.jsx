import React from 'react';
import {
  X,
  QrCode,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

export default function ScanQrModal({ isOpen, onClose, onSelectQrTarget }) {
  if (!isOpen) return null;

  const sampleQrs = [
    {
      id: 'qr-1',
      name: 'Blue Tokai Coffee Roasters',
      upiId: 'bluetokai@icici',
      amount: '280',
      note: 'Iced Latte & Croissant',
      type: 'Verified Merchant (Safe)',
      riskLevel: 'low',
    },
    {
      id: 'qr-2',
      name: 'Ramesh General Store',
      upiId: 'ramesh.kirana@paytm',
      amount: '165',
      note: 'Daily Groceries',
      type: 'Local Merchant (Safe)',
      riskLevel: 'low',
    },
    {
      id: 'qr-3',
      name: 'Telegram Lucky Draw Win 99',
      upiId: 'win_cash_lottery99@ybl',
      amount: '5000',
      note: 'Lottery processing fee',
      type: 'Suspicious / Phishing QR (Test AI Shield)',
      riskLevel: 'high',
    },
  ];

  return (
    <div className="upi-modal-overlay" onClick={onClose}>
      <div className="upi-modal-sheet scan-qr-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="upi-modal-header">
          <div className="upi-modal-title-group">
            <h3 className="upi-modal-main-title">Scan Any UPI QR Code</h3>
            <span className="upi-modal-sub-title">PayPilot AI Real-Time QR Threat Inspector</span>
          </div>
          <button type="button" className="upi-modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="upi-modal-body">
          {/* Simulated Scanner Viewfinder */}
          <div className="qr-viewfinder-box">
            <div className="qr-laser-line" />
            <div className="qr-corner qr-top-left" />
            <div className="qr-corner qr-top-right" />
            <div className="qr-corner qr-bottom-left" />
            <div className="qr-corner qr-bottom-right" />
            <div className="qr-center-icon">
              <QrCode size={64} className="qr-target-icon" />
            </div>
            <div className="qr-aim-text">Point camera at BharatPe / GPay / Paytm QR</div>
          </div>

          {/* Quick Sample QR Scenarios for Hackathon Demo */}
          <div className="demo-qr-scenarios">
            <div className="demo-qr-heading">
              <Sparkles size={14} className="text-blue" />
              <span>Hackathon Live Test Scenarios:</span>
            </div>

            <div className="demo-qr-list">
              {sampleQrs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`demo-qr-card ${item.riskLevel === 'high' ? 'demo-qr-danger' : 'demo-qr-safe'}`}
                  onClick={() => {
                    onSelectQrTarget({
                      name: item.name,
                      upiId: item.upiId,
                      amount: item.amount,
                      note: item.note,
                    });
                    onClose();
                  }}
                >
                  <div className="demo-qr-icon">
                    {item.riskLevel === 'high' ? (
                      <ShieldAlert size={18} className="text-rose" />
                    ) : (
                      <ShieldCheck size={18} className="text-emerald" />
                    )}
                  </div>
                  <div className="demo-qr-info">
                    <span className="demo-qr-name">{item.name}</span>
                    <span className="demo-qr-type">{item.type}</span>
                  </div>
                  <div className="demo-qr-amount">
                    <span>₹{item.amount}</span>
                    <ArrowRight size={14} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="upi-modal-footer">
          <button type="button" className="upi-secondary-btn w-full" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
