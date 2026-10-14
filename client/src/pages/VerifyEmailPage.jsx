import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Mail, CheckCircle2, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { authApi } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Button } from '../components/common/Button.jsx';

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token');
  const [tokenInput, setTokenInput] = useState(tokenFromUrl || '');
  const [verifying, setVerifying] = useState(Boolean(tokenFromUrl));
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [resending, setResending] = useState(false);

  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const handleVerify = async (tokenToUse) => {
    const activeToken = tokenToUse || tokenInput;
    if (!activeToken) {
      setError('Please provide a valid verification token.');
      return;
    }

    setVerifying(true);
    setError('');

    try {
      await authApi.verifyEmail(activeToken);
      setSuccess(true);
      await refreshProfile();
    } catch (err) {
      setError(err.message || 'Invalid or expired verification token.');
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    if (tokenFromUrl) {
      handleVerify(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const handleResend = async () => {
    setResending(true);
    setResendMessage('');
    setError('');
    try {
      await authApi.resendVerification();
      setResendMessage('A fresh verification link has been sent to your student email.');
    } catch (err) {
      setError(err.message || 'Failed to resend email.');
    } finally {
      setResending(false);
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
          maxWidth: '480px',
          backgroundColor: 'var(--color-surface)',
          padding: '40px 36px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-editorial)',
          border: '1px solid var(--color-border)',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: success ? 'var(--color-success-bg)' : 'var(--color-primary-light)',
            color: success ? 'var(--color-success)' : 'var(--color-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
          }}
        >
          {success ? <CheckCircle2 size={28} /> : <Mail size={28} />}
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.9rem',
            color: 'var(--color-text-main)',
            marginBottom: '8px'
          }}
        >
          {success ? 'Email Verified!' : 'Verify Campus Email'}
        </h2>

        <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
          {success
            ? 'Your student email has been verified. Welcome to the exclusive WeDate campus community.'
            : `We sent a verification link to ${user?.email || 'your registered campus email address'}. Click the link in your email to activate your account.`}
        </p>

        {error && (
          <div
            style={{
              padding: '12px',
              backgroundColor: 'var(--color-error-bg)',
              color: 'var(--color-error)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              marginBottom: '20px',
              textAlign: 'left'
            }}
          >
            {error}
          </div>
        )}

        {resendMessage && (
          <div
            style={{
              padding: '12px',
              backgroundColor: 'var(--color-success-bg)',
              color: 'var(--color-success)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              marginBottom: '20px',
              textAlign: 'left'
            }}
          >
            {resendMessage}
          </div>
        )}

        {success ? (
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/onboarding')}
            style={{ width: '100%' }}
          >
            Complete Your Profile <ArrowRight size={18} />
          </Button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Paste verification token here"
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
              <Button
                variant="primary"
                onClick={() => handleVerify(tokenInput)}
                loading={verifying}
              >
                Verify
              </Button>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '16px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
                Didn't receive the email? Check your junk folder or request a new link.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResend}
                loading={resending}
                icon={RefreshCw}
              >
                Resend Verification Link
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
