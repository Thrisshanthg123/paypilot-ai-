import React, { useState } from 'react';
import {
  X,
  Building2,
  Lock,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export default function CheckBalanceModal({ isOpen, onClose, accounts = [] }) {
  const [selectedAccId, setSelectedAccId] = useState(null);
  const [revealedBalances, setRevealedBalances] = useState({});
  const [pinInput, setPinInput] = useState(['', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleStartCheck = (accId) => {
    setSelectedAccId(accId);
    setPinInput(['', '', '', '']);
  };

  const handleDigit = (digit) => {
    const emptyIdx = pinInput.findIndex((d) => d === '');
    if (emptyIdx !== -1) {
      const next = [...pinInput];
      next[emptyIdx] = digit;
      setPinInput(next);

      if (emptyIdx === 3) {
        setIsVerifying(true);
        setTimeout(() => {
          setRevealedBalances((prev) => ({
            ...prev,
            [selectedAccId]: true,
          }));
          setIsVerifying(false);
          setSelectedAccId(null);
        }, 500);
      }
    }
  };

  const handleBackspace = () => {
    const lastFilled = pinInput.slice().reverse().findIndex((d) => d !== '');
    if (lastFilled !== -1) {
      const actualIdx = 3 - lastFilled;
      const next = [...pinInput];
      next[actualIdx] = '';
      setPinInput(next);
    }
  };

  return (
    <div className="upi-modal-overlay" onClick={onClose}>
      <div className="upi-modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="upi-modal-header">
          <div className="upi-modal-title-group">
            <h3 className="upi-modal-main-title">Check Bank Account Balance</h3>
            <span className="upi-modal-sub-title">PayPilot AI • NPCI & PayPal Sandbox Direct Inquiry</span>
          </div>
          <button type="button" className="upi-modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="upi-modal-body">
          {selectedAccId ? (
            /* PIN Screen */
            <div className="text-center py-4">
              <Lock size={32} className="upi-pin-icon mb-2" />
              <h4 className="upi-pin-title">Enter 4-Digit UPI PIN</h4>
              <p className="upi-pin-disclaimer">
                <strong>Demo:</strong> Enter any 4 numbers to view live balance.
              </p>

              <div className="upi-pin-dots my-4">
                {pinInput.map((digit, i) => (
                  <div key={i} className={`upi-pin-dot ${digit !== '' ? 'dot-filled' : ''}`}>
                    {digit !== '' ? '●' : ''}
                  </div>
                ))}
              </div>

              {/* Keypad */}
              <div className="upi-keypad-grid">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'DEL'].map((k, idx) => {
                  if (k === '') return <div key={idx} />;
                  if (k === 'DEL') {
                    return (
                      <button key={idx} type="button" className="upi-key-btn key-action" onClick={handleBackspace}>
                        ⌫
                      </button>
                    );
                  }
                  return (
                    <button key={idx} type="button" className="upi-key-btn" onClick={() => handleDigit(k)}>
                      {k}
                    </button>
                  );
                })}
              </div>

              {isVerifying && (
                <div className="upi-processing-overlay">
                  <div className="upi-spinner" />
                  <span>Connecting to Bank Switch...</span>
                </div>
              )}
            </div>
          ) : (
            /* Accounts List */
            <div className="balance-accounts-list">
              {accounts.map((acc) => {
                const isRevealed = revealedBalances[acc.id];
                return (
                  <div key={acc.id} className="balance-account-card">
                    <div className="balance-card-header">
                      <div className="balance-icon-wrap" style={{ backgroundColor: acc.logoColor || '#1a73e8' }}>
                        <Building2 size={18} color="#fff" />
                      </div>
                      <div className="balance-card-titles">
                        <span className="balance-bank-name">{acc.bankName}</span>
                        <span className="balance-acc-num">
                          {acc.type} • {acc.accountNumberMasked}
                        </span>
                      </div>
                      {acc.isPrimary && <span className="primary-pill">Primary</span>}
                    </div>

                    <div className="balance-amount-row">
                      {isRevealed ? (
                        <div className="revealed-balance-box">
                          <span className="balance-currency">₹</span>
                          <span className="balance-big-val">
                            {acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                          <span className="balance-checked-tag">
                            <CheckCircle2 size={14} className="text-emerald" /> Verified
                          </span>
                        </div>
                      ) : (
                        <div className="hidden-balance-box">
                          <span className="balance-dots">₹ ••••••••</span>
                        </div>
                      )}

                      <button
                        type="button"
                        className="check-now-btn"
                        onClick={() => handleStartCheck(acc.id)}
                      >
                        {isRevealed ? <RefreshCw size={13} /> : <Lock size={13} />}
                        <span>{isRevealed ? 'Refresh' : 'Check Balance'}</span>
                      </button>
                    </div>

                    {acc.usdEquivalent && (
                      <div className="paypal-sbx-note">
                        PayPal Sandbox USD Equivalent: ${acc.usdEquivalent.toFixed(2)} USD
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="upi-modal-footer">
          <button type="button" className="upi-secondary-btn w-full" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
