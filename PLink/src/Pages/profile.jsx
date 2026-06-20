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
  // Grab user id from local storage (defaults to 1 if not set yet)
  const userId = localStorage.getItem('plink_user_id') || 1; 

  const [profile, setProfile] = useState({
    fullName: '',
    role: '',
    email: '',
    phone: '',
    school: ''
  });

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

  // Load User Data from Backend
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/users/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load user info');
        return res.json();
      })
      .then((data) => {
        const fetchedName = data.name || '';
        setProfile({
          fullName: fetchedName, 
          role: data.role || 'Eco Coordinator',
          email: data.email || '',
          phone: data.phone || '',
          school: data.school || ''
        });

        // Sync to storage on initial load if needed
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

  // Save Profile Info Updates
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
          email: profile.email,
          phone: profile.phone,
          school: profile.school,
          role: profile.role
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessageType('success');
        setMessage(data.message || 'Profile updated successfully.');
        
        // --- SYNCS NEW NAME TO STORAGE AND ALERTS SIDEBAR ---
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

  // Change Password Updates
  const updatePassword = async () => {
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
            <input
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              placeholder="Email"
              style={inputStyle}
            />
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
            <button onClick={saveProfile} style={buttonStyle}>Save Changes</button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            background: COLORS.white,
            borderRadius: '24px',
            padding: '24px',
            border: `1px solid ${COLORS.mintLight}`,
            boxShadow: '0 10px 25px rgba(0,0,0,.04)'
          }}>
            <h3 style={{ marginTop: 0, color: COLORS.dark }}>Change Password</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input
                type="password"
                placeholder="Current Password"
                value={password.current}
                onChange={(e) => setPassword({ ...password, current: e.target.value })}
                style={inputStyle}
              />
              <input
                type="password"
                placeholder="New Password"
                value={password.newPass}
                onChange={(e) => setPassword({ ...password, newPass: e.target.value })}
                style={inputStyle}
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={password.confirmPass}
                onChange={(e) => setPassword({ ...password, confirmPass: e.target.value })}
                style={inputStyle}
              />
              <button onClick={updatePassword} style={buttonStyle}>Update Password</button>
            </div>
          </div>

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
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px',
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