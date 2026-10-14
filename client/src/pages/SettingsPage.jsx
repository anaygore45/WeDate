import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Shield,
  Bell,
  Lock,
  Trash2,
  Sparkles,
  Ban,
  Check,
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { settingsApi, userApi } from '../services/api.js';
import { Button } from '../components/common/Button.jsx';
import { Modal } from '../components/common/Modal.jsx';

export const SettingsPage = () => {
  const { user, profile, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('account');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Personalization & Privacy state
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState(
    user?.privacySettings?.personalizedRecommendations ?? true
  );
  const [profileVisibility, setProfileVisibility] = useState(
    user?.privacySettings?.profileVisibility ?? true
  );
  const [privacySaving, setPrivacySaving] = useState(false);
  const [privacyMsg, setPrivacyMsg] = useState('');

  // Notification preferences
  const [notifPrefs, setNotifPrefs] = useState(
    user?.notificationPreferences || {
      newMatches: true,
      newMessages: true,
      profileLikes: true,
      emailAlerts: true
    }
  );
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifMsg, setNotifMsg] = useState('');

  // Blocked users list
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loadingBlocked, setLoadingBlocked] = useState(false);

  // Account deletion
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (activeTab === 'safety') {
      fetchBlockedUsers();
    }
  }, [activeTab]);

  const fetchBlockedUsers = async () => {
    setLoadingBlocked(true);
    try {
      const res = await userApi.getBlockedUsers();
      if (res.success && res.data) {
        setBlockedUsers(res.data);
      }
    } catch (err) {
      console.warn('[Blocked Fetch Error]', err.message);
    } finally {
      setLoadingBlocked(false);
    }
  };

  const handleUnblock = async (targetId) => {
    try {
      await userApi.unblockUser(targetId);
      setBlockedUsers((prev) => prev.filter((b) => b.blockedUserId !== targetId));
    } catch (err) {
      console.warn('[Unblock Error]', err.message);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    setPasswordError('');
    setPasswordMsg('');

    try {
      const res = await settingsApi.changePassword({ currentPassword, newPassword });
      if (res.success) {
        setPasswordMsg('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSavePrivacy = async () => {
    setPrivacySaving(true);
    setPrivacyMsg('');
    try {
      const res = await settingsApi.updatePrivacy({
        profileVisibility,
        personalizedRecommendations
      });
      if (res.success) {
        setPrivacyMsg('Privacy and recommendation settings saved.');
        await refreshProfile();
        setTimeout(() => setPrivacyMsg(''), 3000);
      }
    } catch (err) {
      console.warn('[Privacy Save Error]', err.message);
    } finally {
      setPrivacySaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setNotifSaving(true);
    setNotifMsg('');
    try {
      const res = await settingsApi.updateNotifications(notifPrefs);
      if (res.success) {
        setNotifMsg('Notification preferences saved.');
        setTimeout(() => setNotifMsg(''), 3000);
      }
    } catch (err) {
      console.warn('[Notif Save Error]', err.message);
    } finally {
      setNotifSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setDeleteError('Please type "DELETE" to confirm.');
      return;
    }

    setDeleting(true);
    setDeleteError('');

    try {
      await settingsApi.deleteAccount(deleteConfirmText);
      await logout();
      navigate('/');
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete account.');
      setDeleting(false);
    }
  };

  return (
    <div style={{ flex: 1, padding: '36px 20px', backgroundColor: 'var(--color-bg)' }}>
      <div className="container" style={{ maxWidth: '840px' }}>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2.4rem',
            color: 'var(--color-primary)',
            margin: '0 0 24px 0'
          }}
        >
          Settings & Privacy
        </h1>

        {/* Tabs Bar */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            borderBottom: '1px solid var(--color-border)',
            marginBottom: '32px',
            overflowX: 'auto',
            paddingBottom: '4px'
          }}
        >
          {[
            { id: 'account', label: 'Account & Security', icon: User },
            { id: 'personalization', label: 'Smart Discovery', icon: Sparkles },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'safety', label: 'Privacy & Blocked', icon: Shield }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: active ? 'var(--color-surface)' : 'transparent',
                  color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  fontWeight: active ? 600 : 500,
                  fontSize: '0.9rem',
                  border: active ? '1px solid var(--color-border)' : '1px solid transparent',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: Account & Security */}
        {activeTab === 'account' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Account Details Box */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', marginBottom: '16px' }}>
                Account Identity
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Registered Student Email: </span>
                  <strong>{user?.email}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Verification Status: </span>
                  <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                    {user?.isVerified ? '✓ Verified Campus Student' : 'Pending Verification'}
                  </span>
                </div>
              </div>
            </div>

            {/* Change Password Box */}
            <form
              onSubmit={handleChangePassword}
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', margin: 0 }}>
                Change Password
              </h3>

              {passwordMsg && (
                <div style={{ padding: '10px', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)', borderRadius: '4px', fontSize: '0.85rem' }}>
                  {passwordMsg}
                </div>
              )}
              {passwordError && (
                <div style={{ padding: '10px', backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)', borderRadius: '4px', fontSize: '0.85rem' }}>
                  {passwordError}
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      outline: 'none',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      outline: 'none',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                <Button type="submit" variant="primary" loading={passwordLoading}>
                  Update Password
                </Button>
              </div>
            </form>

            {/* Account Deletion Danger Zone */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-error)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
              }}
            >
              <div>
                <h4 style={{ color: 'var(--color-error)', margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 700 }}>
                  Permanently Delete Account
                </h4>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', margin: 0, maxWidth: '480px' }}>
                  Deletes all profile photographs, mutual matches, chat histories, and campus credentials. This cannot be undone.
                </p>
              </div>
              <Button variant="danger" size="sm" icon={Trash2} onClick={() => setDeleteModalOpen(true)}>
                Delete Account
              </Button>
            </div>
          </div>
        )}

        {/* TAB 2: Smart Discovery & Personalization */}
        {activeTab === 'personalization' && (
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Sparkles size={20} color="var(--color-primary)" />
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', margin: 0 }}>
                  WeDate Smart Discovery Preferences
                </h3>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                WeDate Smart Discovery uses classical content-based similarity (Jaccard on interests and hobbies, TF-IDF on biographies, and relationship goal alignment) to rank candidate profiles on your campus.
              </p>
            </div>

            {privacyMsg && (
              <div style={{ padding: '10px 14px', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)', borderRadius: '4px', fontSize: '0.85rem' }}>
                {privacyMsg}
              </div>
            )}

            {/* Toggle Personalization */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                backgroundColor: 'var(--color-bg)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)'
              }}
            >
              <div style={{ maxWidth: '480px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 4px 0' }}>
                  Personalized Profile Recommendations
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  When enabled, candidates are ranked using similarity scores and transparent explanation reasons. When disabled, standard chronological discovery is used without scores.
                </p>
              </div>
              <input
                type="checkbox"
                checked={personalizedRecommendations}
                onChange={(e) => setPersonalizedRecommendations(e.target.checked)}
                style={{ width: '20px', height: '20px', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
              />
            </div>

            {/* Toggle Profile Visibility */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                backgroundColor: 'var(--color-bg)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)'
              }}
            >
              <div style={{ maxWidth: '480px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 4px 0' }}>
                  Profile Visibility in Discovery
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  Control whether other verified students can see your profile in the discovery deck. When hidden, existing matches can still message you.
                </p>
              </div>
              <input
                type="checkbox"
                checked={profileVisibility}
                onChange={(e) => setProfileVisibility(e.target.checked)}
                style={{ width: '20px', height: '20px', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="primary" onClick={handleSavePrivacy} loading={privacySaving}>
                Save Preferences
              </Button>
            </div>
          </div>
        )}

        {/* TAB 3: Notifications */}
        {activeTab === 'notifications' && (
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', margin: 0 }}>
              Notification Alerts
            </h3>

            {notifMsg && (
              <div style={{ padding: '10px 14px', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)', borderRadius: '4px', fontSize: '0.85rem' }}>
                {notifMsg}
              </div>
            )}

            {[
              { key: 'newMatches', label: 'New Mutual Matches', desc: 'Alert when another student likes your profile back.' },
              { key: 'newMessages', label: 'Chat Messages', desc: 'Real-time notifications when a match sends you a message.' },
              { key: 'profileLikes', label: 'Profile Activity', desc: 'In-app notification when you receive new profile likes.' },
              { key: 'emailAlerts', label: 'Email Summaries', desc: 'Periodic student digest for unread messages.' }
            ].map((item) => (
              <div
                key={item.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: '1px solid var(--color-border-subtle)'
                }}
              >
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0 0 2px 0' }}>{item.label}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: 0 }}>{item.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifPrefs[item.key]}
                  onChange={(e) =>
                    setNotifPrefs((prev) => ({ ...prev, [item.key]: e.target.checked }))
                  }
                  style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                />
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <Button variant="primary" onClick={handleSaveNotifications} loading={notifSaving}>
                Save Notification Preferences
              </Button>
            </div>
          </div>
        )}

        {/* TAB 4: Privacy & Blocked Users */}
        {activeTab === 'safety' && (
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
            <div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', margin: '0 0 4px 0' }}>
                Blocked Students
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                Blocked accounts cannot view your profile in discovery or communicate with you.
              </p>
            </div>

            {loadingBlocked ? (
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Loading blocked list...</p>
            ) : blockedUsers.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                <Ban size={28} color="var(--color-text-muted)" style={{ marginBottom: '8px' }} />
                <p style={{ fontSize: '0.9rem', margin: 0 }}>No blocked accounts.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {blockedUsers.map((b) => (
                  <div
                    key={b._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      backgroundColor: 'var(--color-bg)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {b.primaryPhoto ? (
                        <img
                          src={b.primaryPhoto}
                          alt={b.name}
                          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem'
                          }}
                        >
                          U
                        </div>
                      )}
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{b.name}</span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnblock(b.blockedUserId)}
                    >
                      Unblock
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Account Deletion Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Permanent Deletion"
        maxWidth="440px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '10px', color: 'var(--color-error)' }}>
            <AlertTriangle size={24} style={{ flexShrink: 0 }} />
            <p style={{ fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
              This action is permanent and immediate. All your photos, mutual matches, chats, and account history will be irreversibly deleted.
            </p>
          </div>

          {deleteError && (
            <div style={{ padding: '8px 12px', backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)', borderRadius: '4px', fontSize: '0.85rem' }}>
              {deleteError}
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Type <strong>DELETE</strong> to confirm:
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                outline: 'none',
                fontSize: '0.95rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteAccount} loading={deleting}>
              Permanently Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
