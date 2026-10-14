import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Heart,
  Compass,
  MessageCircle,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useSocket } from '../../contexts/SocketContext.jsx';

export const Navbar = () => {
  const { user, profile, logout } = useAuth();
  const { unreadNotifications } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const primaryPhoto = profile?.photos?.find((p) => p.isPrimary)?.url || profile?.photos?.[0]?.url;

  return (
    <>
      <header
        style={{
          backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div
          className="container"
          style={{
            height: '70px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Logo / Wordmark */}
          <Link
            to={user ? '/discover' : '/'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none'
            }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #762D43 0%, #5E2134 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FAF7F3'
              }}
            >
              <Heart size={18} fill="#EBC9CE" color="#762D43" />
            </div>
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.6rem',
                color: 'var(--color-primary)',
                letterSpacing: '-0.02em',
                fontWeight: 600
              }}
            >
              WeDate
            </span>
          </Link>

          {/* Authenticated Desktop Navigation */}
          {user ? (
            <nav
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px'
              }}
              className="desktop-nav"
            >
              <Link
                to="/discover"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  color: isActive('/discover') ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  borderBottom: isActive('/discover') ? '2px solid var(--color-primary)' : '2px solid transparent',
                  padding: '8px 4px',
                  transition: 'var(--transition-fast)'
                }}
              >
                <Compass size={18} />
                <span>Discover</span>
              </Link>

              <Link
                to="/matches"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  color: isActive('/matches') ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  borderBottom: isActive('/matches') ? '2px solid var(--color-primary)' : '2px solid transparent',
                  padding: '8px 4px',
                  transition: 'var(--transition-fast)'
                }}
              >
                <Heart size={18} />
                <span>Matches</span>
              </Link>

              <Link
                to="/notifications"
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  color: isActive('/notifications') ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  borderBottom: isActive('/notifications') ? '2px solid var(--color-primary)' : '2px solid transparent',
                  padding: '8px 4px',
                  transition: 'var(--transition-fast)'
                }}
              >
                <Bell size={18} />
                <span>Alerts</span>
                {unreadNotifications > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '2px',
                      right: '-6px',
                      background: 'var(--color-primary)',
                      color: '#FFF',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      borderRadius: '10px',
                      padding: '1px 5px',
                      minWidth: '16px',
                      textAlign: 'center'
                    }}
                  >
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </Link>

              {/* Profile Avatar & Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  {primaryPhoto ? (
                    <img
                      src={primaryPhoto}
                      alt={profile?.name || 'Profile'}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'var(--color-primary-light)',
                        color: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        fontSize: '0.9rem'
                      }}
                    >
                      {profile?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                    {profile?.name?.split(' ')[0] || 'My Account'}
                  </span>
                </button>

                {dropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '110%',
                      right: 0,
                      width: '210px',
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)',
                      padding: '8px 0',
                      zIndex: 50,
                      animation: 'fadeIn 0.2s ease-out forwards'
                    }}
                  >
                    <div
                      style={{
                        padding: '8px 16px',
                        borderBottom: '1px solid var(--color-border-subtle)',
                        marginBottom: '4px'
                      }}
                    >
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                        {profile?.name || 'Student Profile'}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.email}
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 16px',
                        color: 'var(--color-text-main)',
                        fontSize: '0.9rem',
                        transition: 'var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <User size={16} />
                      <span>View & Edit Profile</span>
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 16px',
                        color: 'var(--color-text-main)',
                        fontSize: '0.9rem',
                        transition: 'var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Settings size={16} />
                      <span>Settings & Privacy</span>
                    </Link>

                    <div style={{ height: '1px', background: 'var(--color-border-subtle)', margin: '4px 0' }} />

                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 16px',
                        color: 'var(--color-error)',
                        fontSize: '0.9rem',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-error-bg)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <LogOut size={16} />
                      <span>Log out</span>
                    </button>
                  </div>
                )}
              </div>
            </nav>
          ) : (
            /* Public Desktop Navigation */
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <Link
                to="/terms"
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: 'var(--color-text-secondary)',
                  textDecoration: 'none'
                }}
              >
                Community Guidelines
              </Link>
              <Link
                to="/privacy"
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: 'var(--color-text-secondary)',
                  textDecoration: 'none'
                }}
              >
                Privacy & Safety
              </Link>
              <Link
                to="/login"
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: 'var(--color-primary)',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)'
                }}
              >
                Log in
              </Link>
              <Link
                to="/register"
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  background: 'var(--color-primary)',
                  padding: '9px 20px',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Bottom Navigation for Authenticated Users */}
      {user && (
        <nav
          className="mobile-bottom-bar"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '60px',
            backgroundColor: 'var(--color-surface)',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            zIndex: 40,
            boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
          }}
        >
          <Link
            to="/discover"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              color: isActive('/discover') ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontSize: '0.75rem',
              fontWeight: 500
            }}
          >
            <Compass size={20} />
            <span>Discover</span>
          </Link>

          <Link
            to="/matches"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              color: isActive('/matches') ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontSize: '0.75rem',
              fontWeight: 500
            }}
          >
            <Heart size={20} />
            <span>Matches</span>
          </Link>

          <Link
            to="/notifications"
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              color: isActive('/notifications') ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontSize: '0.75rem',
              fontWeight: 500
            }}
          >
            <Bell size={20} />
            <span>Alerts</span>
            {unreadNotifications > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '12px',
                  background: 'var(--color-primary)',
                  color: '#FFF',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  borderRadius: '10px',
                  padding: '1px 4px'
                }}
              >
                {unreadNotifications}
              </span>
            )}
          </Link>

          <Link
            to="/profile"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              color: isActive('/profile') ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontSize: '0.75rem',
              fontWeight: 500
            }}
          >
            <User size={20} />
            <span>Profile</span>
          </Link>
        </nav>
      )}
    </>
  );
};
