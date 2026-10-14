import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SlidersHorizontal,
  RefreshCw,
  Heart,
  Sparkles,
  MessageCircle,
  EyeOff,
  ShieldCheck
} from 'lucide-react';
import { discoveryApi, userApi } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useSocket } from '../contexts/SocketContext.jsx';
import { ProfileCard } from '../components/discovery/ProfileCard.jsx';
import { FilterModal } from '../components/discovery/FilterModal.jsx';
import { ReportModal } from '../components/safety/ReportModal.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { Button } from '../components/common/Button.jsx';

export const DiscoveryPage = () => {
  const { user, profile } = useAuth();
  const { triggerMatchCelebration } = useSocket();
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [targetForReport, setTargetForReport] = useState(null);
  const [isPersonalized, setIsPersonalized] = useState(true);

  // Mutual match celebration modal state
  const [matchModalData, setMatchModalData] = useState(null);

  const fetchDiscoveryQueue = async (customFilters = filters) => {
    setLoading(true);
    try {
      const res = await discoveryApi.getQueue(customFilters);
      if (res.success && res.data) {
        setCandidates(res.data.candidates || []);
        setCurrentIndex(0);
        setIsPersonalized(res.data.isPersonalized ?? true);
      }
    } catch (err) {
      console.warn('[Discovery Queue Error]', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscoveryQueue();
  }, []);

  const handleSwipe = async (targetUserId, action) => {
    try {
      const res = await discoveryApi.swipe(targetUserId, action);
      if (res.success && res.data) {
        if (res.data.isMatch) {
          // Trigger confetti & display match popup!
          triggerMatchCelebration();
          setMatchModalData({
            matchId: res.data.matchId,
            chatId: res.data.chatId,
            matchedProfile: res.data.matchedProfile || candidates[currentIndex]
          });
        }
      }
    } catch (err) {
      console.warn('[Swipe Action Error]', err.message);
    } finally {
      // Advance to next profile in queue
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleReport = (cand) => {
    setTargetForReport(cand);
    setReportModalOpen(true);
  };

  const handleBlock = async (cand) => {
    const targetId = cand.user?._id || cand.user || cand._id;
    try {
      await userApi.blockUser(targetId);
      // Skip current profile immediately
      setCurrentIndex((prev) => prev + 1);
    } catch (err) {
      console.warn('[Block Error]', err.message);
    }
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    fetchDiscoveryQueue(newFilters);
  };

  const currentCandidate = candidates[currentIndex];
  const hasRemainingCandidates = currentIndex < candidates.length;

  return (
    <div
      style={{
        flex: 1,
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: 'var(--color-bg)'
      }}
    >
      {/* Top Controls Toolbar */}
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.5rem',
              color: 'var(--color-primary)',
              fontWeight: 600
            }}
          >
            Discover
          </span>
          {isPersonalized && (
            <span
              style={{
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.72rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Sparkles size={11} /> Smart AI
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => fetchDiscoveryQueue()}
            title="Refresh candidate queue"
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <RefreshCw size={18} />
          </button>

          <button
            onClick={() => setFilterModalOpen(true)}
            title="Adjust filters"
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-main)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <SlidersHorizontal size={16} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Main Card / Queue Area */}
      {loading ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px'
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              border: '3px solid var(--color-border)',
              borderTopColor: 'var(--color-primary)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              marginBottom: '16px'
            }}
          />
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
            Finding compatible student profiles...
          </p>
        </div>
      ) : hasRemainingCandidates ? (
        <ProfileCard
          key={currentCandidate._id}
          candidate={currentCandidate}
          onLike={(targetId) => handleSwipe(targetId, 'like')}
          onPass={(targetId) => handleSwipe(targetId, 'pass')}
          onReport={handleReport}
          onBlock={handleBlock}
          isPersonalized={isPersonalized}
        />
      ) : (
        /* Empty Queue State */
        <div
          style={{
            width: '100%',
            maxWidth: '460px',
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-border)',
            padding: '56px 32px',
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
            <EyeOff size={32} />
          </div>

          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.7rem',
              color: 'var(--color-primary)',
              marginBottom: '10px'
            }}
          >
            You're All Caught Up
          </h3>

          <p
            style={{
              fontSize: '0.92rem',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.6,
              marginBottom: '28px'
            }}
          >
            You've reviewed all currently eligible student profiles matching your criteria. Try broadening your discovery filters or check back later!
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Button variant="outline" onClick={() => setFilterModalOpen(true)}>
              Broaden Filters
            </Button>
            <Button variant="primary" onClick={() => fetchDiscoveryQueue()}>
              Refresh Queue
            </Button>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      <FilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        filters={filters}
        onApply={handleApplyFilters}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetUser={targetForReport}
        onSuccess={() => setCurrentIndex((prev) => prev + 1)}
      />

      {/* Mutual Match Celebration Modal */}
      {matchModalData && (
        <Modal
          isOpen={Boolean(matchModalData)}
          onClose={() => setMatchModalData(null)}
          title="It's a Mutual Match!"
          maxWidth="440px"
        >
          <div style={{ textAlign: 'center', padding: '12px 0 8px 0' }}>
            {/* Matched Avatar with Heart Badge */}
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '20px' }}>
              <img
                src={
                  matchModalData.matchedProfile?.photos?.find((p) => p.isPrimary)?.url ||
                  matchModalData.matchedProfile?.photos?.[0]?.url ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'
                }
                alt={matchModalData.matchedProfile?.name}
                style={{
                  width: '110px',
                  height: '110px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid var(--color-surface)',
                  boxShadow: 'var(--shadow-editorial)'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '4px',
                  right: '4px',
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #FFF'
                }}
              >
                <Heart size={18} fill="#EBC9CE" color="#762D43" />
              </div>
            </div>

            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.8rem',
                color: 'var(--color-primary)',
                marginBottom: '8px'
              }}
            >
              You and {matchModalData.matchedProfile?.name} liked each other!
            </h3>

            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '28px' }}>
              Start your conversation now to break the ice and talk about shared interests.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Button
                variant="primary"
                size="lg"
                icon={MessageCircle}
                onClick={() => {
                  const mId = matchModalData.matchId;
                  setMatchModalData(null);
                  navigate(`/chat/${mId}`);
                }}
              >
                Start Conversation
              </Button>
              <Button
                variant="ghost"
                onClick={() => setMatchModalData(null)}
              >
                Keep Discovering
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
