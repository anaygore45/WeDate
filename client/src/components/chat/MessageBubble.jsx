import React from 'react';
import { Check, CheckCheck } from 'lucide-react';

export const MessageBubble = ({ message, isMe }) => {
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isMe ? 'flex-end' : 'flex-start',
        marginBottom: '12px',
        maxWidth: '75%',
        alignSelf: isMe ? 'flex-end' : 'flex-start'
      }}
    >
      <div
        style={{
          padding: message.messageType === 'image' ? '6px' : '10px 16px',
          borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          backgroundColor: isMe ? 'var(--color-primary)' : 'var(--color-surface)',
          color: isMe ? '#FFFFFF' : 'var(--color-text-main)',
          border: isMe ? 'none' : '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
          wordBreak: 'break-word',
          fontSize: '0.95rem',
          lineHeight: 1.45
        }}
      >
        {message.messageType === 'image' && message.mediaUrl && (
          <img
            src={message.mediaUrl}
            alt="Shared in conversation"
            style={{
              maxWidth: '260px',
              maxHeight: '260px',
              borderRadius: '12px',
              objectFit: 'cover',
              display: 'block'
            }}
          />
        )}

        {message.content && (
          <p style={{ margin: message.messageType === 'image' ? '6px 8px 2px 8px' : 0 }}>
            {message.content}
          </p>
        )}
      </div>

      {/* Timestamp & Read Receipt */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          marginTop: '4px',
          padding: '0 4px',
          fontSize: '0.7rem',
          color: 'var(--color-text-muted)'
        }}
      >
        <span>{formatTime(message.createdAt)}</span>
        {isMe && (
          <span>
            {message.isRead ? (
              <CheckCheck size={13} color="var(--color-primary)" />
            ) : (
              <Check size={13} />
            )}
          </span>
        )}
      </div>
    </div>
  );
};
