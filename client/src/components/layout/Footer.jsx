import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck } from 'lucide-react';

export const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        padding: '48px 0 32px 0',
        marginTop: 'auto'
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '32px',
            marginBottom: '40px'
          }}
        >
          {/* Brand info */}
          <div style={{ maxWidth: '360px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px'
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  background: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Heart size={14} fill="#EBC9CE" color="#762D43" />
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.4rem',
                  color: 'var(--color-primary)',
                  fontWeight: 600
                }}
              >
                WeDate
              </span>
            </div>
            <p
              style={{
                fontSize: '0.9rem',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.6
              }}
            >
              An exclusive, verified student dating and connection platform. Fostering authentic campus relationships through mutual interest and explainable AI discovery.
            </p>
          </div>

          {/* Platform Links */}
          <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
            <div>
              <h4
                style={{
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: 700,
                  color: 'var(--color-text-main)',
                  marginBottom: '16px'
                }}
              >
                Platform
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li>
                  <Link to="/discover" style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                    Discover Profiles
                  </Link>
                </li>
                <li>
                  <Link to="/matches" style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                    Mutual Matches
                  </Link>
                </li>
                <li>
                  <Link to="/register" style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                    Student Verification
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4
                style={{
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: 700,
                  color: 'var(--color-text-main)',
                  marginBottom: '16px'
                }}
              >
                Safety & Privacy
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li>
                  <Link to="/privacy" style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                    Terms of Use
                  </Link>
                </li>
                <li>
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck size={14} color="var(--color-success)" /> Campus Verified Only
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid var(--color-border)',
            paddingTop: '24px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            fontSize: '0.85rem',
            color: 'var(--color-text-muted)'
          }}
        >
          <p>© {new Date().getFullYear()} WeDate. Designed for intentional student connection.</p>
          <p>Adult student community (18+). Never share sensitive credentials or financial details.</p>
        </div>
      </div>
    </footer>
  );
};
