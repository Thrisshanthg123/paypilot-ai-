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

import { ShieldCheck, ArrowRight } from 'lucide-react';
import StatusBadge from './components/StatusBadge';

export default function App() {
  // Active Bottom Navigation Tab: 'home' | 'history' | 'rewards' | 'profile'
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
      <div className="upi-mobile-viewport">
        {/* Top Header */}
        <TopHeader
          user={currentUser}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          unreadCount={unreadCount}
          onOpenProfile={() => setActiveTab('profile')}
        />

        {/* Main Content Area Based on Tab */}
        <main className="upi-content-scroll">
          {activeTab === 'home' && (
            <div className="upi-home-view">
              {/* PayPal AI Hackathon Banner */}
              <div className="paypal-security-banner">
                <div className="banner-icon-shield">
                  <ShieldCheck size={22} className="text-emerald" />
                </div>
                <div className="banner-content">
                  <div className="banner-title">
                    PayPilot AI Neural Guard Active
                  </div>
                  <div className="banner-subtitle">
                    Real-time QR threat screening & zero-day phishing interception powered by PayPal Sandbox
                  </div>
                </div>
                <button
                  type="button"
                  className="banner-action-btn"
                  onClick={() => setIsScanOpen(true)}
                  title="Test AI QR Scanner"
                >
                  <span>Test AI</span>
                  <ArrowRight size={13} />
                </button>
              </div>

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

              {/* 5. Recent Transaction Preview on Home */}
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
        </main>

        {/* 7. Bottom Navigation */}
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
