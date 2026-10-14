import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';

export const ConversationList = ({
  conversations = [],
  activeChatId,
  onSelectChat,
  onlineStatusMap = {}
}) => {
  const [search, setSearch] = useState('');

  const filtered = conversations.filter((c) =>
    c.profile?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      style={{
        width: '320px',
        backgroundColor: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
    >
      {/* Header & Search */}
      <div style={{ padding: '20px 16px 12px 16px', borderBottom: '1px solid var(--color-border-subtle)' }}>
        <h3
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.4rem',
            color: 'var(--color-primary)',
            marginBottom: '12px'
          }}
        >
          Conversations
        </h3>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-full)',
            padding: '6px 12px'
          }}
        >
          <Search size={16} color="var(--color-text-muted)" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search connections..."
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '0.85rem',
              width: '100%',
              color: 'var(--color-text-main)'
            }}
          />
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            <p style={{ fontSize: '0.9rem' }}>No conversations yet.</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              When you and another student both like each other, you can message here!
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const isActive = activeChatId === item._id;
            const otherUserId = item.otherUser?._id || item.otherUser;
            const isOnline = onlineStatusMap[otherUserId];
            const photoUrl =
              item.profile?.photos?.find((p) => p.isPrimary)?.url ||
              item.profile?.photos?.[0]?.url ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';

            return (
              <div
                key={item._id}
                onClick={() => onSelectChat(item)}
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent',
                  borderBottom: '1px solid var(--color-border-subtle)',
                  transition: 'background-color var(--transition-fast)'
                }}
              >
                {/* Avatar with presence dot */}
                <div style={{ position: 'relative' }}>
                  <img
                    src={photoUrl}
                    alt={item.profile?.name}
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                  {isOnline && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '1px',
                        right: '1px',
                        width: '11px',
                        height: '11px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-success)',
                        border: '2px solid var(--color-surface)'
                      }}
                    />
                  )}
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h4
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        color: 'var(--color-text-main)',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {item.profile?.name}
                    </h4>
                  </div>
                  <p
                    style={{
                      fontSize: '0.8rem',
                      color: item.unreadCount > 0 ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                      fontWeight: item.unreadCount > 0 ? 600 : 400,
                      margin: '2px 0 0 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {item.lastMessage?.text || 'New mutual match! Say hello.'}
                  </p>
                </div>

                {/* Unread badge */}
                {item.unreadCount > 0 && (
                  <span
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      color: '#FFF',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      borderRadius: 'var(--radius-full)',
                      padding: '2px 6px'
                    }}
                  >
                    {item.unreadCount}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
