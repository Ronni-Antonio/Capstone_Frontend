import React, { useState, useEffect } from 'react';
import api from '../api';
import { useData } from '../context/DataContext.jsx';

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
  const [showRfidModal, setShowRfidModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [activationError, setActivationError] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  const { 
    students, 
    transactions, 
    sections: sectionsList,
    refreshStudents,
    addStudent: addStudentToContext,
    updateStudent,
    activateStudent,
    getActivationStatus,
    cancelActivation
  } = useData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSection, setFilterSection] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Initialize newStudent with first section from context
  const [newStudent, setNewStudent] = useState({
    first_name: '',
    last_name: '',
    grade_level: '',
    section: '',
    bottles: 0,
    points: 0
  });
  
  useEffect(() => {
    if (sectionsList.length > 0) {
      setNewStudent(prev => ({ ...prev, section: sectionsList[0] }));
    }
  }, [sectionsList]);
  
  // CSV Upload State
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvError, setCsvError] = useState(null);
  const [csvSuccess, setCsvSuccess] = useState(null);
  
  // Add Individual Student State
  const [addStudentError, setAddStudentError] = useState(null);
  const [addStudentSuccess, setAddStudentSuccess] = useState(null);

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
    
    // Normalize status to Title Case (e.g., "active" → "Active")
    const normalizeStatus = (status) => {
      if (!status) return 'Inactive';
      const lowerStatus = status.toLowerCase();
      if (lowerStatus === 'active') return 'Active';
      return 'Inactive';
    };
    
    const finalStudent = {
      id: displayId, // use student_number for display in the table
      actual_student_id: actualStudentId, // keep the actual id for transaction matching
      name: fullName,
      initials: getInitials(),
      grade_level: student?.grade_level,
      section: student?.section || 'No Section',
      bottles: totalFromTransactions || student?.bottles || student?.bottles_qty || 0,
      points: student?.points_balance ?? student?.points ?? 0,
      status: normalizeStatus(student?.status) // normalize status
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

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterSection]);

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setAddStudentError(null);
    setAddStudentSuccess(null);
    
    try {
      const res = await api.addStudent(newStudent);
      // If the API returns the created student, add it directly to context (optimistic update)
      if (res.data) {
        addStudentToContext(res.data);
      } else {
        // Otherwise refresh just the students list
        await refreshStudents();
      }
      
      setAddStudentSuccess('Student added successfully!');
      
      // Wait 1.5 seconds then close modal and reset
      setTimeout(() => {
        setShowModal(false);
        setNewStudent({
          student_number: '',
          first_name: '',
          last_name: '',
          grade_level: '',
          initials: '',
          section: sectionsList.length > 0 ? sectionsList[0] : '',
          bottles: 0,
          points: 0
        });
        setAddStudentSuccess(null);
      }, 1500);
      
    } catch (err) {
      console.error('Error adding student:', err);
      setAddStudentError(err.response?.data?.message || err.message || 'Failed to add student');
    }
  };

  // --- CSV Upload Functions ---

  // 1. Download Sample CSV
  const downloadSampleCsv = () => {
    const sampleContent = [
      ['student_number', 'first_name', 'last_name', 'grade_level', 'section'],
      ['136721000000', 'John', 'Doe', '3', 'Sampaguita'],

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
                // Fully successful - close modal and refresh just students
                setCsvSuccess(`Successfully imported ${importedCount} student(s)!`);
                setShowModal(false);
                await refreshStudents();
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

  // Clean up polling interval on unmount
  React.useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Handle Activate Card button click
  const handleActivateCard = (student) => {
    setSelectedStudent(student);
    setScanning(false);
    setScanSuccess(false);
    setActivationError(null);
    setShowRfidModal(true);
  };

  // Handle Cancel Activation
  const handleCancelActivation = async () => {
    if (selectedStudent) {
      try {
        await cancelActivation(selectedStudent.actual_student_id);
      } catch (err) {
        console.error('Cancel error:', err);
      }
    }
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    setShowRfidModal(false);
    setSelectedStudent(null);
    setScanning(false);
    setScanSuccess(false);
    setActivationError(null);
  };

  // Handle Start RFID Scan (waiting for ESP32)
  const handleStartScan = async () => {
    if (!selectedStudent) return;
    setScanning(true);
    setActivationError(null);
    
    try {
      // 1. Start activation session on backend
      await activateStudent(selectedStudent.actual_student_id);
      
      // 2. Poll for activation status from backend
      const interval = setInterval(async () => {
        try {
          const statusData = await getActivationStatus(selectedStudent.actual_student_id);
          console.log('Activation status:', statusData);
          
          if (statusData.status === 'success') {
            clearInterval(interval);
            setPollingInterval(null);
            setScanSuccess(true);
            await refreshStudents();
            
            setTimeout(() => {
              setShowRfidModal(false);
              setSelectedStudent(null);
            }, 1500);
          } else if (statusData.status === 'error') {
            clearInterval(interval);
            setPollingInterval(null);
            setScanning(false);
            setActivationError(statusData.message || 'Activation failed');
          }
        } catch (pollErr) {
          console.error('Polling error:', pollErr);
        }
      }, 2000); // Poll every 2 seconds
      
      setPollingInterval(interval);
      
    } catch (err) {
      console.error('Start activation error:', err);
      setScanning(false);
      setActivationError(err.response?.data?.message || err.message || 'Failed to start activation');
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

        <select
          value={filterSection}
          onChange={(e) => setFilterSection(e.target.value)}
          style={{
            border: `1px solid ${COLORS.mintLight}`,
            borderRadius: '12px',
            padding: '10px 16px',
            background: COLORS.white,
            color: COLORS.dark,
            cursor: 'pointer',
            outline: 'none',
            fontSize: '14px'
          }}
        >
          {['All', ...uniqueSections].map((section) => (
            <option key={section} value={section}>{section}</option>
          ))}
        </select>

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
              <th style={th}>Status</th>
              <th style={th}>Bottles</th>
              <th style={th}>Points</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentStudents.length > 0 ? (
              currentStudents.map((student) => (
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

                  <td style={td}>
                    <span
                      style={{
                        padding: '6px 12px',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: student.status === 'Active' ? COLORS.mint : '#fee2e2',
                        color: student.status === 'Active' ? COLORS.dark : '#dc2626'
                      }}
                    >
                      {student.status}
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

                    {student.status !== 'Active' && (
                      <button
                        onClick={() => handleActivateCard(student)}
                        style={{
                          ...actionBtn,
                          background: '#3e5f44',
                          color: '#fff'
                        }}
                        title="Activate Card"
                      >
                        <i className="fa-solid fa-id-card"></i>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ ...td, textAlign: 'center' }}>
                  No students found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            padding: '20px',
            borderTop: `1px solid ${COLORS.mintLight}`
          }}>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: `1px solid ${COLORS.mintLight}`,
                background: currentPage === 1 ? '#f4f4f4' : 'white',
                color: currentPage === 1 ? '#aaa' : COLORS.dark,
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontWeight: '600'
              }}
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: currentPage === page ? COLORS.dark : 'transparent',
                  color: currentPage === page ? 'white' : COLORS.dark,
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: `1px solid ${COLORS.mintLight}`,
                background: currentPage === totalPages ? '#f4f4f4' : 'white',
                color: currentPage === totalPages ? '#aaa' : COLORS.dark,
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontWeight: '600'
              }}
            >
              Next
            </button>
          </div>
        )}
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
                onClick={() => {
                  setShowModal(false);
                  setAddStudentError(null);
                  setAddStudentSuccess(null);
                  setCsvError(null);
                  setCsvSuccess(null);
                }}
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
              
              {/* Add Individual Student Error */}
              {addStudentError && (
                <div
                  style={{
                    marginTop: '12px',
                    padding: '12px',
                    background: '#fee2e2',
                    color: '#dc2626',
                    borderRadius: '12px',
                    fontSize: '13px'
                  }}
                >
                  ❌ {addStudentError}
                </div>
              )}
              
              {/* Add Individual Student Success */}
              {addStudentSuccess && (
                <div
                  style={{
                    marginTop: '12px',
                    padding: '12px',
                    background: '#dcfce7',
                    color: '#166534',
                    borderRadius: '12px',
                    fontSize: '14px'
                  }}
                >
                  ✅ {addStudentSuccess}
                </div>
              )}

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

                <select
                  value={newStudent.grade_level || ''}
                  onChange={(e) => setNewStudent({ ...newStudent, grade_level: e.target.value })}
                  style={modalInput}
                  required
                >
                  {[3, 4, 5, 6].map((grade) => (
                    <option key={grade} value={grade}>Grade {grade}</option>
                  ))}
                </select>

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
                  required
                >
                  {sectionsList.map((section) => (
                    <option key={section} value={section}>{section}</option>
                  ))}
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

      {/* RFID Scan Modal */}
      {showRfidModal && selectedStudent && (
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
              width: '500px',
              maxWidth: '95%',
              background: '#fff',
              borderRadius: '24px',
              padding: '32px',
              border: `1px solid ${COLORS.mintLight}`,
              textAlign: 'center'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: '16px'
              }}
            >
              <button
                onClick={() => setShowRfidModal(false)}
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
                fontSize: '64px',
                marginBottom: '16px'
              }}
            >
              {scanSuccess ? '✅' : scanning ? '📶' : '🪪'}
            </div>

            <h2
              style={{
                margin: '0 0 8px 0',
                color: COLORS.dark
              }}
            >
              {scanSuccess 
                ? 'Card Activated!' 
                : scanning 
                  ? 'Waiting for RFID Scan...' 
                  : 'Activate Student Card'}
            </h2>

            <p
              style={{
                margin: '0 0 24px 0',
                color: COLORS.darkMuted,
                fontSize: '14px',
                lineHeight: '1.5'
              }}
            >
              {scanSuccess 
                ? `${selectedStudent.name}'s card has been activated successfully!` 
                : scanning 
                  ? 'The system is waiting for the ESP32 to scan an RFID card...' 
                  : `Click "Start Scan" to activate ${selectedStudent.name}'s RFID card.`}
            </p>

            {selectedStudent && (
              <div
                style={{
                  background: '#eef4df',
                  borderRadius: '16px',
                  padding: '20px',
                  marginBottom: '24px',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: COLORS.dark,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      fontWeight: '700'
                    }}
                  >
                    {selectedStudent.initials}
                  </div>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: COLORS.dark }}>
                      {selectedStudent.name}
                    </div>
                    <div style={{ fontSize: '14px', color: COLORS.darkMuted }}>
                      {selectedStudent.section} • Grade {selectedStudent.grade_level}
                    </div>
                    <div style={{ fontSize: '14px', color: COLORS.darkMuted }}>
                      ID: {selectedStudent.id}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Activation Error Display */}
            {activationError && (
              <div
                style={{
                  marginBottom: '16px',
                  padding: '12px',
                  background: '#fee2e2',
                  color: '#dc2626',
                  borderRadius: '12px',
                  fontSize: '14px',
                  textAlign: 'left'
                }}
              >
                ❌ {activationError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              {/* Cancel Button */}
              <button
                onClick={handleCancelActivation}
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  fontSize: '15px',
                  fontWeight: '600',
                  borderRadius: '16px',
                  border: `2px solid ${COLORS.dark}`,
                  background: 'transparent',
                  color: COLORS.dark,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              {!scanning && !scanSuccess && (
                <button
                  onClick={handleStartScan}
                  style={{
                    flex: 2,
                    padding: '14px 20px',
                    fontSize: '15px',
                    fontWeight: '600',
                    borderRadius: '16px',
                    border: 'none',
                    background: COLORS.dark,
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Start Scan
                </button>
              )}
            </div>
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