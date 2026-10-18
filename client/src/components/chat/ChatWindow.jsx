import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Image as ImageIcon,
  Smile,
  MoreVertical,
  Flag,
  UserX,
  ShieldCheck,
  X,
  Sparkles,
  Loader2,
  Wand2,
  RefreshCw
} from 'lucide-react';
import { MessageBubble } from './MessageBubble.jsx';
import { getSocket } from '../../services/socket.js';
import { chatApi, matchApi, aiApi } from '../../services/api.js';

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

  // Gemini AI Icebreaker state
  const [showIcebreakers, setShowIcebreakers] = useState(false);
  const [icebreakersLoading, setIcebreakersLoading] = useState(false);
  const [icebreakers, setIcebreakers] = useState([]);
  const [icebreakerError, setIcebreakerError] = useState(null);

  // Gemini AI "What to Reply" state
  const [showSmartReplies, setShowSmartReplies] = useState(false);
  const [smartRepliesLoading, setSmartRepliesLoading] = useState(false);
  const [smartReplies, setSmartReplies] = useState([]);
  const [smartReplyError, setSmartReplyError] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFetchIcebreakers = async () => {
    if (showIcebreakers) {
      setShowIcebreakers(false);
      return;
    }

    setShowIcebreakers(true);
    if (icebreakers.length > 0) return;

    setIcebreakersLoading(true);
    setIcebreakerError(null);

    try {
      const res = await aiApi.getIcebreakers(matchId);
      if (res.success && res.data?.starters) {
        setIcebreakers(res.data.starters);
      } else {
        setIcebreakerError(res.message || 'Could not generate conversation starters.');
      }
    } catch (err) {
      if (err.response?.data?.code === 'AI_NOT_CONFIGURED') {
        setIcebreakerError('Set GEMINI_API_KEY in server environment to enable smart icebreakers.');
      } else {
        setIcebreakerError(err.response?.data?.message || err.message || 'Failed to load conversation starters.');
      }
    } finally {
      setIcebreakersLoading(false);
    }
  };

  const handleSelectIcebreaker = (starterText) => {
    setInputText(starterText);
    setShowIcebreakers(false);
  };

  const handleFetchSmartReplies = async () => {
    if (showSmartReplies) {
      setShowSmartReplies(false);
      return;
    }

    setShowSmartReplies(true);
    setShowIcebreakers(false);
    setSmartRepliesLoading(true);
    setSmartReplyError(null);

    try {
      const res = await aiApi.suggestReplies(chatId, matchId);
      if (res.success && res.data?.replies) {
        setSmartReplies(res.data.replies);
      } else {
        setSmartReplyError(res.message || 'Could not generate reply suggestions.');
      }
    } catch (err) {
      if (err.response?.data?.code === 'AI_NOT_CONFIGURED') {
        setSmartReplyError('Set GEMINI_API_KEY in server environment to enable smart reply suggestions.');
      } else {
        setSmartReplyError(err.response?.data?.message || err.message || 'Failed to generate reply suggestions.');
      }
    } finally {
      setSmartRepliesLoading(false);
    }
  };

  const handleSelectReply = (replyText) => {
    setInputText(replyText);
    setShowSmartReplies(false);
  };

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

        {messages.map((msg) => {
          const myId = (currentUserId || '').toString();
          const senderId = (msg.sender?._id || msg.sender?.id || msg.sender || '').toString();
          const isMe = Boolean(myId && senderId && myId === senderId);
          return (
            <MessageBubble
              key={msg._id || msg.createdAt || Math.random()}
              message={msg}
              isMe={isMe}
            />
          );
        })}

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
        {/* Quick Emoji Bar & AI Tools Triggers */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
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

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* AI Smart Reply Helper Trigger */}
            <button
              type="button"
              onClick={handleFetchSmartReplies}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: showSmartReplies ? 'var(--color-primary)' : 'var(--color-primary-light)',
                color: showSmartReplies ? '#FFFFFF' : 'var(--color-primary)',
                border: '1px solid var(--color-accent)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
            >
              <Wand2 size={13} />
              <span>{showSmartReplies ? 'Close Reply Helper' : '✨ What to Reply?'}</span>
            </button>

            {/* AI Icebreakers Trigger */}
            <button
              type="button"
              onClick={handleFetchIcebreakers}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: showIcebreakers ? 'var(--color-primary)' : 'var(--color-primary-light)',
                color: showIcebreakers ? '#FFFFFF' : 'var(--color-primary)',
                border: '1px solid var(--color-accent)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
            >
              <Sparkles size={13} />
              <span>{showIcebreakers ? 'Close Starters' : '✨ Icebreakers'}</span>
            </button>
          </div>
        </div>

        {/* AI "What to Reply" Smart Helper Drawer */}
        {showSmartReplies && (
          <div
            style={{
              marginBottom: '12px',
              padding: '12px 14px',
              backgroundColor: 'var(--color-surface-subtle)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              animation: 'slideUp 0.25s ease-out'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Wand2 size={14} color="var(--color-primary)" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  AI Chat Helper — What to reply?
                </span>
              </div>
              <button
                type="button"
                onClick={handleFetchSmartReplies}
                disabled={smartRepliesLoading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.7rem',
                  color: 'var(--color-text-secondary)'
                }}
              >
                <RefreshCw size={11} className={smartRepliesLoading ? 'animate-spin' : ''} />
                <span>Reroll suggestions</span>
              </button>
            </div>

            {smartRepliesLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', fontSize: '0.8rem', padding: '10px 0' }}>
                <Loader2 size={16} className="animate-spin" />
                <span>Reading conversation vibe & drafting replies with Gemini...</span>
              </div>
            ) : smartReplyError ? (
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', padding: '6px 0' }}>
                <span style={{ fontWeight: 600, color: 'var(--color-error)' }}>Notice: </span>
                {smartReplyError}
              </div>
            ) : smartReplies.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {smartReplies.map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectReply(item.reply)}
                    style={{
                      textAlign: 'left',
                      padding: '10px 14px',
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      transition: 'var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-primary)';
                      e.currentTarget.style.backgroundColor = 'var(--color-primary-light)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                      e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: 'var(--color-primary)',
                          textTransform: 'uppercase',
                          backgroundColor: 'var(--color-primary-light)',
                          padding: '2px 8px',
                          borderRadius: '10px'
                        }}
                      >
                        {item.tone || 'Suggested Reply'}
                      </span>
                      {item.contextReason && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                          {item.contextReason}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-main)', lineHeight: 1.45 }}>
                      "{item.reply}"
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                Click below to get tailored reply suggestions based on the last messages.
              </p>
            )}
          </div>
        )}

        {/* Smart Icebreakers Drawer */}
        {showIcebreakers && (
          <div
            style={{
              marginBottom: '12px',
              padding: '12px 14px',
              backgroundColor: 'var(--color-surface-subtle)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              animation: 'slideUp 0.25s ease-out'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} color="var(--color-primary)" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  Personalized Conversation Starters
                </span>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>
                Click to copy into input
              </span>
            </div>

            {icebreakersLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', fontSize: '0.8rem', padding: '10px 0' }}>
                <Loader2 size={16} className="animate-spin" />
                <span>Generating grounded starters with Gemini...</span>
              </div>
            ) : icebreakerError ? (
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', padding: '6px 0' }}>
                <span style={{ fontWeight: 600, color: 'var(--color-error)' }}>Notice: </span>
                {icebreakerError}
              </div>
            ) : icebreakers.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {icebreakers.map((starter, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectIcebreaker(starter.starter)}
                    style={{
                      textAlign: 'left',
                      padding: '8px 12px',
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      transition: 'var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-primary)';
                      e.currentTarget.style.backgroundColor = 'var(--color-primary-light)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                      e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                        {starter.category || 'Shared Passion'}
                      </span>
                      {starter.rationale && (
                        <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
                          {starter.rationale}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-main)', lineHeight: 1.4 }}>
                      "{starter.starter}"
                    </p>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        )}

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
