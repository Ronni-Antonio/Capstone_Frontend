import React from 'react';
import { useData } from '../context/DataContext.jsx';

// Theming variables to match your exact layout style colors
const COLORS = {
  white: '#ffffff',
  dark: '#3e5f44',
  darkMuted: 'rgba(62, 95, 68, 0.6)',
  mintLight: 'rgba(199, 234, 187, 0.4)',
  mintMuted: 'rgba(199, 234, 187, 0.6)',
  limeLight: 'rgba(232, 245, 189, 0.6)',
  ivory: '#fcfcf7',
  sage: '#5a7c61',
  redBg: '#fef2f2',
  redText: '#b91c1c',
  amberBg: '#fffbeb',
  amberText: '#b45309'
};

export function MachineMonitoring() {
  const { transactions } = useData();

  // Calculate stats from transactions
  const totalBottles = transactions.reduce((sum, t) => {
    const bottles = t.bottles_deposited || t.bottles || t.bottle_qty || t.bottles_qty || 0;
    return sum + bottles;
  }, 0);

  
  // For fullness: simulate based on total bottles (since we don't have actual bin level)
  // Max out at 100%
  const maxCapacityBottles = 300; // Adjust this to your needs
  const fullness = Math.min(Math.round((totalBottles / maxCapacityBottles) * 100), 100);

  // Calculate accepted/rejected (simulate rejection rate if not in data)
  const rejectionRate = 0.05; // 5% rejection rate if not specified in data
  const acceptedToday = totalBottles; // All are accepted for now
  const rejectedToday = Math.round(acceptedToday * rejectionRate);
  
  // Rejected reasons - simulated
  const rejectedReasons = [
    { reason: 'Non-PET', count: Math.round(rejectedToday * 0.5) },
    { reason: 'Aluminum can', count: Math.round(rejectedToday * 0.25) },
    { reason: 'Crushed bottle', count: Math.round(rejectedToday * 0.15) },
    { reason: 'With liquid', count: Math.max(0, rejectedToday - Math.round(rejectedToday * 0.5) - Math.round(rejectedToday * 0.25) - Math.round(rejectedToday * 0.15)) },
  ].filter(r => r.count > 0);

  // Rejected by hour - simulated
  const rejectedByHour = [
    { h: '7am', v: 0 }, { h: '8am', v: Math.floor(rejectedToday * 0.1) }, { h: '9am', v: 0 },
    { h: '10am', v: Math.floor(rejectedToday * 0.1) }, { h: '11am', v: 0 }, { h: '12pm', v: Math.floor(rejectedToday * 0.3) },
    { h: '1pm', v: Math.floor(rejectedToday * 0.25) }, { h: '2pm', v: 0 }, { h: '3pm', v: Math.floor(rejectedToday * 0.15) },
    { h: '4pm', v: 0 }, { h: '5pm', v: 0 }
  ];

  const status = fullness >= 85 ? 'critical' : fullness >= 65 ? 'warning' : 'normal';
  
  // Max value calculation for bar chart styling height scaling
  const maxRejectedValue = Math.max(...rejectedByHour.map(d => d.v), 1);

  // SVG Circumference for circular dial track calculation
  const radius = 15.9155;
  const circumference = 2 * Math.PI * radius; // Approx 100
  const strokeDashoffset = 100 - fullness;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'sans-serif' }}>
      
      {/* Pure CSS Keyframes injection - completely independent of packages */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fillBar {
          from { width: 0%; }
          to { width: ${fullness}%; }
        }
        @keyframes fillCircle {
          from { stroke-dashoffset: 100; }
          to { stroke-dashoffset: ${strokeDashoffset}; }
        }
        @keyframes growBar {
          from { height: 2px; }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-circle-fill {
          animation: fillCircle 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .animate-bar-fill {
          animation: fillBar 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .animate-chart-grow {
          animation-name: growBar;
          animation-duration: 0.8s;
          animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
          transform-origin: bottom;
        }
      `}</style>

      {/* Main monitoring card */}
      <div className="animate-fade-in-up" style={{
        backgroundColor: COLORS.white,
        borderRadius: '24px',
        padding: '28px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
        border: `1px solid ${COLORS.mintLight}`
      }}>
        
        {/* Header section */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexGrow: 1 }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: COLORS.mintMuted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Simplified Recycle Icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={COLORS.dark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2.5 3.19-2.5 5.5h20c0-2.31-1-4.24-2.5-5.5M12 2v10M12 2l-4 4M12 2l4 4"/></svg>
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: COLORS.darkMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plink Recycling Bin</div>
              <h2 style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: '700', color: COLORS.dark }}>Main Lobby Unit</h2>
              <div style={{ fontSize: '12px', color: COLORS.darkMuted, display: 'flex', gap: '12px', marginTop: '4px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>📍 Grade 3 Hallway</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>🕒 Last scan {transactions.length > 0 ? 'just now' : 'never'}</span>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Native Status Badge */}
            <span style={{
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: '600',
              textTransform: 'capitalize',
              backgroundColor: status === 'critical' ? COLORS.redBg : status === 'warning' ? COLORS.amberBg : COLORS.mintMuted,
              color: status === 'critical' ? COLORS.redText : status === 'warning' ? COLORS.amberText : COLORS.dark
            }}>{status}</span>
            <span style={{ padding: '4px 10px', backgroundColor: COLORS.limeLight, color: COLORS.dark, borderRadius: '9999px', fontSize: '12px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              🟢 Connected
            </span>
          </div>
        </div>

        {/* Content Layout Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          
          {/* Circular Fullness display */}
          <div style={{ backgroundColor: COLORS.ivory, borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: COLORS.darkMuted, textTransform: 'uppercase', marginBottom: '8px' }}>Real-time Fullness</div>
            
            <div style={{ position: 'relative', width: '224px', height: '224px' }}>
              <svg width="100%" height="100%" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                {/* Background circle track */}
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e8f5bd" strokeWidth="3" />
                {/* Foreground active data track with SVG animation parameters */}
                <path 
                  className="animate-circle-fill"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                  fill="none" 
                  stroke={fullness >= 85 ? COLORS.redText : fullness >= 65 ? '#f59e0b' : COLORS.dark} 
                  strokeWidth="3" 
                  strokeDasharray="100"
                  strokeDashoffset="100"
                  strokeLinecap="round"
                />
              </svg>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '48px', fontWeight: '700', color: COLORS.dark }}>{fullness}%</div>
                <div style={{ fontSize: '12px', color: COLORS.darkMuted, marginTop: '4px' }}>Bin capacity used</div>
              </div>
            </div>

            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: status === 'critical' ? '#ef4444' : status === 'warning' ? '#f59e0b' : COLORS.sage }} />
              <span style={{ fontWeight: '600', color: status === 'critical' ? COLORS.redText : status === 'warning' ? COLORS.amberText : COLORS.dark }}>
                {status === 'normal' && 'Normal — accepting bottles'}
                {status === 'warning' && 'Warning — please prepare to empty'}
                {status === 'critical' && 'Full — empty bin immediately'}
              </span>
            </div>
          </div>

          {/* Progress row metrics */}
          <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: COLORS.dark }}>Fullness Progress</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: COLORS.dark }}>{fullness} / 100%</span>
              </div>
              <div style={{ width: '100%', height: '20px', backgroundColor: 'rgba(232,245,189,0.7)', borderRadius: '9999px', overflow: 'hidden', position: 'relative' }}>
                <div 
                  className="animate-bar-fill"
                  style={{
                    height: '100%',
                    borderRadius: '9999px',
                    width: '0%',
                    backgroundColor: status === 'critical' ? '#ef4444' : status === 'warning' ? '#f59e0b' : COLORS.sage
                  }} 
                />
                <span style={{ position: 'absolute', top: 0, bottom: 0, width: '1px', backgroundColor: 'rgba(62,95,68,0.3)', left: '65%' }} />
                <span style={{ position: 'absolute', top: 0, bottom: 0, width: '1px', backgroundColor: 'rgba(62,95,68,0.3)', left: '85%' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'rgba(62,95,68,0.5)', marginTop: '6px' }}>
                <span>0%</span>
                <span style={{ color: COLORS.sage, fontWeight: '600' }}>Normal</span>
                <span style={{ color: '#d97706', fontWeight: '600' }}>65% Warning</span>
                <span style={{ color: '#dc2626', fontWeight: '600' }}>85% Full</span>
                <span>100%</span>
              </div>
            </div>

            {/* Micro grid counter metrics items */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div style={{ backgroundColor: COLORS.mintLight, borderRadius: '16px', padding: '16px' }}>
                <div style={{ fontSize: '12px', color: COLORS.darkMuted }}>Bottles Today</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: COLORS.dark, marginTop: '4px' }}>{acceptedToday}</div>
                <div style={{ fontSize: '11px', color: COLORS.sage, fontWeight: '600', marginTop: '4px' }}>Accepted ✓</div>
              </div>
              <div style={{ backgroundColor: COLORS.redBg, borderRadius: '16px', padding: '16px' }}>
                <div style={{ fontSize: '12px', color: COLORS.darkMuted }}>Rejected Today</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: COLORS.redText, marginTop: '4px' }}>{rejectedToday}</div>
                <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: '600', marginTop: '4px' }}>Non-PET items</div>
              </div>
              <div style={{ backgroundColor: COLORS.limeLight, borderRadius: '16px', padding: '16px' }}>
                <div style={{ fontSize: '12px', color: COLORS.darkMuted }}>Acceptance Rate</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: COLORS.dark, marginTop: '4px' }}>
                  {acceptedToday + rejectedToday > 0 ? Math.round((acceptedToday / (acceptedToday + rejectedToday)) * 100) : 100}%
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(62,95,68,0.7)', fontWeight: '600', marginTop: '4px' }}>PET accuracy</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Analytics Breakdown Row */}
      <div className="animate-fade-in-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', animationDelay: '0.15s', opacity: 0 }}>
        
        {/* Container 1 */}
        <div style={{ backgroundColor: COLORS.white, borderRadius: '24px', padding: '24px', border: `1px solid ${COLORS.mintLight}` }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '700', color: COLORS.dark }}>Rejected Items</h3>
          <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: COLORS.darkMuted }}>Breakdown of items the machine rejected today</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ backgroundColor: COLORS.redBg, borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '16px', backgroundColor: COLORS.white, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', fontWeight: 'bold' }}>✕</div>
              <div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: COLORS.redText }}>{rejectedToday}</div>
                <div style={{ fontSize: '12px', color: COLORS.darkMuted }}>items rejected today</div>
              </div>
            </div>
            
            {rejectedReasons.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                {rejectedReasons.map((r) => (
                  <div key={r.reason} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: COLORS.ivory, borderRadius: '12px' }}>
                    <span style={{ fontSize: '14px', color: 'rgba(62,95,68,0.8)' }}>{r.reason}</span>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: COLORS.dark }}>{r.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Container 2 (Bar chart with grow animation applied directly to elements) */}
        <div style={{ backgroundColor: COLORS.white, borderRadius: '24px', padding: '24px', border: `1px solid ${COLORS.mintLight}`, gridColumn: 'span 1' }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '700', color: COLORS.dark }}>Rejected Items by Hour</h3>
          <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: COLORS.darkMuted }}>When non-PET items were attempted today</p>
          
          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: `1px solid ${COLORS.mintMuted}`, paddingBottom: '8px', gap: '4px' }}>
            {rejectedByHour.map((item, index) => {
              const heightPercent = (item.v / maxRejectedValue) * 100;
              return (
                <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' }}>
                  {item.v > 0 && (
                    <div style={{ fontSize: '10px', fontWeight: '600', color: COLORS.redText, marginBottom: '2px' }}>
                      {item.v}
                    </div>
                  )}
                  <div 
                    className="animate-chart-grow"
                    style={{
                      width: '70%',
                      minWidth: '12px',
                      height: item.v === 0 ? '2px' : `${heightPercent}%`,
                      backgroundColor: item.v === 0 ? '#e2e8f0' : '#dc2626',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.3s ease'
                    }} 
                    title={`${item.h}: ${item.v} rejections`} 
                  />
                  <div style={{ fontSize: '10px', color: COLORS.dark, marginTop: '6px', whiteSpace: 'nowrap' }}>
                    {item.h}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Info Legend Panel Card */}
      <div className="animate-fade-in-up" style={{ backgroundColor: COLORS.white, borderRadius: '24px', padding: '24px', border: `1px solid ${COLORS.mintLight}`, animationDelay: '0.3s', opacity: 0 }}>
        <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '700', color: COLORS.dark }}>Status Indicators</h3>
        <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: COLORS.darkMuted }}>How the bin status is determined</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div style={{ backgroundColor: COLORS.mintLight, borderRadius: '16px', padding: '20px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: COLORS.sage, marginTop: '4px', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: '600', color: COLORS.dark }}>Normal</div>
              <div style={{ fontSize: '12px', color: 'rgba(62,95,68,0.7)', marginTop: '2px' }}>0–64% full. Bin is accepting bottles as usual.</div>
            </div>
          </div>
          <div style={{ backgroundColor: COLORS.amberBg, borderRadius: '16px', padding: '20px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f59e0b', marginTop: '4px', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: '600', color: '#92400e' }}>Warning</div>
              <div style={{ fontSize: '12px', color: 'rgba(62,95,68,0.7)', marginTop: '2px' }}>65–84% full. Prepare to empty soon.</div>
            </div>
          </div>
          <div style={{ backgroundColor: COLORS.redBg, borderRadius: '16px', padding: '20px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444', marginTop: '4px', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: '600', color: COLORS.redText }}>Full / Critical</div>
              <div style={{ fontSize: '12px', color: 'rgba(62,95,68,0.7)', marginTop: '2px' }}>85–100% full. Empty bin immediately to keep accepting.</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
