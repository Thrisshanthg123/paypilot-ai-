import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Building2,
  Gift,
} from 'lucide-react';

function UpiPaymentModalInner({
  onClose,
  initialRecipient = null,
  initialAmount = '',
  initialNote = '',
  userAccounts = [],
  onPaymentSuccess,
}) {
  // Step state: 'details' -> 'ai_security' -> 'pin' -> 'result'
  const [step, setStep] = useState('details');

  // Form inputs initialized cleanly from props
  const [recipientName, setRecipientName] = useState(initialRecipient?.name || '');
  const [recipientUpi, setRecipientUpi] = useState(initialRecipient?.upiId || '');
  const [amount, setAmount] = useState(initialAmount ? initialAmount.toString() : '');
  const [note, setNote] = useState(initialNote || '');
  const [selectedAccountId, setSelectedAccountId] = useState('acc-1');

  // PIN simulation state
  const [pinDigits, setPinDigits] = useState(['', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);

  // Completed transaction record for result screen
  const [completedTxn, setCompletedTxn] = useState(null);

  const numAmount = parseFloat(amount) || 0;
  const selectedAccount = userAccounts.find((a) => a.id === selectedAccountId) || userAccounts[0];

  // Dynamic AI Risk Evaluation based on recipient and amount
  const computeAiRisk = () => {
    const upiLower = recipientUpi.toLowerCase();
    const nameLower = recipientName.toLowerCase();
    const isSuspiciousWord =
      upiLower.includes('lottery') ||
      upiLower.includes('win') ||
      upiLower.includes('reward99') ||
      upiLower.includes('free') ||
      nameLower.includes('lottery') ||
      nameLower.includes('prize');

    if (isSuspiciousWord) {
      return {
        score: 94,
        level: 'high',
        verdict: 'SUSPECTED_PHISHING_FRAUD',
        fraudProbability: 0.942,
        recommendation: 'Block',
        title: 'High Risk Phishing Scam Detected',
        warning: 'This UPI ID has been reported by 85+ users in the NPCI/PayPal threat network. Do NOT send money to claim prizes.',
        signals: [
          'VPA contains high-frequency phishing keywords',
          'Account age < 24 hours with sudden inflow requests',
          'Identified in PayPal AI Neural Guard quarantine registry',
        ],
        actionLabel: 'Payment Not Recommended',
      };
    }

    if (numAmount > 50000 || upiLower.includes('unknown')) {
      return {
        score: 48,
        level: 'medium',
        verdict: 'FIRST_TIME_HIGH_VALUE',
        fraudProbability: 0.048,
        recommendation: 'Review',
        title: 'Review High Value Transfer',
        warning: 'You are sending over ₹50,000 to this recipient. Confirm the recipient VPA before authorizing.',
        signals: [
          'High single-transaction amount',
          'Dual confirmation recommended for safety',
          'PayPal Sandbox cross-rail validation passed',
        ],
        actionLabel: 'Proceed with Caution',
      };
    }

    // Standard low-risk peer or verified merchant
    return {
      score: 8,
      level: 'low',
      verdict: 'SAFE_AND_VERIFIED',
      fraudProbability: 0.002,
      recommendation: 'Proceed',
      title: 'Recipient Verified Safe',
      warning: 'Identity verified with bank KYC. Regular pattern with zero fraudulent reports.',
      signals: [
        'VPA identity verified via NPCI directory',
        'Device fingerprint & telemetry secure',
        'PayPal AI Guard pre-flight scan cleared (0.002% anomaly score)',
      ],
      actionLabel: 'Safe to Proceed',
    };
  };

  const aiRisk = computeAiRisk();

  // Handlers for PIN keypad
  const handlePinKeyPress = (digit) => {
    const firstEmptyIndex = pinDigits.findIndex((d) => d === '');
    if (firstEmptyIndex !== -1) {
      const nextDigits = [...pinDigits];
      nextDigits[firstEmptyIndex] = digit;
      setPinDigits(nextDigits);

      // If finished entering 4 digits, trigger simulated payment
      if (firstEmptyIndex === 3) {
        handleFinalAuthorization();
      }
    }
  };

  const handlePinBackspace = () => {
    const lastFilledIndex = pinDigits.slice().reverse().findIndex((d) => d !== '');
    if (lastFilledIndex !== -1) {
      const actualIndex = 3 - lastFilledIndex;
      const nextDigits = [...pinDigits];
      nextDigits[actualIndex] = '';
      setPinDigits(nextDigits);
    }
  };

  // Final payment processing simulation
  const handleFinalAuthorization = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const isBlocked = aiRisk.level === 'high' && aiRisk.recommendation === 'Block';
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const refId = `UPI/${Math.floor(432000000000 + Math.random() * 999999999)}`;
      const txnId = `TXN-UPI-${Math.floor(98242 + Math.random() * 1000)}`;

      const newTxn = {
        id: txnId,
        refId,
        recipientName: recipientName || 'Payee',
        recipientUpi: recipientUpi || 'payee@upi',
        type: 'debit',
        amount: numAmount,
        timestamp: now.toISOString().replace('T', ' ').substring(0, 16),
        dateLabel: `Today, ${timeString}`,
        status: isBlocked ? 'blocked' : 'successful',
        category: 'transfer',
        accountUsed: selectedAccount?.bankName ? `${selectedAccount.bankName} ${selectedAccount.accountNumberMasked}` : 'HDFC Bank •• 4912',
        note: note || 'Payment via PayPilot AI',
        risk: {
          score: aiRisk.score,
          level: aiRisk.level,
          verdict: aiRisk.verdict,
          fraudProbability: aiRisk.fraudProbability,
          recommendation: aiRisk.recommendation,
          details: aiRisk.warning,
          securityPill: isBlocked ? 'PayPal AI Shield: Blocked' : 'PayPal AI Guard: Clear',
        },
      };

      setCompletedTxn(newTxn);
      setIsProcessing(false);
      setStep('result');

      if (!isBlocked && onPaymentSuccess) {
        onPaymentSuccess(newTxn);
      }
    }, 700);
  };

  return (
    <div className="upi-modal-overlay" onClick={onClose}>
      <div className="upi-modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="upi-modal-header">
          <div className="upi-modal-title-group">
            <h3 className="upi-modal-main-title">
              {step === 'details' && 'Send Money via UPI'}
              {step === 'ai_security' && 'AI Payment Security Check'}
              {step === 'pin' && 'Enter UPI PIN (Demo)'}
              {step === 'result' && (completedTxn?.status === 'successful' ? 'Payment Successful' : 'Payment Intercepted')}
            </h3>
            <span className="upi-modal-sub-title">PayPilot AI • PayPal Hackathon Demo</span>
          </div>
          <button type="button" className="upi-modal-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* ================= STEP 1: ENTER DETAILS ================= */}
        {step === 'details' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (recipientName && recipientUpi && numAmount > 0) {
                setStep('ai_security');
              }
            }}
            className="upi-modal-body"
          >
            {/* Recipient Details */}
            <div className="upi-form-group">
              <label className="upi-form-label">Paying To</label>
              <input
                type="text"
                required
                placeholder="Recipient Name (e.g. Priya Sharma)"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="upi-input"
              />
            </div>

            <div className="upi-form-group">
              <label className="upi-form-label">Recipient UPI ID / Mobile</label>
              <input
                type="text"
                required
                placeholder="e.g. priya.s@okhdfcbank or 9876543210"
                value={recipientUpi}
                onChange={(e) => setRecipientUpi(e.target.value)}
                className="upi-input"
              />
            </div>

            {/* Amount */}
            <div className="upi-form-group">
              <label className="upi-form-label">Amount (₹)</label>
              <div className="upi-amount-input-wrapper">
                <span className="upi-rupee-symbol">₹</span>
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="upi-amount-field"
                  autoFocus
                />
              </div>
            </div>

            {/* Note */}
            <div className="upi-form-group">
              <label className="upi-form-label">Add a note (optional)</label>
              <input
                type="text"
                placeholder="e.g. Dinner, Rent, Groceries"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="upi-input"
              />
            </div>

            {/* Paying Account Selector */}
            <div className="upi-form-group">
              <label className="upi-form-label">Pay from Account</label>
              <div className="upi-account-chips">
                {userAccounts.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    className={`upi-account-chip ${selectedAccountId === acc.id ? 'chip-selected' : ''}`}
                    onClick={() => setSelectedAccountId(acc.id)}
                  >
                    <div className="chip-bank-icon" style={{ backgroundColor: acc.logoColor || '#1a73e8' }}>
                      <Building2 size={13} color="#fff" />
                    </div>
                    <div className="chip-text">
                      <span className="chip-name">{acc.bankName}</span>
                      <span className="chip-num">{acc.accountNumberMasked}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit to AI check */}
            <button
              type="submit"
              disabled={!recipientName || !recipientUpi || numAmount <= 0}
              className="upi-submit-btn"
            >
              <span>Continue to AI Safety Check</span>
              <ArrowRight size={18} />
            </button>
          </form>
        )}

        {/* ================= STEP 2: AI RISK SECURITY CHECK ================= */}
        {step === 'ai_security' && (
          <div className="upi-modal-body">
            <div className="upi-ai-check-card">
              {/* Status Header */}
              <div className={`upi-ai-banner ${aiRisk.level === 'high' ? 'ai-banner-danger' : aiRisk.level === 'medium' ? 'ai-banner-warning' : 'ai-banner-success'}`}>
                {aiRisk.level === 'high' ? (
                  <ShieldAlert size={28} className="text-rose" />
                ) : aiRisk.level === 'medium' ? (
                  <AlertTriangle size={28} className="text-amber" />
                ) : (
                  <ShieldCheck size={28} className="text-emerald" />
                )}
                <div>
                  <h4 className="ai-banner-title">{aiRisk.title}</h4>
                  <p className="ai-banner-sub">
                    Risk Score: <strong>{aiRisk.score}/100</strong> • {aiRisk.level.toUpperCase()} RISK
                  </p>
                </div>
              </div>

              {/* Transfer Summary */}
              <div className="upi-ai-summary-row">
                <div>
                  <span className="ai-label">Paying Amount</span>
                  <div className="ai-val-big">₹{numAmount.toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <span className="ai-label">To Payee</span>
                  <div className="ai-val-name">{recipientName}</div>
                  <div className="ai-val-upi">{recipientUpi}</div>
                </div>
              </div>

              {/* Fraud Warnings & Signals */}
              <div className="upi-ai-signals-box">
                <span className="ai-signals-heading">PayPilot AI Threat Analysis:</span>
                <p className="ai-warning-desc">{aiRisk.warning}</p>

                <div className="ai-signal-pills">
                  {aiRisk.signals.map((sig, idx) => (
                    <div key={idx} className="ai-signal-item">
                      <span className="signal-bullet">•</span>
                      <span>{sig}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hackathon Sandbox Badge */}
              <div className="hackathon-compliance-strip">
                <Sparkles size={14} className="text-blue" />
                <span>Screened by PayPal Neural Guard Engine • PayPal Sandbox Active</span>
              </div>
            </div>

            {/* Security Action Buttons */}
            <div className="upi-modal-actions-row">
              <button
                type="button"
                className="upi-secondary-btn"
                onClick={() => setStep('details')}
              >
                Back / Edit
              </button>

              {aiRisk.level === 'high' ? (
                <button
                  type="button"
                  className="upi-danger-btn"
                  onClick={() => setStep('pin')}
                >
                  <ShieldAlert size={16} />
                  <span>Override & Pay at Own Risk</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="upi-primary-btn"
                  onClick={() => setStep('pin')}
                >
                  <Lock size={16} />
                  <span>Proceed to UPI PIN</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ================= STEP 3: SIMULATED UPI PIN SCREEN ================= */}
        {step === 'pin' && (
          <div className="upi-modal-body text-center">
            <div className="upi-pin-header">
              <Lock size={28} className="upi-pin-icon" />
              <h4 className="upi-pin-title">Enter 4-Digit UPI PIN</h4>
              <p className="upi-pin-disclaimer">
                <strong>Demo Mode:</strong> Press any 4 numbers below. Your real UPI PIN is NEVER requested or collected.
              </p>
              <div className="upi-pin-paying-info">
                Paying <strong>₹{numAmount.toLocaleString()}</strong> from {selectedAccount?.bankName}
              </div>
            </div>

            {/* PIN Dots */}
            <div className="upi-pin-dots">
              {pinDigits.map((digit, i) => (
                <div key={i} className={`upi-pin-dot ${digit !== '' ? 'dot-filled' : ''}`}>
                  {digit !== '' ? '●' : ''}
                </div>
              ))}
            </div>

            {/* On-screen Keypad */}
            <div className="upi-keypad-grid">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'DEL'].map((keyVal, idx) => {
                if (keyVal === '') return <div key={idx} />;
                if (keyVal === 'DEL') {
                  return (
                    <button
                      key={idx}
                      type="button"
                      className="upi-key-btn key-action"
                      onClick={handlePinBackspace}
                    >
                      ⌫
                    </button>
                  );
                }
                return (
                  <button
                    key={idx}
                    type="button"
                    className="upi-key-btn"
                    onClick={() => handlePinKeyPress(keyVal)}
                  >
                    {keyVal}
                  </button>
                );
              })}
            </div>

            {isProcessing && (
              <div className="upi-processing-overlay">
                <div className="upi-spinner" />
                <span>Authorizing with Bank Gateway...</span>
              </div>
            )}
          </div>
        )}

        {/* ================= STEP 4: SUCCESS / RESULT SCREEN ================= */}
        {step === 'result' && completedTxn && (
          <div className="upi-modal-body upi-result-body">
            {completedTxn.status === 'successful' ? (
              <div className="upi-success-card">
                <div className="success-icon-burst">
                  <CheckCircle2 size={56} className="text-emerald" />
                </div>
                <h3 className="success-heading">₹{completedTxn.amount.toLocaleString()}</h3>
                <p className="success-recipient">Paid to {completedTxn.recipientName}</p>
                <span className="success-upi-id">{completedTxn.recipientUpi}</span>

                <div className="success-receipt-details">
                  <div className="receipt-row">
                    <span>UPI Reference No.</span>
                    <strong className="mono">{completedTxn.refId}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Paid From</span>
                    <span>{completedTxn.accountUsed}</span>
                  </div>
                  <div className="receipt-row">
                    <span>Time</span>
                    <span>{completedTxn.dateLabel}</span>
                  </div>
                  <div className="receipt-row">
                    <span>Security Screening</span>
                    <span className="text-emerald font-semibold">AI Verified Clean</span>
                  </div>
                </div>

                {/* Reward notification */}
                <div className="upi-reward-earned-box">
                  <Gift size={20} className="text-amber" />
                  <div>
                    <div className="reward-box-title">You earned a Scratch Card!</div>
                    <div className="reward-box-sub">Check your Rewards tab for cashback</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="upi-blocked-card">
                <div className="blocked-icon-burst">
                  <ShieldAlert size={56} className="text-rose" />
                </div>
                <h3 className="blocked-heading">Payment Blocked</h3>
                <p className="blocked-desc">
                  PayPilot AI Shield protected your account from an active scam threat.
                </p>
                <div className="blocked-details-box">
                  <span>Reason:</span> {completedTxn.risk?.details}
                </div>
              </div>
            )}

            <div className="upi-result-footer">
              <button
                type="button"
                className="upi-primary-btn w-full"
                onClick={onClose}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UpiPaymentModal({
  isOpen,
  onClose,
  initialRecipient = null,
  initialAmount = '',
  initialNote = '',
  userAccounts = [],
  onPaymentSuccess,
}) {
  if (!isOpen) return null;

  return (
    <UpiPaymentModalInner
      onClose={onClose}
      initialRecipient={initialRecipient}
      initialAmount={initialAmount}
      initialNote={initialNote}
      userAccounts={userAccounts}
      onPaymentSuccess={onPaymentSuccess}
    />
  );
}
