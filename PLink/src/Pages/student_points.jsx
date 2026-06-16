import React, { useState } from 'react';

const COLORS = {
  white: '#ffffff',
  dark: '#3e5f44',
  darkMuted: 'rgba(62,95,68,0.6)',
  mintLight: 'rgba(199,234,187,0.4)',
  mint: '#c7eabb',
  lime: '#e8f5bd',
  bg: '#f7f8f3',
  sage: '#5a7c61'
};

const students = [
  {
    initials: 'MC',
    name: 'Maria Clara Santos',
    id: '#0001',
    section: '3-Sampaguita',
    bottles: 142,
    points: 710
  },
  {
    initials: 'JM',
    name: 'Juan Miguel Dela Cruz',
    id: '#0002',
    section: '3-Rosal',
    bottles: 128,
    points: 640
  },
  {
    initials: 'LM',
    name: 'Liza Marie Mendoza',
    id: '#0003',
    section: '3-Orchid',
    bottles: 119,
    points: 595
  },
  {
    initials: 'AR',
    name: 'Andres Bonifacio Reyes',
    id: '#0004',
    section: '3-Sampaguita',
    bottles: 112,
    points: 560
  },
  {
    initials: 'SI',
    name: 'Sofia Isabel Ramos',
    id: '#0005',
    section: '3-Jasmine',
    bottles: 98,
    points: 490
  },
  {
    initials: 'ML',
    name: 'Mateo Lorenzo Garcia',
    id: '#0006',
    section: '3-Rosal',
    bottles: 94,
    points: 470
  }
];

export default function StudentPoints() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        fontFamily: 'sans-serif'
      }}
    >
      {/* TOP CARDS */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr',
          gap: '20px'
        }}
      >
        {/* TOP RECYCLER */}

        <div
          style={{
            background: COLORS.dark,
            color: 'white',
            borderRadius: '24px',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              fontSize: '13px',
              opacity: 0.8
            }}
          >
            Top Recycler
          </div>

          <div
            style={{
              fontSize: '36px',
              fontWeight: '700',
              marginTop: '8px'
            }}
          >
            Maria Clara Santos
          </div>

          <div
            style={{
              marginTop: '8px',
              opacity: 0.85
            }}
          >
            3-Sampaguita · 142 bottles
          </div>

          <div
            style={{
              marginTop: '14px',
              display: 'inline-block',
              background: 'rgba(255,255,255,0.15)',
              padding: '8px 14px',
              borderRadius: '999px'
            }}
          >
            🏆 710 points earned
          </div>
        </div>

        {/* MOST IMPROVED */}

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
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              background: COLORS.mint,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ⭐
          </div>

          <div
            style={{
              marginTop: '18px',
              fontSize: '12px',
              color: COLORS.darkMuted
            }}
          >
            Most Improved
          </div>

          <div
            style={{
              fontSize: '28px',
              fontWeight: '700',
              color: COLORS.dark,
              marginTop: '6px'
            }}
          >
            Diego Villanueva
          </div>

          <div
            style={{
              color: COLORS.darkMuted,
              marginTop: '4px'
            }}
          >
            +48 bottles this week
          </div>
        </div>

        {/* TOTAL PARTICIPANTS */}

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
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              background: COLORS.mint,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            👨‍🎓
          </div>

          <div
            style={{
              marginTop: '18px',
              fontSize: '12px',
              color: COLORS.darkMuted
            }}
          >
            Total Participants
          </div>

          <div
            style={{
              fontSize: '34px',
              fontWeight: '700',
              color: COLORS.dark,
              marginTop: '6px'
            }}
          >
            18 Students
          </div>

          <div
            style={{
              color: COLORS.darkMuted
            }}
          >
            across 5 sections
          </div>
        </div>
      </div>

      {/* FILTER BAR */}

      <div
        style={{
          background: COLORS.white,
          borderRadius: '24px',
          padding: '18px',
          border: `1px solid ${COLORS.mintLight}`,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}
      >
        <input
          placeholder="Search student..."
          style={{
            flex: 1,
            minWidth: '250px',
            border: `1px solid ${COLORS.mintLight}`,
            borderRadius: '999px',
            padding: '12px 18px',
            outline: 'none'
          }}
        />

        {[
          'All',
          '3-Sampaguita',
          '3-Rosal',
          '3-Orchid',
          '3-Jasmine'
        ].map((section) => (
          <button
            key={section}
            style={{
              border: 'none',
              background:
                section === 'All'
                  ? COLORS.dark
                  : COLORS.lime,
              color:
                section === 'All'
                  ? 'white'
                  : COLORS.dark,
              padding: '10px 16px',
              borderRadius: '999px',
              cursor: 'pointer'
            }}
          >
            {section}
          </button>
        ))}

        <button
  onClick={() => setShowModal(true)}
  style={{
    border: 'none',
    background: COLORS.dark,
    color: 'white',
    padding: '12px 18px',
    borderRadius: '14px',
    cursor: 'pointer',
    fontWeight: '600'
  }}
>
  <i className="fa-solid fa-plus"></i> Add Student
</button>
      </div>

      {/* TABLE */}

      <div
        style={{
          background: COLORS.white,
          borderRadius: '24px',
          overflow: 'hidden',
          border: `1px solid ${COLORS.mintLight}`
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}
        >
          <thead>
            <tr
              style={{
                background: '#eef4df'
              }}
            >
              <th style={th}>Student Name</th>
              <th style={th}>Grade</th>
              <th style={th}>Section</th>
              <th style={th}>Bottles</th>
              <th style={th}>Points</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {students.map((student) => (
              <tr
                key={student.id}
                style={{
                  borderTop:
                    '1px solid rgba(199,234,187,0.3)'
                }}
              >
                <td style={td}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: COLORS.mint,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700'
                      }}
                    >
                      {student.initials}
                    </div>

                    <div>
                      <div
                        style={{
                          fontWeight: '600',
                          color: COLORS.dark
                        }}
                      >
                        {student.name}
                      </div>

                      <div
                        style={{
                          fontSize: '12px',
                          color: COLORS.darkMuted
                        }}
                      >
                        ID {student.id}
                      </div>
                    </div>
                  </div>
                </td>

                <td style={td}>Grade 3</td>

                <td style={td}>
                  <span
                    style={{
                      background: COLORS.mint,
                      padding: '6px 12px',
                      borderRadius: '999px',
                      fontSize: '12px'
                    }}
                  >
                    {student.section}
                  </span>
                </td>

                <td style={td}>{student.bottles}</td>

                <td
                  style={{
                    ...td,
                    color: '#6aa96f',
                    fontWeight: '700'
                  }}
                >
                  +{student.points} pts
                </td>

                <td style={td}>
                  <button style={actionBtn}>
                    <i className="fa-solid fa-eye"></i>
                  </button>

                  <button style={actionBtn}>
                    <i className="fa-solid fa-pen"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
            </div>

      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.45)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
          }}
        >
          <div
            style={{
              width: '750px',
              maxWidth: '95%',
              background: '#fff',
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
                marginBottom: '20px'
              }}
            >
              <h2
                style={{
                  margin: 0,
                  color: COLORS.dark
                }}
              >
                Add Students
              </h2>

              <button
                onClick={() => setShowModal(false)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '22px'
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                border: `2px dashed ${COLORS.mint}`,
                borderRadius: '18px',
                padding: '30px',
                textAlign: 'center',
                marginBottom: '24px'
              }}
            >
              <h3 style={{ color: COLORS.dark }}>
                Upload CSV File
              </h3>

              <p
                style={{
                  color: COLORS.darkMuted,
                  fontSize: '14px'
                }}
              >
                Upload a CSV file containing student records.
              </p>

              <input
                type="file"
                accept=".csv"
              />
            </div>

            <h3
              style={{
                color: COLORS.dark
              }}
            >
              Add Individual Student
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
              }}
            >
              <input
                placeholder="Student Name"
                style={modalInput}
              />

              <input
                placeholder="Student ID"
                style={modalInput}
              />

              <select style={modalInput}>
                <option>3-Sampaguita</option>
                <option>3-Rosal</option>
                <option>3-Orchid</option>
                <option>3-Jasmine</option>
              </select>

              <input
                placeholder="Initials"
                style={modalInput}
              />
            </div>

            <button
              style={{
                marginTop: '20px',
                border: 'none',
                background: COLORS.dark,
                color: '#fff',
                padding: '12px 18px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Add Student
            </button>
          </div>
        </div>
            )}
    </div>
  );
}

const th = {
  padding: '16px',
  textAlign: 'left',
  color: '#3e5f44',
  fontSize: '13px'
};

const td = {
  padding: '18px',
  color: '#3e5f44'
};

const actionBtn = {
  width: '36px',
  height: '36px',
  borderRadius: '10px',
  border: 'none',
  marginRight: '8px',
  cursor: 'pointer',
  background: '#c7eabb',
  color: '#3e5f44'
};

const modalInput = {
  width: '100%',
  padding: '12px',
  borderRadius: '12px',
  border: '1px solid rgba(199,234,187,.5)',
  outline: 'none',
  boxSizing: 'border-box'
};