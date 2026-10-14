import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart } from 'lucide-react';

export const TermsPage = () => {
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
            Terms of Use
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
            Last revised: October 2026 • Community guidelines for verified student dating
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
              1. Acceptance of Terms
            </h2>
            <p>
              By creating an account, accessing, or using <strong>WeDate</strong>, you agree to be bound by these Terms of Use and our Privacy Policy. If you do not accept these terms, you may not register or access the service.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--color-primary)', marginBottom: '8px' }}>
              2. Eligibility & Student Verification
            </h2>
            <p>
              WeDate is an exclusive dating and social connection platform for eligible adult students. You must be at least 18 years of age and hold an authentic, verifiable email address belonging to the configured student community domain. Public registration by unauthorized individuals or commercial accounts is strictly prohibited.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--color-primary)', marginBottom: '8px' }}>
              3. Community Standards & Code of Conduct
            </h2>
            <p>
              WeDate is committed to providing a respectful, welcoming campus environment. Users agree never to:
            </p>
            <ul style={{ paddingLeft: '24px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Engage in harassment, intimidation, stalking, or abusive conduct.</li>
              <li>Upload explicit, pornographic, non-consensual, or fraudulent photography.</li>
              <li>Impersonate another student or fabricate profile credentials.</li>
              <li>Use the platform for commercial solicitation, advertisements, or spam.</li>
              <li>Violate any local, national, or campus safety regulations.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--color-primary)', marginBottom: '8px' }}>
              4. Mutual Messaging & Safety Controls
            </h2>
            <p>
              One-to-one messaging is permitted only between users who have formed an active mutual match via reciprocal Likes. Either user may unmatch or block the other at any time, immediately and permanently terminating communications.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--color-primary)', marginBottom: '8px' }}>
              5. Recommendation System Disclaimer
            </h2>
            <p>
              The <strong>WeDate Smart Discovery</strong> recommendation engine computes similarity across explicitly selected attributes (interests, hobbies, spoken languages, and relationship goals). Scores and match percentages represent attribute similarity and do not constitute a prediction, guarantee, or scientific endorsement of romantic compatibility or personal character.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--color-primary)', marginBottom: '8px' }}>
              6. Account Termination
            </h2>
            <p>
              Users may permanently delete their account at any time through Account Settings. WeDate reserves the right to suspend or terminate accounts that breach safety guidelines or violate student community conduct standards.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
