import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  className = '',
  style = {},
  type = 'button',
  onClick,
  ...props
}) => {
  const getStyles = () => {
    const base = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      fontWeight: 600,
      borderRadius: 'var(--radius-sm)',
      transition: 'all var(--transition-fast)',
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled || loading ? 0.6 : 1,
      textDecoration: 'none'
    };

    const sizes = {
      sm: { padding: '6px 12px', fontSize: '0.85rem' },
      md: { padding: '10px 18px', fontSize: '0.95rem' },
      lg: { padding: '14px 26px', fontSize: '1.05rem' }
    };

    const variants = {
      primary: {
        backgroundColor: 'var(--color-primary)',
        color: '#FFFFFF',
        border: '1px solid var(--color-primary)',
        boxShadow: 'var(--shadow-sm)'
      },
      secondary: {
        backgroundColor: 'var(--color-surface-subtle)',
        color: 'var(--color-primary)',
        border: '1px solid var(--color-accent)'
      },
      outline: {
        backgroundColor: 'transparent',
        color: 'var(--color-primary)',
        border: '1px solid var(--color-border)'
      },
      ghost: {
        backgroundColor: 'transparent',
        color: 'var(--color-text-main)',
        border: '1px solid transparent'
      },
      danger: {
        backgroundColor: 'var(--color-error)',
        color: '#FFFFFF',
        border: '1px solid var(--color-error)'
      }
    };

    return { ...base, ...sizes[size], ...variants[variant], ...style };
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={getStyles()}
      className={`btn-${variant} ${className}`}
      {...props}
    >
      {loading ? (
        <span
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid currentColor',
            borderRightColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite'
          }}
        />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 18} />
      ) : null}
      {children}
    </button>
  );
};
