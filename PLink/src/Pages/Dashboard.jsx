import { useData } from '../context/DataContext.jsx';

const COLORS = {
  white: '#ffffff',
  dark: '#3e5f44',
  sage: '#5a7c61',
  muted: 'rgba(62,95,68,0.62)',
  mint: '#c7eabb',
  mintLight: 'rgba(199,234,187,0.38)',
  lime: '#e8f5bd',
  limeLight: 'rgba(232,245,189,0.62)',
  ivory: '#fcfcf7',
  paper: '#d9e8c8',
  plastic: '#6f9f78',
};

const formatDate = (date) => {
  if (!date) return '—';
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));

const calculateCompartmentFill = (compartment) => {
  const stored = Number(compartment?.current_fill_percentage);
  if (Number.isFinite(stored)) return clamp(Math.round(stored));

  const empty = Number(compartment?.empty_threshold_cm ?? 80);
  const full = Number(compartment?.full_threshold_cm ?? 20);
  const distance = Number(compartment?.current_distance_cm ?? empty);
  const range = empty - full;
  if (range <= 0) return 0;
  return clamp(Math.round(((empty - distance) / range) * 100));
};

const Card = ({ children, style = {} }) => (
  <div
    style={{
      background: COLORS.white,
      border: `1px solid ${COLORS.mintLight}`,
      borderRadius: '24px',
      boxShadow: '0 10px 28px rgba(62,95,68,.045)',
      padding: '24px',
      ...style,
    }}
  >
    {children}
  </div>
);

const EmptyState = ({ children }) => (
  <div style={{ padding: '34px 12px', textAlign: 'center', color: COLORS.muted, fontSize: '13px' }}>
    {children}
  </div>
);

function CompartmentCard({ compartment, fallbackCategory }) {
  const category = compartment?.material_category || fallbackCategory;
  const isPaper = category === 'paper';
  const fill = calculateCompartmentFill(compartment);
  const distance = compartment?.current_distance_cm;
  const label = compartment?.name || `${isPaper ? 'Paper' : 'Plastic'} Compartment`;

  const status = fill >= 95 ? 'Full' : fill >= 80 ? 'Almost Full' : 'Normal';

  return (
    <div
      style={{
        flex: 1,
        minWidth: '220px',
        borderRadius: '18px',
        padding: '18px',
        background: isPaper ? 'rgba(232,245,189,.42)' : 'rgba(199,234,187,.32)',
        border: `1px solid ${COLORS.mintLight}`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '11px', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '.04em' }}>
            {isPaper ? 'Paper' : 'Plastic'} fullness
          </div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: COLORS.dark, marginTop: '4px' }}>{label}</div>
        </div>
        <div style={{ fontSize: '30px', fontWeight: 800, color: COLORS.dark }}>{fill}%</div>
      </div>

      <div style={{ height: '10px', borderRadius: '999px', background: 'rgba(62,95,68,.10)', overflow: 'hidden', marginTop: '18px' }}>
        <div
          style={{
            height: '100%',
            width: `${fill}%`,
            borderRadius: '999px',
            background: isPaper ? '#9db66e' : COLORS.sage,
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '11px', color: COLORS.muted }}>
        <span>{distance != null ? `${Number(distance).toFixed(0)} cm` : 'No reading'}</span>
        <span style={{ fontWeight: 700, color: fill >= 80 ? '#9a6a20' : COLORS.dark }}>{status}</span>
      </div>
    </div>
  );
}

function HorizontalBars({ data, labelKey, valueKey, colors = [COLORS.dark, '#7eac78', '#9cc98d', '#badca9', '#d8ebca'], suffix = '' }) {
  const max = Math.max(...data.map((item) => Number(item[valueKey] || 0)), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {data.map((item, index) => {
        const value = Number(item[valueKey] || 0);
        return (
          <div key={`${item[labelKey]}-${index}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: COLORS.dark }}>{item[labelKey]}</span>
              <span style={{ fontSize: '12px', fontWeight: 800, color: COLORS.sage }}>{value.toLocaleString()}{suffix}</span>
            </div>
            <div style={{ height: '9px', borderRadius: '999px', background: COLORS.mintLight, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${(value / max) * 100}%`,
                  height: '100%',
                  borderRadius: '999px',
                  background: colors[index % colors.length],
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SevenDayBars({ data, valueKey, label = 'Count', color = COLORS.dark }) {
  const max = Math.max(...data.map((item) => Number(item[valueKey] || 0)), 1);

  return (
    <div>
      <div style={{ height: '225px', display: 'flex', alignItems: 'flex-end', gap: '12px', borderBottom: `1px solid ${COLORS.mintLight}`, padding: '0 4px 8px' }}>
        {data.map((item, index) => {
          const value = Number(item[valueKey] || 0);
          const height = value > 0 ? Math.max((value / max) * 170, 8) : 3;
          return (
            <div key={`${item.date}-${index}`} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: '6px', height: '100%' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: COLORS.dark }}>{value}</span>
              <div style={{ width: '70%', maxWidth: '50px', height: `${height}px`, borderRadius: '9px 9px 3px 3px', background: color, opacity: value > 0 ? 1 : .18 }} />
              <span style={{ fontSize: '10px', color: COLORS.muted, whiteSpace: 'nowrap' }}>{formatDate(item.date)}</span>
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: 'center', fontSize: '11px', color: COLORS.muted, marginTop: '10px' }}>{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const { dashboard } = useData();

  const summary = dashboard?.summary || {};
  const totalItems = Number(summary.total_items || 0);
  const totalPoints = Number(summary.total_points || 0);
  const participatingStudents = Number(summary.participating_students || 0);

  const smartBin = dashboard?.smart_bin || null;
  const compartments = Array.isArray(smartBin?.compartments) ? smartBin.compartments : [];
  const plasticCompartment = compartments.find((c) => c.material_category === 'plastic') || null;
  const paperCompartment = compartments.find((c) => c.material_category === 'paper') || null;

  const dailyData = Array.isArray(dashboard?.daily_recycling) ? dashboard.daily_recycling : [];
  const wasteCategories = Array.isArray(dashboard?.waste_categories) ? dashboard.waste_categories : [];
  const participationTrend = Array.isArray(dashboard?.participation_trend) ? dashboard.participation_trend : [];
  const sectionStats = Array.isArray(dashboard?.section_stats) ? dashboard.section_stats : [];
  const topRecyclers = Array.isArray(dashboard?.top_recyclers)
    ? dashboard.top_recyclers
    : Array.isArray(dashboard?.user_ranking)
      ? dashboard.user_ranking
      : [];
  const rewardTrend = Array.isArray(dashboard?.reward_redemptions_trend) ? dashboard.reward_redemptions_trend : [];
  const rewardBreakdown = Array.isArray(dashboard?.reward_breakdown) ? dashboard.reward_breakdown : [];

  const wasteCategoryTotal = wasteCategories.reduce((sum, item) => sum + Number(item.total_items || 0), 0);

  // Compact Daily Waste Collection Report summaries. These are derived from the
  // existing 7-day dashboard payload, so no additional backend request is needed.
  const weeklyCollectedItems = dailyData.reduce(
    (sum, item) => sum + Number(item.items || 0),
    0
  );
  const averageCollectedPerDay = dailyData.length
    ? weeklyCollectedItems / dailyData.length
    : 0;

  const totalRedemptions = rewardTrend.reduce((sum, item) => sum + Number(item.redemptions || 0), 0);
  const totalPointsSpent = rewardTrend.reduce((sum, item) => sum + Number(item.points_spent || 0), 0);

  const topSection = dashboard?.top_section || null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', fontFamily: 'sans-serif' }}>
      <style>{`
        @keyframes dashboardFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .dashboard-section { animation: dashboardFade .35s ease both; }
        @media (max-width: 980px) {
          .dashboard-grid-2 { grid-template-columns: 1fr !important; }
          .dashboard-grid-3 { grid-template-columns: 1fr !important; }
          .daily-summary-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>


      {/* Core KPIs */}
      <div className="dashboard-section dashboard-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px' }}>
        {[
          ['Recyclables Collected', totalItems.toLocaleString(), 'All accepted/rejected transaction items'],
          ['Points Earned', totalPoints.toLocaleString(), 'Recycling points generated'],
          ['Students Participating', participatingStudents.toLocaleString(), 'Unique students who have recycled'],
        ].map(([title, value, subtitle]) => (
          <Card key={title} style={{ padding: '20px 22px' }}>
            <div style={{ fontSize: '12px', color: COLORS.muted }}>{title}</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: COLORS.dark, marginTop: '10px' }}>{value}</div>
            <div style={{ fontSize: '11px', color: COLORS.muted, marginTop: '5px' }}>{subtitle}</div>
          </Card>
        ))}
      </div>

      {/* Both compartments are shown because either can become full independently. */}
      <Card className="dashboard-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ margin: 0, color: COLORS.dark }}>Smart Bin Compartment Fullness</h3>
            <div style={{ fontSize: '12px', color: COLORS.muted, marginTop: '4px' }}>
              Separate HC-SR04 fullness monitoring for plastic and paper compartments
            </div>
          </div>
          <span style={{ padding: '6px 11px', borderRadius: '999px', background: COLORS.limeLight, color: COLORS.dark, fontSize: '11px', fontWeight: 800 }}>
            {smartBin?.status || 'Unknown'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <CompartmentCard compartment={plasticCompartment} fallbackCategory="plastic" />
          <CompartmentCard compartment={paperCompartment} fallbackCategory="paper" />
        </div>
      </Card>

      {/* Daily report + categories */}
      <div className="dashboard-section dashboard-grid-2" style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: '20px' }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, color: COLORS.dark }}>Daily Waste Collection Report</h3>
              <div style={{ fontSize: '12px', color: COLORS.muted, marginTop: '4px' }}>Last seven days of recycling activity</div>
            </div>
            <span style={{ background: COLORS.limeLight, color: COLORS.dark, padding: '6px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 800 }}>7 days</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '460px' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${COLORS.mintLight}` }}>
                  <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: '11px', color: COLORS.muted }}>Date</th>
                  <th style={{ textAlign: 'right', padding: '10px 8px', fontSize: '11px', color: COLORS.muted }}>Items Collected</th>
                  <th style={{ textAlign: 'right', padding: '10px 8px', fontSize: '11px', color: COLORS.muted }}>Points Earned</th>
                </tr>
              </thead>
              <tbody>
                {[...dailyData].reverse().map((item) => (
                  <tr key={item.date} style={{ borderBottom: '1px solid rgba(0,0,0,.045)' }}>
                    <td style={{ padding: '12px 8px', fontSize: '13px', fontWeight: 700, color: COLORS.dark }}>{formatDate(item.date)}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'right', fontSize: '13px', fontWeight: 800, color: COLORS.sage }}>{Number(item.items || 0)}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'right', fontSize: '13px', fontWeight: 800, color: COLORS.dark }}>{Number(item.points || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Keep this compact: only the two most useful 7-day summaries. */}
          <div
            className="daily-summary-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '12px',
              marginTop: '18px',
              paddingTop: '16px',
              borderTop: `1px solid ${COLORS.mintLight}`,
            }}
          >
            <div
              style={{
                padding: '14px 16px',
                borderRadius: '16px',
                background: 'rgba(199,234,187,.24)',
                border: `1px solid ${COLORS.mintLight}`,
              }}
            >
              <div style={{ fontSize: '11px', color: COLORS.muted }}>Total Items</div>
              <div style={{ fontSize: '22px', lineHeight: 1.1, fontWeight: 800, color: COLORS.dark, marginTop: '6px' }}>
                {weeklyCollectedItems.toLocaleString()}
              </div>
              <div style={{ fontSize: '10px', color: COLORS.muted, marginTop: '4px' }}>Last 7 days</div>
            </div>

            <div
              style={{
                padding: '14px 16px',
                borderRadius: '16px',
                background: 'rgba(232,245,189,.34)',
                border: `1px solid ${COLORS.mintLight}`,
              }}
            >
              <div style={{ fontSize: '11px', color: COLORS.muted }}>Average / Day</div>
              <div style={{ fontSize: '22px', lineHeight: 1.1, fontWeight: 800, color: COLORS.dark, marginTop: '6px' }}>
                {averageCollectedPerDay.toFixed(1)}
              </div>
              <div style={{ fontSize: '10px', color: COLORS.muted, marginTop: '4px' }}>items per day</div>
            </div>
          </div>
        </Card>

        <Card>
          <h3 style={{ margin: 0, color: COLORS.dark }}>Recyclable Type Statistics</h3>
          <div style={{ fontSize: '12px', color: COLORS.muted, marginTop: '4px', marginBottom: '20px' }}>
            Accepted recyclable items deposited by CNN-classified material type
          </div>
          {wasteCategories.length ? (
            <>
              <HorizontalBars
                data={wasteCategories.map((item) => ({
                  ...item,
                  label: item.label || item.name || item.material_category || item.category || 'Unknown',
                }))}
                labelKey="label"
                valueKey="total_items"
                colors={[COLORS.plastic, '#6f9d76', '#8bb88a', '#a7bd76', '#b8d4a7', '#c6dbb4', '#d5e7c4', '#e1efd4', '#adc58a']}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '14px', borderTop: `1px solid ${COLORS.mintLight}` }}>
                <span style={{ fontSize: '12px', color: COLORS.muted }}>Total deposited</span>
                <strong style={{ color: COLORS.dark }}>{wasteCategoryTotal.toLocaleString()} items</strong>
              </div>
            </>
          ) : <EmptyState>No recyclable type data available yet.</EmptyState>}
        </Card>
      </div>

      {/* Student participation trend is more useful here than active/inactive account status. */}
      <div className="dashboard-section dashboard-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <Card>
          <h3 style={{ margin: 0, color: COLORS.dark }}>Student Participation Trend</h3>
          <div style={{ fontSize: '12px', color: COLORS.muted, marginTop: '4px', marginBottom: '18px' }}>
            Unique students who recycled per day during the last seven days
          </div>
          {participationTrend.length ? (
            <SevenDayBars data={participationTrend} valueKey="participants" label="Unique participating students per day" color={COLORS.dark} />
          ) : <EmptyState>No student participation activity yet.</EmptyState>}
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: 0, color: COLORS.dark }}>Weekly Waste Collection by Section</h3>
              <div style={{ fontSize: '12px', color: COLORS.muted, marginTop: '4px' }}>All sections, last seven days</div>
            </div>
            {topSection && (
              <span style={{ background: COLORS.limeLight, color: COLORS.dark, borderRadius: '999px', padding: '6px 10px', fontSize: '11px', fontWeight: 800 }}>
                Top: {topSection.name}
              </span>
            )}
          </div>
          {sectionStats.length ? (
            <HorizontalBars
              data={[...sectionStats].sort((a, b) => Number(b.total_items) - Number(a.total_items))}
              labelKey="name"
              valueKey="total_items"
              suffix=""
            />
          ) : <EmptyState>No section recycling data available.</EmptyState>}
        </Card>
      </div>

      {/* Ranking + rewards */}
      <div className="dashboard-section dashboard-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: '20px' }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, color: COLORS.dark }}>Top 5 Recyclers</h3>
              <div style={{ fontSize: '12px', color: COLORS.muted, marginTop: '4px' }}>Ranked by points earned from recycling</div>
            </div>
            <span style={{ padding: '6px 10px', borderRadius: '999px', background: COLORS.limeLight, color: COLORS.dark, fontSize: '11px', fontWeight: 800 }}>Top 5</span>
          </div>

          {topRecyclers.length ? (
            <div>
              {topRecyclers.slice(0, 5).map((item, index) => (
                <div
                  key={item.student_id || `${item.student_name}-${index}`}
                  style={{ display: 'grid', gridTemplateColumns: '42px 1fr auto', gap: '12px', alignItems: 'center', padding: '12px 0', borderBottom: index < Math.min(topRecyclers.length, 5) - 1 ? '1px solid rgba(0,0,0,.05)' : 'none' }}
                >
                  <div style={{ width: '36px', height: '36px', borderRadius: '12px', display: 'grid', placeItems: 'center', background: index === 0 ? COLORS.dark : COLORS.mintLight, color: index === 0 ? '#fff' : COLORS.dark, fontWeight: 800 }}>
                    {index + 1}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: COLORS.dark, fontWeight: 800, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.student_name || 'Unknown Student'}</div>
                    <div style={{ color: COLORS.muted, fontSize: '11px', marginTop: '3px' }}>{Number(item.total_items || 0)} items recycled</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: COLORS.sage, fontWeight: 800, fontSize: '14px' }}>{Number(item.points_earned || item.total_points || 0).toLocaleString()}</div>
                    <div style={{ color: COLORS.muted, fontSize: '10px' }}>points earned</div>
                  </div>
                </div>
              ))}
            </div>
          ) : <EmptyState>No recycler ranking data available yet.</EmptyState>}
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, color: COLORS.dark }}>Recent Reward Redemptions</h3>
              <div style={{ fontSize: '12px', color: COLORS.muted, marginTop: '4px' }}>Daily redemption activity during the last seven days</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: COLORS.dark }}>{totalRedemptions}</div>
              <div style={{ fontSize: '10px', color: COLORS.muted }}>{totalPointsSpent.toLocaleString()} pts spent</div>
            </div>
          </div>

          {rewardTrend.length ? (
            <SevenDayBars data={rewardTrend} valueKey="redemptions" label="Reward redemptions per day" color="#8ba566" />
          ) : <EmptyState>No reward redemptions yet.</EmptyState>}

          {rewardBreakdown.length > 0 && (
            <div style={{ marginTop: '22px', paddingTop: '18px', borderTop: `1px solid ${COLORS.mintLight}` }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: COLORS.dark, marginBottom: '12px' }}>Most redeemed rewards · last 30 days</div>
              <HorizontalBars
                data={rewardBreakdown}
                labelKey="reward_name"
                valueKey="redemption_count"
                colors={['#8ba566', '#a2bc77', '#b8ce8c', '#cbdba8', '#dce7c4']}
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
