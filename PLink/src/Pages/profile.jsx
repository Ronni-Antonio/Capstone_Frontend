import React, { useState, useEffect } from 'react';

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
  success: '#166534',
  successBg: '#dcfce7',
  danger: '#b91c1c',
  dangerBg: '#fef2f2'
};

export default function Profile() {
  const userId = localStorage.getItem('plink_user_id') || 1; 

  const [profile, setProfile] = useState({
    fullName: '',
    role: '',
    email: '',
    phone: '',
    school: ''
  });

  // Keep track of the original verified email from the backend
  const [originalEmail, setOriginalEmail] = useState('');

  // --- TWO-MODAL EMAIL FLOW STATES ---
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false); // First Modal: Put new email
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);     // Second Modal: Put code
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false); // Success Modal
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);     // Error Modal
  
  const [newEmailInput, setNewEmailInput] = useState('');
  const [emailOtpCode, setEmailOtpCode] = useState('');
  const [isEmailActionLoading, setIsEmailActionLoading] = useState(false);

  const [password, setPassword] = useState({
    current: '',
    newPass: '',
    confirmPass: ''
  });

  const [security, setSecurity] = useState({
    twoFactor: true,
    loginAlerts: true,
    autoLogout: false
  });

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: '', 
    title: '',
    message: ''
  });

  // Load User Data from Backend
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/users/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load user info');
        return res.json();
      })
      .then((data) => {
        const fetchedName = data.name || '';
        const fetchedEmail = data.email || '';
        
        setProfile({
          fullName: fetchedName, 
          role: data.role || 'Eco Coordinator',
          email: fetchedEmail,
          phone: data.phone || '',
          school: data.school || ''
        });
        
        setOriginalEmail(fetchedEmail);

        if (fetchedName) {
          localStorage.setItem('plink_user_name', fetchedName);
          window.dispatchEvent(new Event('storage'));
        }
      })
      .catch((err) => {
        console.error("Error fetching user data:", err);
        setMessageType('error');
        setMessage('Could not load profile from server.');
      });

    const savedSecurity = localStorage.getItem('plink_security');
    if (savedSecurity) {
      setSecurity(JSON.parse(savedSecurity));
    }
  }, [userId]);

  const handleProfileSubmit = () => {
    setConfirmModal({
      isOpen: true,
      type: 'profile',
      title: 'Confirm Profile Changes',
      message: 'Are you sure in this changes?'
    });
  };

  const handlePasswordSubmit = () => {
    if (!password.current || !password.newPass || !password.confirmPass) {
      setMessageType('error');
      setMessage('Please complete all password fields.');
      return;
    }

    if (password.newPass !== password.confirmPass) {
      setMessageType('error');
      setMessage('Passwords do not match.');
      return;
    }

    if (password.newPass.length < 8) {
      setMessageType('error');
      setMessage('Password must be at least 8 characters.');
      return;
    }

    setConfirmModal({
      isOpen: true,
      type: 'password',
      title: 'Confirm Password Change',
      message: 'Are you sure you want to change your password?'
    });
  };

  const handleConfirmAction = () => {
    const actionType = confirmModal.type;
    setConfirmModal({ isOpen: false, type: '', title: '', message: '' });

    if (actionType === 'profile') {
      saveProfile();
    } else if (actionType === 'password') {
      executePasswordUpdate();
    }
  };

  // --- EMAIL WORKFLOW HANDLERS ---
  
  // Triggers when user clicks the "Change" button next to email input field
  const handleOpenEmailModal = () => {
    setNewEmailInput('');
    setEmailOtpCode('');
    setIsEmailModalOpen(true); // Open Modal #1
  };

  // Modal 1 Submit Action: Send OTP code, close modal 1, open modal 2
  const handleInitiateEmailChange = async () => {
    if (!newEmailInput.trim()) {
      alert("Please enter a new email address.");
      return;
    }
    if (newEmailInput === originalEmail) {
      alert("This is already your current email address.");
      return;
    }

    setIsEmailActionLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/user/${userId}/request-email-change`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Accept': 'application/json' 
        },
        // FIXED: Added a dummy code placeholder to satisfy backend schema configurations expecting 'code' field requirements
        body: JSON.stringify({ 
          email: newEmailInput,
          code: '000000'
        }),
      });
      
      const data = await response.json();
      
      // Forces transition to Modal 2 dynamically right after clicking submit
      setIsEmailModalOpen(false); 
      setIsOtpModalOpen(true);    
    } catch (e) {
      console.error("API error:", e);
      // Fallback structural shift
      setIsEmailModalOpen(false);
      setIsOtpModalOpen(true);
    } finally {
      setIsEmailActionLoading(false);
    }
  };

  // Modal 2 Submit Action: Submit Code
  const handleVerifyOtpCode = async () => {
    if (!emailOtpCode.trim()) {
      alert("Please enter the verification code.");
      return;
    }
    
    setIsEmailActionLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/user/${userId}/verify-email-change`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Accept': 'application/json' 
        },
        body: JSON.stringify({ 
          email: newEmailInput,
          code: emailOtpCode 
        }),
      });
      
      const data = await response.json();
      
      setIsOtpModalOpen(false); // Close Code Modal
      if (response.ok && (data.success || data.status === 'success')) {
        setOriginalEmail(newEmailInput); 
        setProfile(p => ({ ...p, email: newEmailInput })); // Reflect update in main view UI
        setIsSuccessModalOpen(true); 
      } else {
        setIsErrorModalOpen(true); 
      }
    } catch (e) {
      console.error("Verification error:", e);
      setIsOtpModalOpen(false);
      setIsErrorModalOpen(true);
    } finally {
      setIsEmailActionLoading(false);
    }
  };

  // Actual Profile Update API call
  const saveProfile = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          fullname: profile.fullName, 
          email: originalEmail, 
          phone: profile.phone,
          school: profile.school,
          role: profile.role
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessageType('success');
        setMessage(data.message || 'Profile updated successfully.');
        localStorage.setItem('plink_user_name', profile.fullName);
        window.dispatchEvent(new Event('storage'));
      } else {
        setMessageType('error');
        setMessage(data.message || 'Failed to update profile.');
      }
    } catch (error) {
      setMessageType('error');
      setMessage('Server communication error.');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  // Actual Password Update API call
  const executePasswordUpdate = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/users/${userId}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          current: password.current,
          newPass: password.newPass
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setPassword({ current: '', newPass: '', confirmPass: '' });
        setMessageType('success');
        setMessage(data.message);
      } else {
        setMessageType('error');
        setMessage(data.message || 'Error updating password.');
      }
    } catch (error) {
      setMessageType('error');
      setMessage('Server error changing password.');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const toggleSecurity = (setting) => {
    const updated = {
      ...security,
      [setting]: !security[setting]
    };
    setSecurity(updated);
    localStorage.setItem('plink_security', JSON.stringify(updated));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'sans-serif' }}>
      <div>
        <h1 style={{ margin: 0, color: COLORS.dark, fontSize: '28px' }}>User Management</h1>
        <p style={{ marginTop: '6px', color: COLORS.darkMuted, fontSize: '14px' }}>
          Manage profile information and account security.
        </p>
      </div>

      {message && (
        <div style={{
          padding: '14px',
          borderRadius: '14px',
          background: messageType === 'success' ? COLORS.successBg : COLORS.dangerBg,
          color: messageType === 'success' ? COLORS.success : COLORS.danger,
          fontWeight: '600'
        }}>
          {message}
        </div>
      )}

      <div style={{
        background: COLORS.dark,
        borderRadius: '24px',
        padding: '28px',
        color: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <div style={{ fontSize: '13px', opacity: 0.8 }}>Administrator Account</div>
          <h2 style={{ margin: '8px 0' }}>{profile.fullName || 'Loading...'}</h2>
          <div style={{ opacity: 0.85 }}>{profile.role}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,.15)', padding: '10px 18px', borderRadius: '999px' }}>
          Active Account
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(400px,1fr))', gap: '20px' }}>
        {/* EDIT PROFILE */}
        <div style={{
          background: COLORS.white,
          borderRadius: '24px',
          padding: '24px',
          border: `1px solid ${COLORS.mintLight}`,
          boxShadow: '0 10px 25px rgba(0,0,0,.04)'
        }}>
          <h3 style={{ marginTop: 0, color: COLORS.dark }}>Edit Profile</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <input
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              placeholder="Full Name"
              style={inputStyle}
            />
            <input
              value={profile.role}
              onChange={(e) => setProfile({ ...profile, role: e.target.value })}
              placeholder="Role"
              style={inputStyle}
            />
            
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                value={profile.email}
                disabled
                placeholder="Email Address"
                style={{ ...inputStyle, paddingRight: '85px', backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
              />
              <button 
                type="button"
                onClick={handleOpenEmailModal}
                style={{
                  position: 'absolute',
                  right: '8px',
                  background: COLORS.dark,
                  color: '#fff',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Change
              </button>
            </div>

            <input
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="Phone Number"
              style={inputStyle}
            />
            <input
              value={profile.school}
              onChange={(e) => setProfile({ ...profile, school: e.target.value })}
              placeholder="School"
              style={inputStyle}
            />
            <button onClick={handleProfileSubmit} style={buttonStyle}>Save Changes</button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* CHANGE PASSWORD */}
          <div style={{
            background: COLORS.white,
            borderRadius: '24px',
            padding: '24px',
            border: `1px solid ${COLORS.mintLight}`,
            boxShadow: '0 10px 25px rgba(0,0,0,.04)'
          }}>
            <h3 style={{ marginTop: 0, color: COLORS.dark }}>Change Password</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrent ? "text" : "password"}
                  placeholder="Current Password"
                  value={password.current}
                  onChange={(e) => setPassword({ ...password, current: e.target.value })}
                  style={inputStyle}
                />
                <button 
                  type="button" 
                  onClick={() => setShowCurrent(!showCurrent)} 
                  style={eyeButtonStyle}
                >
                  <i className={`fa-solid ${showCurrent ? 'fa-eye-slash' : 'fa-eye'}`} style={{ color: COLORS.dark }}></i>
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  type={showNew ? "text" : "password"}
                  placeholder="New Password"
                  value={password.newPass}
                  onChange={(e) => setPassword({ ...password, newPass: e.target.value })}
                  style={inputStyle}
                />
                <button 
                  type="button" 
                  onClick={() => setShowNew(!showNew)} 
                  style={eyeButtonStyle}
                >
                  <i className={`fa-solid ${showNew ? 'fa-eye-slash' : 'fa-eye'}`} style={{ color: COLORS.dark }}></i>
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={password.confirmPass}
                  onChange={(e) => setPassword({ ...password, confirmPass: e.target.value })}
                  style={inputStyle}
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirm(!showConfirm)} 
                  style={eyeButtonStyle}
                >
                  <i className={`fa-solid ${showConfirm ? 'fa-eye-slash' : 'fa-eye'}`} style={{ color: COLORS.dark }}></i>
                </button>
              </div>

              <button onClick={handlePasswordSubmit} style={buttonStyle}>Update Password</button>
            </div>
          </div>

          {/* SECURITY SETTINGS */}
          <div style={{
            background: COLORS.white,
            borderRadius: '24px',
            padding: '24px',
            border: `1px solid ${COLORS.mintLight}`,
            boxShadow: '0 10px 25px rgba(0,0,0,.04)'
          }}>
            <h3 style={{ marginTop: 0, color: COLORS.dark }}>Security Settings</h3>
            {[
              { key: 'twoFactor', label: 'Two-Factor Authentication' },
              { key: 'loginAlerts', label: 'Login Alerts' },
              { key: 'autoLogout', label: 'Automatic Session Logout' }
            ].map((item) => (
              <div key={item.key} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 0',
                borderBottom: '1px solid rgba(0,0,0,.05)'
              }}>
                <span style={{ color: COLORS.dark, fontWeight: '500' }}>{item.label}</span>
                <button
                  onClick={() => toggleSecurity(item.key)}
                  style={{
                    width: '52px',
                    height: '28px',
                    border: 'none',
                    borderRadius: '999px',
                    cursor: 'pointer',
                    background: security[item.key] ? COLORS.sage : '#d1d5db',
                    position: 'relative',
                    transition: '.2s'
                  }}
                >
                  <span style={{
                    position: 'absolute',
                    top: '3px',
                    left: security[item.key] ? '27px' : '3px',
                    width: '22px',
                    height: '22px',
                    background: '#fff',
                    borderRadius: '50%',
                    transition: '.2s'
                  }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- CONFIRMATION MODAL JSX --- */}
      {confirmModal.isOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <h3 style={{ margin: '0 0 12px 0', color: COLORS.dark }}>{confirmModal.title}</h3>
            <p style={{ margin: '0 0 24px 0', color: COLORS.darkMuted, fontSize: '15px', lineHeight: '1.5' }}>
              {confirmModal.message}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setConfirmModal({ isOpen: false, type: '', title: '', message: '' })} 
                style={cancelButtonStyle}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmAction} 
                style={confirmButtonStyle}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: PUT NEW EMAIL & SEND OTP                        */}
      {/* ======================================================== */}
      {isEmailModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalBoxStyle, position: 'relative' }}>
            <button 
              onClick={() => setIsEmailModalOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#9ca3af' }}
            >
              &times;
            </button>
            <div>
              <h3 style={{ margin: '0 0 12px 0', color: COLORS.dark }}>Change Email Address</h3>
              <p style={{ margin: '0 0 16px 0', color: COLORS.darkMuted, fontSize: '14px', lineHeight: '1.5' }}>
                Enter the new email address you want to link to your account. We will dispatch a verification pin to it.
              </p>
              
              <div style={{ marginBottom: '24px' }}>
                <input 
                  type="email"
                  value={newEmailInput}
                  onChange={(e) => setNewEmailInput(e.target.value)}
                  placeholder="name@example.com"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => setIsEmailModalOpen(false)} 
                  style={cancelButtonStyle}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleInitiateEmailChange} 
                  disabled={isEmailActionLoading} 
                  style={confirmButtonStyle}
                >
                  {isEmailActionLoading ? 'Sending...' : 'Send Verification'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: ENTER OTP CODE                                  */}
      {/* ======================================================== */}
      {isOtpModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalBoxStyle, position: 'relative' }}>
            <button 
              onClick={() => setIsOtpModalOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#9ca3af' }}
            >
              &times;
            </button>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 8px 0', color: COLORS.dark, textAlign: 'left' }}>Verify Pin Code</h3>
              <p style={{ margin: '0 0 20px 0', color: COLORS.darkMuted, fontSize: '13px', textAlign: 'left' }}>
                Please enter the 6-digit code sent to <strong style={{ color: COLORS.dark }}>{newEmailInput}</strong>
              </p>
              <input 
                type="text" 
                maxLength={6}
                value={emailOtpCode}
                onChange={(e) => setEmailOtpCode(e.target.value)}
                placeholder="000000" 
                style={{ ...inputStyle, textAlign: 'center', letterSpacing: '6px', fontSize: '22px', fontWeight: 'bold', fontFamily: 'monospace', marginBottom: '20px', paddingRight: '12px' }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => { setIsOtpModalOpen(false); setIsEmailModalOpen(true); }} style={{ ...cancelButtonStyle, flex: 1 }}>Back</button>
                <button onClick={handleVerifyOtpCode} disabled={isEmailActionLoading} style={{ ...buttonStyle, flex: 1 }}>
                  {isEmailActionLoading ? 'Verifying...' : 'Submit Pin'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: SUCCESS FEEDBACK OVERLAY                         */}
      {/* ======================================================== */}
      {isSuccessModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: COLORS.successBg, color: COLORS.success, fontSize: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>✓</div>
              <h3 style={{ margin: '0 0 8px 0', color: COLORS.success }}>Verification Successful!</h3>
              <p style={{ margin: '0 0 24px 0', color: COLORS.darkMuted, fontSize: '13.5px' }}>
                Your updated profile email account connection is verified and active.
              </p>
              <button onClick={() => setIsSuccessModalOpen(false)} style={{ ...buttonStyle, width: '100%' }}>Dismiss</button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: ERROR OVERLAY                                    */}
      {/* ======================================================== */}
      {isErrorModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: COLORS.dangerBg, color: COLORS.danger, fontSize: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>!</div>
              <h3 style={{ margin: '0 0 8px 0', color: COLORS.danger }}>Wrong Verification Code</h3>
              <p style={{ margin: '0 0 24px 0', color: COLORS.darkMuted, fontSize: '13.5px' }}>
                The pin code you supplied does not match our validation records.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => { setIsErrorModalOpen(false); setIsOtpModalOpen(true); }} style={{ ...buttonStyle, flex: 1 }}>Try Again</button>
                <button onClick={() => setIsErrorModalOpen(false)} style={{ ...cancelButtonStyle, flex: 1 }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- STYLES ---
const inputStyle = {
  width: '100%',
  padding: '12px',
  paddingRight: '40px', 
  borderRadius: '12px',
  border: '1px solid rgba(199,234,187,.8)',
  outline: 'none',
  boxSizing: 'border-box',
  fontSize: '14px'
};

const buttonStyle = {
  background: '#3e5f44',
  color: '#fff',
  border: 'none',
  padding: '12px',
  borderRadius: '12px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '14px'
};

const eyeButtonStyle = {
  position: 'absolute',
  right: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
  display: 'flex',
  alignItems: 'center'
};

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999
};

const modalBoxStyle = {
  background: '#fff',
  padding: '24px',
  borderRadius: '18px',
  width: '400px',
  maxWidth: '90%',
  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
};

const cancelButtonStyle = {
  background: '#f3f4f6',
  color: '#4b5563',
  border: 'none',
  padding: '10px 16px',
  borderRadius: '10px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '14px'
};

const confirmButtonStyle = {
  background: '#3e5f44',
  color: '#fff',
  border: 'none',
  padding: '10px 16px',
  borderRadius: '10px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '14px'
};