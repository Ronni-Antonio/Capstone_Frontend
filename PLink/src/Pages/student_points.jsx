import React, { useState, useEffect } from 'react';
import api from '../api';

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


export default function StudentPoints() {
  const [showModal, setShowModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSection, setFilterSection] = useState('All');
  const [newStudent, setNewStudent] = useState({
    first_name: '',
    last_name: '',
    grade_level: '3',
    section: 'Sampaguita',
    bottles: 0,
    points: 0
  });
  // CSV Upload State
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvError, setCsvError] = useState(null);
  const [csvSuccess, setCsvSuccess] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch both students and transactions in parallel
      const [studentsRes, transactionsRes] = await Promise.all([
        api.getStudents(),
        api.getTransactions()
      ]);
      
      let studentsData = studentsRes.data;
      let transactionsData = transactionsRes.data;
      
      // Ensure data is always an array
      if (!Array.isArray(studentsData)) studentsData = [];
      if (!Array.isArray(transactionsData)) transactionsData = [];
      
      setStudents(studentsData);
      setTransactions(transactionsData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setStudents([]);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total bottles per student from transactions
  const getTotalBottlesForStudent = (actualStudentId) => {
    // Ensure transactions is always an array
    const safeTransactions = Array.isArray(transactions) ? transactions : [];
    
    const matchingTransactions = safeTransactions.filter(tx => tx && tx.student_id === actualStudentId);
    
    const total = matchingTransactions.reduce((total, tx) => {
      const bottles = tx.bottles_deposited || tx.bottles || tx.bottle_qty || tx.bottles_qty || 0;
      return total + bottles;
    }, 0);
  
    return total;
  };

  // Helper to safely get student data with defaults
  const safeStudent = (student) => {
    const fullName = student?.name 
      ? student.name 
      : [student?.first_name, student?.last_name].filter(Boolean).join(' ').trim() || 'Unknown Student';
    
    // Generate initials if not provided
    const getInitials = () => {
      if (student?.initials) return student.initials;
      if (student?.first_name && student?.last_name) {
        return `${student.first_name[0]}${student.last_name[0]}`.toUpperCase();
      }
      if (fullName && fullName !== 'Unknown Student') {
        const nameParts = fullName.split(' ');
        return nameParts.length > 1 
          ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
          : nameParts[0][0].toUpperCase();
      }
      return 'NA';
    };

    // Get the actual student_id (foreign key) and student_number (display ID)
    const actualStudentId = student?.id || student?.student_id || 0;
    const displayId = student?.student_number || student?.id || 'N/A';
    
    const totalFromTransactions = getTotalBottlesForStudent(actualStudentId);
    
    const finalStudent = {
      id: displayId, // use student_number for display in the table
      actual_student_id: actualStudentId, // keep the actual id for transaction matching
      name: fullName,
      initials: getInitials(),
      grade_level: student?.grade_level || '3',
      section: student?.section || 'No Section',
      bottles: totalFromTransactions || student?.bottles || student?.bottles_qty || 0,
      points: student?.points_balance ?? student?.points ?? 0
    };
    return finalStudent;
  };

  // Calculate stats for top cards
  const processedStudents = students.map(safeStudent);
  const topStudent = [...processedStudents].sort((a, b) => b.points - a.points)[0];
  const totalStudents = students.length;
  const uniqueSections = [...new Set(processedStudents.map(s => s.section).filter(Boolean))];

  // Filter students
  const filteredStudents = processedStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSection = filterSection === 'All' || student.section === filterSection;
    return matchesSearch && matchesSection;
  });

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await api.addStudent(newStudent);
      setShowModal(false);
      setNewStudent({
        student_number: '',
        first_name: '',
        last_name: '',
        grade_level: '3',
        initials: '',
        section: 'Sampaguita',
        bottles: 0,
        points: 0
      });
      fetchData();
    } catch (err) {
      console.error('Error adding student:', err);
      alert('Failed to add student');
    }
  };

  // --- CSV Upload Functions ---

  // 1. Download Sample CSV
  const downloadSampleCsv = () => {
    const sampleContent = [
      ['student_number', 'first_name', 'last_name', 'grade_level', 'section'],
      ['1001', 'John', 'Doe', '3', 'Sampaguita'],
      ['1002', 'Jane', 'Smith', '3', 'Rosal'],
      ['1003', 'Mike', 'Johnson', '3', 'Orchid'],
    ];
    const csvContent = sampleContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'students_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 3. Handle CSV File Upload
  const handleCsvFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCsvError(null);
    setCsvSuccess(null);
    setCsvLoading(true);

    try {
      const response = await api.importStudentsCsv(file);

      // Success!
      const importedCount = response.data?.imported || 0;
      const errors = response.data?.errors || [];
      
      if (importedCount > 0 && errors.length === 0) {
        // Fully successful - close modal and refresh
        setCsvSuccess(`Successfully imported ${importedCount} student(s)!`);
        setShowModal(false);
        fetchData();
        // Clear file input
        e.target.value = '';
      } else {
        // Partial success or all errors - show detailed errors and keep modal open
        let message = '';
        if (importedCount > 0) {
          message = `Imported ${importedCount} student(s). However, ${errors.length} row(s) had errors.`;
        } else {
          message = `Failed to import students. ${errors.length} row(s) had errors.`;
        }
        
        // Format detailed errors
        const formattedErrors = errors.map((err, idx) => 
          `Row ${err.row || (idx + 2)}: ${err.message || JSON.stringify(err)}`
        ).join(' • ');
        
        setCsvError(`${message} Errors: ${formattedErrors}`);
        console.warn('⚠️ CSV Import Errors:', errors);
      }
    } catch (err) {
      console.error('❌ CSV Upload Error:', err);
      
      // Try to get detailed error from backend
      let errorMessage = 'Failed to upload CSV';
      if (err.response?.data) {
        if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
        if (err.response.data.errors) {
          const formattedErrors = err.response.data.errors.map((err, idx) => 
            `Row ${err.row || (idx + 2)}: ${err.message || JSON.stringify(err)}`
          ).join(' • ');
          errorMessage += ` Errors: ${formattedErrors}`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setCsvError(errorMessage);
    } finally {
      setCsvLoading(false);
    }
  };

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

          {topStudent ? (
            <>
              <div
                style={{
                  fontSize: '36px',
                  fontWeight: '700',
                  marginTop: '8px'
                }}
              >
                {topStudent.name}
              </div>

              <div
                style={{
                  marginTop: '8px',
                  opacity: 0.85
                }}
              >
                {topStudent.section} · {topStudent.bottles} bottles
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
                🏆 {topStudent.points} points earned
              </div>
            </>
          ) : (
            <div style={{ marginTop: '20px', opacity: 0.7 }}>
              No students yet
            </div>
          )}
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
            Total Participants
          </div>

          <div
            style={{
              fontSize: '28px',
              fontWeight: '700',
              color: COLORS.dark,
              marginTop: '6px'
            }}
          >
            {totalStudents}
          </div>

          <div
            style={{
              color: COLORS.darkMuted,
              marginTop: '4px'
            }}
          >
            Students
          </div>
        </div>

        {/* TOTAL SECTIONS */}

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
            Sections
          </div>

          <div
            style={{
              fontSize: '34px',
              fontWeight: '700',
              color: COLORS.dark,
              marginTop: '6px'
            }}
          >
            {uniqueSections.length}
          </div>

          <div
            style={{
              color: COLORS.darkMuted
            }}
          >
            Active
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
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            minWidth: '250px',
            border: `1px solid ${COLORS.mintLight}`,
            borderRadius: '999px',
            padding: '12px 18px',
            outline: 'none'
          }}
        />

        {['All', ...uniqueSections].map((section) => (
          <button
            key={section}
            onClick={() => setFilterSection(section)}
            style={{
              border: 'none',
              background:
                filterSection === section
                  ? COLORS.dark
                  : COLORS.lime,
              color:
                filterSection === section
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
            {loading ? (
              <tr>
                <td colSpan="6" style={{ ...td, textAlign: 'center' }}>
                  Loading students...
                </td>
              </tr>
            ) : filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
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

                  <td style={td}>Grade {student.grade_level}</td>

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
                    {student.points} pts
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
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ ...td, textAlign: 'center' }}>
                  No students found
                </td>
              </tr>
            )}
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
              <h3 style={{ color: COLORS.dark, margin: '0 0 8px 0' }}>
                Upload CSV File
              </h3>

              <p
                style={{
                  color: COLORS.darkMuted,
                  fontSize: '14px',
                  margin: '0 0 16px 0'
                }}
              >
                Upload a CSV file with columns: student_number, first_name, last_name, grade_level, section.
              </p>

              <button
                onClick={downloadSampleCsv}
                style={{
                  background: COLORS.mintLight,
                  border: `1px solid ${COLORS.mint}`,
                  padding: '8px 16px',
                  borderRadius: '12px',
                  color: COLORS.dark,
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: '16px'
                }}
              >
                📥 Download Sample CSV
              </button>

              <input
                type="file"
                accept=".csv"
                onChange={handleCsvFileChange}
                disabled={csvLoading}
                style={{
                  margin: '0 auto',
                  display: 'block',
                  cursor: csvLoading ? 'not-allowed' : 'pointer',
                  opacity: csvLoading ? 0.6 : 1
                }}
              />

              {/* CSV Error */}
              {csvError && (
                <div
                  style={{
                    marginTop: '16px',
                    padding: '12px',
                    background: '#fee2e2',
                    color: '#dc2626',
                    borderRadius: '12px',
                    fontSize: '13px',
                    textAlign: 'left',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}
                >
                  ❌ <strong>Error:</strong>
                  <div style={{ marginTop: '8px', lineHeight: '1.5' }}>
                    {csvError.split(' • ').map((error, idx) => (
                      <div key={idx} style={{ marginBottom: '4px' }}>• {error}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* CSV Success */}
              {csvSuccess && (
                <div
                  style={{
                    marginTop: '16px',
                    padding: '12px',
                    background: '#dcfce7',
                    color: '#166534',
                    borderRadius: '12px',
                    fontSize: '14px'
                  }}
                >
                  ✅ {csvSuccess}
                </div>
              )}

              {/* CSV Loading */}
              {csvLoading && (
                <div
                  style={{
                    marginTop: '16px',
                    padding: '12px',
                    background: '#e0f2fe',
                    color: '#0369a1',
                    borderRadius: '12px',
                    fontSize: '14px'
                  }}
                >
                  ⏳ Uploading and processing CSV...
                </div>
              )}
            </div>

            <form onSubmit={handleAddStudent}>
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
                  placeholder="Student Number"
                  value={newStudent.student_number || ''}
                  onChange={(e) => setNewStudent({ ...newStudent, student_number: e.target.value })}
                  style={modalInput}
                  required
                />

                <input
                  placeholder="Grade Level"
                  value={newStudent.grade_level || ''}
                  onChange={(e) => setNewStudent({ ...newStudent, grade_level: e.target.value })}
                  style={modalInput}
                  required
                />

                <input
                  placeholder="First Name"
                  value={newStudent.first_name}
                  onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })}
                  style={modalInput}
                  required
                />

                <input
                  placeholder="Last Name"
                  value={newStudent.last_name}
                  onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })}
                  style={modalInput}
                  required
                />

                <input
                  placeholder="Initials (optional)"
                  value={newStudent.initials || ''}
                  onChange={(e) => setNewStudent({ ...newStudent, initials: e.target.value })}
                  style={modalInput}
                />

                <select
                  value={newStudent.section}
                  onChange={(e) => setNewStudent({ ...newStudent, section: e.target.value })}
                  style={modalInput}
                >
                  <option>Sampaguita</option>
                  <option>Rosal</option>
                  <option>Orchid</option>
                  <option>Jasmine</option>
                </select>
              </div>

              <button
                type="submit"
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
            </form>
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