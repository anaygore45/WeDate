import React from 'react';
import { Check } from 'lucide-react';

export const ChipSelect = ({ options = [], selected = [], onChange, max = null }) => {
  const isSelected = (opt) => selected.includes(opt);

  const toggleOption = (opt) => {
    if (isSelected(opt)) {
      onChange(selected.filter((item) => item !== opt));
    } else {
      if (max && selected.length >= max) return;
      onChange([...selected, opt]);
    }
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {options.map((opt) => {
        const active = isSelected(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggleOption(opt)}
            style={{
              padding: '7px 14px',
              borderRadius: 'var(--radius-full)',
              border: active ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
              backgroundColor: active ? 'var(--color-primary)' : 'var(--color-surface)',
              color: active ? '#FFFFFF' : 'var(--color-text-main)',
              fontSize: '0.85rem',
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            {active && <Check size={14} />}
            {opt}
          </button>
        );
      })}
    </div>
  );
};
