import React from 'react';
import { ShieldCheck, MapPin, Eye, Flag } from 'lucide-react';

export const SafetyDisclaimer = () => {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <ShieldCheck size={22} color="var(--color-primary)" />
        <h3
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.25rem',
            color: 'var(--color-primary)',
            margin: 0
          }}
        >
          Community Safety Guidelines
        </h3>
      </div>

      <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
        Your well-being and privacy are paramount on WeDate. While all accounts are verified through eligible campus student credentials, please keep these practical safety principles in mind:
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', gap: '10px' }}>
          <MapPin size={18} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '2px' }}>Meet in Public Spaces</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
              Choose bustling campus cafes, libraries, or public dining areas for first meetups.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Eye size={18} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '2px' }}>Inform a Trusted Friend</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
              Share your plans and location with a roommate or trusted classmate beforehand.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Flag size={18} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '2px' }}>Block & Report Inappropriate Behavior</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
              Never tolerate harassment or impersonation. Use the report button on any profile or chat.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
