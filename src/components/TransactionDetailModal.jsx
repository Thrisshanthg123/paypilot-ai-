import React from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  Copy,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import RiskIndicator from './RiskIndicator';

export default function TransactionDetailModal({
  transaction,
  isOpen,
  onClose,
  onCopyText,
}) {
  if (!isOpen || !transaction) return null;

  const isDebit = transaction.type === 'debit';
  const isBlocked = transaction.status === 'blocked';

  return (
    <div className="upi-modal-overlay" onClick={onClose}>
      <div className="upi-modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="upi-modal-header">
          <div className="upi-modal-title-group">
            <h3 className="upi-modal-main-title">Transaction Receipt</h3>
            <span className="upi-modal-sub-title">UPI & PayPal AI Threat Audit</span>
          </div>
          <button type="button" className="upi-modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="upi-modal-body">
          {/* Main Amount Card */}
          <div className="receipt-main-card">
            <div className={`receipt-icon-circle ${isBlocked ? 'bg-rose-50 text-rose' : isDebit ? 'bg-blue-50 text-blue' : 'bg-emerald-50 text-emerald'}`}>
              {isBlocked ? <ShieldAlert size={32} /> : isDebit ? <ArrowUpRight size={32} /> : <ArrowDownLeft size={32} />}
            </div>

            <h2 className="receipt-amount-display">
              {isDebit ? '- ₹' : '+ ₹'}
              {transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>

            <p className="receipt-status-text">
              {isBlocked ? 'Transaction Intercepted by AI Shield' : isDebit ? `Paid to ${transaction.recipientName}` : `Received from ${transaction.recipientName}`}
            </p>

            <div className="receipt-badge-wrap">
              <StatusBadge status={transaction.status} />
              {transaction.risk && (
                <RiskIndicator risk={transaction.risk} showScore={true} compact={false} />
              )}
            </div>
          </div>

          {/* Details Table */}
          <div className="receipt-details-list">
            <div className="receipt-item-row">
              <span className="receipt-item-label">UPI Reference No.</span>
              <div className="receipt-item-val-group">
                <span className="mono font-semibold">{transaction.refId || 'UPI/432091884102'}</span>
                <button
                  type="button"
                  className="copy-mini-btn"
                  onClick={() => onCopyText?.(transaction.refId)}
                  title="Copy Reference"
                >
                  <Copy size={12} />
                </button>
              </div>
            </div>

            <div className="receipt-item-row">
              <span className="receipt-item-label">Recipient UPI VPA</span>
              <span className="receipt-item-val">{transaction.recipientUpi}</span>
            </div>

            <div className="receipt-item-row">
              <span className="receipt-item-label">Bank Account Used</span>
              <span className="receipt-item-val">{transaction.accountUsed || 'HDFC Bank •• 4912'}</span>
            </div>

            <div className="receipt-item-row">
              <span className="receipt-item-label">Date & Time</span>
              <span className="receipt-item-val">{transaction.dateLabel || transaction.timestamp}</span>
            </div>

            {transaction.note && (
              <div className="receipt-item-row">
                <span className="receipt-item-label">Payment Note</span>
                <span className="receipt-item-val italic">&ldquo;{transaction.note}&rdquo;</span>
              </div>
            )}
          </div>

          {/* AI Security Intelligence Card */}
          {transaction.risk && (
            <div className="receipt-ai-card">
              <div className="ai-card-title-row">
                <div className="flex-center gap-2">
                  <ShieldCheck size={18} className="text-emerald" />
                  <span className="font-bold text-sm">PayPal AI Security Verdict</span>
                </div>
                <span className="ai-score-pill">
                  Threat Score: {transaction.risk.score}/100
                </span>
              </div>

              <p className="ai-eval-text">
                {transaction.risk.details || 'Verified compliant transaction pattern.'}
              </p>

              <div className="ai-guarantee-note">
                <span className="dot dot-success" />
                <span>Screened by PayPal Neural Guard v4.2 (Developer Sandbox Engine)</span>
              </div>
            </div>
          )}
        </div>

        <div className="upi-modal-footer">
          <button type="button" className="upi-primary-btn w-full" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
