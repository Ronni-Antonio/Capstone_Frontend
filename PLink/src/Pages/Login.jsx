import React, { useState } from 'react'
import { motion, AnimatePresence } from "motion/react"
import {
  LeafIcon,
  RecycleIcon,
  EyeIcon,
  EyeOffIcon,
  MailIcon,
  LockIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TreesIcon,
  SproutIcon,
  ArrowRightIcon,
  CheckIcon,
  XIcon,
} from 'lucide-react'

// Internal CSS variables mapping matching the green/eco palette design system
const ecoStyles = `
  :root {
    --eco-ivory: #fcfdf7;
    --eco-light: #e8f5bd;
    --eco-lime: #c7eabb;
    --eco-mint: #a2cb8b;
    --eco-sage: #84b179;
    --eco-dark: #3e5f44;
  }

  .login-container {
    min-height: 100vh;
    width: 100%;
    background-color: var(--eco-ivory) !important;
    color: #3e5f44 !important;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    position: relative;
    overflow: hidden;
    font-family: system-ui, -apple-system, sans-serif !important;
    box-sizing: border-box;
  }

  .login-container * {
    box-sizing: border-box;
  }

  @media (min-width: 1024px) {
    .login-container { padding: 2rem; }
  }

  .main-card {
    position: relative;
    width: 100%;
    max-w: 72rem;
    background: rgba(255, 255, 255, 0.8) !important;
    backdrop-filter: blur(24px);
    border-radius: 2.5rem;
    box-shadow: 0 25px 50px -12px rgba(62, 95, 68, 0.15) !important;
    border: 1px solid rgba(162, 203, 139, 0.4);
    overflow: hidden;
    display: grid;
    z-index: 10;
  }

  @media (min-width: 1024px) {
    .main-card { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }

  /* Left Panel Styles */
  .left-panel {
    position: relative;
    padding: 2.5rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 560px;
    background-color: var(--eco-dark) !important;
    color: #ffffff !important;
    overflow: hidden;
  }

  @media (min-width: 1024px) {
    .left-panel { padding: 3rem; }
  }

  .logo-area {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .logo-box {
    width: 3rem;
    height: 3rem;
    border-radius: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(199, 234, 187, 0.2);
    backdrop-filter: blur(4px);
  }

  .login-container h2.tagline-h2 {
    font-size: 1.5rem !important;
    font-weight: 700 !important;
    line-height: 1.25 !important;
    color: #ffffff !important;
    margin: 0 !important;
    letter-spacing: normal !important;
  }

  @media (min-width: 1024px) {
    .login-container h2.tagline-h2 { font-size: 1.875rem !important; }
  }

  .login-container p.tagline-p {
    font-size: 0.875rem !important;
    margin-top: 0.5rem !important;
    color: rgba(162, 203, 139, 0.9) !important;
    line-height: 1.5 !important;
  }

  .pill-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 1.25rem;
  }

  .pill {
    inline-size: max-content;
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(4px);
    color: var(--eco-mint) !important;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  /* Right Form Area */
  .right-panel {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: rgba(255, 255, 255, 0.6) !important;
    backdrop-filter: blur(24px);
  }

  @media (min-width: 1024px) {
    .right-panel { padding: 3rem; }
  }

  .form-wrapper {
    max-w: 24rem;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
  }

  .welcome-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--eco-sage);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
  }

  .login-container h1.title-h1 {
    font-size: 1.875rem !important;
    font-weight: 700 !important;
    color: var(--eco-dark) !important;
    line-height: 1.25 !important;
    margin: 0 !important;
    letter-spacing: normal !important;
  }

  @media (min-width: 1024px) {
    .login-container h1.title-h1 { font-size: 2.25rem !important; }
  }

  .login-container p.sub-p {
    font-size: 0.875rem !important;
    color: rgba(62, 95, 68, 0.6) !important;
    margin-top: 0.5rem !important;
    line-height: 1.5 !important;
  }

  .demo-btn {
    font-size: 11px;
    font-weight: 600;
    background-color: rgba(199, 234, 187, 0.6);
    color: var(--eco-dark);
    border: none;
    padding: 0.375rem 0.75rem;
    border-radius: 9999px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  .demo-btn:hover { background-color: var(--eco-mint); }

  .input-group-label {
    display: block;
    cursor: pointer;
  }

  .input-span {
    display: block;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--eco-dark);
    margin-bottom: 0.375rem;
  }

  .input-field-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: var(--eco-ivory) !important;
    border: 1px solid rgba(162, 203, 139, 0.5);
    border-radius: 0.75rem;
    padding: 0.625rem 0.875rem;
    transition: border-color 0.2s;
  }
  .input-field-container:focus-within { border-color: var(--eco-sage); }

  .custom-input {
    background: transparent !important;
    border: none !important;
    outline: none !important;
    font-size: 0.875rem !important;
    color: var(--eco-dark) !important;
    flex: 1;
    min-width: 0;
    padding: 0 !important;
    box-shadow: none !important;
  }
  .custom-input::placeholder { color: rgba(62, 95, 68, 0.4) !important; }

  .eye-toggle-btn {
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 0.5rem;
    border: none;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(62, 95, 68, 0.6);
    cursor: pointer;
    transition: background-color 0.2s;
  }
  .eye-toggle-btn:hover { background-color: rgba(162, 203, 139, 0.6); }

  .row-flex {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 0.25rem;
  }

  .check-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    user-select: none;
  }

  .checkbox-btn {
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 0.375rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
    border: none;
    cursor: pointer;
  }

  .text-link {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--eco-sage) !important;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: color 0.2s;
  }
  .text-link:hover { color: var(--eco-dark) !important; }

  .submit-btn {
    width: 100%;
    margin-top: 0.5rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background-color: var(--eco-dark) !important;
    color: #ffffff !important;
    border-radius: 1rem;
    font-weight: 600;
    font-size: 0.875rem;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 6px -1px rgba(62, 95, 68, 0.1);
  }
  .submit-btn:hover:not(:disabled) {
    background-color: var(--eco-sage) !important;
    box-shadow: 0 10px 15px -3px rgba(62, 95, 68, 0.2);
  }
  .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid rgba(255, 255, 255, 0.4);
    border-top-color: #ffffff;
    border-radius: 9999px;
    animation: spin 1s linear infinite;
  }

  .info-banner {
    margin-top: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background-color: rgba(199, 234, 187, 0.4);
    border-radius: 0.75rem;
  }

  /* Modals Layout */
  .modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 50;
    background-color: rgba(62, 95, 68, 0.4);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .modal-card {
    background-color: #ffffff !important;
    border-radius: 1.5rem;
    padding: 1.75rem;
    max-w: 24rem;
    width: 100%;
    box-shadow: 0 25px 50px -12px rgba(62, 95, 68, 0.15);
    position: relative;
  }

  .modal-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 2rem;
    height: 2rem;
    border-radius: 0.5rem;
    border: none;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--eco-dark);
    cursor: pointer;
    transition: background-color 0.2s;
  }
  .modal-close:hover { background-color: var(--eco-lime); }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`

export default function Login({ onLogin }) {

  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Forgot password state
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotStep, setForgotStep] = useState('input')
  const [forgotEmail, setForgotEmail] = useState('')
  const [countdown, setCountdown] = useState(30)

 const handleSubmit = (e) => {
  e.preventDefault();
  setLoading(true);

  setTimeout(() => {
    setLoading(false);
    localStorage.setItem('plink_role', 'admin');

    onLogin(); // Go to dashboard
  }, 700);
  }

  const handleForgotSubmit = (e) => {
    e.preventDefault()
    if (!forgotEmail) return
    setForgotStep('sent')
    setCountdown(30)
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer)
          return 0
        }
        return c - 1
      })
    }, 1000)
  }

  return (
    <div className="login-container">
      {/* Injecting Styles Electronically */}
      <style dangerouslySetInnerHTML={{ __html: ecoStyles }} />

      <FloatingShapes />

      <div className="main-card">
        {/* LEFT — Illustration panel */}
        <div className="left-panel">
          <DecorPattern />

          {/* Logo */}
          <div className="logo-area">
            <div className="logo-box">
              <LeafIcon style={{ width: '1.5rem', height: '1.5rem', color: 'var(--eco-mint)' }} />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '1.5rem', lineHeight: '1.25', color: '#ffffff' }}>
                Plink
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(162, 203, 139, 0.8)' }}>
                Smart Eco Recycling
              </div>
            </div>
          </div>

          {/* Illustration */}
          <div style={{ position: 'relative', margin: '2rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PlinkIllustration />
          </div>

          {/* Tagline + pills */}
          <div style={{ position: 'relative' }}>
            <h2 className="tagline-h2">
              The admin console for <br />
              smarter school recycling. 🌱
            </h2>
            <p className="tagline-p">
              Monitor machines, manage student records, and analyze recycling
              performance — all from one administrator command center.
            </p>

            <div className="pill-container">
              {[
                { icon: ShieldCheckIcon, label: 'Secure access' },
                { icon: SparklesIcon, label: 'AI detection' },
                { icon: RecycleIcon, label: 'Live analytics' },
                { icon: TreesIcon, label: 'Eco-friendly' },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="pill">
                  <Icon style={{ width: '0.875rem', height: '0.875rem' }} />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — Form */}
        <div className="right-panel">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="form-wrapper"
          >
            <div className="welcome-badge">
              <SproutIcon style={{ width: '0.875rem', height: '0.875rem' }} />
              Welcome to Plink
            </div>
            <h1 className="title-h1">Admin sign in</h1>
            <p className="sub-p">
              Enter your administrator credentials to access the Plink management console.
            </p>

            {/* Demo Credentials */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@plink.ph')
                  setPassword('admin123')
                }}
                className="demo-btn"
              >
              Use the Admin Demo
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Field
                label="Email or Username"
                icon={MailIcon}
                type="text"
                value={email}
                onChange={setEmail}
                placeholder="you@plinkschool.ph"
              />

              <div>
                <label className="input-group-label">
                  <span className="input-span">Password</span>
                  <div className="input-field-container">
                    <LockIcon style={{ width: '1rem', height: '1rem', color: 'rgba(62, 95, 68, 0.5)', flexShrink: 0 }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="custom-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="eye-toggle-btn"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOffIcon style={{ width: '1rem', height: '1rem' }} />
                      ) : (
                        <EyeIcon style={{ width: '1rem', height: '1rem' }} />
                      )}
                    </button>
                  </div>
                </label>
              </div>

              <div className="row-flex">
                <label className="check-wrapper">
                  <button
                    type="button"
                    onClick={() => setRemember(!remember)}
                    role="checkbox"
                    aria-checked={remember}
                    className="checkbox-btn"
                    style={{ backgroundColor: remember ? 'var(--eco-dark)' : 'var(--eco-ivory)', border: remember ? 'none' : '1px solid rgba(162, 203, 139, 0.6)' }}
                  >
                    {remember && (
                      <CheckIcon
                        style={{ width: '0.75rem', height: '0.75rem', color: '#ffffff' }}
                        strokeWidth={3}
                      />
                    )}
                  </button>
                  <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'rgba(62, 95, 68, 0.8)' }}>
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(true)
                    setForgotStep('input')
                    setForgotEmail(email)
                  }}
                  className="text-link"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || !email || !password}
                className="submit-btn"
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    Logging in…
                  </>
                ) : (
                  <>
                    Login
                    <ArrowRightIcon style={{ width: '1rem', height: '1rem' }} />
                  </>
                )}
              </button>
            </form>

            <div className="info-banner">
              <ShieldCheckIcon style={{ width: '1rem', height: '1rem', color: 'var(--eco-dark)', flexShrink: 0 }} />
              <p style={{ fontSize: '11px', color: 'rgba(62, 95, 68, 0.8)', margin: 0, lineHeight: '1.25' }}>
                Administrator access only. This console is restricted to authorized school staff.
              </p>
            </div>

            <p style={{ fontSize: '0.75rem', color: 'rgba(62, 95, 68, 0.6)', textAlign: 'center', marginTop: '1.25rem', margin: '1.25rem 0 0 0' }}>
              Don't have an account?{' '}
              <button className="text-link" style={{ padding: 0, fontSize: '0.75rem' }}>
                Contact your school administrator
              </button>
            </p>

            <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(162, 203, 139, 0.4)', textAlign: 'center' }}>
              <p style={{ fontSize: '11px', color: 'rgba(62, 95, 68, 0.5)', margin: 0 }}>
                © 2026 Plink Smart Eco Recycling · Greenfield Elementary School
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setShowForgotModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setShowForgotModal(false)} className="modal-close">
                <XIcon style={{ width: '1rem', height: '1rem' }} />
              </button>

              {forgotStep === 'input' ? (
                <div>
                  <div style={{ width: '3rem', height: '3rem', borderRadius: '1rem', backgroundColor: 'rgba(199, 234, 187, 0.4)', marginBottom: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <LockIcon style={{ width: '1.5rem', height: '1.5rem', color: 'var(--eco-dark)' }} />
                  </div>
                  <h3 style={{ fontFamily: 'inherit', fontWeight: '700', color: 'var(--eco-dark)', fontSize: '1.25rem', margin: '0 0 0.25rem 0' }}>
                    Reset Password
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'rgba(62, 95, 68, 0.6)', marginTop: '0.25rem', marginBottom: '1.25rem', lineHeight: '1.4' }}>
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                  <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Field
                      label="Email Address"
                      icon={MailIcon}
                      type="email"
                      value={forgotEmail}
                      onChange={setForgotEmail}
                      placeholder="you@plinkschool.ph"
                    />
                    <button
                      type="submit"
                      disabled={!forgotEmail}
                      className="submit-btn"
                      style={{ padding: '0.625rem' }}
                    >
                      Send reset link
                    </button>
                  </form>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <div style={{ width: '4rem', height: '4rem', borderRadius: '9999px', backgroundColor: 'rgba(162, 203, 139, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto', marginRight: 'auto', marginBottom: '1rem' }}>
                    <MailIcon style={{ width: '2rem', height: '2rem', color: 'var(--eco-dark)' }} />
                  </div>
                  <h3 style={{ fontWeight: '700', color: 'var(--eco-dark)', fontSize: '1.25rem', margin: 0 }}>
                    Check your email
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'rgba(62, 95, 68, 0.6)', marginTop: '0.5rem', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                    We've sent a password reset link to <br />
                    <span style={{ fontWeight: '600', color: 'var(--eco-dark)' }}>{forgotEmail}</span>
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button
                      disabled={countdown > 0}
                      onClick={() => setCountdown(30)}
                      className="submit-btn"
                      style={{ backgroundColor: 'rgba(199, 234, 187, 0.6)', color: 'var(--eco-dark)', padding: '0.625rem' }}
                    >
                      {countdown > 0 ? `Resend in ${countdown}s` : 'Resend email'}
                    </button>
                    <button
                      onClick={() => setShowForgotModal(false)}
                      className="text-link"
                    >
                      Back to login
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Field({ label, icon: Icon, type, value, onChange, placeholder }) {
  return (
    <label className="input-group-label">
      <span className="input-span">{label}</span>
      <div className="input-field-container">
        <Icon style={{ width: '1rem', height: '1rem', color: 'rgba(62, 95, 68, 0.5)', flexShrink: 0 }} />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="custom-input"
        />
      </div>
    </label>
  )
}

function FloatingShapes() {
  const shapeStyles = {
    shape0: { top: '2.5rem', left: '-2.5rem', color: 'rgba(162, 203, 139, 0.3)', width: '8rem', height: '8rem' },
    shape1: { bottom: '4rem', left: '5rem', color: 'rgba(232, 245, 189, 0.4)', width: '6rem', height: '6rem' },
    shape2: { top: '33.333%', right: '2.5rem', color: 'rgba(132, 177, 121, 0.25)', width: '7rem', height: '7rem' },
    shape3: { bottom: '2.5rem', right: '25%', color: 'rgba(162, 203, 139, 0.4)', width: '5rem', height: '5rem' },
    shape4: { top: '5rem', right: '33.333%', color: 'rgba(232, 245, 189, 0.3)', width: '6rem', height: '6rem' },
  }

  const shapes = [
    { Icon: LeafIcon, styleId: 'shape0', delay: 0, rot: -20 },
    { Icon: SproutIcon, styleId: 'shape1', delay: 0.5, rot: 15 },
    { Icon: RecycleIcon, styleId: 'shape2', delay: 1, rot: 30 },
    { Icon: LeafIcon, styleId: 'shape3', delay: 1.5, rot: 60 },
    { Icon: TreesIcon, styleId: 'shape4', delay: 0.8, rot: -10 },
  ]

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }} aria-hidden="true">
      {shapes.map((s, i) => {
        const { Icon } = s
        const targetStyle = shapeStyles[s.styleId]
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              y: [0, -12, 0],
              rotate: [s.rot, s.rot + 8, s.rot],
            }}
            transition={{
              opacity: { duration: 0.8, delay: s.delay },
              y: { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: s.delay },
              rotate: { duration: 8, repeat: Infinity, ease: 'easeInOut', delay: s.delay },
            }}
            style={{ position: 'absolute', ...targetStyle }}
          >
            <Icon style={{ width: '100%', height: '100%', color: targetStyle.color }} />
          </motion.div>
        )
      })}
    </div>
  )
}

function DecorPattern() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }} aria-hidden="true">
      <LeafIcon style={{ position: 'absolute', top: '-1.5rem', right: '-1.5rem', width: '10rem', height: '10rem', color: 'rgba(132, 177, 121, 0.15)' }} />
      <LeafIcon style={{ position: 'absolute', bottom: '-2.5rem', left: '-2.5rem', width: '13rem', height: '13rem', transform: 'rotate(45deg)', color: 'rgba(132, 177, 121, 0.1)' }} />
      <SproutIcon style={{ position: 'absolute', top: '50%', right: '2rem', width: '4rem', height: '4rem', color: 'rgba(162, 203, 139, 0.15)' }} />
    </div>
  )
}

function PlinkIllustration() {
  return (
    <motion.svg
      viewBox="0 0 360 280"
      style={{ width: '100%', maxWidth: '24rem' }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <ellipse cx="180" cy="255" rx="130" ry="10" fill="#000" opacity="0.15" />
      <motion.g
        initial={{ y: -8 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <rect x="110" y="80" width="140" height="160" rx="22" fill="#84b179" />
        <rect x="110" y="80" width="140" height="160" rx="22" fill="url(#binShade)" opacity="0.25" />
        <rect x="100" y="62" width="160" height="26" rx="13" fill="#3e5f44" />
        <circle cx="180" cy="75" r="4" fill="#c7eabb" />

        <rect x="130" y="105" width="100" height="60" rx="10" fill="#3e5f44" />
        <rect x="138" y="112" width="60" height="6" rx="3" fill="#c7eabb" />
        <rect x="138" y="124" width="80" height="6" rx="3" fill="#84b179" />
        <rect x="138" y="136" width="40" height="6" rx="3" fill="#84b179" />
        <circle cx="215" cy="155" r="5" fill="#a2cb8b">
          <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
        </circle>

        <rect x="140" y="180" width="80" height="14" rx="7" fill="#3e5f44" />

        <g transform="translate(160, 205)">
          <circle cx="20" cy="20" r="18" fill="#e8f5bd" />
          <path d="M20 8 L26 16 L23 16 L23 22 L17 22 L17 16 L14 16 Z" fill="#3e5f44" transform="rotate(120 20 20)" />
          <path d="M20 8 L26 16 L23 16 L23 22 L17 22 L17 16 L14 16 Z" fill="#3e5f44" transform="rotate(240 20 20)" />
          <path d="M20 8 L26 16 L23 16 L23 22 L17 22 L17 16 L14 16 Z" fill="#3e5f44" />
        </g>
      </motion.g>

      <motion.g
        animate={{ y: [0, -8, 0], rotate: [-8, -2, -8] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '60px 100px' }}
      >
        <rect x="45" y="80" width="30" height="50" rx="8" fill="#c7eabb" />
        <rect x="50" y="68" width="20" height="14" rx="4" fill="#84b179" />
        <rect x="48" y="92" width="24" height="10" rx="2" fill="#e8f5bd" opacity="0.7" />
      </motion.g>

      <motion.g animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>
        <circle cx="290" cy="100" r="3" fill="#a2cb8b" />
        <circle cx="305" cy="130" r="2" fill="#c7eabb" />
        <circle cx="295" cy="160" r="2.5" fill="#84b179" />
      </motion.g>

      <motion.g
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <rect x="275" y="200" width="14" height="30" rx="3" fill="#a2cb8b" />
        <rect x="293" y="185" width="14" height="45" rx="3" fill="#84b179" />
        <rect x="311" y="170" width="14" height="60" rx="3" fill="#e8f5bd" />
      </motion.g>

      <defs>
        <linearGradient id="binShade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="1" />
        </linearGradient>
      </defs>
    </motion.svg>
  )
}