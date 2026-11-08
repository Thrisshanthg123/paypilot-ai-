import React from 'react';
import { Send, UserPlus } from 'lucide-react';

export default function PeopleAndContacts({
  contacts = [],
  searchQuery = '',
  onSelectContact,
  onAddNewContact,
}) {
  const filteredContacts = contacts.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(q) ||
      c.upiId.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q)
    );
  });

  return (
    <section className="upi-contacts-section">
      <div className="upi-section-heading-row">
        <div>
          <h2 className="upi-section-title">People & Businesses</h2>
          <p className="upi-section-sub">Recently paid & frequent contacts</p>
        </div>
        <button
          type="button"
          className="upi-link-btn"
          onClick={onAddNewContact}
        >
          <UserPlus size={14} />
          <span>New</span>
        </button>
      </div>

      {filteredContacts.length === 0 ? (
        <div className="upi-empty-contacts">
          <p>No contacts matching &ldquo;{searchQuery}&rdquo;</p>
        </div>
      ) : (
        <div className="upi-contacts-grid">
          {filteredContacts.map((contact) => (
            <button
              key={contact.id}
              type="button"
              className="upi-contact-card"
              onClick={() => onSelectContact(contact)}
              title={`Pay ${contact.name} (${contact.upiId})`}
            >
              <div
                className="upi-contact-avatar"
                style={{ backgroundColor: contact.avatarBg || '#6739b7' }}
              >
                <span>{contact.avatar}</span>
                {contact.isFrequent && (
                  <span className="upi-frequent-badge" title="Frequent Payee">
                    ★
                  </span>
                )}
              </div>
              <span className="upi-contact-name">{contact.name}</span>
              <span className="upi-contact-upi">{contact.upiId}</span>
              <span className="upi-pay-pill">
                <Send size={11} />
                <span>Pay</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
