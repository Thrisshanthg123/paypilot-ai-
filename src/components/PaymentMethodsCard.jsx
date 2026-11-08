import React from 'react';
import { CreditCard, Building2, Wallet, Coins, ShieldCheck, Zap } from 'lucide-react';

export default function PaymentMethodsCard({ methods = [], systemMetrics }) {
  const getMethodIcon = (methodName) => {
    if (methodName.includes('Card')) return CreditCard;
    if (methodName.includes('ACH') || methodName.includes('Wire')) return Building2;
    if (methodName.includes('Wallet')) return Wallet;
    return Coins;
  };

  return (
    <div className="payment-insights-card">
      <div className="card-header-flex">
        <div>
          <h3 className="card-heading">Payment Rails & Volume</h3>
          <p className="card-subheading">Settlement distribution by channel</p>
        </div>
        <span className="live-ai-chip">
          <Zap size={12} className="text-amber-500" />
          <span>Multi-Rail Routing</span>
        </span>
      </div>

      {/* Progress Bars Breakdown */}
      <div className="methods-list">
        {methods.map((item, idx) => {
          const Icon = getMethodIcon(item.method);
          return (
            <div key={idx} className="method-item">
              <div className="method-row-top">
                <div className="method-title-wrap">
                  <div className="method-icon-box" style={{ color: item.color, backgroundColor: `${item.color}15` }}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <span className="method-name">{item.method}</span>
                    <span className="method-count">({item.count.toLocaleString()} txns)</span>
                  </div>
                </div>
                <div className="method-val-wrap">
                  <span className="method-volume">{item.volume}</span>
                  <span className="method-percentage">{item.share}%</span>
                </div>
              </div>

              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${item.share}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Engine Status Mini Banner */}
      {systemMetrics && (
        <div className="ai-guard-mini-card">
          <div className="ai-guard-header">
            <div className="ai-guard-icon-box">
              <ShieldCheck size={18} className="text-emerald" />
            </div>
            <div>
              <div className="ai-guard-title">PayPilot AI Neural Guard</div>
              <div className="ai-guard-sub">Engine {systemMetrics.aiStatus} • {systemMetrics.latencyMs}ms avg latency</div>
            </div>
          </div>
          <div className="ai-guard-metrics-row">
            <div>
              <span className="sub-stat-num">{systemMetrics.accuracyScore}</span>
              <span className="sub-stat-lbl">Model Accuracy</span>
            </div>
            <div>
              <span className="sub-stat-num">{systemMetrics.preventedLosses}</span>
              <span className="sub-stat-lbl">Fraud Intercepted</span>
            </div>
            <div>
              <span className="sub-stat-num">{systemMetrics.activeRules}</span>
              <span className="sub-stat-lbl">Active Rules</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
