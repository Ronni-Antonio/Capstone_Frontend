import { useData } from '../context/DataContext.jsx';

const COLORS = {
  white: '#ffffff',
  dark: '#3e5f44',
  darkMuted: 'rgba(62,95,68,0.6)',
  mintLight: 'rgba(199,234,187,0.4)',
  mintMuted: 'rgba(199,234,187,0.6)',
  limeLight: 'rgba(232,245,189,0.6)',
  ivory: '#fcfcf7',
  sage: '#5a7c61',
  bg: '#f7f8f3',
  redBg: '#fef2f2',
  redText: '#b91c1c',
  amberBg: '#fffbeb',
  amberText: '#b45309',
  sectionColors: [
    '#3e5f44', '#8bc37a', '#92c283', '#dcefd1', '#a8d5ba'
  ]
};

export default function Dashboard() {
  const { dashboard } = useData();

  const summary = dashboard?.summary || {};
  const dailyData = (dashboard?.daily_recycling || []).map((row) => ({
    date: row.date
      ? new Date(`${row.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : 'Unknown',
    bottles: Number(row.items || 0),
    points: Number(row.points || 0),
  }));

  const graphMaxBottles = Math.max(...dailyData.map((d) => d.bottles), 1);
  const graphMaxPoints = Math.max(...dailyData.map((d) => d.points), 1);
  const step = 510 / (dailyData.length - 1 || 1);

  const bottlesPoints = dailyData.map((d, i) => {
    const x = 60 + i * step;
    const y = 200 - (d.bottles / graphMaxBottles) * 150;
    return `${x},${y}`;
  }).join(' ');

  const pointsPoints = dailyData.map((d, i) => {
    const x = 60 + i * step;
    const y = 200 - (d.points / graphMaxPoints) * 150;
    return `${x},${y}`;
  }).join(' ');

  const totalBottles = Number(summary.total_items || 0);
  const totalPoints = Number(summary.total_points || 0);
  const grade3Participants = Number(summary.grade_3_participants || 0);
  const activeStudents = Number(summary.active_students || 0);
  const inactiveStudents = Number(summary.inactive_students || 0);
  const totalStudents = Number(summary.total_students || (activeStudents + inactiveStudents) || 0);

  // Dashboard is intentionally lightweight after login, so do not depend on the
  // globally-loaded students/transactions arrays here. Build the participation
  // chart directly from the dashboard summary returned by Laravel.
  const generateParticipationGradient = () => {
    if (totalStudents <= 0) return '#eef5e9';
    const activePct = Math.max(0, Math.min(100, (activeStudents / totalStudents) * 100));
    return `conic-gradient(${COLORS.dark} 0% ${activePct}%, #8bc37a ${activePct}% 100%)`;
  };

  const primaryBin = dashboard?.smart_bin || null;
  const emptyDistance = Number(primaryBin?.empty_threshold_cm ?? 80);
  const fullDistance = Number(primaryBin?.full_threshold_cm ?? 20);
  const currentDistance = Number(primaryBin?.current_distance_cm ?? emptyDistance);
  const range = emptyDistance - fullDistance;
  const calculatedFill = range > 0
    ? ((emptyDistance - currentDistance) / range) * 100
    : Number(primaryBin?.current_fill_percentage || 0);
  const binFullness = Math.max(0, Math.min(100, Math.round(calculatedFill)));

  const topSection = dashboard?.top_section
    ? {
        name: dashboard.top_section.name,
        bottles: Number(dashboard.top_section.total_items || 0),
        points: Number(dashboard.top_section.total_points || 0),
      }
    : null;

  // The optimized dashboard endpoint currently returns the top section only.
  // Use it for the section chart until a full `section_stats` payload is added.
  // This keeps the first dashboard request small and prevents runtime errors.
  const sectionStats = Array.isArray(dashboard?.section_stats)
    ? Object.fromEntries(
        dashboard.section_stats.map((row) => [
          row.name || 'Unknown Section',
          {
            bottles: Number(row.total_items || 0),
            points: Number(row.total_points || 0),
          },
        ])
      )
    : topSection
      ? {
          [topSection.name || 'Top Section']: {
            bottles: topSection.bottles,
            points: topSection.points,
          },
        }
      : {};

  const maxBottles = Math.max(
    ...Object.values(sectionStats).map((stats) => Number(stats.bottles || 0)),
    1
  );

  const activities = (dashboard?.recent_activity || []).map((tx) => {
    const name = tx.student_name || 'Unknown Student';
    const parts = name.split(' ').filter(Boolean);
    const initials = parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : (parts[0]?.[0] || 'U').toUpperCase();
    const bottles = Number(tx.total_items || 0);
    const points = Number(tx.total_points || 0);
    return {
      initials,
      name,
      action: `recycled ${bottles} bottle${bottles !== 1 ? 's' : ''}`,
      points: `+${points} pts`,
    };
  });

  const stats = [
    { title: 'Bottles Collected', value: totalBottles.toLocaleString(), change: '+0%' },
    { title: 'Points Earned', value: totalPoints.toLocaleString(), change: '+0%' },
    { title: 'Bin Fullness', value: `${binFullness}%`, change: binFullness === 0 ? '0%' : '+2%' },
    { title: 'Grade 3 Participants', value: grade3Participants.toString(), change: '+0%' },
  ];

  // New dashboard sections.
  // These read optional fields from the dashboard API. The backend can provide
  // dashboard.waste_categories, dashboard.user_ranking, and dashboard.reward_history
  // later without requiring another frontend rewrite.
  const wasteCategories = Array.isArray(dashboard?.waste_categories)
    ? dashboard.waste_categories
    : [];

  const userRanking = Array.isArray(dashboard?.user_ranking)
    ? dashboard.user_ranking
    : Array.isArray(dashboard?.top_users)
      ? dashboard.top_users
      : [];

  const rewardHistory = Array.isArray(dashboard?.reward_history)
    ? dashboard.reward_history
    : [];

  const categoryTotal = wasteCategories.reduce(
    (sum, item) => sum + Number(item.total_items || item.quantity || item.count || 0),
    0
  );

  const categoryColors = ['#3e5f44', '#8bc37a', '#92c283', '#dcefd1', '#a8d5ba'];

  const getCategoryName = (item) =>
    item.category || item.name || item.type || 'Unknown';

  const getCategoryValue = (item) =>
    Number(item.total_items || item.quantity || item.count || 0);

  const getRankingName = (item) =>
    item.student_name || item.name || item.fullname || item.student || 'Unknown Student';

  const getRankingPoints = (item) =>
    Number(item.total_points || item.points || 0);

  const getRankingBottles = (item) =>
    Number(item.total_items || item.bottles || item.items || 0);

  const getRewardName = (item) =>
    item.reward_name || item.name || item.reward || 'Unknown Reward';

  const getRewardStudent = (item) =>
    item.student_name || item.student || item.user_name || 'Unknown Student';

  const getRewardPoints = (item) =>
    Number(item.points || item.points_used || item.cost || 0);

  const getRewardDate = (item) =>
    item.redeemed_at || item.date || item.created_at || '—';

  const trendBottles = dailyData.slice(-7);
  const trendTotal = trendBottles.reduce((sum, item) => sum + item.bottles, 0);
  const trendAverage = trendBottles.length
    ? Math.round(trendTotal / trendBottles.length)
    : 0;
  const trendBestDay = trendBottles.length
    ? trendBottles.reduce((best, item) => item.bottles > best.bottles ? item : best, trendBottles[0])
    : null;

  const alerts = [
    { title: 'Welcome', desc: 'Dashboard is using optimized live data', type: 'warning' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        fontFamily: 'sans-serif'
      }}
    >
      <style>{`
        @keyframes fadeInUp{
          from{
            opacity:0;
            transform:translateY(10px);
          }
          to{
            opacity:1;
            transform:translateY(0);
          }
        }

        .fade-up{
          animation:fadeInUp .5s ease forwards;
        }

        @media (max-width: 900px){
          .dashboard-two-column{
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>


      {/* Stats */}

      <div
        className="fade-up"
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit,minmax(220px,1fr))',
          gap: '18px'
        }}
      >
        {stats.map((item) => (
          <div
            key={item.title}
            style={{
              background: COLORS.white,
              borderRadius: '22px',
              padding: '22px',
              border: `1px solid ${COLORS.mintLight}`,
              boxShadow:
                '0 10px 25px rgba(0,0,0,.04)'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <span
                style={{
                  color: COLORS.darkMuted,
                  fontSize: '12px'
                }}
              >
                {item.title}
              </span>

              <span
                style={{
                  background: COLORS.limeLight,
                  color: COLORS.dark,
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: '600'
                }}
              >
                {item.change}
              </span>
            </div>

            <h2
              style={{
                marginTop: '14px',
                marginBottom: 0,
                fontSize: '32px',
                color: COLORS.dark
              }}
            >
              {item.value}
            </h2>
          </div>
        ))}
      </div>

      {/* Daily Waste Collection Report + Waste Category Statistics */}
      <div
        className="fade-up"
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '20px'
        }}
      >
        {/* Daily Waste Collection Report */}
        <div
          style={{
            background: COLORS.white,
            borderRadius: '24px',
            padding: '24px',
            border: `1px solid ${COLORS.mintLight}`,
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '18px',
              gap: '12px'
            }}
          >
            <div>
              <h3 style={{ margin: 0, color: COLORS.dark }}>
                Daily Waste Collection Report
              </h3>
              <div style={{ fontSize: '12px', color: COLORS.darkMuted, marginTop: '5px' }}>
                Daily recycling collection and points generated
              </div>
            </div>

            <div
              style={{
                padding: '6px 10px',
                borderRadius: '999px',
                background: COLORS.limeLight,
                color: COLORS.dark,
                fontSize: '11px',
                fontWeight: '700',
                whiteSpace: 'nowrap'
              }}
            >
              {dailyData.length} day{dailyData.length !== 1 ? 's' : ''}
            </div>
          </div>

          {dailyData.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  minWidth: '480px'
                }}
              >
                <thead>
                  <tr style={{ borderBottom: `1px solid ${COLORS.mintLight}` }}>
                    <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: '11px', color: COLORS.darkMuted }}>
                      Date
                    </th>
                    <th style={{ textAlign: 'right', padding: '10px 8px', fontSize: '11px', color: COLORS.darkMuted }}>
                      Bottles Collected
                    </th>
                    <th style={{ textAlign: 'right', padding: '10px 8px', fontSize: '11px', color: COLORS.darkMuted }}>
                      Points Earned
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dailyData.slice(-7).reverse().map((item, index) => (
                    <tr
                      key={`${item.date}-${index}`}
                      style={{ borderBottom: '1px solid rgba(0,0,0,.04)' }}
                    >
                      <td style={{ padding: '12px 8px', color: COLORS.dark, fontSize: '13px', fontWeight: '600' }}>
                        {item.date}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', color: COLORS.sage, fontSize: '13px', fontWeight: '700' }}>
                        {item.bottles.toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', color: COLORS.dark, fontSize: '13px', fontWeight: '700' }}>
                        {item.points.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: COLORS.darkMuted,
                fontSize: '13px'
              }}
            >
              No daily waste collection data available yet.
            </div>
          )}
        </div>

        {/* Waste Category Statistics */}
        <div
          style={{
            background: COLORS.white,
            borderRadius: '24px',
            padding: '24px',
            border: `1px solid ${COLORS.mintLight}`
          }}
        >
          <h3 style={{ margin: 0, color: COLORS.dark }}>
            Waste Category Statistics
          </h3>
          <div style={{ fontSize: '12px', color: COLORS.darkMuted, marginTop: '5px', marginBottom: '20px' }}>
            Collected waste by category
          </div>

          {wasteCategories.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {wasteCategories.map((item, index) => {
                const value = getCategoryValue(item);
                const percentage = categoryTotal > 0
                  ? Math.round((value / categoryTotal) * 100)
                  : 0;

                return (
                  <div key={`${getCategoryName(item)}-${index}`}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            width: '9px',
                            height: '9px',
                            borderRadius: '50%',
                            background: categoryColors[index % categoryColors.length],
                            display: 'inline-block'
                          }}
                        />
                        <span style={{ fontSize: '12px', color: COLORS.dark, fontWeight: '600' }}>
                          {getCategoryName(item)}
                        </span>
                      </div>
                      <span style={{ fontSize: '12px', color: COLORS.darkMuted, fontWeight: '700' }}>
                        {value.toLocaleString()} ({percentage}%)
                      </span>
                    </div>

                    <div
                      style={{
                        height: '8px',
                        borderRadius: '999px',
                        background: COLORS.mintLight,
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          width: `${percentage}%`,
                          height: '100%',
                          borderRadius: '999px',
                          background: categoryColors[index % categoryColors.length]
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                padding: '30px 10px',
                textAlign: 'center',
                color: COLORS.darkMuted,
                fontSize: '13px',
                lineHeight: '1.5'
              }}
            >
              Waste category data will appear here once the backend provides
              category totals.
            </div>
          )}
        </div>
      </div>

      {/* Charts Row */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '20px'
        }}
      >
        {/* Trend Graph */}

        <div
          style={{
            background: COLORS.white,
            borderRadius: '24px',
            padding: '24px',
            border: `1px solid ${COLORS.mintLight}`
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3
              style={{
                margin: 0,
                color: COLORS.dark
              }}
            >
              Daily Recycling Trends
            </h3>
            <div style={{ display: 'flex', gap: '20px', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '3px', backgroundColor: '#8bc37a', borderRadius: '2px' }} />
                <span style={{ color: COLORS.darkMuted }}>Bottles</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '3px', backgroundColor: '#3e5f44', borderRadius: '2px' }} />
                <span style={{ color: COLORS.darkMuted }}>Points</span>
              </div>
            </div>
          </div>

          <svg
            viewBox="0 0 600 250"
            width="100%"
            height="250"
          >
            {/* Axes */}
            <line x1="60" y1="40" x2="60" y2="210" stroke={COLORS.mintLight} strokeWidth="2" />
            <line x1="60" y1="210" x2="570" y2="210" stroke={COLORS.mintLight} strokeWidth="2" />

            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = 210 - ratio * 160;
              return (
                <g key={i}>
                  <line x1="60" y1={y} x2="570" y2={y} stroke="rgba(62,95,68,0.1)" strokeWidth="1" />
                  <text
                    x="55"
                    y={y + 4}
                    textAnchor="end"
                    fontSize="10"
                    fill={COLORS.darkMuted}
                  >
                    {Math.round(ratio * graphMaxBottles)}
                  </text>
                </g>
              );
            })}

            {/* Y-axis label */}
            <text
              x="25"
              y="125"
              textAnchor="middle"
              fontSize="11"
              fill={COLORS.darkMuted}
              transform="rotate(-90 25 125)"
            >
              Bottles
            </text>

            {/* Bottles line */}
            <polyline
              fill="none"
              stroke="#8bc37a"
              strokeWidth="4"
              points={bottlesPoints}
            />

            {/* Points line */}
            <polyline
              fill="none"
              stroke="#3e5f44"
              strokeWidth="4"
              points={pointsPoints}
            />

            {/* Data points and values for bottles */}
            {dailyData.map((d, i) => {
              const x = 60 + i * (510 / (dailyData.length - 1 || 1));
              const y = 200 - (d.bottles / graphMaxBottles) * 150;
              return (
                <g key={`bottle-${i}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r="6"
                    fill="#8bc37a"
                    stroke="white"
                    strokeWidth="2"
                  />
                  <text
                    x={x}
                    y={y - 10}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="600"
                    fill="#8bc37a"
                  >
                    {d.bottles}
                  </text>
                </g>
              );
            })}

            {/* Data points for points */}
            {dailyData.map((d, i) => {
              const x = 60 + i * (510 / (dailyData.length - 1 || 1));
              const y = 200 - (d.points / graphMaxPoints) * 150;
              return (
                <g key={`point-${i}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r="6"
                    fill="#3e5f44"
                    stroke="white"
                    strokeWidth="2"
                  />
                  <text
                    x={x}
                    y={y - 10}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="600"
                    fill="#3e5f44"
                  >
                    {d.points}
                  </text>
                </g>
              );
            })}

            {/* X-axis labels */}
            {dailyData.map((d, i) => {
              const x = 60 + i * (510 / (dailyData.length - 1 || 1));
              return (
                <text
                  key={`label-${i}`}
                  x={x}
                  y="232"
                  textAnchor="middle"
                  fontSize="11"
                  fill={COLORS.darkMuted}
                >
                  {d.date}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Participation */}

        <div
          style={{
            background: COLORS.white,
            borderRadius: '24px',
            padding: '24px',
            border: `1px solid ${COLORS.mintLight}`
          }}
        >
          <h3
            style={{
              marginTop: 0,
              color: COLORS.dark
            }}
          >
            Student Participation
          </h3>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: '24px'
            }}
          >
            <div
              style={{
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                background: generateParticipationGradient(),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div
                style={{
                  width: '110px',
                  height: '110px',
                  borderRadius: '50%',
                  background: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <div style={{ fontSize: '28px', fontWeight: '700', color: COLORS.dark }}>
                  {totalStudents}
                </div>
                <div style={{ fontSize: '12px', color: COLORS.darkMuted }}>
                  Total
                </div>
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '24px', marginTop: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: COLORS.dark }} />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: COLORS.dark }}>Active</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: COLORS.dark }}>{activeStudents}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#8bc37a' }} />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: COLORS.dark }}>Inactive</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: COLORS.dark }}>{inactiveStudents}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Ranking */}
      <div
        className="fade-up"
        style={{
          background: COLORS.white,
          borderRadius: '24px',
          padding: '24px',
          border: `1px solid ${COLORS.mintLight}`
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '18px'
          }}
        >
          <div>
            <h3 style={{ margin: 0, color: COLORS.dark }}>
              User Ranking
            </h3>
            <div style={{ fontSize: '12px', color: COLORS.darkMuted, marginTop: '5px' }}>
              Top recycling participants based on points earned
            </div>
          </div>

          <div
            style={{
              background: COLORS.limeLight,
              color: COLORS.dark,
              borderRadius: '999px',
              padding: '6px 10px',
              fontSize: '11px',
              fontWeight: '700'
            }}
          >
            Top 5
          </div>
        </div>

        {userRanking.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {userRanking.slice(0, 5).map((item, index) => (
              <div
                key={`${getRankingName(item)}-${index}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '45px 1fr auto auto',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '13px 0',
                  borderBottom: index < Math.min(userRanking.length, 5) - 1
                    ? '1px solid rgba(0,0,0,.05)'
                    : 'none'
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '12px',
                    background: index === 0
                      ? COLORS.dark
                      : index === 1
                        ? '#8bc37a'
                        : COLORS.mintMuted,
                    color: index < 2 ? '#fff' : COLORS.dark,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '13px'
                  }}
                >
                  #{index + 1}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: '700',
                      color: COLORS.dark,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {getRankingName(item)}
                  </div>
                  <div style={{ fontSize: '11px', color: COLORS.darkMuted, marginTop: '3px' }}>
                    {getRankingBottles(item).toLocaleString()} bottle{getRankingBottles(item) !== 1 ? 's' : ''} recycled
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: COLORS.sage }}>
                    {getRankingPoints(item).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '10px', color: COLORS.darkMuted }}>
                    points
                  </div>
                </div>

                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: COLORS.dark
                  }}
                >
                  {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: '35px 20px',
              textAlign: 'center',
              color: COLORS.darkMuted,
              fontSize: '13px'
            }}
          >
            User ranking data will appear here once the backend provides the
            ranking records.
          </div>
        )}
      </div>

      {/* Lower Section */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '20px'
        }}
      >
        {/* Bar Chart */}

        <div
          style={{
            background: COLORS.white,
            borderRadius: '24px',
            padding: '24px',
            border: `1px solid ${COLORS.mintLight}`
          }}
        >
          <h3
            style={{
              marginTop: 0,
              color: COLORS.dark
            }}
          >
            Weekly Bottle Collection by Section
          </h3>

          {/* Sort sections by bottles descending first */}
          {(() => {
            const sortedSectionEntries = Object.entries(sectionStats)
              .sort(([, a], [, b]) => b.bottles - a.bottles)
              .slice(0, 5);

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'stretch', gap: '16px', height: '240px', paddingLeft: '40px' }}>
                  {/* Y-axis */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    width: '40px',
                    marginLeft: '-40px',
                    fontSize: '10px',
                    color: COLORS.darkMuted,
                    textAlign: 'right'
                  }}>
                    {[maxBottles, Math.round(maxBottles * 0.75), Math.round(maxBottles * 0.5), Math.round(maxBottles * 0.25), 0].map((val, i) => (
                      <div key={i}>{val}</div>
                    ))}
                  </div>

                  {/* Bars */}
                  <div style={{ flex: 1, display: 'flex', alignItems: 'end', gap: '20px', borderLeft: `1px solid ${COLORS.mintLight}`, borderBottom: `1px solid ${COLORS.mintLight}`, paddingLeft: '8px', paddingBottom: '8px' }}>
                    {sortedSectionEntries.map(([section, stats], index) => (
                      <div
                        key={section}
                        style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {/* Value on top */}
                        <div style={{ fontSize: '11px', fontWeight: '700', color: COLORS.dark }}>
                          {stats.bottles}
                        </div>

                        {/* Bar */}
                        <div
                          style={{
                            width: '100%',
                            maxWidth: '80px',
                            height: `${Math.min((stats.bottles / (maxBottles || 1)) * 200, 200)}px`,
                            background: COLORS.sectionColors[index % COLORS.sectionColors.length],
                            borderRadius: '10px 10px 0 0'
                          }}
                        />

                        {/* Section label */}
                        <span style={{ fontSize: '12px', color: COLORS.dark, fontWeight: '600', wordBreak: 'break-word', textAlign: 'center' }}>
                          {section}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Y-axis title */}
                <div style={{ textAlign: 'center', fontSize: '11px', color: COLORS.darkMuted }}>
                  Bottles Recycled
                </div>
              </div>
            );
          })()}

        </div>

        {/* Right Column */}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}
        >
          <div
            style={{
              background: COLORS.dark,
              color: '#fff',
              borderRadius: '24px',
              padding: '22px'
            }}
          >
            <div
              style={{
                fontSize: '13px',
                opacity: .8
              }}
            >
              Top Section This Week
            </div>

            <h2
              style={{
                margin: '8px 0'
              }}
            >
              {topSection ? topSection.name : 'No Data'}
            </h2>

            <div
              style={{
                fontSize: '13px'
              }}
            >
              {topSection ? `${topSection.bottles} Bottles • ${topSection.points} Points` : 'No activity yet'}
            </div>
          </div>

          <div
            style={{
              background: COLORS.white,
              borderRadius: '24px',
              padding: '20px',
              border: `1px solid ${COLORS.mintLight}`
            }}
          >
            <h3
              style={{
                marginTop: 0,
                color: COLORS.dark
              }}
            >
              Quick Alerts
            </h3>

            {alerts.map((alert) => (
              <div
                key={alert.title}
                style={{
                  marginTop: '12px',
                  padding: '12px',
                  borderRadius: '14px',
                  background:
                    alert.type === 'danger'
                      ? COLORS.redBg
                      : COLORS.amberBg
                }}
              >
                <div
                  style={{
                    fontWeight: '600',
                    color:
                      alert.type === 'danger'
                        ? COLORS.redText
                        : COLORS.amberText
                  }}
                >
                  {alert.title}
                </div>

                <div
                  style={{
                    fontSize: '12px',
                    marginTop: '4px'
                  }}
                >
                  {alert.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reward History + Collection Trends */}
      <div
        className="fade-up"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px'
        }}
      >
        {/* Reward History */}
        <div
          style={{
            background: COLORS.white,
            borderRadius: '24px',
            padding: '24px',
            border: `1px solid ${COLORS.mintLight}`,
            overflow: 'hidden'
          }}
        >
          <h3 style={{ margin: 0, color: COLORS.dark }}>
            Reward History
          </h3>
          <div style={{ fontSize: '12px', color: COLORS.darkMuted, marginTop: '5px', marginBottom: '18px' }}>
            Recent reward redemptions
          </div>

          {rewardHistory.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  minWidth: '430px'
                }}
              >
                <thead>
                  <tr style={{ borderBottom: `1px solid ${COLORS.mintLight}` }}>
                    <th style={{ textAlign: 'left', padding: '9px 7px', fontSize: '11px', color: COLORS.darkMuted }}>
                      Reward
                    </th>
                    <th style={{ textAlign: 'left', padding: '9px 7px', fontSize: '11px', color: COLORS.darkMuted }}>
                      Student
                    </th>
                    <th style={{ textAlign: 'right', padding: '9px 7px', fontSize: '11px', color: COLORS.darkMuted }}>
                      Points
                    </th>
                    <th style={{ textAlign: 'right', padding: '9px 7px', fontSize: '11px', color: COLORS.darkMuted }}>
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rewardHistory.slice(0, 5).map((item, index) => (
                    <tr
                      key={`${getRewardName(item)}-${index}`}
                      style={{ borderBottom: '1px solid rgba(0,0,0,.04)' }}
                    >
                      <td style={{ padding: '11px 7px', fontSize: '12px', color: COLORS.dark, fontWeight: '600' }}>
                        {getRewardName(item)}
                      </td>
                      <td style={{ padding: '11px 7px', fontSize: '12px', color: COLORS.darkMuted }}>
                        {getRewardStudent(item)}
                      </td>
                      <td style={{ padding: '11px 7px', textAlign: 'right', fontSize: '12px', color: COLORS.sage, fontWeight: '700' }}>
                        {getRewardPoints(item).toLocaleString()}
                      </td>
                      <td style={{ padding: '11px 7px', textAlign: 'right', fontSize: '11px', color: COLORS.darkMuted }}>
                        {getRewardDate(item)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div
              style={{
                padding: '35px 20px',
                textAlign: 'center',
                color: COLORS.darkMuted,
                fontSize: '13px'
              }}
            >
              No reward redemption history available yet.
            </div>
          )}
        </div>

        {/* Collection Trends */}
        <div
          style={{
            background: COLORS.white,
            borderRadius: '24px',
            padding: '24px',
            border: `1px solid ${COLORS.mintLight}`
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '12px'
            }}
          >
            <div>
              <h3 style={{ margin: 0, color: COLORS.dark }}>
                Collection Trends
              </h3>
              <div style={{ fontSize: '12px', color: COLORS.darkMuted, marginTop: '5px' }}>
                Recent collection performance
              </div>
            </div>

            <div
              style={{
                background: COLORS.limeLight,
                color: COLORS.dark,
                borderRadius: '12px',
                padding: '8px 10px',
                textAlign: 'right'
              }}
            >
              <div style={{ fontSize: '16px', fontWeight: '800' }}>
                {trendAverage.toLocaleString()}
              </div>
              <div style={{ fontSize: '9px', fontWeight: '600' }}>
                avg/day
              </div>
            </div>
          </div>

          {trendBottles.length > 0 ? (
            <>
              <div
                style={{
                  height: '155px',
                  display: 'flex',
                  alignItems: 'end',
                  gap: '10px',
                  marginTop: '25px',
                  padding: '0 4px',
                  borderBottom: `1px solid ${COLORS.mintLight}`
                }}
              >
                {trendBottles.map((item, index) => {
                  const max = Math.max(...trendBottles.map((d) => d.bottles), 1);
                  const height = Math.max(8, (item.bottles / max) * 125);

                  return (
                    <div
                      key={`${item.date}-${index}`}
                      style={{
                        flex: 1,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'end',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <span
                        style={{
                          fontSize: '9px',
                          color: COLORS.darkMuted,
                          fontWeight: '700'
                        }}
                      >
                        {item.bottles}
                      </span>
                      <div
                        style={{
                          width: '100%',
                          maxWidth: '42px',
                          height: `${height}px`,
                          background: COLORS.sage,
                          borderRadius: '8px 8px 0 0'
                        }}
                      />
                      <span
                        style={{
                          fontSize: '9px',
                          color: COLORS.darkMuted,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {item.date}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '18px',
                  padding: '12px',
                  borderRadius: '14px',
                  background: COLORS.ivory
                }}
              >
                <div>
                  <div style={{ fontSize: '10px', color: COLORS.darkMuted }}>
                    7-day total
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: COLORS.dark }}>
                    {trendTotal.toLocaleString()} bottles
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', color: COLORS.darkMuted }}>
                    Best day
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: COLORS.sage }}>
                    {trendBestDay ? `${trendBestDay.date} · ${trendBestDay.bottles}` : '—'}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div
              style={{
                padding: '50px 20px',
                textAlign: 'center',
                color: COLORS.darkMuted,
                fontSize: '13px'
              }}
            >
              Collection trend data will appear here once daily records are available.
            </div>
          )}
        </div>
      </div>

      {/* Activity */}

      <div
        style={{
          background: COLORS.white,
          borderRadius: '24px',
          padding: '24px',
          border: `1px solid ${COLORS.mintLight}`
        }}
      >
        <h3
          style={{
            marginTop: 0,
            color: COLORS.dark
          }}
        >
          Recent Recycling Activity
        </h3>

        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 0',
                borderBottom:
                  '1px solid rgba(0,0,0,.05)'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: COLORS.mintMuted,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: COLORS.dark,
                    fontWeight: '700'
                  }}
                >
                  {activity.initials}
                </div>

                <div>
                  <div
                    style={{
                      fontWeight: '600',
                      color: COLORS.dark
                    }}
                  >
                    {activity.name}
                  </div>

                  <div
                    style={{
                      fontSize: '12px',
                      color: COLORS.darkMuted
                    }}
                  >
                    {activity.action}
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontWeight: '700',
                  color: COLORS.sage
                }}
              >
                {activity.points}
              </div>
            </div>
          ))
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px', 
            color: COLORS.darkMuted 
          }}>
            No recent recycling activity
          </div>
        )}
      </div>
    </div>
  );
}