import React from 'react';
import { Sparkles, Info, CheckCircle2 } from 'lucide-react';

export const WhyThisProfile = ({ score, reasons = [], isPersonalized = true }) => {
  if (!isPersonalized || score === null) return null;

  return (
    <div
      style={{
        marginTop: '16px',
        padding: '14px 16px',
        backgroundColor: 'var(--color-surface-subtle)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={16} color="var(--color-primary)" />
          <span
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--color-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            WeDate Smart Discovery
          </span>
        </div>

        {score !== null && (
          <span
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-primary)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 700
            }}
          >
            {score}% Compatibility
          </span>
        )}
      </div>

      {reasons.length > 0 ? (
        <ul
          style={{
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            marginBottom: '8px'
          }}
        >
          {reasons.map((reason, idx) => (
            <li
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '6px',
                fontSize: '0.85rem',
                color: 'var(--color-text-main)',
                lineHeight: 1.4
              }}
            >
              <CheckCircle2
                size={14}
                color="var(--color-primary)"
                style={{ flexShrink: 0, marginTop: '2px' }}
              />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
          General profile recommendations based on verified student community activity.
        </p>
      )}

      <p
        style={{
          fontSize: '0.7rem',
          color: 'var(--color-text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          margin: 0
        }}
      >
        <Info size={11} />
        Similarity across explicit attributes. Not a guarantee of relationship outcome.
      </p>
    </div>
  );
};
