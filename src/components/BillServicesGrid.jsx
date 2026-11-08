import React from 'react';
import {
  Smartphone,
  Zap,
  Tv,
  Car,
  Droplets,
  Wifi,
  CreditCard,
  Flame,
} from 'lucide-react';

export default function BillServicesGrid({ services = [], onSelectService }) {
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'Smartphone':
        return Smartphone;
      case 'Zap':
        return Zap;
      case 'Tv':
        return Tv;
      case 'Car':
        return Car;
      case 'Droplets':
        return Droplets;
      case 'Wifi':
        return Wifi;
      case 'CreditCard':
        return CreditCard;
      default:
        return Flame;
    }
  };

  return (
    <section className="upi-bills-section">
      <div className="upi-section-heading-row">
        <div>
          <h2 className="upi-section-title">Recharge & Bill Payments</h2>
          <p className="upi-section-sub">BBPS Authorized • Instant receipt</p>
        </div>
        <span className="bbps-brand-badge">
          <span>BBPS Assured</span>
        </span>
      </div>

      <div className="upi-bills-grid">
        {services.map((service) => {
          const Icon = getIcon(service.icon);
          return (
            <button
              key={service.id}
              type="button"
              className="upi-bill-card"
              onClick={() => onSelectService(service)}
            >
              <div
                className="upi-bill-icon-circle"
                style={{ backgroundColor: service.bg, color: service.color }}
              >
                <Icon size={22} />
              </div>
              <span className="upi-bill-name">{service.name}</span>
              <span className="upi-bill-badge">{service.badge}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
