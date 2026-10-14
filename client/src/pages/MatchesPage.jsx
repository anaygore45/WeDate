import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, MessageCircle, UserX, Compass, Calendar, GraduationCap } from 'lucide-react';
import { matchApi } from '../services/api.js';
import { Button } from '../components/common/Button.jsx';
import { Modal } from '../components/common/Modal.jsx';

export const MatchesPage = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unmatchingId, setUnmatchingId] = useState(null);
  const navigate = useNavigate();

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await matchApi.getMatches();
      if (res.success && res.data) {
        setMatches(res.data);
      }
    } catch (err) {
      console.warn('[Matches Fetch Error]', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleConfirmUnmatch = async () => {
    if (!unmatchingId) return;
    try {
      await matchApi.deleteMatch(unmatchingId);
      setMatches((prev) => prev.filter((m) => m._id !== unmatchingId));
    } catch (err) {
      console.warn('[Unmatch Error]', err.message);
    } finally {
      setUnmatchingId(null);
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
      <div className="container" style={{ maxWidth: '960px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '2.4rem',
              color: 'var(--color-primary)',
              margin: '0 0 8px 0'
            }}
          >
            Your Matches
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', margin: 0 }}>
            Mutual connections formed on campus. Chat directly or view profile details.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ color: 'var(--color-text-secondary)' }}>Loading your matches...</p>
          </div>
        ) : matches.length === 0 ? (
          /* Empty state */
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '60px 32px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}
            >
              <Heart size={32} />
            </div>
            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.8rem',
                color: 'var(--color-primary)',
                marginBottom: '8px'
              }}
            >
              No Matches Yet
            </h3>
            <p
              style={{
                fontSize: '0.95rem',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.6,
                maxWidth: '440px',
                margin: '0 auto 28px auto'
              }}
            >
              Keep swiping on the Discovery deck! When you and another student both express mutual interest, your match will appear right here.
            </p>
            <Link to="/discover">
              <Button variant="primary" size="lg" icon={Compass}>
                Explore Discover Deck
              </Button>
            </Link>
          </div>
        ) : (
          /* Matches Grid */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '24px'
            }}
          >
            {matches.map((item) => {
              const photo =
                item.profile?.photos?.find((p) => p.isPrimary)?.url ||
                item.profile?.photos?.[0]?.url ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';

              const matchDate = new Date(item.createdAt).toLocaleDateString([], {
                month: 'short',
                day: 'numeric'
              });

              return (
                <div
                  key={item._id}
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform var(--transition-fast)'
                  }}
                >
                  {/* Photo Header */}
                  <div style={{ position: 'relative', height: '220px', width: '100%' }}>
                    <img
                      src={photo}
                      alt={item.profile?.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        backgroundColor: 'rgba(37,32,32,0.65)',
                        color: '#FFF',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Calendar size={11} /> Matched {matchDate}
                    </div>
                  </div>

                  {/* Body Info */}
                  <div style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: '8px' }}>
                      <h3
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: '1.4rem',
                          color: 'var(--color-text-main)',
                          margin: 0
                        }}
                      >
                        {item.profile?.name}, {item.profile?.age}
                      </h3>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: 'var(--color-text-secondary)',
                          fontSize: '0.82rem',
                          marginTop: '4px'
                        }}
                      >
                        <GraduationCap size={14} color="var(--color-primary)" />
                        <span>{item.profile?.department}</span>
                      </div>
                    </div>

                    {item.chat?.lastMessage?.text ? (
                      <p
                        style={{
                          fontSize: '0.85rem',
                          color: 'var(--color-text-secondary)',
                          margin: '0 0 14px 0',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Last: "{item.chat.lastMessage.text}"
                      </p>
                    ) : (
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-primary)', margin: '0 0 14px 0', fontWeight: 500 }}>
                        No messages yet. Send a greeting!
                      </p>
                    )}

                    {/* Actions */}
                    <div
                      style={{
                        display: 'flex',
                        gap: '8px',
                        marginTop: 'auto',
                        paddingTop: '12px',
                        borderTop: '1px solid var(--color-border-subtle)'
                      }}
                    >
                      <Button
                        variant="primary"
                        size="sm"
                        icon={MessageCircle}
                        style={{ flex: 1 }}
                        onClick={() => navigate(`/chat/${item._id}`)}
                      >
                        Chat
                      </Button>
                      <button
                        onClick={() => setUnmatchingId(item._id)}
                        title="Unmatch user"
                        style={{
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--color-border)',
                          backgroundColor: 'var(--color-surface)',
                          color: 'var(--color-text-secondary)',
                          cursor: 'pointer'
                        }}
                      >
                        <UserX size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Unmatch Confirmation Modal */}
      {unmatchingId && (
        <Modal
          isOpen={Boolean(unmatchingId)}
          onClose={() => setUnmatchingId(null)}
          title="Remove Match?"
          maxWidth="420px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Removing this match will deactivate the relationship and disable further messaging for both parties. This cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button variant="outline" onClick={() => setUnmatchingId(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmUnmatch}>
                Confirm Unmatch
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
