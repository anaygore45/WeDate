import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Heart,
  MessageCircle,
  ShieldCheck,
  CheckCheck,
  ExternalLink
} from 'lucide-react';
import { notificationApi } from '../services/api.js';
import { useSocket } from '../contexts/SocketContext.jsx';
import { Button } from '../components/common/Button.jsx';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setUnreadNotifications } = useSocket();
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationApi.getNotifications();
      if (res.success && res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadNotifications(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.warn('[Notifications Error]', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadNotifications(0);
    } catch (err) {
      console.warn('[Mark All Read Error]', err.message);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await notificationApi.markAsRead(notif._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
        setUnreadNotifications((prev) => Math.max(0, prev - 1));
      } catch (e) {
        // ignore
      }
    }

    if (notif.data?.matchId) {
      navigate(`/chat/${notif.data.matchId}`);
    } else if (notif.type === 'match') {
      navigate('/matches');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'match':
        return <Heart size={18} color="var(--color-primary)" />;
      case 'message':
        return <MessageCircle size={18} color="var(--color-primary)" />;
      case 'security':
        return <ShieldCheck size={18} color="var(--color-success)" />;
      default:
        return <Bell size={18} color="var(--color-primary)" />;
    }
  };

  return (
    <div
      style={{
        flex: 1,
        padding: '36px 20px',
        backgroundColor: 'var(--color-bg)'
      }}
    >
      <div className="container" style={{ maxWidth: '680px' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '24px'
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '2.2rem',
                color: 'var(--color-primary)',
                margin: '0 0 6px 0'
              }}
            >
              Notifications
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', margin: 0 }}>
              Recent matches, conversations, and community updates
            </p>
          </div>

          {notifications.some((n) => !n.isRead) && (
            <Button
              variant="outline"
              size="sm"
              icon={CheckCheck}
              onClick={handleMarkAllRead}
            >
              Mark all read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ color: 'var(--color-text-secondary)' }}>Loading alerts...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '48px 24px',
              textAlign: 'center'
            }}
          >
            <Bell size={32} color="var(--color-text-muted)" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--color-text-main)', margin: '0 0 6px 0' }}>
              No notifications yet
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
              You'll be alerted whenever someone matches with you or sends a message.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {notifications.map((notif) => {
              const dateStr = new Date(notif.createdAt).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  style={{
                    backgroundColor: notif.isRead ? 'var(--color-surface)' : 'var(--color-primary-light)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'transform var(--transition-fast)'
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {getIcon(notif.type)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <h4
                        style={{
                          fontSize: '0.95rem',
                          fontWeight: notif.isRead ? 600 : 700,
                          color: 'var(--color-text-main)',
                          margin: '0 0 4px 0'
                        }}
                      >
                        {notif.title}
                      </h4>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                        {dateStr}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.4 }}>
                      {notif.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
