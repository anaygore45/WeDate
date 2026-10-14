import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Image as ImageIcon,
  Smile,
  MoreVertical,
  Flag,
  UserX,
  ShieldCheck,
  X
} from 'lucide-react';
import { MessageBubble } from './MessageBubble.jsx';
import { getSocket } from '../../services/socket.js';
import { chatApi, matchApi } from '../../services/api.js';

const QUICK_EMOJIS = ['👋', '☕', '✨', '😊', '📚', '🎶', '🙌'];

export const ChatWindow = ({
  chatId,
  matchId,
  otherProfile,
  otherUserId,
  currentUserId,
  isOnline = false,
  onUnmatch,
  onReport
}) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch initial messages
  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const res = await chatApi.getMessages(chatId, { limit: 60 });
        if (isMounted && res.success && res.data) {
          setMessages(res.data.messages || []);
          setTimeout(scrollToBottom, 100);
        }
      } catch (err) {
        console.warn('[History Error]', err.message);
      } finally {
        if (isMounted) setLoadingHistory(false);
      }
    };

    if (chatId) {
      fetchHistory();
    }

    return () => {
      isMounted = false;
    };
  }, [chatId]);

  // Setup Socket.IO real-time events for this room
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !chatId) return;

    // Join room
    socket.emit('join_chat', { chatId });
    socket.emit('mark_read', { chatId });

    const handleNewMessage = (data) => {
      if (data.chatId === chatId) {
        setMessages((prev) => [...prev, data.message]);
        setTimeout(scrollToBottom, 50);
        socket.emit('mark_read', { chatId });
      }
    };

    const handleUserTyping = (data) => {
      if (data.chatId === chatId && data.userId !== currentUserId) {
        setOtherUserTyping(data.isTyping);
      }
    };

    const handleMessagesRead = (data) => {
      if (data.chatId === chatId && data.readBy !== currentUserId) {
        setMessages((prev) =>
          prev.map((msg) => (msg.sender === currentUserId ? { ...msg, isRead: true } : msg))
        );
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('messages_read', handleMessagesRead);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('messages_read', handleMessagesRead);
    };
  }, [chatId, currentUserId]);

  // Handle typing status notification
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    const socket = getSocket();
    if (!socket) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing_start', { chatId });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing_stop', { chatId });
    }, 1500);
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() && !selectedImage) return;

    const content = inputText.trim();
    setInputText('');
    const socket = getSocket();

    // Stop typing
    if (isTyping && socket) {
      setIsTyping(false);
      socket.emit('typing_stop', { chatId });
    }

    // Handle image upload if selected
    let mediaUrl = '';
    if (selectedImage) {
      setUploadingImage(true);
      try {
        const formData = new FormData();
        formData.append('image', selectedImage);
        const uploadRes = await chatApi.uploadImage(chatId, formData);
        if (uploadRes.success && uploadRes.data) {
          mediaUrl = uploadRes.data.url;
        }
      } catch (err) {
        console.error('[Upload Error]', err);
      } finally {
        setSelectedImage(null);
        setUploadingImage(false);
      }
    }

    const payload = {
      chatId,
      content,
      messageType: mediaUrl ? 'image' : 'text',
      mediaUrl
    };

    if (socket && socket.connected) {
      socket.emit('send_message', payload);
    } else {
      // HTTP fallback
      try {
        const res = await chatApi.sendMessage(chatId, payload);
        if (res.success && res.data) {
          setMessages((prev) => [...prev, res.data]);
          setTimeout(scrollToBottom, 50);
        }
      } catch (err) {
        console.error('[Fallback Send Error]', err);
      }
    }
  };

  const photoUrl =
    otherProfile?.photos?.find((p) => p.isPrimary)?.url ||
    otherProfile?.photos?.[0]?.url ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--color-bg)'
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 24px',
          backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ position: 'relative' }}>
            <img
              src={photoUrl}
              alt={otherProfile?.name}
              style={{
                width: '42px',
                height: '42px',
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
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-success)',
                  border: '2px solid var(--color-surface)'
                }}
              />
            )}
          </div>
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.25rem',
                color: 'var(--color-text-main)',
                margin: 0
              }}
            >
              {otherProfile?.name}
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', margin: 0 }}>
              {isOnline ? 'Online now' : otherProfile?.department || 'Verified Student'}
            </p>
          </div>
        </div>

        {/* Menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer'
            }}
          >
            <MoreVertical size={20} />
          </button>

          {menuOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                width: '160px',
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--color-border)',
                zIndex: 20,
                padding: '4px 0'
              }}
            >
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onReport({ _id: otherUserId, name: otherProfile?.name });
                }}
                style={{
                  width: '100%',
                  padding: '8px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--color-error)',
                  fontSize: '0.85rem',
                  textAlign: 'left'
                }}
              >
                <Flag size={14} />
                <span>Report User</span>
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onUnmatch(matchId);
                }}
                style={{
                  width: '100%',
                  padding: '8px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--color-text-main)',
                  fontSize: '0.85rem',
                  textAlign: 'left'
                }}
              >
                <UserX size={14} />
                <span>Unmatch</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        style={{
          flex: 1,
          padding: '20px 24px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Safety Header Badge */}
        <div
          style={{
            alignSelf: 'center',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-full)',
            padding: '6px 16px',
            fontSize: '0.75rem',
            color: 'var(--color-text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '20px'
          }}
        >
          <ShieldCheck size={14} color="var(--color-primary)" />
          Mutual verified match. Keep conversation respectful and thoughtful.
        </div>

        {messages.map((msg) => (
          <MessageBubble
            key={msg._id || msg.createdAt}
            message={msg}
            isMe={msg.sender?.toString() === currentUserId.toString()}
          />
        ))}

        {/* Typing indicator */}
        {otherUserTyping && (
          <div
            style={{
              alignSelf: 'flex-start',
              fontSize: '0.8rem',
              color: 'var(--color-text-secondary)',
              fontStyle: 'italic',
              margin: '4px 0 8px 12px'
            }}
          >
            {otherProfile?.name} is typing...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview if selected */}
      {selectedImage && (
        <div
          style={{
            padding: '8px 24px',
            backgroundColor: 'var(--color-surface)',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-main)' }}>
            Attached: <strong>{selectedImage.name}</strong>
          </span>
          <button
            onClick={() => setSelectedImage(null)}
            style={{ color: 'var(--color-error)', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Input Form & Quick Emojis */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          padding: '12px 24px'
        }}
      >
        {/* Quick Emoji Bar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setInputText((prev) => prev + emoji)}
              style={{
                fontSize: '1.1rem',
                padding: '2px 6px',
                borderRadius: '6px',
                backgroundColor: 'transparent',
                cursor: 'pointer'
              }}
            >
              {emoji}
            </button>
          ))}
        </div>

        <form onSubmit={handleSend} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Hidden File Input for images */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setSelectedImage(e.target.files[0]);
              }
            }}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach image"
            style={{
              padding: '8px',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <ImageIcon size={20} />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder={`Message ${otherProfile?.name || '...'}`}
            style={{
              flex: 1,
              padding: '12px 18px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg)',
              outline: 'none',
              fontSize: '0.95rem',
              color: 'var(--color-text-main)'
            }}
          />

          <button
            type="submit"
            disabled={!inputText.trim() && !selectedImage}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: inputText.trim() || selectedImage ? 'var(--color-primary)' : 'var(--color-border)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: inputText.trim() || selectedImage ? 'pointer' : 'default',
              transition: 'background-color var(--transition-fast)'
            }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
