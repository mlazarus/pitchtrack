import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    }
    // If successful, parent component will handle redirect
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/#reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      alert('✅ Password reset email sent! Check your inbox.');
      setShowResetForm(false);
      setResetEmail('');
    }
    setLoading(false);
  };

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem'
  };

  const cardStyle = {
    background: 'white',
    borderRadius: '16px',
    padding: '2rem',
    maxWidth: '450px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '1rem',
    marginBottom: '1rem'
  };

  const buttonStyle = {
    width: '100%',
    padding: '0.75rem',
    border: 'none',
    borderRadius: '8px',
    background: '#6366f1',
    color: 'white',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.5 : 1,
    marginBottom: '0.5rem'
  };

  // Password Reset Form
  if (showResetForm) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: '800', color: '#1e293b' }}>
            🔐 Reset Password
          </h1>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>
            Enter your email to receive a password reset link
          </p>

          {error && (
            <div style={{ 
              padding: '1rem', 
              background: '#fee2e2', 
              borderRadius: '8px', 
              color: '#dc2626',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handlePasswordReset}>
            <input
              type="email"
              placeholder="your@email.com"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              style={inputStyle}
              required
            />
            <button type="submit" style={buttonStyle} disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <button
            onClick={() => setShowResetForm(false)}
            style={{ ...buttonStyle, background: '#64748b' }}
          >
            ← Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  // Sign In Form
  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: '800', color: '#1e293b', textAlign: 'center' }}>
          🎮 Pitch Game Tracker
        </h1>
        <p style={{ color: '#64748b', marginBottom: '2rem', textAlign: 'center' }}>
          Sign in to continue
        </p>

        {error && (
          <div style={{ 
            padding: '1rem', 
            background: '#fee2e2', 
            borderRadius: '8px', 
            color: '#dc2626',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSignIn}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            required
            autoFocus
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            required
          />
          <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button
            onClick={() => setShowResetForm(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#6366f1',
              fontSize: '0.875rem',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Forgot password?
          </button>
        </div>

        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          background: '#f8fafc', 
          borderRadius: '8px',
          fontSize: '0.875rem',
          color: '#64748b',
          textAlign: 'center'
        }}>
          <strong>New user?</strong> Ask an admin to create your account.
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
