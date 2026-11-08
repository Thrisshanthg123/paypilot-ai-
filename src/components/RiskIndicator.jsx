import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

export default function RiskIndicator({ risk, showScore = true, compact = false }) {
  if (!risk) return null;

  const level = (risk.level || 'low').toLowerCase();
  const score = typeof risk.score === 'number' ? risk.score : 0;

  const levelConfigs = {
    low: {
      label: 'Low Risk',
      colorClass: 'risk-low',
      icon: ShieldCheck,
      desc: 'Safe & Verified',
    },
    medium: {
      label: 'Medium Risk',
      colorClass: 'risk-medium',
      icon: AlertTriangle,
      desc: 'Screening Flag',
    },
    high: {
      label: 'High Risk',
      colorClass: 'risk-high',
      icon: ShieldAlert,
      desc: 'High Probability',
    },
    critical: {
      label: 'Critical Risk',
      colorClass: 'risk-critical',
      icon: ShieldAlert,
      desc: 'Immediate Threat',
    },
  };

  const config = levelConfigs[level] || levelConfigs.low;
  const Icon = config.icon;

  if (compact) {
    return (
      <span className={`risk-indicator-compact ${config.colorClass}`} title={`Risk Score: ${score}/100`}>
        <span className="risk-dot" />
        <span className="risk-label">{config.label}</span>
        {showScore && <span className="risk-score-pill">{score}</span>}
      </span>
    );
  }

  return (
    <div className={`risk-indicator-pill ${config.colorClass}`} title={`Risk Score: ${score}/100`}>
      <span className="risk-dot" />
      <Icon size={13} className="risk-icon" />
      <span className="risk-text-label">{config.label}</span>
      {showScore && <span className="risk-score-badge">{score}/100</span>}
    </div>
  );
}
