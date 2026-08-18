import React, { useEffect, useMemo, useState } from 'react';
import api from '../api.jsx';

const COLORS = {
  white: '#ffffff',
  dark: '#3e5f44',
  sage: '#5f8466',
  sage2: '#7ca381',
  paper: '#a7bd76',
  muted: '#829487',
  border: 'rgba(199,234,187,0.7)',
  grid: 'rgba(62,95,68,0.10)',
  light: '#f4f8ef',
  forecast: '#9aae62',
  danger: '#b35f5f',
};

const PERIODS = [
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 90 days', value: 90 },
];

const fmt = (value, digits = 0) =>
  Number(value || 0).toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });

const dateLabel = (value) => {
  if (!value) return '';
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

function Card({ children, style = {} }) {
  return (
    <section
      style={{
        background: COLORS.white,
        border: `1px solid ${COLORS.border}`,
        borderRadius: '22px',
        padding: '22px',
        minWidth: 0,
        ...style,
      }}
    >
      {children}
    </section>
  );
}

function SectionTitle({ title, subtitle, right }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '18px',
      }}
    >
      <div>
        <h3 style={{ margin: 0, color: COLORS.dark, fontSize: '17px' }}>{title}</h3>
        {subtitle && (
          <div style={{ color: COLORS.muted, fontSize: '12px', marginTop: '5px' }}>
            {subtitle}
          </div>
        )}
      </div>
      {right}
    </div>
  );
}

function EmptyState({ text = 'No data available for this period.' }) {
  return (
    <div
      style={{
        minHeight: '160px',
        display: 'grid',
        placeItems: 'center',
        color: COLORS.muted,
        fontSize: '13px',
        textAlign: 'center',
      }}
    >
      {text}
    </div>
  );
}

function HorizontalBars({ data, labelKey = 'label', valueKey = 'value', suffix = '' }) {
  const max = Math.max(...data.map((item) => Number(item[valueKey] || 0)), 1);

  if (!data.length) return <EmptyState />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
      {data.map((item, index) => {
        const value = Number(item[valueKey] || 0);
        return (
          <div key={`${item[labelKey]}-${index}`}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '12px',
                color: COLORS.dark,
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '6px',
              }}
            >
              <span>{item[labelKey]}</span>
              <span>{fmt(value)}{suffix}</span>
            </div>
            <div style={{ height: '9px', background: '#eaf3e4', borderRadius: '999px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.max(value > 0 ? 2 : 0, (value / max) * 100)}%`,
                  height: '100%',
                  borderRadius: '999px',
                  background: index % 2 === 0 ? COLORS.sage2 : COLORS.paper,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TrendChart({ history = [], historyKey = 'y', forecast = [], height = 220 }) {
  const historical = history
    .filter((row) => row?.ds)
    .map((row) => ({ ds: row.ds, value: Number(row[historyKey] ?? row.y ?? 0), kind: 'history' }));
  const predicted = forecast
    .filter((row) => row?.ds)
    .map((row) => ({ ds: row.ds, value: Number(row.yhat || 0), kind: 'forecast' }));

  const combined = [...historical, ...predicted];
  if (!combined.length) return <EmptyState text="No historical or forecast data available." />;

  const width = 720;
  const pad = { left: 42, right: 20, top: 22, bottom: 34 };
  const usableW = width - pad.left - pad.right;
  const usableH = height - pad.top - pad.bottom;
  const values = combined.map((row) => row.value);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);
  const step = combined.length > 1 ? usableW / (combined.length - 1) : 0;
  const point = (row, index) => ({
    x: pad.left + index * step,
    y: pad.top + usableH - ((row.value - min) / range) * usableH,
  });
  const historyPoints = historical.map((row, i) => point(row, i));
  const forecastStart = Math.max(0, historical.length - 1);
  const forecastSeries = historical.length && predicted.length
    ? [historical[historical.length - 1], ...predicted]
    : predicted;
  const forecastPoints = forecastSeries.map((row, i) => point(row, forecastStart + i));
  const labels = combined.length <= 9
    ? combined.map((_, i) => i)
    : combined.map((_, i) => i).filter((i) => i === 0 || i === combined.length - 1 || i % Math.ceil(combined.length / 6) === 0);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} role="img">
      {[0, 0.5, 1].map((ratio) => {
        const y = pad.top + usableH - ratio * usableH;
        const value = min + ratio * range;
        return (
          <g key={ratio}>
            <line x1={pad.left} y1={y} x2={width - pad.right} y2={y} stroke={COLORS.grid} />
            <text x={pad.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill={COLORS.muted}>
              {fmt(value, value < 10 ? 1 : 0)}
            </text>
          </g>
        );
      })}

      {historical.length > 1 && (
        <polyline
          points={historyPoints.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke={COLORS.dark}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {forecastPoints.length > 1 && (
        <polyline
          points={forecastPoints.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke={COLORS.forecast}
          strokeWidth="3"
          strokeDasharray="8 6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {historyPoints.map((p, i) => (
        <circle key={`h-${i}`} cx={p.x} cy={p.y} r="3.5" fill={COLORS.dark} />
      ))}
      {forecastPoints.slice(historical.length ? 1 : 0).map((p, i) => (
        <circle key={`f-${i}`} cx={p.x} cy={p.y} r="3.5" fill={COLORS.forecast} />
      ))}

      {labels.map((i) => {
        const p = point(combined[i], i);
        return (
          <text key={i} x={p.x} y={height - 8} textAnchor="middle" fontSize="9" fill={COLORS.muted}>
            {dateLabel(combined[i].ds)}
          </text>
        );
      })}
    </svg>
  );
}

function ForecastPanel({ metric }) {
  if (!metric) return null;
  const forecast = metric.forecast || [];
  const first = forecast[0];

  return (
    <Card>
      <SectionTitle
        title={metric.title}
        subtitle={metric.forecast_generated_at ? `Prophet forecast generated ${metric.forecast_generated_at}` : 'Historical trend; run Prophet to generate a forecast'}
        right={
          <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: COLORS.muted, whiteSpace: 'nowrap' }}>
            <span>━ Actual</span>
            <span style={{ color: COLORS.forecast }}>┄ Forecast</span>
          </div>
        }
      />
      <TrendChart history={metric.history || []} forecast={forecast} />
      {forecast.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3,minmax(0,1fr))',
            gap: '10px',
            marginTop: '10px',
          }}
        >
          <MiniMetric
            label="Next forecast"
            value={`${fmt(first?.yhat, 1)} ${metric.unit}`}
          />
          <MiniMetric
            label="Forecast range"
            value={first?.yhat_lower != null && first?.yhat_upper != null
              ? `${fmt(first.yhat_lower, 1)}–${fmt(first.yhat_upper, 1)}`
              : '—'}
          />
          <MiniMetric
            label={metric.next_7_total != null ? 'Next 7 days' : 'Forecast peak'}
            value={metric.next_7_total != null
              ? `${fmt(metric.next_7_total, 1)} ${metric.unit}`
              : `${fmt(metric.peak_forecast, 1)}${metric.unit}`}
          />
        </div>
      )}
    </Card>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div style={{ background: COLORS.light, borderRadius: '14px', padding: '12px 14px' }}>
      <div style={{ color: COLORS.muted, fontSize: '10px' }}>{label}</div>
      <div style={{ color: COLORS.dark, fontWeight: 700, marginTop: '5px', fontSize: '14px' }}>{value}</div>
    </div>
  );
}

export default function Reports() {
  const [period, setPeriod] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [forecasting, setForecasting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [forecastMessage, setForecastMessage] = useState('');

  const loadData = async (days = period) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.getReportsAnalytics({ days });
      setData(response.data);
    } catch (err) {
      console.error('Reports analytics error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load reports and analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(period);
  }, [period]);

  const runForecast = async () => {
    setForecasting(true);
    setForecastMessage('');
    setError('');
    try {
      const response = await api.runProphetForecast({ periods: 7 });
      setForecastMessage(response.data?.message || 'Forecast generated successfully.');
      await loadData(period);
    } catch (err) {
      console.error('Prophet forecast error:', err);
      setError(
        err.response?.data?.details ||
        err.response?.data?.message ||
        err.message ||
        'Unable to run Prophet forecast.'
      );
    } finally {
      setForecasting(false);
    }
  };

  const downloadPdf = async () => {
    setDownloading(true);
    setError('');
    try {
      const response = await api.downloadSustainabilityReport({ days: period });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const from = data?.range?.from || 'report';
      const to = data?.range?.to || 'current';
      link.download = `plink-sustainability-report-${from}-to-${to}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF download error:', err);
      setError(err.response?.data?.message || err.message || 'Unable to download the PDF report.');
    } finally {
      setDownloading(false);
    }
  };

  const summaryCards = useMemo(() => {
    const s = data?.summary || {};
    return [
      ['Recyclables Collected', fmt(s.total_items), 'accepted + completed items'],
      ['Students Participating', fmt(s.participating_students), 'unique students'],
      ['Points Awarded', fmt(s.total_points), 'earned from recycling'],
      ['Rewards Redeemed', fmt(s.rewards_redeemed), 'completed redemptions'],
      ['Transactions', fmt(s.transactions), 'completed deposits'],
    ];
  }, [data]);

  if (loading && !data) {
    return <div style={{ padding: '40px', color: COLORS.muted }}>Loading Reports & Analytics…</div>;
  }

  const predictive = data?.predictive || {};
  const wasteTypes = data?.waste_types || [];
  const sections = data?.section_performance || [];
  const rewards = data?.reward_breakdown || [];
  const topRecyclers = data?.top_recyclers || [];
  const compartments = data?.compartments?.current || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'sans-serif' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
            style={{
              border: `1px solid ${COLORS.border}`,
              borderRadius: '12px',
              padding: '10px 12px',
              color: COLORS.dark,
              background: COLORS.white,
              fontWeight: 600,
            }}
          >
            {PERIODS.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
          <button onClick={runForecast} disabled={forecasting} style={buttonStyle(COLORS.sage)}>
            {forecasting ? 'Running Prophet…' : 'Run 7-Day Forecast'}
          </button>
          <button onClick={downloadPdf} disabled={downloading} style={buttonStyle(COLORS.dark)}>
            {downloading ? 'Preparing PDF…' : 'Download PDF Report'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fff0f0', color: COLORS.danger, borderRadius: '14px', padding: '12px 16px', fontSize: '12px' }}>
          {error}
        </div>
      )}
      {forecastMessage && (
        <div style={{ background: '#eef7e8', color: COLORS.dark, borderRadius: '14px', padding: '12px 16px', fontSize: '12px' }}>
          {forecastMessage}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '14px' }}>
        {summaryCards.map(([title, value, subtitle]) => (
          <Card key={title} style={{ padding: '18px' }}>
            <div style={{ fontSize: '11px', color: COLORS.muted }}>{title}</div>
            <div style={{ fontSize: '25px', fontWeight: 800, color: COLORS.dark, marginTop: '8px' }}>{value}</div>
            <div style={{ fontSize: '10px', color: COLORS.muted, marginTop: '4px' }}>{subtitle}</div>
          </Card>
        ))}
      </div>

      <div>
        <h3 style={groupTitleStyle}>Historical Analytics</h3>
        <div style={groupSubtitleStyle}>
          Descriptive analytics calculated from the selected reporting period
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.45fr) minmax(300px,0.85fr)', gap: '20px' }}>
        <Card>
          <SectionTitle title="Recycling Collection Trend" subtitle="Items collected per day" />
          <TrendChart history={(data?.daily_collection || []).map((row) => ({ ds: row.ds, y: row.items }))} />
        </Card>
        <Card>
          <SectionTitle title="Recyclable Type Distribution" subtitle="Accepted items classified by CNN material type" />
          <HorizontalBars data={wasteTypes.map((item) => ({ label: item.label || item.name, value: item.total_items }))} />
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '20px' }}>
        <Card>
          <SectionTitle title="Student Participation" subtitle="Unique students recycling each day" />
          <TrendChart history={(data?.participation_trend || []).map((row) => ({ ds: row.ds, y: row.students }))} />
        </Card>
        <Card>
          <SectionTitle title="Section Performance" subtitle="Recyclable items collected by section" />
          <HorizontalBars data={sections.map((item) => ({ label: item.name, value: item.total_items }))} />
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '20px' }}>
        <Card>
          <SectionTitle title="Top 5 Recyclers" subtitle="Ranked by points earned during the reporting period" />
          {topRecyclers.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {topRecyclers.map((student, index) => (
                <div
                  key={student.student_id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '32px 1fr auto',
                    gap: '12px',
                    alignItems: 'center',
                    padding: '12px',
                    background: COLORS.light,
                    borderRadius: '14px',
                  }}
                >
                  <div style={{ fontWeight: 800, color: COLORS.sage }}>#{index + 1}</div>
                  <div>
                    <div style={{ fontWeight: 700, color: COLORS.dark, fontSize: '13px' }}>{student.name}</div>
                    <div style={{ color: COLORS.muted, fontSize: '10px', marginTop: '3px' }}>{fmt(student.items_recycled)} items recycled</div>
                  </div>
                  <div style={{ color: COLORS.dark, fontWeight: 800 }}>{fmt(student.points_earned)} pts</div>
                </div>
              ))}
            </div>
          ) : <EmptyState />}
        </Card>

        <Card>
          <SectionTitle title="Reward Redemptions" subtitle="Most redeemed rewards in the selected period" />
          <HorizontalBars data={rewards.map((item) => ({ label: item.name, value: item.redemptions }))} />
        </Card>
      </div>

      <Card>
        <SectionTitle title="Smart Bin Compartments" subtitle="Current fullness for each separately monitored compartment" />
        {compartments.length ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: '14px' }}>
            {compartments.map((compartment) => (
              <div key={compartment.compartment_id} style={{ background: COLORS.light, borderRadius: '16px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                  <strong style={{ color: COLORS.dark }}>{compartment.name}</strong>
                  <strong style={{ color: COLORS.dark, fontSize: '20px' }}>{fmt(compartment.fill_percentage)}%</strong>
                </div>
                <div style={{ height: '10px', background: '#e5efdf', borderRadius: '999px', overflow: 'hidden', marginTop: '12px' }}>
                  <div
                    style={{
                      width: `${Math.min(100, Math.max(0, Number(compartment.fill_percentage || 0)))}%`,
                      height: '100%',
                      background: compartment.material_category === 'paper' ? COLORS.paper : COLORS.sage,
                    }}
                  />
                </div>
                <div style={{ color: COLORS.muted, fontSize: '10px', marginTop: '8px' }}>
                  {compartment.distance_cm ?? '—'} cm · {compartment.status}
                </div>
              </div>
            ))}
          </div>
        ) : <EmptyState />}
      </Card>

      <div style={{ marginTop: '8px' }}>
        <h3 style={groupTitleStyle}>Predictive Analytics — Prophet</h3>
        <div style={groupSubtitleStyle}>
          Forecasts are stored in Laravel so the system can later compare predicted values with actual outcomes
        </div>
      </div>

      {!Object.values(predictive).some((metric) => metric?.forecast?.length) && (
        <div style={{ background: '#f2f7df', color: COLORS.dark, borderRadius: '16px', padding: '14px 16px', fontSize: '12px' }}>
          No Prophet forecast has been stored yet. Start the Python Prophet service, then click <strong>Run 7-Day Forecast</strong>.
        </div>
      )}

      <ForecastPanel metric={predictive.recycling_volume} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '20px' }}>
        <ForecastPanel metric={predictive.student_participation} />
        <ForecastPanel metric={predictive.reward_redemptions} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '20px' }}>
        <ForecastPanel metric={predictive.plastic_fullness} />
        <ForecastPanel metric={predictive.paper_fullness} />
      </div>

      <Card>
        <SectionTitle
          title="Downloadable Sustainability Report"
          subtitle="The PDF uses the same historical analytics and stored Prophet forecasts shown on this page"
          right={<button onClick={downloadPdf} disabled={downloading} style={buttonStyle(COLORS.dark)}>{downloading ? 'Preparing…' : 'Download PDF'}</button>}
        />
        <div style={{ color: COLORS.muted, fontSize: '12px', lineHeight: 1.7 }}>
          Includes the reporting period, summary statistics, recyclable-type breakdown, section performance,
          top recyclers, compartment fullness, and the latest seven-day Prophet forecasts with prediction ranges.
        </div>
      </Card>
    </div>
  );
}

const buttonStyle = (background) => ({
  border: 'none',
  borderRadius: '12px',
  padding: '10px 14px',
  background,
  color: '#fff',
  fontWeight: 700,
  fontSize: '12px',
  cursor: 'pointer',
});

const groupTitleStyle = {
  margin: 0,
  color: COLORS.dark,
  fontSize: '19px',
};

const groupSubtitleStyle = {
  color: COLORS.muted,
  fontSize: '12px',
  marginTop: '5px',
};
