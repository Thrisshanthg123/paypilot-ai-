import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  Download,
  Eye,
  AlertCircle,
  ShieldAlert,
  CreditCard,
  Building2,
  Coins,
  Wallet,
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import RiskIndicator from './RiskIndicator';

export default function TransactionTable({
  transactions = [],
  activeStatusFilter = 'all',
  onFilterChange,
  searchQuery = '',
  onSearchChange,
  onSelectTransaction,
  onExportCSV,
  onFlagTransaction,
}) {
  const [sortField, setSortField] = useState('timestamp'); // 'timestamp' | 'amount' | 'risk'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'
  const [methodFilter, setMethodFilter] = useState('all');

  const filteredAndSorted = useMemo(() => {
    let result = [...transactions];

    // Status filter
    if (activeStatusFilter !== 'all') {
      if (activeStatusFilter === 'flagged') {
        result = result.filter(
          (t) => t.risk?.level === 'high' || t.risk?.level === 'critical' || t.status === 'blocked',
        );
      } else {
        result = result.filter((t) => t.status === activeStatusFilter);
      }
    }

    // Payment method filter
    if (methodFilter !== 'all') {
      result = result.filter((t) => (t.method?.type || '').toLowerCase().includes(methodFilter.toLowerCase()));
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((t) => {
        return (
          t.id.toLowerCase().includes(q) ||
          t.customer?.name?.toLowerCase().includes(q) ||
          t.customer?.email?.toLowerCase().includes(q) ||
          t.customer?.company?.toLowerCase().includes(q) ||
          t.recipient?.toLowerCase().includes(q) ||
          t.method?.label?.toLowerCase().includes(q) ||
          t.amount.toString().includes(q)
        );
      });
    }

    // Sorting
    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'risk') {
        valA = a.risk?.score || 0;
        valB = b.risk?.score || 0;
      } else if (sortField === 'amount') {
        valA = a.amount;
        valB = b.amount;
      } else if (sortField === 'timestamp') {
        valA = new Date(a.timestamp).getTime();
        valB = new Date(b.timestamp).getTime();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [transactions, activeStatusFilter, methodFilter, searchQuery, sortField, sortOrder]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getMethodIcon = (type = '') => {
    const t = type.toLowerCase();
    if (t.includes('card')) return CreditCard;
    if (t.includes('wire') || t.includes('ach')) return Building2;
    if (t.includes('crypto')) return Coins;
    return Wallet;
  };

  const statusTabs = [
    { id: 'all', label: 'All Transactions', count: transactions.length },
    { id: 'successful', label: 'Successful', count: transactions.filter((t) => t.status === 'successful').length },
    { id: 'pending', label: 'Pending', count: transactions.filter((t) => t.status === 'pending').length },
    { id: 'failed', label: 'Failed', count: transactions.filter((t) => t.status === 'failed').length },
    { id: 'blocked', label: 'Blocked', count: transactions.filter((t) => t.status === 'blocked').length },
    {
      id: 'flagged',
      label: 'Flagged Risk',
      count: transactions.filter(
        (t) => t.risk?.level === 'high' || t.risk?.level === 'critical' || t.status === 'blocked',
      ).length,
    },
  ];

  return (
    <div className="table-card">
      {/* Table Header Controls */}
      <div className="table-header-block">
        <div className="table-title-area">
          <h3 className="table-title">Recent Transactions</h3>
          <p className="table-subtitle">
            Showing {filteredAndSorted.length} of {transactions.length} processed payment records
          </p>
        </div>

        <div className="table-actions-group">
          {/* Search Bar */}
          <div className="table-search-box">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              placeholder="Search by ID, merchant, email..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="table-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => onSearchChange('')}
                title="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {/* Payment Method Filter */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="filter-select"
            aria-label="Filter by payment rail"
          >
            <option value="all">All Payment Rails</option>
            <option value="Card">Cards (Visa/MC)</option>
            <option value="Wire">Bank Wire</option>
            <option value="ACH">ACH Direct</option>
            <option value="Crypto">Crypto / Web3</option>
          </select>

          {/* Export CSV button */}
          <button
            type="button"
            className="secondary-action-btn"
            onClick={() => onExportCSV(filteredAndSorted)}
            title="Export filtered records to CSV"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="status-tabs-nav">
        {statusTabs.map((tab) => {
          const isActive = activeStatusFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`status-tab-btn ${isActive ? 'status-tab-active' : ''}`}
              onClick={() => onFilterChange(tab.id)}
            >
              <span>{tab.label}</span>
              <span className={`tab-count-pill ${isActive ? 'tab-count-active' : ''}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Responsive Table */}
      <div className="table-scroll-container">
        <table className="fintech-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('timestamp')} className="sortable-th">
                <div className="th-content">
                  <span>Transaction ID & Time</span>
                  <ArrowUpDown size={12} className={sortField === 'timestamp' ? 'text-blue' : 'text-gray'} />
                </div>
              </th>
              <th>Customer / Account</th>
              <th>Recipient</th>
              <th onClick={() => handleSort('amount')} className="sortable-th text-right">
                <div className="th-content justify-end">
                  <span>Amount</span>
                  <ArrowUpDown size={12} className={sortField === 'amount' ? 'text-blue' : 'text-gray'} />
                </div>
              </th>
              <th>Payment Method</th>
              <th>Status</th>
              <th onClick={() => handleSort('risk')} className="sortable-th">
                <div className="th-content">
                  <span>AI Risk Level</span>
                  <ArrowUpDown size={12} className={sortField === 'risk' ? 'text-blue' : 'text-gray'} />
                </div>
              </th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSorted.length === 0 ? (
              <tr>
                <td colSpan={8} className="empty-table-cell">
                  <div className="empty-table-state">
                    <AlertCircle size={32} className="empty-state-icon" />
                    <h4>No transactions found</h4>
                    <p>Try adjusting your search criteria or status filter to see results.</p>
                    <button
                      type="button"
                      className="clear-filters-btn"
                      onClick={() => {
                        onFilterChange('all');
                        onSearchChange('');
                        setMethodFilter('all');
                      }}
                    >
                      Reset All Filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAndSorted.map((txn) => {
                const MethodIcon = getMethodIcon(txn.method?.type);
                const isHighRisk = txn.risk?.level === 'high' || txn.risk?.level === 'critical';

                return (
                  <tr
                    key={txn.id}
                    className={`table-row ${isHighRisk ? 'row-highlight-risk' : ''}`}
                    onClick={() => onSelectTransaction(txn)}
                  >
                    {/* Transaction ID & Time */}
                    <td className="cell-id">
                      <div className="txn-id-wrapper">
                        <span className="txn-id">{txn.id}</span>
                        <span className="txn-timestamp" title={txn.timestamp}>
                          {txn.relativeTime || txn.timestamp}
                        </span>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="cell-customer">
                      <div className="customer-cell-flex">
                        <div className="avatar-circle">{txn.customer?.avatar || 'CU'}</div>
                        <div className="customer-info-box">
                          <span className="customer-name">{txn.customer?.name}</span>
                          <span className="customer-email" title={txn.customer?.email}>
                            {txn.customer?.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Recipient */}
                    <td className="cell-recipient">
                      <span className="recipient-text">{txn.recipient}</span>
                    </td>

                    {/* Amount */}
                    <td className="cell-amount text-right">
                      <span className="amount-val">
                        {txn.currency === 'EUR' ? '€' : '$'}
                        {txn.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                      <span className="currency-tag">{txn.currency}</span>
                    </td>

                    {/* Payment Method */}
                    <td className="cell-method">
                      <div className="method-badge">
                        <MethodIcon size={14} className="method-badge-icon" />
                        <span>{txn.method?.label || txn.method?.type}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="cell-status">
                      <StatusBadge status={txn.status} />
                    </td>

                    {/* Risk Indicator */}
                    <td className="cell-risk">
                      <RiskIndicator risk={txn.risk} showScore={true} compact={false} />
                    </td>

                    {/* Action buttons */}
                    <td className="cell-actions text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="row-actions-group">
                        <button
                          type="button"
                          className="action-icon-btn view-details-btn"
                          onClick={() => onSelectTransaction(txn)}
                          title="View Full Risk Breakdown"
                        >
                          <Eye size={15} />
                          <span className="action-hover-text">Inspect</span>
                        </button>
                        {txn.status !== 'blocked' && (
                          <button
                            type="button"
                            className="action-icon-btn flag-btn"
                            onClick={() => onFlagTransaction(txn.id)}
                            title={isHighRisk ? 'Update Risk Review' : 'Flag as Suspicious'}
                          >
                            <ShieldAlert size={15} className={isHighRisk ? 'text-crimson' : 'text-slate'} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="table-footer-bar">
        <div className="footer-legend">
          <span className="legend-item">
            <span className="dot dot-success" /> Verified Clean
          </span>
          <span className="legend-item">
            <span className="dot dot-warning" /> Under Observation
          </span>
          <span className="legend-item">
            <span className="dot dot-danger" /> Shield Quarantined
          </span>
        </div>
        <div className="footer-pagination-info">
          Showing 1 - {filteredAndSorted.length} of {filteredAndSorted.length} entries
        </div>
      </div>
    </div>
  );
}
