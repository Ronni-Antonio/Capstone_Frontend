import React, { useEffect, useMemo, useState } from 'react';
import { useData } from '../context/DataContext.jsx';
import { RecycleIcon } from 'lucide-react';

// The Smart Bin now uses HC-SR04 distance as the source of truth.
// empty_threshold_cm = distance when the bin is considered empty
// full_threshold_cm  = distance when the bin is considered full
const COLORS = {
  white: '#ffffff',
  dark: '#3e5f44',
  darkMuted: 'rgba(62,95,68,0.6)',
  mintLight: 'rgba(199,234,187,0.4)',
  mintMuted: 'rgba(199,234,187,0.6)',
  limeLight: 'rgba(232,245,189,0.6)',
  ivory: '#fcfcf7',
  sage: '#5a7c61',
  redBg: '#fef2f2',
  redText: '#b91c1c',
  amberBg: '#fffbeb',
  amberText: '#b45309',
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const calculateFillFromDistance = (distance, emptyThreshold, fullThreshold) => {
  const d = Number(distance);
  const empty = Number(emptyThreshold);
  const full = Number(fullThreshold);

  if (!Number.isFinite(d) || !Number.isFinite(empty) || !Number.isFinite(full) || empty <= full) {
    return null;
  }

  // HC-SR04: a smaller measured distance means the bin contains more material.
  const percentage = ((empty - d) / (empty - full)) * 100;
  return Math.round(clamp(percentage, 0, 100));
};

const getBinState = (smartBin, fullness, distance, fullThreshold) => {
  if (!smartBin) {
    return {
      key: 'unknown',
      label: 'No data',
      message: 'No Smart Bin data is available.',
    };
  }

  if (smartBin.status === 'offline') {
    return {
      key: 'offline',
      label: 'Offline',
      message: 'Offline — check the Smart Bin connection.',
    };
  }

  const d = Number(distance);
  const full = Number(fullThreshold);

  if ((Number.isFinite(d) && Number.isFinite(full) && d <= full) || fullness >= 100) {
    return {
      key: 'full',
      label: 'Full',
      message: 'Full — empty the bin immediately.',
    };
  }

  if (fullness >= 80) {
    return {
      key: 'almost_full',
      label: 'Almost Full',
      message: 'Warning — prepare to empty the bin.',
    };
  }

  return {
    key: 'normal',
    label: 'Normal',
    message: 'Normal — bin is accepting bottles.',
  };
};

const stateStyles = {
  normal: {
    bg: COLORS.mintMuted,
    text: COLORS.dark,
    accent: COLORS.sage,
  },
  almost_full: {
    bg: COLORS.amberBg,
    text: COLORS.amberText,
    accent: '#f59e0b',
  },
  full: {
    bg: COLORS.redBg,
    text: COLORS.redText,
    accent: '#dc2626',
  },
  offline: {
    bg: '#f1f5f9',
    text: '#475569',
    accent: '#64748b',
  },
  unknown: {
    bg: '#f1f5f9',
    text: '#475569',
    accent: '#64748b',
  },
};

export function MachineMonitoring() {
  const {
    smartBins,
    refreshSmartBins,
  } = useData();

  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // The API still supplies the Smart Bin through the existing /machines route,
  // while the returned record uses the revised distance-based fields.
  const smartBin = smartBins?.[0] || null;

  // Refresh the sensor data periodically so the dashboard can reflect new
  // HC-SR04 readings without requiring a full page reload.
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

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  const sensor = useMemo(() => {
    if (!smartBin) {
      return {
        distance: null,
        emptyThreshold: 80,
        fullThreshold: 20,
        fullness: 0,
      };
    }

    // These are the revised backend fields.
    // Fallbacks are only for compatibility with an older API response.
    const distance = Number(
      smartBin.current_distance_cm ??
      smartBin.distance_cm ??
      smartBin.currentDistanceCm
    );

    const emptyThreshold = Number(
      smartBin.empty_threshold_cm ??
      smartBin.emptyThresholdCm ??
      80
    );

    const fullThreshold = Number(
      smartBin.full_threshold_cm ??
      smartBin.fullThresholdCm ??
      20
    );

    const calculatedFullness = calculateFillFromDistance(
      distance,
      emptyThreshold,
      fullThreshold
    );

    return {
      distance: Number.isFinite(distance) ? distance : null,
      emptyThreshold,
      fullThreshold,
      // Do not use current_fill_percentage as the source of truth.
      // It may be returned by Laravel, but the UI derives fullness from
      // the measured HC-SR04 distance.
      fullness: calculatedFullness ?? 0,
    };
  }, [smartBin]);

  // Today's bottle classification statistics are supplied by /api/machines.
  // The backend derives them from recycling_items.status so Machine Monitoring
  // does not need to download the complete recycling transaction history.
  const todayStats = smartBin?.today_stats || {};
  const acceptedToday = Number(todayStats.accepted || 0);
  const rejectedToday = Number(todayStats.rejected || 0);

  const binState = getBinState(
    smartBin,
    sensor.fullness,
    sensor.distance,
    sensor.fullThreshold
  );

  const styles = stateStyles[binState.key] || stateStyles.unknown;

  const hourlyRejectedMap = useMemo(() => {
    const rows = Array.isArray(smartBin?.rejected_by_hour)
      ? smartBin.rejected_by_hour
      : [];

    return new Map(
      rows.map((row) => [Number(row.hour), Number(row.count || 0)])
    );
  }, [smartBin]);

  const rejectedByHour = Array.from({ length: 11 }, (_, index) => {
    const hour = index + 7;
    const suffix = hour >= 12 ? 'pm' : 'am';
    const displayHour = hour > 12 ? hour - 12 : hour;

    return {
      h: `${displayHour}${suffix}`,
      v: hourlyRejectedMap.get(hour) || 0,
    };
  });

  const maxRejectedValue = Math.max(
    ...rejectedByHour.map((item) => item.v),
    1
  );

  const classifiedToday = acceptedToday + rejectedToday;
  const acceptanceRate =
    todayStats.acceptance_rate !== undefined && todayStats.acceptance_rate !== null
      ? Math.round(Number(todayStats.acceptance_rate))
      : classifiedToday > 0
        ? Math.round((acceptedToday / classifiedToday) * 100)
        : 0;

  const circleDashOffset = 100 - sensor.fullness;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        fontFamily: 'sans-serif',
      }}
    >
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }

        .distance-fill {
          transition: width 0.5s ease, stroke-dashoffset 0.5s ease;
        }
      `}</style>

      <div
        className="animate-fade-in-up"
        style={{
          backgroundColor: COLORS.white,
          borderRadius: '24px',
          padding: '28px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
          border: `1px solid ${COLORS.mintLight}`,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: '#EBF5E4',
                border: '2px solid #A2CB8B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RecycleIcon className="w-5 h-5 text-[#2F5D3A]" />
            </div>

            <div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: COLORS.darkMuted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Plink Recycling Bin
              </div>

              <h2
                style={{
                  margin: '4px 0 0',
                  fontSize: '24px',
                  fontWeight: '700',
                  color: COLORS.dark,
                }}
              >
                {smartBin?.name || 'Smart Recycling Bin'}
              </h2>

              <div
                style={{
                  fontSize: '12px',
                  color: COLORS.darkMuted,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginTop: '4px',
                }}
              >
                <span>📍 {smartBin?.location || 'Unknown location'}</span>
                <span>
                  🕒 Last active{' '}
                  {smartBin?.last_active_at
                    ? new Date(smartBin.last_active_at).toLocaleString()
                    : 'never'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span
              style={{
                padding: '5px 12px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: '700',
                backgroundColor: styles.bg,
                color: styles.text,
              }}
            >
              {binState.label}
            </span>

            <span
              style={{
                padding: '5px 10px',
                backgroundColor: COLORS.limeLight,
                color: COLORS.dark,
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: '600',
              }}
            >
              {smartBin?.status === 'online'
                ? '🟢 Connected'
                : smartBin?.status === 'offline'
                  ? '🔴 Offline'
                  : `🟡 ${smartBin?.status || 'Unknown'}`}
            </span>
          </div>
        </div>

        {/* Main monitoring area */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
          }}
        >
          {/* Distance-derived fullness */}
          <div
            style={{
              backgroundColor: COLORS.ivory,
              borderRadius: '24px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                fontWeight: '600',
                color: COLORS.darkMuted,
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              Real-time Bin Fullness
            </div>

            <div style={{ position: 'relative', width: '224px', height: '224px' }}>
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 36 36"
                style={{ transform: 'rotate(-90deg)' }}
              >
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e8f5bd"
                  strokeWidth="3"
                />

                <path
                  className="distance-fill"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={styles.accent}
                  strokeWidth="3"
                  strokeDasharray="100"
                  strokeDashoffset={circleDashOffset}
                  strokeLinecap="round"
                />
              </svg>

              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: '48px',
                    fontWeight: '700',
                    color: COLORS.dark,
                  }}
                >
                  {sensor.fullness}%
                </div>

                <div
                  style={{
                    fontSize: '12px',
                    color: COLORS.darkMuted,
                    marginTop: '4px',
                  }}
                >
                  calculated from distance
                </div>
              </div>
            </div>

            {/* Actual HC-SR04 measurement */}
            <div
              style={{
                width: '100%',
                marginTop: '14px',
                padding: '14px 16px',
                borderRadius: '16px',
                backgroundColor: COLORS.white,
                border: `1px solid ${COLORS.mintLight}`,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  color: COLORS.darkMuted,
                  textTransform: 'uppercase',
                  fontWeight: '700',
                }}
              >
                HC-SR04 Distance
              </div>

              <div
                style={{
                  fontSize: '30px',
                  fontWeight: '700',
                  color: COLORS.dark,
                  marginTop: '4px',
                }}
              >
                {sensor.distance !== null
                  ? `${sensor.distance.toFixed(1)} cm`
                  : 'No reading'}
              </div>

              <div
                style={{
                  fontSize: '11px',
                  color: COLORS.darkMuted,
                  marginTop: '4px',
                }}
              >
                Empty: {sensor.emptyThreshold} cm · Full: {sensor.fullThreshold} cm
              </div>
            </div>

            <div
              style={{
                marginTop: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                textAlign: 'center',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: styles.accent,
                }}
              />

              <span style={{ fontWeight: '600', color: styles.text }}>
                {binState.message}
              </span>
            </div>
          </div>

          {/* Distance-to-fullness explanation + metrics */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '20px',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: '600', color: COLORS.dark }}>
                  Distance-based Fullness
                </span>

                <span style={{ fontSize: '14px', fontWeight: '700', color: COLORS.dark }}>
                  {sensor.fullness}%
                </span>
              </div>

              <div
                style={{
                  width: '100%',
                  height: '20px',
                  backgroundColor: 'rgba(232,245,189,0.7)',
                  borderRadius: '9999px',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    borderRadius: '9999px',
                    width: `${sensor.fullness}%`,
                    backgroundColor: styles.accent,
                    transition: 'width 0.5s ease',
                  }}
                />

                <span
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    width: '1px',
                    backgroundColor: 'rgba(62,95,68,0.35)',
                    left: '80%',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '10px',
                  color: COLORS.darkMuted,
                  marginTop: '6px',
                }}
              >
                <span>0% Empty</span>
                <span>80% Almost Full</span>
                <span>100% Full</span>
              </div>

              <div
                style={{
                  marginTop: '14px',
                  padding: '14px 16px',
                  borderRadius: '14px',
                  backgroundColor: COLORS.ivory,
                  border: `1px solid ${COLORS.mintLight}`,
                  fontSize: '12px',
                  lineHeight: 1.6,
                  color: COLORS.darkMuted,
                }}
              >
                <strong style={{ color: COLORS.dark }}>How it is calculated:</strong>{' '}
                the HC-SR04 measures the empty space above the bottles. As the
                bottles rise, the measured distance decreases, so the calculated
                fullness increases.
              </div>
            </div>

            {/* Today's recycling metrics */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
              }}
            >
              <div
                style={{
                  backgroundColor: COLORS.mintLight,
                  borderRadius: '16px',
                  padding: '16px',
                }}
              >
                <div style={{ fontSize: '12px', color: COLORS.darkMuted }}>
                  Accepted Today
                </div>
                <div
                  style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: COLORS.dark,
                    marginTop: '4px',
                  }}
                >
                  {acceptedToday}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: COLORS.sage,
                    fontWeight: '600',
                    marginTop: '4px',
                  }}
                >
                  Bottles
                </div>
              </div>

              <div
                style={{
                  backgroundColor: COLORS.redBg,
                  borderRadius: '16px',
                  padding: '16px',
                }}
              >
                <div style={{ fontSize: '12px', color: COLORS.darkMuted }}>
                  Rejected Today
                </div>
                <div
                  style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: COLORS.redText,
                    marginTop: '4px',
                  }}
                >
                  {rejectedToday}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: COLORS.redText,
                    fontWeight: '600',
                    marginTop: '4px',
                  }}
                >
                  Non-PET
                </div>
              </div>

              <div
                style={{
                  backgroundColor: COLORS.limeLight,
                  borderRadius: '16px',
                  padding: '16px',
                }}
              >
                <div style={{ fontSize: '12px', color: COLORS.darkMuted }}>
                  Acceptance Rate
                </div>
                <div
                  style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: COLORS.dark,
                    marginTop: '4px',
                  }}
                >
                  {acceptanceRate}%
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: COLORS.darkMuted,
                    fontWeight: '600',
                    marginTop: '4px',
                  }}
                >
                  Today
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sensor status */}
      <div
        className="animate-fade-in-up"
        style={{
          backgroundColor: COLORS.white,
          borderRadius: '24px',
          padding: '24px',
          border: `1px solid ${COLORS.mintLight}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '16px',
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '700',
                color: COLORS.dark,
              }}
            >
              HC-SR04 Sensor Status
            </h3>

            <p
              style={{
                margin: '4px 0 0',
                fontSize: '13px',
                color: COLORS.darkMuted,
              }}
            >
              The dashboard uses distance, not weight, to determine bin fullness.
            </p>
          </div>

          <span
            style={{
              fontSize: '11px',
              color: COLORS.darkMuted,
            }}
          >
            {refreshing
              ? 'Updating…'
              : lastUpdated
                ? `Updated ${lastUpdated.toLocaleTimeString()}`
                : 'Waiting for sensor data'}
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
          }}
        >
          {[
            ['Current Distance', sensor.distance !== null ? `${sensor.distance.toFixed(1)} cm` : '—'],
            ['Empty Threshold', `${sensor.emptyThreshold} cm`],
            ['Full Threshold', `${sensor.fullThreshold} cm`],
            ['Calculated Fullness', `${sensor.fullness}%`],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                backgroundColor: COLORS.ivory,
                borderRadius: '14px',
                padding: '15px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  color: COLORS.darkMuted,
                  textTransform: 'uppercase',
                  fontWeight: '700',
                }}
              >
                {label}
              </div>

              <div
                style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: COLORS.dark,
                  marginTop: '5px',
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rejected items by hour */}
      <div
        className="animate-fade-in-up"
        style={{
          backgroundColor: COLORS.white,
          borderRadius: '24px',
          padding: '24px',
          border: `1px solid ${COLORS.mintLight}`,
        }}
      >
        <h3
          style={{
            margin: '0 0 4px',
            fontSize: '18px',
            fontWeight: '700',
            color: COLORS.dark,
          }}
        >
          Rejected Items by Hour
        </h3>

        <p
          style={{
            margin: '0 0 16px',
            fontSize: '13px',
            color: COLORS.darkMuted,
          }}
        >
          When non-PET items were attempted today.
        </p>

        <div
          style={{
            height: '200px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${COLORS.mintMuted}`,
            paddingBottom: '8px',
            gap: '4px',
          }}
        >
          {rejectedByHour.map((item, index) => {
            const heightPercent = (item.v / maxRejectedValue) * 100;

            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: 1,
                  height: '100%',
                  justifyContent: 'flex-end',
                }}
              >
                {item.v > 0 && (
                  <div
                    style={{
                      fontSize: '10px',
                      fontWeight: '600',
                      color: COLORS.redText,
                      marginBottom: '2px',
                    }}
                  >
                    {item.v}
                  </div>
                )}

                <div
                  style={{
                    width: '70%',
                    minWidth: '12px',
                    height: item.v === 0 ? '2px' : `${heightPercent}%`,
                    backgroundColor: item.v === 0 ? '#e2e8f0' : '#dc2626',
                    borderRadius: '4px 4px 0 0',
                  }}
                  title={`${item.h}: ${item.v} rejections`}
                />

                <div
                  style={{
                    fontSize: '10px',
                    color: COLORS.dark,
                    marginTop: '6px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.h}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
