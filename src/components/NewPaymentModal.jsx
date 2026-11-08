import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function NewPaymentModal({ isOpen, onClose, onSubmitPayment }) {
  const [formData, setFormData] = useState({
    recipient: '',
    customerName: 'Bhaskar Rao (Treasury)',
    customerEmail: 'bhaskar@paypilot.ai',
    amount: '',
    currency: 'USD',
    methodType: 'Bank Wire',
    purpose: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const numericAmount = parseFloat(formData.amount) || 0;
  const isHighValue = numericAmount >= 25000;
  const predictedRiskScore = numericAmount > 50000 ? 55 : numericAmount > 20000 ? 28 : 10;
  const predictedRiskLevel = predictedRiskScore > 50 ? 'medium' : 'low';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.recipient.trim() || !numericAmount || numericAmount <= 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const now = new Date();
      const timestamp = now.toISOString().replace('T', ' ').substring(0, 16);
      const newTxn = {
        id: `TXN-${Math.floor(90822 + Math.random() * 1000)}`,
        customer: {
          name: formData.customerName,
          email: formData.customerEmail,
          company: 'PayPilot Enterprise',
          avatar: 'BR',
        },
        recipient: formData.recipient,
        amount: numericAmount,
        currency: formData.currency,
        timestamp,
        relativeTime: 'Just now',
        method: {
          type: formData.methodType,
          label: `${formData.methodType} •• ${Math.floor(1000 + Math.random() * 9000)}`,
          brand: formData.methodType.toLowerCase().includes('wire') ? 'wire' : 'card',
        },
        status: isHighValue ? 'pending' : 'successful',
        risk: {
          level: predictedRiskLevel,
          score: predictedRiskScore,
          reasons: [
            isHighValue ? 'Elevated corporate threshold review' : 'Dual key authorized payment',
            'Internal treasury originated dispatch',
          ],
        },
        aiAnalysis: {
          verdict: isHighValue ? 'PENDING_CLEARANCE' : 'APPROVED_AUTOMATIC',
          confidence: 99.6,
          fraudProbability: 0.004,
          ipLocation: 'Internal Enterprise Portal',
          anomalyChecksPassed: 18,
          notes: formData.purpose || 'Corporate treasury disbursement verified.',
        },
      };

      onSubmitPayment(newTxn);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container-card new-payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex-center gap-2">
            <div className="modal-title-icon-box">
              <Zap size={18} className="text-blue-500" />
            </div>
            <div>
              <h2 className="modal-title">Dispatch New Payment</h2>
              <p className="modal-subtitle">Direct settlement rail with automated AI pre-flight screening</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="new-payment-form">
          <div className="modal-body-scroll">
            {/* Recipient */}
            <div className="form-group">
              <label className="form-label">
                Recipient / Counterparty Name <span className="text-rose">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Stripe Merchant Settlement, Cloudflare Inc."
                value={formData.recipient}
                onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                className="form-input"
              />
            </div>

            {/* Amount & Currency */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">
                  Amount <span className="text-rose">*</span>
                </label>
                <div className="input-with-prefix">
                  <span className="input-prefix">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="form-input pl-7"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Settlement Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="form-select"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            {/* Payment Rail */}
            <div className="form-group">
              <label className="form-label">Payment Rail & Settlement Engine</label>
              <div className="rail-selector-grid">
                {[
                  { id: 'Bank Wire', label: 'Fedwire / SWIFT', desc: 'Real-time Gross Settlement' },
                  { id: 'ACH', label: 'ACH Direct', desc: 'Standard 24-48h clearing' },
                  { id: 'Credit Card', label: 'Virtual Corporate Card', desc: 'Instant authorization' },
                  { id: 'Crypto', label: 'USDC Vault Off-ramp', desc: 'Atomic smart contract' },
                ].map((rail) => (
                  <div
                    key={rail.id}
                    className={`rail-option-card ${formData.methodType === rail.id ? 'rail-active' : ''}`}
                    onClick={() => setFormData({ ...formData, methodType: rail.id })}
                  >
                    <div className="rail-card-title">{rail.label}</div>
                    <div className="rail-card-desc">{rail.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Purpose */}
            <div className="form-group">
              <label className="form-label">Payment Purpose / Reference</label>
              <input
                type="text"
                placeholder="e.g. Q4 Cloud Infrastructure invoice replenishment"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="form-input"
              />
            </div>

            {/* Live AI Risk Pre-flight Assessment Card */}
            <div className="ai-preflight-box">
              <div className="preflight-header">
                <ShieldCheck size={16} className="text-emerald" />
                <span className="preflight-title">PayPilot AI Pre-Flight Guard</span>
                <span className="preflight-score">
                  Projected Risk: <strong>{predictedRiskScore}/100</strong>
                </span>
              </div>
              <p className="preflight-desc">
                {isHighValue
                  ? 'Payment exceeds $25,000 threshold. Will require dual corporate officer confirmation.'
                  : 'Transaction passes all heuristic checks. Eligible for automated instant clearing.'}
              </p>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.recipient.trim() || numericAmount <= 0}
              className="btn-primary"
            >
              {isSubmitting ? 'Routing Payment...' : 'Authorize & Dispatch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
