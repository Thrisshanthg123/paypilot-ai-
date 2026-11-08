import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  CheckCircle2,
} from 'lucide-react';

const scanStages = [
  'Evaluating 148,290 real-time transaction telemetry points...',
  'Running deep graph neural network for syndicate circular loops...',
  'Cross-referencing TOR exit relays, VPN endpoints and high-velocity BIN patterns...',
  'Synthesizing synthetic identity & card stuffing anomaly vectors...',
  'Completed. Pipeline secured with 99.82% model confidence.',
];

export default function AiRiskScanModal({ isOpen, onClose, onFilterFlagged }) {
  const [scanStep, setScanStep] = useState(0);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setScanStep(current);
      if (current >= scanStages.length - 1) {
        clearInterval(interval);
        setIsScanning(false);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleClose = () => {
    setScanStep(0);
    setIsScanning(true);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-container-card scan-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex-center gap-2">
            <div className="modal-title-icon-box scan-icon-bg">
              <Cpu size={18} className="text-blue-500" />
            </div>
            <div>
              <h2 className="modal-title">Neural Risk & Threat Engine</h2>
              <p className="modal-subtitle">Real-time payment pipeline deep-inspection</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body-scroll">
          {/* Progress Bar */}
          <div className="scan-progress-box">
            <div className="scan-progress-header">
              <span className="scan-status-text">
                {isScanning ? 'Scan in progress...' : 'Inspection Complete'}
              </span>
              <span className="scan-percentage-text">
                {Math.min(100, Math.round(((scanStep + 1) / scanStages.length) * 100))}%
              </span>
            </div>
            <div className="scan-track">
              <div
                className="scan-fill"
                style={{
                  width: `${Math.min(100, Math.round(((scanStep + 1) / scanStages.length) * 100))}%`,
                }}
              />
            </div>
          </div>

          {/* Stepper logs */}
          <div className="scan-stages-list">
            {scanStages.map((stageText, idx) => {
              const isPast = idx < scanStep;
              const isCurrent = idx === scanStep;

              return (
                <div
                  key={idx}
                  className={`scan-stage-item ${isPast ? 'stage-done' : ''} ${isCurrent ? 'stage-active' : ''} ${
                    idx > scanStep ? 'stage-waiting' : ''
                  }`}
                >
                  <div className="stage-icon-cell">
                    {isPast ? (
                      <CheckCircle2 size={16} className="text-emerald" />
                    ) : isCurrent ? (
                      <span className="scanner-spinner" />
                    ) : (
                      <span className="stage-dot" />
                    )}
                  </div>
                  <span className="stage-text">{stageText}</span>
                </div>
              );
            })}
          </div>

          {/* Results Summary Box when done */}
          {!isScanning && (
            <div className="scan-results-card">
              <div className="results-badge-row">
                <ShieldCheck size={20} className="text-emerald" />
                <span className="results-headline">No Active Critical Breaches Detected</span>
              </div>
              <p className="results-body">
                PayPilot AI analyzed all incoming payment queues. <strong>3 suspicious entities</strong> were quarantined
                automatically (2 TOR proxies and 1 high-frequency velocity botnet). Total protected capital in queue:{' '}
                <strong>$86,420.00</strong>.
              </p>

              <div className="findings-stat-grid">
                <div className="finding-box">
                  <span className="finding-val text-emerald">99.82%</span>
                  <span className="finding-lbl">Detection Accuracy</span>
                </div>
                <div className="finding-box">
                  <span className="finding-val text-rose">3 blocked</span>
                  <span className="finding-lbl">Threats Neutralized</span>
                </div>
                <div className="finding-box">
                  <span className="finding-val text-blue">14ms</span>
                  <span className="finding-lbl">Model Latency</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={handleClose}>
            Close
          </button>
          {!isScanning && (
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                onFilterFlagged();
                handleClose();
              }}
            >
              <ShieldAlert size={15} />
              <span>Inspect Flagged Transactions</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
