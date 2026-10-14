import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { authApi } from '../services/api.js';
import { Button } from '../components/common/Button.jsx';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token');
  const [token, setToken] = useState(tokenFromUrl || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Password reset token is required.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authApi.resetPassword({ token, newPassword });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may have expired.');
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
          border: '1px solid var(--color-border)',
          textAlign: success ? 'center' : 'left'
        }}
      >
        {success ? (
          <div>
            <CheckCircle2 size={44} color="var(--color-success)" style={{ marginBottom: '14px' }} />
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.9rem',
                color: 'var(--color-text-main)',
                marginBottom: '8px'
              }}
            >
              Password Reset!
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
              Your password has been securely updated. You can now log in with your new credentials.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/login')}
              style={{ width: '100%' }}
            >
              Log in to WeDate <ArrowRight size={18} />
            </Button>
          </div>
        ) : (
          <div>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.9rem',
                color: 'var(--color-text-main)',
                marginBottom: '8px'
              }}
            >
              Choose New Password
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
              Create a secure password with at least 8 characters.
            </p>

            {error && (
              <div
                style={{
                  padding: '10px 14px',
                  backgroundColor: 'var(--color-error-bg)',
                  color: 'var(--color-error)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  marginBottom: '16px'
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {!tokenFromUrl && (
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Reset Token
                  </label>
                  <input
                    type="text"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste reset token from email"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  New Password
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
                  <Lock size={18} color="var(--color-text-muted)" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
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

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Confirm Password
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
                  <Lock size={18} color="var(--color-text-muted)" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
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

              <Button type="submit" variant="primary" size="lg" loading={loading} style={{ width: '100%', marginTop: '6px' }}>
                Save New Password
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
