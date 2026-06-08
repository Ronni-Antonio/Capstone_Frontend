import React from 'react';

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
  amberText: '#b45309'
};

const stats = [
  {
    title: 'Bottles Collected Today',
    value: '224',
    change: '+12%'
  },
  {
    title: 'Points Earned Today',
    value: '1,120',
    change: '+8%'
  },
  {
    title: 'Bin Fullness',
    value: '62%',
    change: '+5%'
  },
  {
    title: 'Grade 3 Participants',
    value: '224',
    change: '+4%'
  }
];

const activities = [
  {
    initials: 'MS',
    name: 'Maria Santos',
    action: 'recycled 3 bottles',
    points: '+15 pts'
  },
  {
    initials: 'JD',
    name: 'Juan Dela Cruz',
    action: 'recycled 2 bottles',
    points: '+10 pts'
  },
  {
    initials: 'LM',
    name: 'Liza Mendoza',
    action: 'recycled 5 bottles',
    points: '+25 pts'
  },
  {
    initials: 'AR',
    name: 'Andres Reyes',
    action: 'recycled 1 bottle',
    points: '+5 pts'
  },
  {
    initials: 'SR',
    name: 'Sofia Ramos',
    action: 'recycled 4 bottles',
    points: '+20 pts'
  }
];

const alerts = [
  {
    title: 'Machine almost full',
    desc: 'Bin is at 83% capacity',
    type: 'warning'
  },
  {
    title: 'Scanner error',
    desc: 'Calibration required',
    type: 'danger'
  },
  {
    title: 'No internet connection',
    desc: 'Machine briefly offline',
    type: 'warning'
  }
];

export default function Dashboard() {
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
      `}</style>

      {/* Header */}

      <div className="fade-up">
        <h1
          style={{
            margin: 0,
            fontSize: '28px',
            color: COLORS.dark
          }}
        >
          Dashboard
        </h1>

        <p
          style={{
            marginTop: '6px',
            color: COLORS.darkMuted,
            fontSize: '14px'
          }}
        >
          Overview of recycling activity today
        </p>
      </div>

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
          <h3
            style={{
              marginTop: 0,
              color: COLORS.dark
            }}
          >
            Daily Recycling Trends
          </h3>

          <svg
            viewBox="0 0 600 250"
            width="100%"
            height="250"
          >
            <polyline
              fill="none"
              stroke="#8bc37a"
              strokeWidth="4"
              points="
                30,180
                120,150
                210,120
                300,140
                390,90
                480,220
                570,100
              "
            />

            <polyline
              fill="none"
              stroke="#3e5f44"
              strokeWidth="4"
              points="
                30,220
                120,210
                210,200
                300,205
                390,190
                480,240
                570,200
              "
            />
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
              justifyContent: 'center',
              marginTop: '24px'
            }}
          >
            <div
              style={{
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                background:
                  'conic-gradient(#3e5f44 0deg 220deg,#8bc37a 220deg 310deg,#dcefd1 310deg 360deg)',
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
        </div>
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

          <div
            style={{
              display: 'flex',
              alignItems: 'end',
              gap: '20px',
              height: '260px',
              marginTop: '30px'
            }}
          >
            {[420, 390, 300, 250, 180].map(
              (height, index) => (
                <div
                  key={index}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '80px',
                      height: `${height / 2}px`,
                      background: '#92c283',
                      borderRadius: '10px 10px 0 0'
                    }}
                  />

                  <span
                    style={{
                      marginTop: '10px',
                      fontSize: '12px',
                      color: COLORS.dark
                    }}
                  >
                    Grade {index + 3}
                  </span>
                </div>
              )
            )}
          </div>
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
              3-Sampaguita
            </h2>

            <div
              style={{
                fontSize: '13px'
              }}
            >
              412 Bottles • 2,060 Points
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

        {activities.map((activity) => (
          <div
            key={activity.name}
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
        ))}
      </div>
    </div>
  );
}