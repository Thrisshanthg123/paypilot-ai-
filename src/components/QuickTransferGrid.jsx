import React from 'react';
import {
  QrCode,
  Smartphone,
  Landmark,
  AtSign,
  ArrowLeftRight,
  ShieldCheck,
} from 'lucide-react';

export default function QuickTransferGrid({
  onScanClick,
  onTransferClick,
  onCheckBalanceClick,
}) {
  const transferActions = [
    {
      id: 'scan',
      label: 'Scan & Pay',
      sublabel: 'Any QR Code',
      icon: QrCode,
      color: '#1a73e8',
      bg: '#e8f0fe',
      borderColor: '#c2e7ff',
      onClick: onScanClick,
    },
    {
      id: 'mobile',
      label: 'To Mobile',
      sublabel: 'Phone number',
      icon: Smartphone,
      color: '#6739b7',
      bg: '#ede7f6',
      borderColor: '#d1c4e9',
      onClick: () => onTransferClick({ mode: 'mobile' }),
    },
    {
      id: 'bank',
      label: 'To Bank a/c',
      sublabel: 'A/C or IFSC',
      icon: Landmark,
      color: '#00a86b',
      bg: '#e8f5e9',
      borderColor: '#c8e6c9',
      onClick: () => onTransferClick({ mode: 'bank' }),
    },
    {
      id: 'upi',
      label: 'To UPI ID',
      sublabel: 'Instant VPA',
      icon: AtSign,
      color: '#0288d1',
      bg: '#e1f5fe',
      borderColor: '#b3e5fc',
      onClick: () => onTransferClick({ mode: 'upi' }),
    },
    {
      id: 'self',
      label: 'Self Transfer',
      sublabel: 'Between a/cs',
      icon: ArrowLeftRight,
      color: '#f57c00',
      bg: '#fff3e0',
      borderColor: '#ffe0b2',
      onClick: () => onTransferClick({ mode: 'self' }),
    },
    {
      id: 'balance',
      label: 'Check Balance',
      sublabel: 'Bank & PayPal',
      icon: ShieldCheck,
      color: '#512da8',
      bg: '#ede7f6',
      borderColor: '#d1c4e9',
      onClick: onCheckBalanceClick,
    },
  ];

  return (
    <section className="upi-transfer-section">
      <div className="upi-section-heading-row">
        <h2 className="upi-section-title">Money Transfers</h2>
        <span className="upi-sub-tag">Instant • Zero Fee</span>
      </div>

      <div className="upi-transfer-grid">
        {transferActions.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              className="upi-transfer-card"
              onClick={item.onClick}
            >
              <div
                className="upi-transfer-circle"
                style={{
                  backgroundColor: item.bg,
                  color: item.color,
                  borderColor: item.borderColor,
                }}
              >
                <Icon size={24} className="upi-action-icon" />
              </div>
              <span className="upi-action-label">{item.label}</span>
              <span className="upi-action-sublabel">{item.sublabel}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
