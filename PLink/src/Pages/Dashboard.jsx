import { useData } from '../context/DataContext.jsx';

const COLORS = {
  white: '#ffffff',
  dark: '#112d68',
  sage: '#2776c0',
  muted: 'rgba(17,45,104,0.62)',
  mintLight: 'rgba(190,222,246,0.38)',
  limeLight: 'rgba(190,222,246,0.62)',
};

const formatDate = (value) => {
  if (!value) return '—';

  const normalized = String(value).includes('T')
    ? String(value)
    : `${value}T00:00:00`;

  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const Card = ({ children, style = {} }) => (
  <div
    style={{
      background: COLORS.white,
      border: `1px solid ${COLORS.mintLight}`,
      borderRadius: '24px',
      boxShadow: '0 10px 28px rgba(17,45,104,.045)',
      padding: '24px',
      ...style,
    }}
  >
    {children}
  </div>
);

const EmptyState = ({ children }) => (
  <div
    style={{
      padding: '34px 12px',
      textAlign: 'center',
      color: COLORS.muted,
      fontSize: '13px',
    }}
  >
    {children}
  </div>
);

function HorizontalBars({ data, labelKey, valueKey }) {
  const max = Math.max(...data.map((item) => Number(item[valueKey] || 0)), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {data.map((item, index) => {
        const value = Number(item[valueKey] || 0);

        return (
          <div key={`${item[labelKey]}-${index}`}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '12px',
                marginBottom: '6px',
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 700, color: COLORS.dark }}>
                {item[labelKey]}
              </span>
              <span style={{ fontSize: '12px', fontWeight: 800, color: COLORS.sage }}>
                {value.toLocaleString()}
              </span>
            </div>

            <div
              style={{
                height: '9px',
                borderRadius: '999px',
                background: COLORS.mintLight,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${(value / max) * 100}%`,
                  height: '100%',
                  borderRadius: '999px',
                  background: index === 0 ? COLORS.dark : COLORS.sage,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SevenDayBars({ data, valueKey, label }) {
  const values = data.map((item) => Number(item[valueKey] || 0));
  const max = Math.max(...values, 1);

  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '38px minmax(0, 1fr)', gap: '10px' }}>
        <div
          style={{
            height: '230px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '4px 0 30px',
            color: COLORS.muted,
            fontSize: '10px',
            textAlign: 'right',
          }}
        >
          <span>{max}</span>
          <span>{Math.round(max / 2)}</span>
          <span>0</span>
        </div>

        <div
          style={{
            position: 'relative',
            height: '230px',
            borderLeft: `1px solid ${COLORS.mintLight}`,
            borderBottom: `1px solid ${COLORS.mintLight}`,
            padding: '8px 8px 30px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: '50%',
              borderTop: `1px dashed ${COLORS.mintLight}`,
            }}
          />

          <div
            style={{
              position: 'absolute',
              left: '8px',
              right: '8px',
              top: '8px',
              bottom: '30px',
              display: 'flex',
              alignItems: 'flex-end',
              gap: '12px',
            }}
          >
            {data.map((item, index) => {
              const value = Number(item[valueKey] || 0);
              const height = value > 0 ? Math.max((value / max) * 100, 5) : 1.5;

              return (
                <div
                  key={`${item.date}-${index}`}
                  style={{
                    flex: 1,
                    height: '100%',
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span style={{ fontSize: '11px', fontWeight: 800, color: COLORS.dark }}>
                    {value}
                  </span>
                  <div
                    title={`${formatDate(item.date)}: ${value}`}
                    style={{
                      width: '68%',
                      maxWidth: '52px',
                      height: `${height}%`,
                      minHeight: value > 0 ? '8px' : '3px',
                      borderRadius: '9px 9px 3px 3px',
                      background: COLORS.dark,
                      opacity: value > 0 ? 1 : 0.16,
                    }}
                  />
                </div>
              );
            })}
          </div>

          <div
            style={{
              position: 'absolute',
              left: '8px',
              right: '8px',
              bottom: '6px',
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.max(data.length, 1)}, minmax(0,1fr))`,
              gap: '12px',
            }}
          >
            {data.map((item, index) => (
              <span
                key={`${item.date}-label-${index}`}
                style={{
                  textAlign: 'center',
                  fontSize: '10px',
                  color: COLORS.muted,
                  whiteSpace: 'nowrap',
                }}
              >
                {formatDate(item.date)}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', fontSize: '11px', color: COLORS.muted, marginTop: '10px' }}>
        {label}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { dashboard } = useData();

  const summary = dashboard?.summary || {};
  const totalItems = Number(summary.total_items || 0);
  const totalPoints = Number(summary.total_points || 0);
  const participatingStudents = Number(summary.participating_students || 0);

  const dailyData = Array.isArray(dashboard?.daily_recycling)
    ? dashboard.daily_recycling
    : [];
  const collectionTrends = Array.isArray(dashboard?.collection_trends)
    ? dashboard.collection_trends
    : dailyData;
  const wasteCategories = Array.isArray(dashboard?.waste_categories)
    ? dashboard.waste_categories
    : [];
  const topRecyclers = Array.isArray(dashboard?.top_recyclers)
    ? dashboard.top_recyclers
    : Array.isArray(dashboard?.user_ranking)
      ? dashboard.user_ranking
      : [];
  const rewardHistory = Array.isArray(dashboard?.reward_history)
    ? dashboard.reward_history
    : [];

  const wasteCategoryTotal = wasteCategories.reduce(
    (sum, item) => sum + Number(item.total_items || 0),
    0,
  );
  const weeklyCollectedItems = dailyData.reduce(
    (sum, item) => sum + Number(item.items || 0),
    0,
  );
  const averageCollectedPerDay = dailyData.length
    ? weeklyCollectedItems / dailyData.length
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', fontFamily: 'sans-serif' }}>
      <style>{`
        @keyframes dashboardFade {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .dashboard-section { animation: dashboardFade .35s ease both; }
        @media (max-width: 980px) {
          .dashboard-grid-2 { grid-template-columns: 1fr !important; }
          .dashboard-grid-3 { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 560px) {
          .daily-summary-grid { grid-template-columns: 1fr !important; }
          .dashboard-mobile-stack { flex-direction: column !important; align-items: flex-start !important; }
        }
      `}</style>

      {/* Keep the existing dashboard KPI cards. */}
      <div
        className="dashboard-section dashboard-grid-3"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px' }}
      >
        {[
          ['Recyclables Collected', totalItems.toLocaleString(), 'All accepted/rejected transaction items'],
          ['Points Earned', totalPoints.toLocaleString(), 'Recycling points generated'],
          ['Students Participating', participatingStudents.toLocaleString(), 'Unique students who have recycled'],
        ].map(([title, value, subtitle]) => (
          <Card key={title} style={{ padding: '20px 22px' }}>
            <div style={{ fontSize: '12px', color: COLORS.muted }}>{title}</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: COLORS.dark, marginTop: '10px' }}>
              {value}
            </div>
            <div style={{ fontSize: '11px', color: COLORS.muted, marginTop: '5px' }}>
              {subtitle}
            </div>
          </Card>
        ))}
      </div>

      {/* 1. Daily waste collection report + 2. Waste category statistics */}
      <div
        className="dashboard-section dashboard-grid-2"
        style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: '20px' }}
      >
        <Card>
          <div
            className="dashboard-mobile-stack"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '10px',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <div>
              <h3 style={{ margin: 0, color: COLORS.dark }}>Daily Waste Collection Report</h3>
              <div style={{ fontSize: '12px', color: COLORS.muted, marginTop: '4px' }}>
                Last seven days of recycling activity
              </div>
            </div>
            <span
              style={{
                background: COLORS.limeLight,
                color: COLORS.dark,
                padding: '6px 10px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 800,
              }}
            >
              7 days
            </span>
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
                    <td style={{ padding: '12px 8px', fontSize: '13px', fontWeight: 700, color: COLORS.dark }}>
                      {formatDate(item.date)}
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'right', fontSize: '13px', fontWeight: 800, color: COLORS.sage }}>
                      {Number(item.items || 0)}
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'right', fontSize: '13px', fontWeight: 800, color: COLORS.dark }}>
                      {Number(item.points || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
            <div style={{ padding: '14px 16px', borderRadius: '16px', background: 'rgba(190,222,246,.24)', border: `1px solid ${COLORS.mintLight}` }}>
              <div style={{ fontSize: '11px', color: COLORS.muted }}>Total Items</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: COLORS.dark, marginTop: '6px' }}>
                {weeklyCollectedItems.toLocaleString()}
              </div>
              <div style={{ fontSize: '10px', color: COLORS.muted, marginTop: '4px' }}>Last 7 days</div>
            </div>

            <div style={{ padding: '14px 16px', borderRadius: '16px', background: 'rgba(190,222,246,.34)', border: `1px solid ${COLORS.mintLight}` }}>
              <div style={{ fontSize: '11px', color: COLORS.muted }}>Average / Day</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: COLORS.dark, marginTop: '6px' }}>
                {averageCollectedPerDay.toFixed(1)}
              </div>
              <div style={{ fontSize: '10px', color: COLORS.muted, marginTop: '4px' }}>items per day</div>
            </div>
          </div>
        </Card>

        <Card>
          <h3 style={{ margin: 0, color: COLORS.dark }}>Waste Category Statistics</h3>
          <div style={{ fontSize: '12px', color: COLORS.muted, marginTop: '4px', marginBottom: '20px' }}>
            Accepted recyclable items by CNN-classified material type
          </div>

          {wasteCategories.length ? (
            <>
              <HorizontalBars
                data={wasteCategories.map((item) => ({
                  ...item,
                  label: item.label || item.name || item.material_category || 'Unknown',
                }))}
                labelKey="label"
                valueKey="total_items"
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '20px',
                  paddingTop: '14px',
                  borderTop: `1px solid ${COLORS.mintLight}`,
                }}
              >
                <span style={{ fontSize: '12px', color: COLORS.muted }}>Total deposited</span>
                <strong style={{ color: COLORS.dark }}>{wasteCategoryTotal.toLocaleString()} items</strong>
              </div>
            </>
          ) : (
            <EmptyState>No waste category data available yet.</EmptyState>
          )}
        </Card>
      </div>

      {/* 3. User ranking + 4. Reward history */}
      <div
        className="dashboard-section dashboard-grid-2"
        style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: '20px' }}
      >
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, color: COLORS.dark }}>User Ranking</h3>
              <div style={{ fontSize: '12px', color: COLORS.muted, marginTop: '4px' }}>
                Top students by points earned from recycling
              </div>
            </div>
            <span style={{ padding: '6px 10px', borderRadius: '999px', background: COLORS.limeLight, color: COLORS.dark, fontSize: '11px', fontWeight: 800 }}>
              Top 5
            </span>
          </div>

          {topRecyclers.length ? (
            <div>
              {topRecyclers.slice(0, 5).map((item, index) => (
                <div
                  key={item.student_id || `${item.student_name}-${index}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '42px 1fr auto',
                    gap: '12px',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: index < Math.min(topRecyclers.length, 5) - 1
                      ? '1px solid rgba(0,0,0,.05)'
                      : 'none',
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '12px',
                      display: 'grid',
                      placeItems: 'center',
                      background: index === 0 ? COLORS.dark : COLORS.mintLight,
                      color: index === 0 ? '#fff' : COLORS.dark,
                      fontWeight: 800,
                    }}
                  >
                    {index + 1}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: COLORS.dark, fontWeight: 800, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.student_name || 'Unknown Student'}
                    </div>
                    <div style={{ color: COLORS.muted, fontSize: '11px', marginTop: '3px' }}>
                      {Number(item.total_items || 0)} items recycled
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: COLORS.sage, fontWeight: 800, fontSize: '14px' }}>
                      {Number(item.points_earned || 0).toLocaleString()}
                    </div>
                    <div style={{ color: COLORS.muted, fontSize: '10px' }}>points earned</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState>No user ranking data available yet.</EmptyState>
          )}
        </Card>

        <Card>
          <h3 style={{ margin: 0, color: COLORS.dark }}>Reward History</h3>
          <div style={{ fontSize: '12px', color: COLORS.muted, marginTop: '4px', marginBottom: '16px' }}>
            Most recent reward redemptions
          </div>

          {rewardHistory.length ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '580px' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${COLORS.mintLight}` }}>
                    <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: '11px', color: COLORS.muted }}>Student</th>
                    <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: '11px', color: COLORS.muted }}>Reward</th>
                    <th style={{ textAlign: 'right', padding: '10px 8px', fontSize: '11px', color: COLORS.muted }}>Points</th>
                    <th style={{ textAlign: 'right', padding: '10px 8px', fontSize: '11px', color: COLORS.muted }}>Redeemed</th>
                  </tr>
                </thead>
                <tbody>
                  {rewardHistory.map((item) => (
                    <tr key={item.redemption_id} style={{ borderBottom: '1px solid rgba(0,0,0,.045)' }}>
                      <td style={{ padding: '12px 8px', color: COLORS.dark, fontSize: '12px', fontWeight: 700 }}>
                        {item.student_name || 'Unknown Student'}
                        <div style={{ fontSize: '10px', fontWeight: 500, color: COLORS.muted, marginTop: '2px' }}>
                          {item.student_number || '—'}
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px', color: COLORS.dark, fontSize: '12px' }}>
                        {item.reward_name || 'Unknown Reward'}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', color: COLORS.sage, fontSize: '12px', fontWeight: 800 }}>
                        {Number(item.points_spent || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', color: COLORS.muted, fontSize: '11px' }}>
                        {formatDateTime(item.redeemed_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState>No reward history available yet.</EmptyState>
          )}
        </Card>
      </div>

      {/* 5. Collection trends */}
      <Card style={{ marginBottom: '4px' }}>
        <h3 style={{ margin: 0, color: COLORS.dark }}>Collection Trends</h3>
        <div style={{ fontSize: '12px', color: COLORS.muted, marginTop: '4px', marginBottom: '18px' }}>
          Recyclables collected per day during the last seven days
        </div>

        {collectionTrends.length ? (
          <SevenDayBars
            data={collectionTrends}
            valueKey="items"
            label="Recyclables collected per day"
          />
        ) : (
          <EmptyState>No collection trend data available yet.</EmptyState>
        )}
      </Card>
    </div>
  );
}
