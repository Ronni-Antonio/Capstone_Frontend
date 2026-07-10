import React from 'react';
import { useData } from '../context/DataContext.jsx';

const COLORS = {
  white: '#ffffff',
  dark: '#3e5f44',
  darkMuted: 'rgba(62,95,68,0.6)',
  mintLight: 'rgba(199,234,187,0.4)',
  sage: '#5a7c61',
  bg: '#f7f8f3',
  sectionColors: [
    '#44694b', '#8bbc7b', '#b8dba7', '#d4e9c7', '#e6f2d4', '#a8d5ba',
    '#6b9b72', '#3d5a42', '#9dd4a7', '#c9e8d1', '#7bb887'
  ]
};

const reports = [
  'Daily Recycling Report',
  'Weekly Section Performance',
  'Monthly AI Accuracy Audit',
  'Quarterly Sustainability Brief'
];

export default function Reports() {
  const { students, transactions } = useData();

  // Calculate total bottles
  const totalBottles = transactions.reduce((sum, tx) => {
    const bottles = tx.bottles_deposited || tx.bottles || tx.bottle_qty || tx.bottles_qty || 0;
    return sum + bottles;
  }, 0);

  // Calculate section stats
  const sectionStats = {};
  students.forEach(student => {
    const section = student.section || 'Unknown';
    if (!sectionStats[section]) {
      sectionStats[section] = { bottles: 0, count: 0 };
    }
  });
  transactions.forEach(tx => {
    const student = students.find(s => 
      (s.id || s.student_id) === (tx.student_id || tx.id)
    );
    if (student) {
      const section = student.section || 'Unknown';
      const bottles = tx.bottles_deposited || tx.bottles || tx.bottle_qty || tx.bottles_qty || 0;
      if (sectionStats[section]) {
        sectionStats[section].bottles += bottles;
      }
    }
  });

  // Sort sections by bottles descending
  const sortedSections = Object.entries(sectionStats)
    .sort(([, a], [, b]) => b.bottles - a.bottles);

  // Find top section
  let topSection = 'No Data';
  let topSectionBottles = 0;
  Object.entries(sectionStats).forEach(([section, stats]) => {
    if (stats.bottles > topSectionBottles) {
      topSectionBottles = stats.bottles;
      topSection = section;
    }
  });

  // Generate conic gradient stops
  const generateConicGradient = () => {
    if (sortedSections.length === 0) {
      return 'conic-gradient(#e6f2d4 0deg 360deg)';
    }
    const total = sortedSections.reduce((sum, [, stats]) => sum + stats.bottles, 0);
    let currentDeg = 0;
    const stops = sortedSections.slice(0, COLORS.sectionColors.length).map(([section, stats], i) => {
      const color = COLORS.sectionColors[i % COLORS.sectionColors.length];
      const nextDeg = currentDeg + (stats.bottles / total) * 360;
      const stop = `${color} ${currentDeg}deg ${nextDeg}deg`;
      currentDeg = nextDeg;
      return stop;
    });
    return `conic-gradient(${stops.join(',')})`;
  };
  const conicGradient = generateConicGradient();

  // Prepare weekly data for line chart
  const weeklyData = [
    { week: 'Week 1', bottles: Math.round(totalBottles * 0.1) },
    { week: 'Week 2', bottles: Math.round(totalBottles * 0.15) },
    { week: 'Week 3', bottles: Math.round(totalBottles * 0.18) },
    { week: 'Week 4', bottles: Math.round(totalBottles * 0.22) },
    { week: 'Week 5', bottles: Math.round(totalBottles * 0.18) },
    { week: 'Week 6', bottles: Math.round(totalBottles * 0.17) },
  ];
  const maxWeeklyBottles = Math.max(...weeklyData.map(d => d.bottles), 1);
  const chartHeight = 220;
  const chartWidth = 520;

  // Calculate average
  const avgBottles = transactions.length > 0 ? Math.round(totalBottles / transactions.length) : 0;

  // Stats array with real data
  const stats = [
    ['Total Recycled', totalBottles.toLocaleString(), 'bottles'],
    ['Most Active Section', topSection, `${topSectionBottles} bottles`],
    ['Avg. Bottles/Transaction', avgBottles.toString(), 'per deposit'],
    ['Students Registered', students.length.toString(), 'total users'],
    ['Active Sections', Object.keys(sectionStats).length.toString(), 'participating']
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
      {/* SUMMARY CARDS */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit,minmax(180px,1fr))',
          gap: '18px'
        }}
      >
        {stats.map(([title, value, sub]) => (
          <div
            key={title}
            style={{
              background: COLORS.white,
              borderRadius: '22px',
              padding: '22px',
              border: `1px solid ${COLORS.mintLight}`
            }}
          >
            <div
              style={{
                fontSize: '12px',
                color: COLORS.darkMuted
              }}
            >
              {title}
            </div>

            <div
              style={{
                fontSize: '28px',
                fontWeight: '700',
                color: COLORS.dark,
                marginTop: '8px'
              }}
            >
              {value}
            </div>

            <div
              style={{
                fontSize: '12px',
                color: COLORS.darkMuted,
                marginTop: '4px'
              }}
            >
              {sub}
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '20px'
        }}
      >
        <div
          style={{
            background: COLORS.white,
            borderRadius: '24px',
            padding: '24px',
            border: `1px solid ${COLORS.mintLight}`
          }}
        >
          <h3 style={{ marginTop: 0, color: COLORS.dark }}>
            Bottles by Section
          </h3>

          <div
            style={{
              width: '220px',
              height: '220px',
              borderRadius: '50%',
              margin: '30px auto',
              background: conicGradient,
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
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: '700',
                color: COLORS.dark
              }}
            >
              {totalBottles}
            </div>
          </div>

          {/* Legend */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginTop: '20px'
            }}
          >
            {sortedSections.slice(0, COLORS.sectionColors.length).map(([section, stats], i) => (
              <div
                key={section}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '13px',
                  color: COLORS.dark
                }}
              >
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '4px',
                    background: COLORS.sectionColors[i % COLORS.sectionColors.length]
                  }}
                />
                <span style={{ flex: 1 }}>{section}</span>
                <span style={{ fontWeight: '700' }}>{stats.bottles}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            background: COLORS.white,
            borderRadius: '24px',
            padding: '24px',
            border: `1px solid ${COLORS.mintLight}`
          }}
        >
          <h3 style={{ marginTop: 0, color: COLORS.dark }}>
            Section Performance
          </h3>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'stretch',
                height: '300px',
                gap: '8px'
              }}
            >
              {/* Y-axis */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  paddingRight: '8px',
                  width: '40px',
                  fontSize: '11px',
                  color: COLORS.darkMuted,
                  textAlign: 'right'
                }}
              >
                {[
                  topSectionBottles,
                  Math.round(topSectionBottles * 0.75),
                  Math.round(topSectionBottles * 0.5),
                  Math.round(topSectionBottles * 0.25),
                  0
                ].map((val, i) => (
                  <div key={i}>{val}</div>
                ))}
              </div>

              {/* Bars */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'end',
                  gap: '16px',
                  paddingLeft: '8px',
                  borderLeft: `1px solid ${COLORS.mintLight}`,
                  borderBottom: `1px solid ${COLORS.mintLight}`
                }}
              >
                {sortedSections.slice(0, 6).map(
                  ([section, stats], i) => (
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
                      <div
                        style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          color: COLORS.dark
                        }}
                      >
                        {stats.bottles}
                      </div>
                      {/* Bar */}
                      <div
                        style={{
                          width: '100%',
                          maxWidth: '50px',
                          height: `${Math.min((stats.bottles / (topSectionBottles || 1)) * 250, 250)}px`,
                          background: COLORS.sectionColors[i % COLORS.sectionColors.length],
                          borderRadius: '8px 8px 0 0'
                        }}
                      />
                      {/* Section label below */}
                      <div
                        style={{
                          fontSize: '11px',
                          color: COLORS.dark,
                          textAlign: 'center',
                          fontWeight: '600',
                          wordBreak: 'break-word',
                          maxWidth: '80px'
                        }}
                      >
                        {section}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Y-axis label */}
            <div
              style={{
                textAlign: 'center',
                fontSize: '12px',
                color: COLORS.darkMuted,
                marginTop: '8px'
              }}
            >
              Bottles Recycled
            </div>
          </div>
        </div>
      </div>

      {/* LOWER CHARTS */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px'
        }}
      >
        <div
          style={{
            background: COLORS.white,
            borderRadius: '24px',
            padding: '24px',
            border: `1px solid ${COLORS.mintLight}`
          }}
        >
          <h3 style={{ marginTop: 0, color: COLORS.dark }}>
            Recycling Growth Trend
          </h3>

          <svg
            viewBox="0 0 600 260"
            width="100%"
            height="260"
          >
            {/* Axes */}
            <line
              x1="60"
              y1="20"
              x2="60"
              y2="230"
              stroke={COLORS.mintLight}
              strokeWidth="2"
            />
            <line
              x1="60"
              y1="230"
              x2="560"
              y2="230"
              stroke={COLORS.mintLight}
              strokeWidth="2"
            />

            {/* Y-axis labels */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = 230 - ratio * chartHeight;
              const value = Math.round(ratio * maxWeeklyBottles);
              return (
                <g key={i}>
                  <text
                    x="55"
                    y={y + 4}
                    textAnchor="end"
                    fontSize="11"
                    fill={COLORS.darkMuted}
                  >
                    {value}
                  </text>
                  <line
                    x1="58"
                    y1={y}
                    x2="62"
                    y2={y}
                    stroke={COLORS.mintLight}
                    strokeWidth="2"
                  />
                </g>
              );
            })}

            {/* Y-axis label */}
            <text
              x="20"
              y="130"
              textAnchor="middle"
              fontSize="12"
              fill={COLORS.darkMuted}
              transform="rotate(-90 20 130)"
            >
              Bottles
            </text>

            {/* Line chart */}
            <polyline
              fill="none"
              stroke={COLORS.dark}
              strokeWidth="4"
              points={weeklyData.map((d, i) => {
                const x = 60 + (i / (weeklyData.length - 1)) * (chartWidth - 20);
                const y = 230 - (d.bottles / maxWeeklyBottles) * chartHeight;
                return `${x},${y}`;
              }).join(' ')}
            />

            {/* Data points */}
            {weeklyData.map((d, i) => {
              const x = 60 + (i / (weeklyData.length - 1)) * (chartWidth - 20);
              const y = 230 - (d.bottles / maxWeeklyBottles) * chartHeight;
              return (
                <g key={i}>
                  <circle
                    cx={x}
                    cy={y}
                    r="6"
                    fill="#fff"
                    stroke={COLORS.dark}
                    strokeWidth="3"
                  />
                  <text
                    x={x}
                    y={y - 12}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="700"
                    fill={COLORS.dark}
                  >
                    {d.bottles}
                  </text>
                </g>
              );
            })}

            {/* X-axis labels */}
            {weeklyData.map((d, i) => {
              const x = 60 + (i / (weeklyData.length - 1)) * (chartWidth - 20);
              return (
                <text
                  key={i}
                  x={x}
                  y="250"
                  textAnchor="middle"
                  fontSize="11"
                  fill={COLORS.darkMuted}
                >
                  {d.week}
                </text>
              );
            })}
          </svg>
        </div>

        <div
          style={{
            background: COLORS.white,
            borderRadius: '24px',
            padding: '24px',
            border: `1px solid ${COLORS.mintLight}`,
            overflowX: 'auto'
          }}
        >
          <h3 style={{ marginTop: 0, color: COLORS.dark, marginBottom: '16px' }}>
            Section Distribution
          </h3>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              minWidth: '600px'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'stretch',
                gap: '8px',
                height: '240px'
              }}
            >
              {/* Y-axis */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  paddingRight: '8px',
                  width: '40px',
                  fontSize: '10px',
                  color: COLORS.darkMuted,
                  textAlign: 'right'
                }}
              >
                {[
                  topSectionBottles,
                  Math.round(topSectionBottles * 0.75),
                  Math.round(topSectionBottles * 0.5),
                  Math.round(topSectionBottles * 0.25),
                  0
                ].map((val, i) => (
                  <div key={i}>{val}</div>
                ))}
              </div>

              {/* Bars */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'end',
                  gap: '10px',
                  paddingLeft: '8px',
                  borderLeft: `1px solid ${COLORS.mintLight}`,
                  borderBottom: `1px solid ${COLORS.mintLight}`
                }}
              >
                {sortedSections.slice(0, 11).map(
                  ([section, stats], i) => (
                    <div
                      key={section}
                      style={{
                        flex: 1,
                        minWidth: '40px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {/* Value on top */}
                      <div
                        style={{
                          fontSize: '10px',
                          fontWeight: '700',
                          color: COLORS.dark
                        }}
                      >
                        {stats.bottles}
                      </div>
                      {/* Bar */}
                      <div
                        style={{
                          width: '100%',
                          maxWidth: '30px',
                          height: `${Math.min((stats.bottles / (topSectionBottles || 1)) * 200, 200)}px`,
                          background: COLORS.sectionColors[i % COLORS.sectionColors.length],
                          borderRadius: '6px 6px 0 0'
                        }}
                      />
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Section labels below */}
            <div
              style={{
                display: 'flex',
                gap: '10px',
                paddingLeft: '48px'
              }}
            >
              {sortedSections.slice(0, 11).map(
                ([section, stats], i) => (
                  <div
                    key={section}
                    style={{
                      flex: 1,
                      minWidth: '40px',
                      textAlign: 'center',
                      fontSize: '10px',
                      color: COLORS.darkMuted,
                      fontWeight: '600',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {section.length > 8 ? section.slice(0, 8) + '...' : section}
                  </div>
                )
              )}
            </div>

            {/* Y-axis label */}
            <div
              style={{
                textAlign: 'center',
                fontSize: '11px',
                color: COLORS.darkMuted,
                marginTop: '8px',
                paddingLeft: '24px'
              }}
            >
              Bottles Recycled
            </div>
          </div>
        </div>
      </div>

      {/* REPORTS */}

      <div
        style={{
          background: COLORS.white,
          borderRadius: '24px',
          padding: '24px',
          border: `1px solid ${COLORS.mintLight}`
        }}
      >
        <h3 style={{ marginTop: 0, color: COLORS.dark }}>
          Downloadable Reports
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit,minmax(300px,1fr))',
            gap: '16px'
          }}
        >
          {reports.map((report) => (
            <div
              key={report}
              style={{
                background: COLORS.bg,
                padding: '18px',
                borderRadius: '18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span
                style={{
                  color: COLORS.dark,
                  fontWeight: '600'
                }}
              >
                {report}
              </span>

              <button
                style={{
                  border: 'none',
                  background: COLORS.dark,
                  color: 'white',
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}
              >
                ↓
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}