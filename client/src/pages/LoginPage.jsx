import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Button } from '../components/common/Button.jsx';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await login(email, password);
      if (!data.user.isVerified) {
        navigate('/verify-email');
      } else if (!data.profile || !data.profile.isCompleted) {
        navigate('/onboarding');
      } else {
        navigate('/discover');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('WeDatePass123!');
    setError('');
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
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'var(--color-primary)',
              color: '#FFF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px'
            }}
          >
            <Heart size={22} fill="#EBC9CE" color="#762D43" />
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '2rem',
              color: 'var(--color-primary)',
              margin: '0 0 6px 0'
            }}
          >
            Welcome Back
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', margin: 0 }}>
            Log in to your campus-verified account
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--color-error-bg)',
              color: 'var(--color-error)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              marginBottom: '20px'
            }}
          >
            {error}
          </div>
        )}

        {/* Quick Demo Pre-fills for Instant Review */}
        <div
          style={{
            backgroundColor: 'var(--color-surface-subtle)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            marginBottom: '24px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Sparkles size={14} color="var(--color-primary)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              ONE-CLICK DEMO ACCOUNTS
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => fillDemoAccount('aarav.sharma@campus.edu')}
              style={{
                fontSize: '0.75rem',
                padding: '4px 8px',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                color: 'var(--color-text-main)'
              }}
            >
              Demo: Aarav Sharma
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('ananya.deshmukh@campus.edu')}
              style={{
                fontSize: '0.75rem',
                padding: '4px 8px',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                color: 'var(--color-text-main)'
              }}
            >
              Demo: Ananya Deshmukh
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Student Email
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
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
                placeholder="student.id@campus.edu"
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  width: '100%',
                  fontSize: '0.95rem',
                  color: 'var(--color-text-main)'
                }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Password</label>
              <Link
                to="/forgot-password"
                style={{ fontSize: '0.8rem', color: 'var(--color-primary)', textDecoration: 'none' }}
              >
                Forgot password?
              </Link>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)'
              }}
            >
              <Lock size={18} color="var(--color-text-muted)" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  width: '100%',
                  fontSize: '0.95rem',
                  color: 'var(--color-text-main)'
                }}
              />
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" loading={loading} style={{ width: '100%', marginTop: '6px' }}>
            Log In <ArrowRight size={18} />
          </Button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginTop: '24px', margin: '24px 0 0 0' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
            Register with campus email
          </Link>
        </p>
      </div>
    </div>
  );
};
