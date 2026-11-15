import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, X, CheckCircle2 } from 'lucide-react';

export default function AuthModal({ isOpen, initialMode = 'login', onClose }) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2000);
    }, 900);
  };

  const handleSocialAuth = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1800);
    }, 800);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '40px 10px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(37,99,235,0.2)', border: '2px solid #3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', color: '#60a5fa' }}>
              <CheckCircle2 size={36} />
            </div>
            <h3 style={{ fontSize: '1.6rem', color: '#fff', marginBottom: '8px' }}>
              {mode === 'login' ? 'Welcome Back!' : 'Account Created!'}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.94rem' }}>
              {mode === 'login' 
                ? `Logged in as ${email || 'linq-user'}. Syncing your collections...` 
                : 'Welcome to LinQ. Your 14-day Pro trial is active!'}
            </p>
          </div>
        ) : (
          <>
            {/* Header Mirroring App Screenshot 3 */}
            <div className="auth-header">
              <div className="auth-logo-badge">
                <img src="/assets/linq-icon.png" alt="LinQ" />
                <span className="logo-text" style={{ fontSize: '1.8rem' }}>
                  Lin<span className="blue-q">Q</span>
                </span>
              </div>
              <h2 className="auth-title">
                {mode === 'login' ? 'Welcome back' : 'Create your account'}
              </h2>
              <p className="auth-subtitle">
                {mode === 'login' ? 'Log in to continue to LinQ' : 'Join 150,000+ visual thinkers and curators'}
              </p>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-input-group">
                <Mail className="auth-input-icon" size={18} />
                <input 
                  type="email" 
                  className="auth-input" 
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="auth-input-group">
                <Lock className="auth-input-icon" size={18} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  className="auth-input" 
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {mode === 'login' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <a href="#forgot" className="auth-forgot-link" onClick={(e) => { e.preventDefault(); alert('A password reset link has been sent to your email.'); }}>
                    Forgot password?
                  </a>
                </div>
              )}

              <button 
                type="submit" 
                className="auth-submit-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Connecting...' : (mode === 'login' ? 'Log In' : 'Create Account')}
              </button>

              <div className="auth-divider">
                <span>or continue with</span>
              </div>

              {/* Social Login Buttons Mirroring App Screenshot 3 */}
              <div className="social-btns-row">
                <button 
                  type="button" 
                  className="social-auth-btn"
                  onClick={handleSocialAuth}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span>Google</span>
                </button>

                <button 
                  type="button" 
                  className="social-auth-btn"
                  onClick={handleSocialAuth}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.42c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.06 1.72-.93 2.74 1.01.08 2.02-.49 2.63-1.24z"/>
                  </svg>
                  <span>Apple</span>
                </button>
              </div>

              <div className="auth-footer-text">
                <span>
                  {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                </span>
                {mode === 'login' ? (
                  <span className="auth-toggle-action" onClick={() => setMode('signup')}>Sign up</span>
                ) : (
                  <a className="auth-toggle-action" href="/admin">Log in</a>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
