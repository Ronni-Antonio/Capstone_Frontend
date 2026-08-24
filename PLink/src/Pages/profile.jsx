import { useState, useEffect } from 'react';
import api from '../api'; // Import your Axios config instance cleanly!

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

  // --- MULTI-MODAL EMAIL & PASSWORD REWRITE FLOW STATES ---
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false); // First Modal: Put new email
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);     // Second Modal: Put code
  const [isNewPasswordModalOpen, setIsNewPasswordModalOpen] = useState(false); // Third Modal: Complex Password rewrite
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false); // Success Modal
  const [isPasswordSuccessModalOpen, setIsPasswordSuccessModalOpen] = useState(false); // Password Success Modal
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);     // Error Modal
  
  const [newEmailInput, setNewEmailInput] = useState('');
  const [emailOtpCode, setEmailOtpCode] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmNewPasswordInput, setConfirmNewPasswordInput] = useState('');
  const [showModalPass, setShowModalPass] = useState(false);
  const [showConfirmModalPass, setShowConfirmModalPass] = useState(false);
  const [isEmailActionLoading, setIsEmailActionLoading] = useState(false);

  const [password, setPassword] = useState({
    current: '',
    newPass: '',
    confirmPass: ''
  });

  const [security, setSecurity] = useState(() => {
    const savedSecurity = localStorage.getItem('plink_security');
    if (savedSecurity) {
      try {
        return JSON.parse(savedSecurity);
      } catch {
        // Fall back to defaults when saved JSON is invalid.
      }
    }

    return {
      twoFactor: true,
      loginAlerts: true,
      autoLogout: false
    };
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

  // Helper validation checks for password complexity strings
  const checkRules = (val) => {
    return {
      minLength: val.length >= 12,
      hasLower: /[a-z]/.test(val),
      hasUpper: /[A-Z]/.test(val),
      hasNumber: /[0-9]/.test(val),
      hasSpecial: /[^A-Za-z0-9]/.test(val)
    };
  };

  const rules = checkRules(newPasswordInput);
  const isPasswordValid = rules.minLength && rules.hasLower && rules.hasUpper && rules.hasNumber && rules.hasSpecial;
  
  // Password complexity rules for Change Password form
  const changePasswordRules = checkRules(password.newPass);
  const isChangePasswordValid = changePasswordRules.minLength && changePasswordRules.hasLower && changePasswordRules.hasUpper && changePasswordRules.hasNumber && changePasswordRules.hasSpecial;

  // Load User Data from Backend
  useEffect(() => {
    // API FIX: Use your centralized Axios config here
    api.get(`/users/${userId}`)
      .then((res) => {
        const data = res.data;
        const fetchedName = data.name || '';
        const fetchedEmail = data.email || '';
        
        // Save user ID to localStorage if not already there
        if (data.id && !localStorage.getItem('plink_user_id')) {
          localStorage.setItem('plink_user_id', data.id);
        }
        
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

    if (!isChangePasswordValid) {
      setMessageType('error');
      setMessage('Please satisfy all password complexity requirements.');
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
  
  const handleOpenEmailModal = () => {
    setNewEmailInput('');
    setEmailOtpCode('');
    setNewPasswordInput('');
    setConfirmNewPasswordInput('');
    setIsEmailModalOpen(true); 
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
      // API FIX: Use the api method we defined
      const response = await api.requestEmailChange(userId, newEmailInput);
      
      if (response.data.success) {
         // Helpful alert for local debugging without Mailtrap!
         if (response.data.debug_otp) {
           console.log("DEBUG GENERATED PIN (DEVELOPMENT ONLY):", response.data.debug_otp);
         }
         setIsEmailModalOpen(false); 
         setIsOtpModalOpen(true);    
      } else {
         alert(response.data.message || "Something went wrong.");
      }
    } catch (e) {
      console.error("API error:", e);
      console.error("Error response:", e.response);
      console.error("Error request:", e.request);
      const backendMessage = e.response?.data?.message || "Failed to communicate with authorization server.";
      alert(backendMessage);
    } finally {
      setIsEmailActionLoading(false);
    }
  };

  // Modal 2 Submit Action: Validate Pin and forward to password entry view
  const handleVerifyOtpCode = () => {
    if (!emailOtpCode.trim()) {
      alert("Please enter the verification code.");
      return;
    }
    // Proceed directly to collect new password string block layout
    setIsOtpModalOpen(false);
    setIsNewPasswordModalOpen(true);
  };

  // Modal 3 Final Submit Action: Commit changes to backend and clear session token references
  const handleFinalizeEmailAndPasswordUpdate = async () => {
    if (!isPasswordValid) {
      alert("Please satisfy all password complexity rules before saving layout changes.");
      return;
    }
    if (newPasswordInput !== confirmNewPasswordInput) {
      alert("Passwords do not match.");
      return;
    }

    setIsEmailActionLoading(true);
    try {
      // API FIX: Use the api method we defined
      const response = await api.verifyEmailChange(userId, { 
        email: newEmailInput,
        code: emailOtpCode,
        newPassword: newPasswordInput
      });
      
      setIsNewPasswordModalOpen(false); 
      if (response.data.success) {
        setIsSuccessModalOpen(true); 
      } else {
        setIsErrorModalOpen(true); 
      }
    } catch (e) {
      console.error("Verification error:", e);
      console.error("Verification error response:", e.response);
      setIsNewPasswordModalOpen(false);
      setIsErrorModalOpen(true);
    } finally {
      setIsEmailActionLoading(false);
    }
  };

  // Flush variables and route window directly out to clean login page layout view
  const triggerLogoutRoutingFallback = () => {
      // Update the profile email and original email in state
      setProfile(prev => ({ ...prev, email: newEmailInput }));
      setOriginalEmail(newEmailInput);
      setIsSuccessModalOpen(false);
      localStorage.clear();
      window.location.href = '/login';
  };

  // Actual Profile Update API call
  const saveProfile = async () => {
    try {
      const response = await api.put(`/users/${userId}`, {
        fullname: profile.fullName, 
        email: originalEmail, 
        phone: profile.phone,
        school: profile.school,
        role: profile.role
      });

      if (response.data.success) {
        setMessageType('success');
        setMessage(response.data.message || 'Profile updated successfully.');
        localStorage.setItem('plink_user_name', profile.fullName);
        window.dispatchEvent(new Event('storage'));
      } else {
        setMessageType('error');
        setMessage(response.data.message || 'Failed to update profile.');
      }
    } catch{
      setMessageType('error');
      setMessage('Server communication error.');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  // Flush variables and route window directly out to clean login page layout view for password change
  const triggerPasswordChangeLogout = () => {
    setPassword({ current: '', newPass: '', confirmPass: '' });
    setIsPasswordSuccessModalOpen(false);
    localStorage.clear();
    window.location.href = '/login';
  };

  // Actual Password Update API call
  const executePasswordUpdate = async () => {
    try {
      const response = await api.changePassword(userId, {
        current: password.current,
        newPass: password.newPass,
        newPass_confirmation: password.confirmPass
      });

      if (response.data.success) {
        setPassword({ current: '', newPass: '', confirmPass: '' });
        setMessage('');
        setIsPasswordSuccessModalOpen(true);
      } else {
        setMessage(response.data.message || 'Error updating password.');
        setMessageType('error');
      }
    } catch (error) {
      console.error("Password change error:", error);
      // Handle Laravel validation errors (422)
      if (error.response && error.response.status === 422) {
        const validationErrors = error.response.data.errors;
        const errorMessages = Object.values(validationErrors).flat().join(' ');
        setMessage(errorMessages || 'Validation error. Please check your inputs.');
      } else if (error.response && error.response.data && error.response.data.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage('Server error changing password.');
      }
      setMessageType('error');
    }
  };

  const toggleSecurity = (setting) => {
    const updated = {
      ...security,
      [setting]: !security[setting]
    };
    setSecurity(updated);
    localStorage.setItem('plink_security', JSON.stringify(updated));
  };

  // Pre-compiled style layouts for component layout rendering setup logic
  const cancelButtonStyle = { padding: '10px 16px', borderRadius: '12px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontWeight: '500', fontSize: '14px' };
  const confirmButtonStyle = { ...buttonStyle, background: COLORS.dark };

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

              {/* Password complexity and match indication */}
              <div style={{ background: '#f9fafb', padding: '14px', borderRadius: '12px', marginTop: '12px', marginBottom: '12px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid #e5e7eb' }}>
                <div style={{ fontWeight: '600', color: COLORS.dark, marginBottom: '2px' }}>Password complexity requirements:</div>
                <div style={{ color: changePasswordRules.minLength ? COLORS.success : '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{changePasswordRules.minLength ? '✓' : '○'}</span> Has Minimum of 12 characters
                </div>
                <div style={{ color: changePasswordRules.hasLower ? COLORS.success : '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{changePasswordRules.hasLower ? '✓' : '○'}</span> Has At least one small character
                </div>
                <div style={{ color: changePasswordRules.hasUpper ? COLORS.success : '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{changePasswordRules.hasUpper ? '✓' : '○'}</span> Has At least one capital character
                </div>
                <div style={{ color: changePasswordRules.hasNumber ? COLORS.success : '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{changePasswordRules.hasNumber ? '✓' : '○'}</span> Has At least one number
                </div>
                <div style={{ color: changePasswordRules.hasSpecial ? COLORS.success : '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{changePasswordRules.hasSpecial ? '✓' : '○'}</span> Has Special characters
                </div>
                <div style={{ color: (password.newPass === password.confirmPass && password.newPass.length > 0) ? COLORS.success : '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{(password.newPass === password.confirmPass && password.newPass.length > 0) ? '✓' : '○'}</span> Passwords match
                </div>
              </div>

              <button 
                onClick={handlePasswordSubmit} 
                style={{ 
                  ...buttonStyle, 
                  opacity: isChangePasswordValid && (password.newPass === password.confirmPass) ? 1 : 0.5,
                  cursor: isChangePasswordValid && (password.newPass === password.confirmPass) ? 'pointer' : 'not-allowed'
                }} 
                disabled={!isChangePasswordValid || (password.newPass !== password.confirmPass)}
              >
                Update Password
              </button>
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

      {/* MODAL 1: PUT NEW EMAIL & SEND OTP */}
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

      {/* MODAL 2: ENTER OTP CODE */}
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
                <button onClick={handleVerifyOtpCode} style={{ ...buttonStyle, flex: 1 }}>
                  Next Section
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: COMPLEX PASSWORD CREATION LAYOUT CHECKLISTER */}
      {isNewPasswordModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalBoxStyle, position: 'relative' }}>
            <button 
              onClick={() => setIsNewPasswordModalOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#9ca3af' }}
            >
              &times;
            </button>
            <div>
              <h3 style={{ margin: '0 0 12px 0', color: COLORS.dark }}>Set New Security Password</h3>
              <p style={{ margin: '0 0 16px 0', color: COLORS.darkMuted, fontSize: '13.5px', lineHeight: '1.4' }}>
                Create a complex password to protect your updated user account profile settings.
              </p>

              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <input 
                  type={showModalPass ? "text" : "password"}
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Enter 12+ char secure password"
                  style={inputStyle}
                />
                <button 
                  type="button" 
                  onClick={() => setShowModalPass(!showModalPass)} 
                  style={eyeButtonStyle}
                >
                  <i className={`fa-solid ${showModalPass ? 'fa-eye-slash' : 'fa-eye'}`} style={{ color: COLORS.dark }}></i>
                </button>
              </div>

              <div style={{ position: 'relative', marginBottom: '18px' }}>
                <input 
                  type={showConfirmModalPass ? "text" : "password"}
                  value={confirmNewPasswordInput}
                  onChange={(e) => setConfirmNewPasswordInput(e.target.value)}
                  placeholder="Confirm new password"
                  style={inputStyle}
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmModalPass(!showConfirmModalPass)} 
                  style={eyeButtonStyle}
                >
                  <i className={`fa-solid ${showConfirmModalPass ? 'fa-eye-slash' : 'fa-eye'}`} style={{ color: COLORS.dark }}></i>
                </button>
              </div>

              <div style={{ background: '#f9fafb', padding: '14px', borderRadius: '12px', marginBottom: '20px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid #e5e7eb' }}>
                <div style={{ fontWeight: '600', color: COLORS.dark, marginBottom: '2px' }}>Password complexity requirements:</div>
                <div style={{ color: rules.minLength ? COLORS.success : '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{rules.minLength ? '✓' : '○'}</span> Has Minimum of 12 characters
                </div>
                <div style={{ color: rules.hasLower ? COLORS.success : '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{rules.hasLower ? '✓' : '○'}</span> Has At least one small character
                </div>
                <div style={{ color: rules.hasUpper ? COLORS.success : '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{rules.hasUpper ? '✓' : '○'}</span> Has At least one capital character
                </div>
                <div style={{ color: rules.hasNumber ? COLORS.success : '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{rules.hasNumber ? '✓' : '○'}</span> Has At least one number
                </div>
                <div style={{ color: rules.hasSpecial ? COLORS.success : '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{rules.hasSpecial ? '✓' : '○'}</span> Has Special characters
                </div>
                <div style={{ color: (newPasswordInput === confirmNewPasswordInput && newPasswordInput.length > 0) ? COLORS.success : '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{(newPasswordInput === confirmNewPasswordInput && newPasswordInput.length > 0) ? '✓' : '○'}</span> Passwords match
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => { setIsNewPasswordModalOpen(false); setIsOtpModalOpen(true); }} 
                  style={cancelButtonStyle}
                >
                  Back
                </button>
                <button 
                  onClick={handleFinalizeEmailAndPasswordUpdate}
                  disabled={!isPasswordValid || (newPasswordInput !== confirmNewPasswordInput) || isEmailActionLoading}
                  style={{ 
                    ...confirmButtonStyle, 
                    opacity: isPasswordValid && (newPasswordInput === confirmNewPasswordInput) && !isEmailActionLoading ? 1 : 0.5,
                    cursor: isPasswordValid && (newPasswordInput === confirmNewPasswordInput) && !isEmailActionLoading ? 'pointer' : 'not-allowed'
                  }}
                >
                  {isEmailActionLoading ? 'Saving changes...' : 'Save Configuration'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: SUCCESS FEEDBACK OVERLAY */}
      {isSuccessModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: COLORS.successBg, color: COLORS.success, fontSize: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>✓</div>
              <h3 style={{ margin: '0 0 8px 0', color: COLORS.success }}>Successfully Changed!</h3>
              <p style={{ margin: '0 0 24px 0', color: COLORS.darkMuted, fontSize: '13.5px', lineHeight: '1.4' }}>
                Your updated profile email and security authentication layers have been committed. Redirecting to login context...
              </p>
              <button onClick={triggerLogoutRoutingFallback} style={{ ...buttonStyle, width: '100%' }}>Proceed to Login</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: ERROR OVERLAY */}
      {isErrorModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: COLORS.dangerBg, color: COLORS.danger, fontSize: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>!</div>
              <h3 style={{ margin: '0 0 8px 0', color: COLORS.danger }}>Operation Failed</h3>
              <p style={{ margin: '0 0 24px 0', color: COLORS.darkMuted, fontSize: '13.5px' }}>
                The pin code parameter supplied was rejected or expired during execution.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => { setIsErrorModalOpen(false); setIsOtpModalOpen(true); }} style={{ ...buttonStyle, flex: 1 }}>Try Again</button>
                <button onClick={() => setIsErrorModalOpen(false)} style={{ ...cancelButtonStyle, flex: 1 }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: PASSWORD CHANGE SUCCESS OVERLAY */}
      {isPasswordSuccessModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: COLORS.successBg, color: COLORS.success, fontSize: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>✓</div>
              <h3 style={{ margin: '0 0 8px 0', color: COLORS.success }}>Password Changed Successfully!</h3>
              <p style={{ margin: '0 0 24px 0', color: COLORS.darkMuted, fontSize: '13.5px', lineHeight: '1.4' }}>
                Your password has been updated successfully. Please log in again with your new password.
              </p>
              <button onClick={triggerPasswordChangeLogout} style={{ ...buttonStyle, width: '100%' }}>Proceed to Login</button>
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
  zIndex: 1000
};

const modalBoxStyle = {
  background: '#fff',
  padding: '32px',
  borderRadius: '24px',
  width: '100%',
  maxWidth: '440px',
  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
  boxSizing: 'border-box'
};
