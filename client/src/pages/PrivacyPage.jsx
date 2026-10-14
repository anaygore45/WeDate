import React from 'react';
import { Shield, Eye, Lock, Database } from 'lucide-react';

export const PrivacyPage = () => {
  return (
    <div style={{ flex: 1, padding: '48px 20px', backgroundColor: 'var(--color-bg)' }}>
      <div className="container" style={{ maxWidth: '780px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '2.4rem',
              color: 'var(--color-primary)',
              margin: '0 0 10px 0'
            }}
          >
            Privacy Policy
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
            Last revised: October 2026 • Transparent privacy practices for our verified student platform
          </p>
        </div>

        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '36px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            lineHeight: 1.6,
            fontSize: '0.95rem',
            color: 'var(--color-text-main)'
          }}
        >
          <section>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--color-primary)', marginBottom: '8px' }}>
              1. Information We Collect
            </h2>
            <p>
              To maintain a verified student community and deliver the discovery experience, WeDate collects:
            </p>
            <ul style={{ paddingLeft: '24px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li><strong>Student Credentials:</strong> Verified email address belonging to the configured student domain.</li>
              <li><strong>Profile Information:</strong> Name, date of birth (to derive and verify minimum age of 18), gender, academic department, and academic year.</li>
              <li><strong>Lifestyle & Matching Attributes:</strong> Self-selected interests, hobbies, relationship goals, languages, and biography text.</li>
              <li><strong>Media:</strong> User-uploaded profile photographs and images explicitly shared inside mutual chats.</li>
              <li><strong>Interaction Data:</strong> Swipe actions (Like/Pass), mutual matches, and messages between matched users.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--color-primary)', marginBottom: '8px' }}>
              2. How AI & Recommendations Use Your Data
            </h2>
            <p>
              The <strong>WeDate Smart Discovery</strong> recommendation algorithm runs entirely on the application's internal servers.
            </p>
            <ul style={{ paddingLeft: '24px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>We <strong>never</strong> transmit your private messages, private activity, or personal profiles to external AI services or third-party LLMs.</li>
              <li>Recommendation calculations use transparent mathematical similarity (Jaccard on interest sets and Cosine similarity on biography text).</li>
              <li>You may opt out of personalized AI ranking at any time in Settings, reverting discovery to standard chronological ordering.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--color-primary)', marginBottom: '8px' }}>
              3. Profile Visibility & Controls
            </h2>
            <p>
              You maintain full control over your discoverability:
            </p>
            <ul style={{ paddingLeft: '24px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li><strong>Hide Profile:</strong> You can toggle profile visibility off at any time, instantly removing your profile from all other students' discovery queues and filter results.</li>
              <li><strong>Blocking:</strong> Blocking a user immediately prevents discovery in both directions, cancels existing matches, and terminates chat rooms.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--color-primary)', marginBottom: '8px' }}>
              4. Data Retention & Permanent Deletion
            </h2>
            <p>
              When you choose to delete your account via Settings, WeDate permanently removes your profile, photographs, swipe records, and mutual matches from our database. Active sessions are invalidated immediately.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--color-primary)', marginBottom: '8px' }}>
              5. Security Practices
            </h2>
            <p>
              We implement industry-standard security safeguards including bcrypt password hashing, encrypted HTTPS communication, HTTP-only authenticated cookies, rate-limiting, and strict server-side authorization checks on all REST endpoints and WebSocket events.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
