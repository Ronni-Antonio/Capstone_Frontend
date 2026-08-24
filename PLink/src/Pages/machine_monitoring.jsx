import { useEffect, useMemo, useState } from 'react';
import { useData } from '../context/DataContext.jsx';

const COLORS = {
  white: '#ffffff',
  dark: '#3e5f44',
  darkMuted: 'rgba(62,95,68,0.62)',
  mintLight: 'rgba(199,234,187,0.42)',
  mintMuted: 'rgba(199,234,187,0.62)',
  limeLight: 'rgba(232,245,189,0.72)',
  ivory: '#fcfcf7',
  sage: '#5a7c61',
  redBg: '#fef2f2',
  redText: '#b91c1c',
  amberBg: '#fffbeb',
  amberText: '#b45309',
};

const calculateFillFromDistance = (distance, emptyThreshold, fullThreshold) => {
  const d = Number(distance);
  const empty = Number(emptyThreshold);
  const full = Number(fullThreshold);

  if (![d, empty, full].every(Number.isFinite) || empty <= full) return 0;
  return Math.max(0, Math.min(100, Math.round(((empty - d) / (empty - full)) * 100)));
};

const getCompartmentState = (compartment, fullness) => {
  if (!compartment || compartment.status === 'offline') {
    return { key: 'offline', label: 'Offline', message: 'Sensor is offline.' };
  }
  if (fullness >= 100 || compartment.status === 'full') {
    return { key: 'full', label: 'Full', message: 'Empty this compartment immediately.' };
  }
  if (fullness >= 80) {
    return { key: 'almost_full', label: 'Almost Full', message: 'Prepare this compartment for collection.' };
  }
  return { key: 'normal', label: 'Normal', message: 'Compartment is ready to accept materials.' };
};

const stateStyles = {
  normal: { bg: COLORS.mintMuted, text: COLORS.dark, accent: COLORS.sage },
  almost_full: { bg: COLORS.amberBg, text: COLORS.amberText, accent: '#f59e0b' },
  full: { bg: COLORS.redBg, text: COLORS.redText, accent: '#dc2626' },
  offline: { bg: '#f1f5f9', text: '#475569', accent: '#64748b' },
};

const compartmentIcon = (category) => category === 'paper' ? '📄' : '♻️';
const compartmentDescription = (category) =>
  category === 'paper'
    ? 'Paper storage compartment'
    : 'Plastic storage compartment';

function CompartmentCard({ compartment }) {
  const distance = compartment?.current_distance_cm === null || compartment?.current_distance_cm === undefined
    ? null
    : Number(compartment.current_distance_cm);
  const empty = Number(compartment?.empty_threshold_cm ?? 80);
  const full = Number(compartment?.full_threshold_cm ?? 20);
  const fullness = distance === null
    ? Number(compartment?.current_fill_percentage ?? 0)
    : calculateFillFromDistance(distance, empty, full);
  const state = getCompartmentState(compartment, fullness);
  const styles = stateStyles[state.key] || stateStyles.offline;
  const circleDashOffset = 100 - fullness;

  return (
    <div
      style={{
        background: COLORS.ivory,
        border: `1px solid ${COLORS.mintLight}`,
        borderRadius: '22px',
        padding: '22px',
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div
            style={{
              width: '48px', height: '48px', borderRadius: '14px',
              background: COLORS.mintMuted, display: 'grid', placeItems: 'center', fontSize: '24px'
            }}
          >
            {compartmentIcon(compartment?.material_category)}
          </div>
          <div>
            <div style={{ fontSize: '17px', fontWeight: 800, color: COLORS.dark }}>
              {compartment?.name || 'Compartment'}
            </div>
            <div style={{ fontSize: '12px', color: COLORS.darkMuted, marginTop: '3px' }}>
              {compartmentDescription(compartment?.material_category)}
            </div>
          </div>
        </div>
        <span
          style={{
            padding: '5px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700,
            background: styles.bg, color: styles.text, whiteSpace: 'nowrap'
          }}
        >
          {state.label}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '190px 1fr', gap: '20px', alignItems: 'center', marginTop: '20px' }}>
        <div style={{ position: 'relative', width: '180px', height: '180px', justifySelf: 'center' }}>
          <svg width="100%" height="100%" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none" stroke="#e8f5bd" strokeWidth="3"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none" stroke={styles.accent} strokeWidth="3"
              strokeDasharray="100" strokeDashoffset={circleDashOffset} strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset .4s ease' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '40px', fontWeight: 800, color: COLORS.dark }}>{fullness}%</div>
              <div style={{ fontSize: '11px', color: COLORS.darkMuted }}>full</div>
            </div>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '7px' }}>
            <strong style={{ color: COLORS.dark }}>Distance-based Fullness</strong>
            <strong style={{ color: styles.text }}>{fullness}%</strong>
          </div>
          <div style={{ height: '18px', background: COLORS.limeLight, borderRadius: '999px', overflow: 'hidden', position: 'relative' }}>
            <div style={{ width: `${fullness}%`, height: '100%', background: styles.accent, borderRadius: '999px', transition: 'width .4s ease' }} />
            <div style={{ position: 'absolute', left: '80%', top: 0, bottom: 0, width: 1, background: 'rgba(62,95,68,.35)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: COLORS.darkMuted, marginTop: '5px' }}>
            <span>0% Empty</span><span>80% Almost Full</span><span>100% Full</span>
          </div>

          <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: '8px' }}>
            {[
              ['Distance', distance !== null && Number.isFinite(distance) ? `${distance.toFixed(1)} cm` : '—'],
              ['Empty', `${empty} cm`],
              ['Full', `${full} cm`],
            ].map(([label, value]) => (
              <div key={label} style={{ background: COLORS.white, border: `1px solid ${COLORS.mintLight}`, borderRadius: '12px', padding: '10px' }}>
                <div style={{ fontSize: '9px', color: COLORS.darkMuted, textTransform: 'uppercase', fontWeight: 700 }}>{label}</div>
                <div style={{ fontSize: '16px', color: COLORS.dark, fontWeight: 800, marginTop: '3px' }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '13px', fontSize: '12px', color: styles.text, fontWeight: 650 }}>
            ● {state.message}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MachineMonitoring() {
  const { smartBins, refreshSmartBins } = useData();
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const smartBin = smartBins?.[0] || null;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setRefreshing(true);
        await refreshSmartBins();
        if (mounted) setLastUpdated(new Date());
      } catch (error) {
        console.error('Unable to refresh Smart Bin data:', error);
      } finally {
        if (mounted) setRefreshing(false);
      }
    };

    load();
    const interval = window.setInterval(load, 5000);
    return () => { mounted = false; window.clearInterval(interval); };
  }, []);

  const compartments = useMemo(() => {
    const rows = Array.isArray(smartBin?.compartments) ? smartBin.compartments : [];
    return [...rows].sort((a, b) => {
      const order = { plastic: 0, paper: 1 };
      return (order[a.material_category] ?? 99) - (order[b.material_category] ?? 99);
    });
  }, [smartBin]);

  const todayStats = smartBin?.today_stats || {};
  const acceptedToday = Number(todayStats.accepted || 0);
  const rejectedToday = Number(todayStats.rejected || 0);
  const acceptanceRate = Math.round(Number(todayStats.acceptance_rate || 0));
  const acceptedByMaterial = todayStats.accepted_by_material || {};

  const hourlyRejectedMap = useMemo(() => {
    const rows = Array.isArray(smartBin?.rejected_by_hour) ? smartBin.rejected_by_hour : [];
    return new Map(rows.map((row) => [Number(row.hour), Number(row.count || 0)]));
  }, [smartBin]);

  const rejectedByHour = Array.from({ length: 11 }, (_, index) => {
    const hour = index + 7;
    const suffix = hour >= 12 ? 'pm' : 'am';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return { h: `${displayHour}${suffix}`, v: hourlyRejectedMap.get(hour) || 0 };
  });
  const maxRejectedValue = Math.max(...rejectedByHour.map((item) => item.v), 1);

  const fullestCompartment = compartments.reduce((best, compartment) => {
    const fill = calculateFillFromDistance(
      compartment.current_distance_cm,
      compartment.empty_threshold_cm,
      compartment.full_threshold_cm
    );
    return !best || fill > best.fill ? { compartment, fill } : best;
  }, null);

  const machineLabel = smartBin?.status === 'offline'
    ? 'Offline'
    : fullestCompartment?.fill >= 100
      ? 'Full'
      : fullestCompartment?.fill >= 80
        ? 'Attention'
        : 'Normal';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'sans-serif' }}>
      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        .animate-fade-in-up { animation: fadeInUp .45s ease-out forwards; }
        @media (max-width: 760px) {
          .compartment-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="animate-fade-in-up" style={{ background: COLORS.white, borderRadius: '24px', padding: '28px', boxShadow: '0 10px 25px -5px rgba(0,0,0,.05)', border: `1px solid ${COLORS.mintLight}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: COLORS.mintMuted, display: 'grid', placeItems: 'center', fontSize: 26 }}>♻️</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.darkMuted, textTransform: 'uppercase', letterSpacing: '.05em' }}>Plink Dual-Compartment Smart Bin</div>
              <h2 style={{ margin: '4px 0 0', fontSize: 24, color: COLORS.dark }}>{smartBin?.name || 'Smart Recycling Bin'}</h2>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 5, fontSize: 12, color: COLORS.darkMuted }}>
                <span>📍 {smartBin?.location || 'Unknown location'}</span>
                <span>🕒 Last active {smartBin?.last_active_at ? new Date(smartBin.last_active_at).toLocaleString() : 'never'}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ padding: '6px 12px', borderRadius: 999, background: machineLabel === 'Normal' ? COLORS.mintMuted : COLORS.amberBg, color: machineLabel === 'Normal' ? COLORS.dark : COLORS.amberText, fontSize: 12, fontWeight: 800 }}>{machineLabel}</span>
            <span style={{ padding: '6px 12px', borderRadius: 999, background: COLORS.limeLight, color: COLORS.dark, fontSize: 12, fontWeight: 700 }}>
              {smartBin?.status === 'online' ? '🟢 Connected' : '🔴 Offline'}
            </span>
          </div>
        </div>

        {compartments.length > 0 ? (
          <div className="compartment-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '18px' }}>
            {compartments.map((compartment) => <CompartmentCard key={compartment.compartment_id} compartment={compartment} />)}
          </div>
        ) : (
          <div style={{ padding: '28px', borderRadius: 18, background: COLORS.ivory, color: COLORS.darkMuted, textAlign: 'center' }}>
            No compartment records found. Run the new migration and seed the Plastic and Paper compartments.
          </div>
        )}

        <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px,1fr))', gap: '12px' }}>
          {[
            ['Accepted Today', acceptedToday, 'Items', COLORS.mintLight, COLORS.dark],
            ['Plastic Accepted', Number(acceptedByMaterial.plastic || 0), 'Today', COLORS.ivory, COLORS.dark],
            ['Paper Accepted', Number(acceptedByMaterial.paper || 0), 'Today', COLORS.limeLight, COLORS.dark],
            ['Rejected Today', rejectedToday, 'Items', COLORS.redBg, COLORS.redText],
            ['Acceptance Rate', `${acceptanceRate}%`, 'Today', COLORS.limeLight, COLORS.dark],
          ].map(([label, value, sub, bg, text]) => (
            <div key={label} style={{ background: bg, borderRadius: 16, padding: 16 }}>
              <div style={{ fontSize: 12, color: COLORS.darkMuted }}>{label}</div>
              <div style={{ fontSize: 25, fontWeight: 800, color: text, marginTop: 4 }}>{value}</div>
              <div style={{ fontSize: 11, color: text, opacity: .8, fontWeight: 650, marginTop: 3 }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="animate-fade-in-up" style={{ background: COLORS.white, borderRadius: 24, padding: 24, border: `1px solid ${COLORS.mintLight}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 15 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, color: COLORS.dark }}>HC-SR04 Compartment Sensors</h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: COLORS.darkMuted }}>Each compartment has its own distance sensor and fullness calculation.</p>
          </div>
          <span style={{ fontSize: 11, color: COLORS.darkMuted }}>{refreshing ? 'Updating…' : lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Waiting for sensor data'}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 12 }}>
          {compartments.map((compartment) => {
            const fill = calculateFillFromDistance(compartment.current_distance_cm, compartment.empty_threshold_cm, compartment.full_threshold_cm);
            return (
              <div key={compartment.compartment_id} style={{ background: COLORS.ivory, borderRadius: 14, padding: 15 }}>
                <div style={{ fontSize: 11, color: COLORS.darkMuted, fontWeight: 800, textTransform: 'uppercase' }}>{compartment.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, gap: 8 }}>
                  <span style={{ color: COLORS.dark }}>Distance</span><strong style={{ color: COLORS.dark }}>{compartment.current_distance_cm ?? '—'} cm</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, gap: 8 }}>
                  <span style={{ color: COLORS.dark }}>Fullness</span><strong style={{ color: COLORS.dark }}>{fill}%</strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="animate-fade-in-up" style={{ background: COLORS.white, borderRadius: 24, padding: 24, border: `1px solid ${COLORS.mintLight}` }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 18, color: COLORS.dark }}>Rejected Items by Hour</h3>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: COLORS.darkMuted }}>Items rejected by the classifier today.</p>
        <div style={{ height: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: `1px solid ${COLORS.mintMuted}`, paddingBottom: 8, gap: 4 }}>
          {rejectedByHour.map((item, index) => {
            const heightPercent = (item.v / maxRejectedValue) * 100;
            return (
              <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' }}>
                {item.v > 0 && <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.redText, marginBottom: 2 }}>{item.v}</div>}
                <div style={{ width: '70%', minWidth: 12, height: item.v === 0 ? 2 : `${heightPercent}%`, background: item.v === 0 ? '#e2e8f0' : '#dc2626', borderRadius: '4px 4px 0 0' }} title={`${item.h}: ${item.v} rejections`} />
                <div style={{ fontSize: 10, color: COLORS.dark, marginTop: 6, whiteSpace: 'nowrap' }}>{item.h}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
