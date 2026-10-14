import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authApi } from '../services/api.js';
import { Button } from '../components/common/Button.jsx';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');

    try {
      await authApi.forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to submit password reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        backgroundColor: 'var(--color-bg)'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'var(--color-surface)',
          padding: '40px 36px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-editorial)',
          border: '1px solid var(--color-border)'
        }}
      >
        <Link
          to="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            color: 'var(--color-text-secondary)',
            marginBottom: '20px'
          }}
        >
          <ArrowLeft size={16} /> Back to Log in
        </Link>

        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.9rem',
            color: 'var(--color-text-main)',
            marginBottom: '8px'
          }}
        >
          Reset Password
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
          Enter your registered student email address. We'll send you a link to reset your account password.
        </p>

        {submitted ? (
          <div
            style={{
              padding: '20px',
              backgroundColor: 'var(--color-success-bg)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center'
            }}
          >
            <CheckCircle2 size={32} color="var(--color-success)" style={{ marginBottom: '8px' }} />
            <h4 style={{ fontSize: '1rem', color: 'var(--color-text-main)', marginBottom: '6px' }}>
              Reset Link Dispatched
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
              If an account is associated with <strong>{email}</strong>, check your inbox for instructions to reset your password.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
              <div
                style={{
                  padding: '10px 14px',
                  backgroundColor: 'var(--color-error-bg)',
                  color: 'var(--color-error)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem'
                }}
              >
                {error}
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Student Email Address
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)'
                }}
              >
                <Mail size={18} color="var(--color-text-muted)" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.id@campus.edu"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    width: '100%',
                    fontSize: '0.95rem'
                  }}
                />
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" loading={loading} style={{ width: '100%' }}>
              Send Reset Link
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
