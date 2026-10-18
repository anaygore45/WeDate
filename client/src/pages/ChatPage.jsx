import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import { ConversationList } from '../components/chat/ConversationList.jsx';
import { ChatWindow } from '../components/chat/ChatWindow.jsx';
import { ReportModal } from '../components/safety/ReportModal.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { Button } from '../components/common/Button.jsx';
import { chatApi, matchApi } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useSocket } from '../contexts/SocketContext.jsx';

export const ChatPage = () => {
  const { matchId } = useParams();
  const { user } = useAuth();
  const { onlineStatusMap } = useSocket();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Unmatch & Report modals
  const [unmatchingMatchId, setUnmatchingMatchId] = useState(null);
  const [reportTarget, setReportTarget] = useState(null);

  const fetchConversations = async () => {
    try {
      const res = await chatApi.getConversations();
      if (res.success && res.data) {
        setConversations(res.data);
        if (!matchId && res.data.length > 0) {
          navigate(`/chat/${res.data[0].matchId}`, { replace: true });
        }
      }
    } catch (err) {
      console.warn('[Conversations Fetch Error]', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // When route has :matchId, fetch or select corresponding chat
  useEffect(() => {
    const loadMatchConversation = async () => {
      if (!matchId) {
        setActiveConversation(null);
        return;
      }

      try {
        const res = await chatApi.getConversationByMatch(matchId);
        if (res.success && res.data) {
          setActiveConversation({
            chatId: res.data.chat._id,
            matchId: res.data.match._id,
            otherUser: res.data.otherUser,
            otherProfile: res.data.otherProfile
          });
        }
      } catch (err) {
        console.warn('[Match Chat Load Error]', err.message);
        navigate('/matches');
      }
    };

    loadMatchConversation();
  }, [matchId]);

  const handleSelectConversation = (conv) => {
    navigate(`/chat/${conv.matchId}`);
  };

  const handleConfirmUnmatch = async () => {
    if (!unmatchingMatchId) return;
    try {
      await matchApi.deleteMatch(unmatchingMatchId);
      setConversations((prev) => prev.filter((c) => c.matchId !== unmatchingMatchId));
      setActiveConversation(null);
      navigate('/matches');
    } catch (err) {
      console.warn('[Unmatch Error]', err.message);
    } finally {
      setUnmatchingMatchId(null);
    }
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        height: 'calc(100vh - 70px)',
        overflow: 'hidden',
        backgroundColor: 'var(--color-bg)'
      }}
    >
      {/* Left Conversations Sidebar */}
      <ConversationList
        conversations={conversations}
        activeChatId={activeConversation?.chatId}
        onSelectChat={handleSelectConversation}
        onlineStatusMap={onlineStatusMap}
      />

      {/* Right Active Conversation Area */}
      {activeConversation ? (
        <ChatWindow
          chatId={activeConversation.chatId}
          matchId={activeConversation.matchId}
          otherProfile={activeConversation.otherProfile}
          otherUserId={activeConversation.otherUser}
          currentUserId={user?._id || user?.id}
          isOnline={Boolean(onlineStatusMap[activeConversation.otherUser])}
          onUnmatch={(mId) => setUnmatchingMatchId(mId)}
          onReport={(target) => setReportTarget(target)}
        />
      ) : (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            color: 'var(--color-text-secondary)',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              color: 'var(--color-primary)'
            }}
          >
            <MessageSquare size={28} />
          </div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--color-text-main)', margin: '0 0 8px 0' }}>
            Select a conversation
          </h3>
          <p style={{ fontSize: '0.9rem', maxWidth: '340px', margin: 0 }}>
            Choose a match from the list on the left to start chatting in real time.
          </p>
        </div>
      )}

      {/* Unmatch Modal */}
      {unmatchingMatchId && (
        <Modal
          isOpen={Boolean(unmatchingMatchId)}
          onClose={() => setUnmatchingMatchId(null)}
          title="Remove Match?"
          maxWidth="420px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', margin: 0 }}>
              Removing this match will permanently disable communication for both students.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button variant="outline" onClick={() => setUnmatchingMatchId(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmUnmatch}>
                Confirm Unmatch
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={Boolean(reportTarget)}
        onClose={() => setReportTarget(null)}
        targetUser={reportTarget}
        onSuccess={() => {
          setActiveConversation(null);
          navigate('/matches');
        }}
      />
    </div>
  );
};
