import React from 'react';

const COLORS = {
  white: '#ffffff',
  dark: '#3e5f44',
  darkMuted: 'rgba(62,95,68,0.6)',
  mintLight: 'rgba(199,234,187,0.4)',
  sage: '#5a7c61',
  bg: '#f7f8f3'
};

const stats = [
  ['Total Recycled', '1,526', 'bottles'],
  ['Most Active Section', '3-Sampaguita', '412 bottles'],
  ['Avg. Bottles/Day', '218', 'past 7 days'],
  ['Peak Recycling Time', '12:00 PM', 'lunch break'],
  ['AI Detection Accuracy', '96.8%', '+1.2% MoM']
];

const reports = [
  'Daily Recycling Report',
  'Weekly Section Performance',
  'Monthly AI Accuracy Audit',
  'Quarterly Sustainability Brief'
];

export default function Reports() {
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
              background:
                'conic-gradient(#44694b 0deg 90deg,#8bbc7b 90deg 170deg,#b8dba7 170deg 240deg,#d4e9c7 240deg 300deg,#e6f2d4 300deg 360deg)',
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
                background: '#fff'
              }}
            />
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
            Monthly Performance vs Target
          </h3>

          <div
            style={{
              display: 'flex',
              alignItems: 'end',
              height: '300px',
              gap: '16px'
            }}
          >
            {[280, 300, 340, 420, 500, 530].map(
              (v, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'end',
                    gap: '6px'
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: `${v / 2}px`,
                      background: '#44694b',
                      borderRadius: '8px 8px 0 0'
                    }}
                  />

                  <div
                    style={{
                      width: '24px',
                      height: `${(v - 30) / 2}px`,
                      background: '#b8dba7',
                      borderRadius: '8px 8px 0 0'
                    }}
                  />
                </div>
              )
            )}
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
            <polyline
              fill="none"
              stroke="#44694b"
              strokeWidth="4"
              points="
              40,180
              120,170
              200,150
              280,140
              360,125
              440,105
              520,95
            "
            />
          </svg>
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
            Peak Recycling Hours
          </h3>

          <div
            style={{
              display: 'flex',
              alignItems: 'end',
              gap: '10px',
              height: '260px'
            }}
          >
            {[12,28,18,22,35,65,52,30,42,22,8].map(
              (v, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${v * 2}px`,
                    background: '#8bbc7b',
                    borderRadius: '8px 8px 0 0'
                  }}
                />
              )
            )}
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