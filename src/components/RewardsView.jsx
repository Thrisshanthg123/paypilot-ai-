import React, { useState } from 'react';
import { Gift, Sparkles, Award } from 'lucide-react';
import { sampleRewards } from '../data/mockData';

export default function RewardsView() {
  const [rewards, setRewards] = useState(sampleRewards);
  const [totalWon, setTotalWon] = useState(480);

  const handleScratch = (id) => {
    setRewards((prev) =>
      prev.map((r) => {
        if (r.id === id && !r.isScratched) {
          setTotalWon((w) => w + 35);
          return {
            ...r,
            isScratched: true,
            amount: r.revealedAmount || '₹35 Cashback',
          };
        }
        return r;
      }),
    );
  };

  return (
    <div className="upi-rewards-container">
      {/* Total Won Banner */}
      <div className="upi-rewards-banner">
        <div className="rewards-trophy-icon">
          <Award size={36} className="text-amber" />
        </div>
        <div>
          <span className="rewards-sub-label">Total Rewards Earned</span>
          <h2 className="rewards-total-won">₹{totalWon}</h2>
          <span className="rewards-tagline">Saved via PayPilot AI Safe Payments</span>
        </div>
      </div>

      <div className="upi-section-heading-row my-4">
        <h3 className="upi-section-title">Scratch Cards & Offers</h3>
        <span className="upi-sub-tag">Tap to reveal</span>
      </div>

      {/* Scratch Cards Grid */}
      <div className="upi-scratch-grid">
        {rewards.map((r) => {
          return (
            <div
              key={r.id}
              className={`scratch-card ${r.isScratched ? 'scratched' : 'unscratched'}`}
              onClick={() => handleScratch(r.id)}
            >
              {r.isScratched ? (
                <div className="card-revealed-content" style={{ borderColor: r.color }}>
                  <div className="revealed-icon-badge" style={{ backgroundColor: `${r.color}20`, color: r.color }}>
                    <Gift size={24} />
                  </div>
                  <h4 className="revealed-amount">{r.amount}</h4>
                  <p className="revealed-desc">{r.desc}</p>
                  <div className="coupon-code-pill">
                    <span>{r.code}</span>
                  </div>
                </div>
              ) : (
                <div className="card-cover-content">
                  <div className="cover-sparkle">
                    <Sparkles size={28} className="text-amber" />
                  </div>
                  <span className="cover-title">PayPilot Mystery Card</span>
                  <span className="cover-sub">Tap to scratch & win!</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
