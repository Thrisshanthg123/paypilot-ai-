import React, { useState } from 'react';
import './App.css';

import {
  currentUser,
  recentContacts,
  billServices,
  initialUpiTransactions,
  userNotifications,
} from './data/mockData';

import TopHeader from './components/TopHeader';
import QuickTransferGrid from './components/QuickTransferGrid';
import PeopleAndContacts from './components/PeopleAndContacts';
import BillServicesGrid from './components/BillServicesGrid';
import TransactionHistoryView from './components/TransactionHistoryView';
import RewardsView from './components/RewardsView';
import ProfileView from './components/ProfileView';
import BottomNav from './components/BottomNav';
import UpiPaymentModal from './components/UpiPaymentModal';
import ScanQrModal from './components/ScanQrModal';
import CheckBalanceModal from './components/CheckBalanceModal';
import TransactionDetailModal from './components/TransactionDetailModal';
import NotificationsModal from './components/NotificationsModal';
import Toast from './components/Toast';

import {
  ShieldCheck,
  ArrowRight,
  Building2,
  Lock,
  Gift,
  QrCode,
  Copy,
  Sparkles,
} from 'lucide-react';
import StatusBadge from './components/StatusBadge';

export default function App() {
  // Active Bottom/Header Navigation Tab: 'home' | 'history' | 'rewards' | 'profile'
  const [activeTab, setActiveTab] = useState('home');

  // Search query from Top Header
  const [searchQuery, setSearchQuery] = useState('');

  // Transactions State
  const [transactions, setTransactions] = useState(initialUpiTransactions);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Modals State
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentRecipient, setPaymentRecipient] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');

  const [isScanOpen, setIsScanOpen] = useState(false);
  const [isBalanceOpen, setIsBalanceOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState(userNotifications);

  // Toast feedback state
  const [toast, setToast] = useState(null);

  const showToast = (title, message, type = 'success') => {
    setToast({ title, message, type });
  };

  // Open Payment flow to specific recipient
  const handleInitiatePayment = (recipient, defaultAmount = '', defaultNote = '') => {
    setPaymentRecipient(recipient);
    setPaymentAmount(defaultAmount);
    setPaymentNote(defaultNote);
    setIsPaymentOpen(true);
  };

  // Open Transfer with mode (mobile, bank, upi, self)
  const handleTransferClick = ({ mode }) => {
    if (mode === 'self') {
      handleInitiatePayment(
        {
          name: 'Self: State Bank of India (••8820)',
          upiId: 'bhaskar.sbi@paypilot',
        },
        '1000',
        'Self Account Transfer',
      );
    } else {
      handleInitiatePayment(null, '', '');
    }
  };

  // Handle Bill Service selection
  const handleSelectBillService = (service) => {
    handleInitiatePayment(
      {
        name: service.name,
        upiId: `${service.id}.billdesk@upi`,
      },
      '499',
      `${service.name} Payment`,
    );
  };

  // Handle QR selection from scanner simulation
  const handleQrSelect = (qrTarget) => {
    handleInitiatePayment(
      {
        name: qrTarget.name,
        upiId: qrTarget.upiId,
      },
      qrTarget.amount,
      qrTarget.note,
    );
  };

  // Handle new successful payment created
  const handlePaymentSuccess = (newTxn) => {
    setTransactions((prev) => [newTxn, ...prev]);
    showToast('Payment Successful', `₹${newTxn.amount} sent to ${newTxn.recipientName}`, 'success');
  };

  // Copy text to clipboard
  const handleCopyText = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast('Copied to Clipboard', text, 'info');
    }
  };

  // Notifications handlers
  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    showToast('All Caught Up', 'All notifications marked as read.', 'info');
  };

  const handleDismissNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="upi-app-root">
      <div className="upi-app-wrapper">
        {/* Top Header - Responsive Full Width */}
        <TopHeader
          user={currentUser}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          unreadCount={unreadCount}
          onOpenProfile={() => setActiveTab('profile')}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onScanClick={() => setIsScanOpen(true)}
        />

        {/* Main Content Area Based on Tab */}
        <main className="upi-content-scroll">
          <div className="upi-content-inner">
            {activeTab === 'home' && (
              <div className="upi-home-view">
                {/* Full Width Top Banner */}
                <div className="paypal-security-banner">
                  <div className="banner-icon-shield">
                    <ShieldCheck size={26} className="text-emerald" />
                  </div>
                  <div className="banner-content">
                    <div className="banner-title">
                      PayPilot AI Neural Guard Active
                    </div>
                    <div className="banner-subtitle">
                      Real-time QR threat screening & zero-day phishing interception powered by PayPal Sandbox and Neural Threat Intelligence.
                    </div>
                  </div>
                  <div className="banner-actions-wrap">
                    <button
                      type="button"
                      className="banner-action-btn"
                      onClick={() => setIsScanOpen(true)}
                      title="Test AI QR Scanner"
                    >
                      <QrCode size={15} />
                      <span>Test AI QR Scan</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>

                {/* Responsive 2-Column Grid on Desktop / Stacks on Mobile */}
                <div className="upi-home-columns">
                  {/* Primary Left Column: Transfers, People, Bill Services */}
                  <div className="upi-home-primary">
                    {/* 2. Money Transfers Grid */}
                    <QuickTransferGrid
                      onScanClick={() => setIsScanOpen(true)}
                      onTransferClick={handleTransferClick}
                      onCheckBalanceClick={() => setIsBalanceOpen(true)}
                    />

                    {/* 3. People and Contacts */}
                    <PeopleAndContacts
                      contacts={recentContacts}
                      searchQuery={searchQuery}
                      onSelectContact={(contact) => handleInitiatePayment(contact)}
                      onAddNewContact={() => handleInitiatePayment(null)}
                    />

                    {/* 4. Recharge & Bill Payments */}
                    <BillServicesGrid
                      services={billServices}
                      onSelectService={handleSelectBillService}
                    />
                  </div>

                  {/* Secondary Right Column on Desktop: Accounts, Recent Activity, Rewards */}
                  <div className="upi-home-secondary">
                    {/* Account Balance Widget */}
                    <div className="upi-side-widget upi-balance-widget">
                      <div className="widget-header-flex">
                        <div className="flex-center gap-2">
                          <Building2 size={18} className="text-blue" />
                          <h3 className="widget-title">Linked Bank Accounts</h3>
                        </div>
                        <button
                          type="button"
                          className="widget-link-btn"
                          onClick={() => setIsBalanceOpen(true)}
                        >
                          <Lock size={12} />
                          <span>Check All</span>
                        </button>
                      </div>

                      <div className="widget-accounts-list">
                        {currentUser.linkedAccounts.map((acc) => (
                          <div key={acc.id} className="widget-account-row">
                            <div className="w-acc-icon" style={{ backgroundColor: acc.logoColor || '#1a73e8' }}>
                              <Building2 size={14} color="#fff" />
                            </div>
                            <div className="w-acc-info">
                              <span className="w-acc-bank">{acc.bankName}</span>
                              <span className="w-acc-mask">{acc.accountNumberMasked}</span>
                            </div>
                            {acc.isPrimary && <span className="w-primary-pill">Primary</span>}
                          </div>
                        ))}
                      </div>

                      <div className="widget-qr-quick-box">
                        <div className="w-qr-meta">
                          <span className="w-qr-label">Receive Money via UPI</span>
                          <span className="w-qr-vpa">{currentUser.upiId}</span>
                        </div>
                        <button
                          type="button"
                          className="w-copy-btn"
                          onClick={() => handleCopyText(currentUser.upiId)}
                          title="Copy UPI ID"
                        >
                          <Copy size={13} />
                          <span>Copy VPA</span>
                        </button>
                      </div>
                    </div>

                    {/* 5. Recent Transaction Preview */}
                    <section className="upi-recent-preview-section">
                      <div className="upi-section-heading-row">
                        <div>
                          <h2 className="upi-section-title">Recent Transactions</h2>
                          <p className="upi-section-sub">Latest UPI activity & AI audits</p>
                        </div>
                        <button
                          type="button"
                          className="upi-link-btn"
                          onClick={() => setActiveTab('history')}
                        >
                          <span>See All</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>

                      <div className="upi-txns-list-preview">
                        {transactions.slice(0, 4).map((t) => {
                          const isDebit = t.type === 'debit';
                          const isBlocked = t.status === 'blocked';
                          return (
                            <div
                              key={t.id}
                              className={`upi-txn-row ${isBlocked ? 'txn-row-blocked' : ''}`}
                              onClick={() => setSelectedTransaction(t)}
                            >
                              <div className="txn-avatar-col">
                                <div className={`txn-avatar-bubble ${isDebit ? 'avatar-debit' : 'avatar-credit'}`}>
                                  {isDebit ? '↑' : '↓'}
                                </div>
                              </div>
                              <div className="txn-info-col">
                                <div className="txn-recipient-name">{t.recipientName}</div>
                                <div className="txn-sub-details">
                                  <span className="txn-date">{t.dateLabel || t.timestamp}</span>
                                  <span className="bullet-dot">•</span>
                                  <span className="txn-upi-tag">{t.recipientUpi}</span>
                                </div>
                              </div>
                              <div className="txn-amount-col">
                                <div className={`txn-amount-val ${isDebit ? 'amount-debit' : 'amount-credit'}`}>
                                  {isDebit ? '- ₹' : '+ ₹'}
                                  {t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                                <StatusBadge status={t.status} size="sm" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>

                    {/* Rewards Teaser Widget */}
                    <div
                      className="upi-side-widget upi-reward-teaser-card"
                      onClick={() => setActiveTab('rewards')}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="teaser-icon-wrap">
                        <Gift size={24} className="text-amber" />
                      </div>
                      <div className="teaser-content">
                        <div className="teaser-title-row">
                          <span className="teaser-title">Rewards & Cashback</span>
                          <Sparkles size={14} className="text-amber" />
                        </div>
                        <p className="teaser-desc">
                          You have <strong>2 unscratched cards</strong> waiting! Win up to ₹100 cashback.
                        </p>
                      </div>
                      <ArrowRight size={16} className="teaser-arrow" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <TransactionHistoryView
                transactions={transactions}
                onSelectTransaction={(txn) => setSelectedTransaction(txn)}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            )}

            {activeTab === 'rewards' && (
              <RewardsView />
            )}

            {activeTab === 'profile' && (
              <ProfileView
                user={currentUser}
                onCopyUpi={(upi) => handleCopyText(upi)}
                onCheckBalance={() => setIsBalanceOpen(true)}
              />
            )}
          </div>
        </main>

        {/* 7. Bottom Navigation (Fixed on mobile/tablet screens < 900px) */}
        <BottomNav
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onScanClick={() => setIsScanOpen(true)}
        />

        {/* Modals */}
        <UpiPaymentModal
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          initialRecipient={paymentRecipient}
          initialAmount={paymentAmount}
          initialNote={paymentNote}
          userAccounts={currentUser.linkedAccounts}
          onPaymentSuccess={handlePaymentSuccess}
        />

        <ScanQrModal
          isOpen={isScanOpen}
          onClose={() => setIsScanOpen(false)}
          onSelectQrTarget={handleQrSelect}
        />

        <CheckBalanceModal
          isOpen={isBalanceOpen}
          onClose={() => setIsBalanceOpen(false)}
          accounts={currentUser.linkedAccounts}
        />

        <TransactionDetailModal
          transaction={selectedTransaction}
          isOpen={Boolean(selectedTransaction)}
          onClose={() => setSelectedTransaction(null)}
          onCopyText={handleCopyText}
        />

        <NotificationsModal
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          notifications={notifications}
          onMarkAllRead={handleMarkAllRead}
          onDismiss={handleDismissNotification}
        />

        {/* Toast Notification Container */}
        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    </div>
  );
}
