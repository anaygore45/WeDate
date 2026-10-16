import React, { useState } from 'react';
import { Sparkles, Info, CheckCircle2, ChevronDown, ChevronUp, Loader2, MessageSquare } from 'lucide-react';
import { aiApi } from '../../services/api.js';

export const WhyThisProfile = ({
  score,
  reasons = [],
  isPersonalized = true,
  candidateUserId = null,
  candidateName = 'this student'
}) => {
  const [showAiInsight, setShowAiInsight] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [aiError, setAiError] = useState(null);

  if (!isPersonalized || score === null) return null;

  const handleFetchAiExplanation = async () => {
    if (showAiInsight && aiExplanation) {
      setShowAiInsight(false);
      return;
    }

    setShowAiInsight(true);
    if (aiExplanation || !candidateUserId) return;

    setAiLoading(true);
    setAiError(null);

    try {
      const res = await aiApi.explainMatch(candidateUserId);
      if (res.success && res.data) {
        setAiExplanation(res.data);
      } else {
        setAiError(res.message || 'Could not retrieve AI insight.');
      }
    } catch (err) {
      if (err.response?.data?.code === 'AI_NOT_CONFIGURED') {
        setAiError('Configure GEMINI_API_KEY in server environment to enable generative explanations.');
      } else {
        setAiError(err.response?.data?.message || err.message || 'AI Assistant is currently unavailable.');
      }
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div
      style={{
        marginTop: '16px',
        padding: '14px 16px',
        backgroundColor: 'var(--color-surface-subtle)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={16} color="var(--color-primary)" />
          <span
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--color-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            WeDate Smart Discovery
          </span>
        </div>

        {score !== null && (
          <span
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-primary)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 700
            }}
          >
            {score}% Compatibility
          </span>
        )}
      </div>

      {reasons.length > 0 ? (
        <ul
          style={{
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            marginBottom: '10px'
          }}
        >
          {reasons.map((reason, idx) => (
            <li
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '6px',
                fontSize: '0.85rem',
                color: 'var(--color-text-main)',
                lineHeight: 1.4
              }}
            >
              <CheckCircle2
                size={14}
                color="var(--color-primary)"
                style={{ flexShrink: 0, marginTop: '2px' }}
              />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
          General profile recommendations based on verified student community activity.
        </p>
      )}

      {/* AI Deep Connection Insight Button */}
      {candidateUserId && (
        <div style={{ marginBottom: '10px' }}>
          <button
            type="button"
            onClick={handleFetchAiExplanation}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-accent)',
              borderRadius: 'var(--radius-full)',
              padding: '5px 12px',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--color-primary)',
              cursor: 'pointer',
              transition: 'var(--transition-fast)'
            }}
          >
            <Sparkles size={13} />
            <span>{showAiInsight ? 'Hide Gemini Connection Insight' : '✨ Gemini Deep Connection Insight'}</span>
            {showAiInsight ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {/* AI Explanation Drawer */}
          {showAiInsight && (
            <div
              style={{
                marginTop: '10px',
                padding: '12px 14px',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              {aiLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', fontSize: '0.8rem' }}>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Gemini is analyzing grounded profile synergy...</span>
                </div>
              ) : aiError ? (
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-error)' }}>Notice: </span>
                  {aiError}
                </div>
              ) : aiExplanation ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-main)', lineHeight: 1.5, margin: 0 }}>
                    {aiExplanation.explanation}
                  </p>

                  {aiExplanation.sharedHighlights && aiExplanation.sharedHighlights.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
                      {aiExplanation.sharedHighlights.map((hl, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: 'var(--color-primary-light)',
                            color: 'var(--color-primary)'
                          }}
                        >
                          ✦ {hl}
                        </span>
                      ))}
                    </div>
                  )}

                  {aiExplanation.conversationSpark && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 10px',
                        backgroundColor: 'var(--color-bg)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        color: 'var(--color-text-secondary)',
                        marginTop: '4px'
                      }}
                    >
                      <MessageSquare size={12} color="var(--color-primary)" />
                      <span>
                        <strong style={{ color: 'var(--color-text-main)' }}>Idea:</strong> {aiExplanation.conversationSpark}
                      </span>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}

      <p
        style={{
          fontSize: '0.7rem',
          color: 'var(--color-text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          margin: 0
        }}
      >
        <Info size={11} />
        Similarity computed from voluntary profile disclosures. Never guarantees relationship outcome.
      </p>
    </div>
  );
};
