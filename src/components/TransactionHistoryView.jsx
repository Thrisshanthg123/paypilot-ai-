import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
} from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function TransactionHistoryView({
  transactions = [],
  onSelectTransaction,
  searchQuery = '',
  onSearchChange,
}) {
  const [activeTab, setActiveTab] = useState('all');

  const filtered = useMemo(() => {
    let result = [...transactions];

    if (activeTab === 'debit') {
      result = result.filter((t) => t.type === 'debit');
    } else if (activeTab === 'credit') {
      result = result.filter((t) => t.type === 'credit');
    } else if (activeTab === 'bill') {
      result = result.filter((t) => t.category === 'bill');
    } else if (activeTab === 'flagged') {
      result = result.filter(
        (t) => t.status === 'blocked' || t.risk?.level === 'high' || t.risk?.level === 'critical',
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.recipientName.toLowerCase().includes(q) ||
          t.recipientUpi.toLowerCase().includes(q) ||
          t.refId.toLowerCase().includes(q) ||
          t.note?.toLowerCase().includes(q) ||
          t.amount.toString().includes(q),
      );
    }

    return result;
  }, [transactions, activeTab, searchQuery]);

  return (
    <div className="upi-history-container">
      {/* Title & Filter Tabs */}
      <div className="upi-history-header">
        <h2 className="upi-history-title">Transaction History</h2>
        <p className="upi-history-sub">All UPI debits, credits and AI-quarantined threats</p>
      </div>

      {/* Search Bar for History */}
      <div className="upi-history-search-bar">
        <Search size={16} className="history-search-icon" />
        <input
          type="text"
          placeholder="Search by name, UPI ID, or Ref ID..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="history-search-input"
        />
      </div>

      {/* Filter Tabs */}
      <div className="upi-history-tabs">
        {[
          { id: 'all', label: 'All' },
          { id: 'debit', label: 'Sent (Debited)' },
          { id: 'credit', label: 'Received (Credited)' },
          { id: 'bill', label: 'Bills & Utilities' },
          { id: 'flagged', label: 'AI Blocked / Flagged' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`upi-tab-chip ${activeTab === tab.id ? 'tab-chip-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <div className="upi-txns-list">
        {filtered.length === 0 ? (
          <div className="upi-empty-history">
            <Clock size={36} className="text-gray mb-2" />
            <h4>No transactions found</h4>
            <p>Try changing your filter or search query</p>
          </div>
        ) : (
          filtered.map((t) => {
            const isDebit = t.type === 'debit';
            const isBlocked = t.status === 'blocked';

            return (
              <div
                key={t.id}
                className={`upi-txn-row ${isBlocked ? 'txn-row-blocked' : ''}`}
                onClick={() => onSelectTransaction(t)}
              >
                {/* Avatar with transfer direction icon */}
                <div className="txn-avatar-col">
                  <div className={`txn-avatar-bubble ${isDebit ? 'avatar-debit' : 'avatar-credit'}`}>
                    {isDebit ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                  </div>
                </div>

                {/* Recipient & Meta info */}
                <div className="txn-info-col">
                  <div className="txn-recipient-name">{t.recipientName}</div>
                  <div className="txn-sub-details">
                    <span className="txn-date">{t.dateLabel || t.timestamp}</span>
                    <span className="bullet-dot">•</span>
                    <span className="txn-upi-tag">{t.recipientUpi}</span>
                  </div>
                  {t.note && <div className="txn-note-text">&ldquo;{t.note}&rdquo;</div>}
                </div>

                {/* Amount & Status info */}
                <div className="txn-amount-col">
                  <div className={`txn-amount-val ${isDebit ? 'amount-debit' : 'amount-credit'}`}>
                    {isDebit ? '- ₹' : '+ ₹'}
                    {t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>

                  <div className="txn-badges-row">
                    <StatusBadge status={t.status} size="sm" />
                    {t.risk && (
                      <span className={`mini-risk-pill risk-${t.risk.level}`}>
                        {t.risk.level.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
