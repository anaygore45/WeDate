import React from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  ShieldCheck,
  Compass,
  MessageCircle,
  Sparkles,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { Button } from '../components/common/Button.jsx';
import { SafetyDisclaimer } from '../components/safety/SafetyDisclaimer.jsx';

export const LandingPage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Editorial Hero Section */}
      <section
        style={{
          padding: '80px 0 60px 0',
          backgroundColor: 'var(--color-bg)',
          borderBottom: '1px solid var(--color-border)'
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '48px',
              alignItems: 'center'
            }}
          >
            {/* Left Copy */}
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  marginBottom: '20px'
                }}
              >
                <ShieldCheck size={16} />
                <span>Verified Student Dating Community</span>
              </div>

              <h1
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(2.5rem, 5vw, 3.8rem)',
                  color: 'var(--color-primary)',
                  lineHeight: 1.15,
                  marginBottom: '20px'
                }}
              >
                Real connections.
                <br />
                Closer to home.
              </h1>

              <p
                style={{
                  fontSize: '1.15rem',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: '32px',
                  maxWidth: '520px'
                }}
              >
                A more personal way to meet people on campus, discover shared interests and academic pursuits, and see where a genuine connection goes.
              </p>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <Link to="/register">
                  <Button variant="primary" size="lg">
                    Get Started <ArrowRight size={18} />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg">
                    Log In
                  </Button>
                </Link>
              </div>

              {/* Verified domain trust note */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '28px',
                  fontSize: '0.85rem',
                  color: 'var(--color-text-muted)'
                }}
              >
                <CheckCircle size={15} color="var(--color-success)" />
                <span>Restricted to verified campus email domains. 100% spam-free.</span>
              </div>
            </div>

            {/* Right Editorial Photography Composition */}
            <div
              style={{
                position: 'relative',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
                  alt="Student reading at cafe"
                  style={{
                    width: '100%',
                    height: '240px',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-md)'
                  }}
                />
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80"
                  alt="Student in campus library"
                  style={{
                    width: '100%',
                    height: '180px',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-md)'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '28px' }}>
                <img
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80"
                  alt="Student walking campus grounds"
                  style={{
                    width: '100%',
                    height: '190px',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-md)'
                  }}
                />
                <img
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80"
                  alt="Student smiling at art exhibition"
                  style={{
                    width: '100%',
                    height: '230px',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-md)'
                  }}
                />
              </div>

              {/* Floating Smart Discovery Preview Card */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '-12px',
                  left: '10%',
                  right: '10%',
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 18px',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-primary)'
                  }}
                >
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>
                    WeDate Smart Discovery
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                    Transparent recommendations based on shared interests & lifestyle
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Product Workflow */}
      <section style={{ padding: '80px 0', backgroundColor: 'var(--color-surface)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 56px auto' }}>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '2.2rem',
                color: 'var(--color-primary)',
                marginBottom: '12px'
              }}
            >
              How WeDate Works
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Built specifically for students who want genuine connections without the noise, bots, or anonymity of public apps.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '32px'
            }}
          >
            {/* Step 1 */}
            <div
              style={{
                padding: '32px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-border)'
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}
              >
                <ShieldCheck size={22} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '10px' }}>
                1. Verify Your Student Status
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Register using your official student community email domain. Every profile is backed by an authentic student identity.
              </p>
            </div>

            {/* Step 2 */}
            <div
              style={{
                padding: '32px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-border)'
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}
              >
                <Compass size={22} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '10px' }}>
                2. Smart Campus Discovery
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Explore candidate profiles ranked with transparent AI similarity across academic departments, hobbies, and relationship goals.
              </p>
            </div>

            {/* Step 3 */}
            <div
              style={{
                padding: '32px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-border)'
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}
              >
                <MessageCircle size={22} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '10px' }}>
                3. Connect When Interest Is Mutual
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                No unsolicited messages. Real-time private chat unlocks only when both students express interest through a mutual like.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Community Trust Section */}
      <section style={{ padding: '70px 0', backgroundColor: 'var(--color-bg)' }}>
        <div className="container" style={{ maxWidth: '880px' }}>
          <SafetyDisclaimer />
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section
        style={{
          padding: '60px 0',
          backgroundColor: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          textAlign: 'center'
        }}
      >
        <div className="container" style={{ maxWidth: '600px' }}>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '2.1rem',
              color: 'var(--color-primary)',
              marginBottom: '16px'
            }}
          >
            Ready to find your match on campus?
          </h2>
          <p
            style={{
              fontSize: '1rem',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.6,
              marginBottom: '28px'
            }}
          >
            Join your fellow verified students today. Create your profile in minutes.
          </p>
          <Link to="/register">
            <Button variant="primary" size="lg">
              Create Your Profile
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
