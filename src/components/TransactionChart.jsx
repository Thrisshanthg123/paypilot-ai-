import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { BarChart3, DollarSign } from 'lucide-react';

const formatCurrency = (val) => {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
  return `$${val}`;
};

const formatCount = (val) => {
  if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
  return `${val}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-chart-tooltip">
        <div className="tooltip-header">{label} Overview</div>
        <div className="tooltip-items">
          {payload.map((item, idx) => {
            const isMoney = item.dataKey === 'volume';
            const valFormatted = isMoney
              ? `$${Number(item.value).toLocaleString()}`
              : Number(item.value).toLocaleString();
            return (
              <div key={idx} className="tooltip-item-row">
                <span className="tooltip-color-dot" style={{ backgroundColor: item.color }} />
                <span className="tooltip-item-name">{item.name}:</span>
                <span className="tooltip-item-val">{valFormatted}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export default function TransactionChart({
  chartData,
  activeTimeframe,
  onTimeframeChange,
}) {
  const [metricMode, setMetricMode] = useState('volume'); // 'volume' | 'count'

  const currentData = chartData[activeTimeframe] || chartData['7D'];

  // Calculate quick summary metrics
  const totalVol = currentData.reduce((acc, curr) => acc + (curr.volume || 0), 0);
  const totalCount = currentData.reduce((acc, curr) => acc + (curr.count || 0), 0);
  const totalFlagged = currentData.reduce((acc, curr) => acc + (curr.flagged || 0), 0);
  const peakPoint = currentData.reduce((max, p) => (p.volume > max.volume ? p : max), currentData[0] || { volume: 0 });

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div className="chart-title-block">
          <div className="chart-title-row">
            <h3 className="chart-title">Transaction Activity & Volume</h3>
            <span className="live-pulse-badge">
              <span className="pulse-dot" /> Live Feed
            </span>
          </div>
          <p className="chart-subtitle">
            Real-time settlement throughput, successful authorization trends and risk signals
          </p>
        </div>

        <div className="chart-controls">
          {/* Mode Switcher */}
          <div className="button-group-toggle">
            <button
              type="button"
              className={`toggle-btn ${metricMode === 'volume' ? 'toggle-btn-active' : ''}`}
              onClick={() => setMetricMode('volume')}
            >
              <DollarSign size={13} />
              <span>Volume ($)</span>
            </button>
            <button
              type="button"
              className={`toggle-btn ${metricMode === 'count' ? 'toggle-btn-active' : ''}`}
              onClick={() => setMetricMode('count')}
            >
              <BarChart3 size={13} />
              <span>Count</span>
            </button>
          </div>

          {/* Timeframe Selector */}
          <div className="button-group-toggle">
            {['7D', '30D', '12M'].map((tf) => (
              <button
                key={tf}
                type="button"
                className={`toggle-btn ${activeTimeframe === tf ? 'toggle-btn-active' : ''}`}
                onClick={() => onTimeframeChange(tf)}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mini metric badges strip */}
      <div className="chart-metric-strip">
        <div className="metric-strip-item">
          <span className="strip-label">Total Volume in Period</span>
          <span className="strip-value">${totalVol.toLocaleString()}</span>
        </div>
        <div className="metric-strip-item">
          <span className="strip-label">Total Processed</span>
          <span className="strip-value">{totalCount.toLocaleString()} txns</span>
        </div>
        <div className="metric-strip-item">
          <span className="strip-label">Peak Activity ({peakPoint?.name})</span>
          <span className="strip-value">${peakPoint?.volume?.toLocaleString() || 0}</span>
        </div>
        <div className="metric-strip-item">
          <span className="strip-label">Flagged Anomalies</span>
          <span className="strip-value text-rose">{totalFlagged} cases</span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="chart-container" style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          {metricMode === 'volume' ? (
            <AreaChart data={currentData} margin={{ top: 15, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="flaggedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={formatCurrency}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="volume"
                name="Settled Volume"
                stroke="#2563eb"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#volumeGradient)"
                activeDot={{ r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          ) : (
            <BarChart data={currentData} margin={{ top: 15, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={formatCount}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
              />
              <Bar dataKey="successful" name="Successful Txns" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="flagged" name="Flagged Txns" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
