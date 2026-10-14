import React, { useState, useEffect } from 'react';
import {
  Heart,
  X,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  GraduationCap,
  Sparkles,
  MoreVertical,
  Flag,
  Ban
} from 'lucide-react';
import { WhyThisProfile } from './WhyThisProfile.jsx';

export const ProfileCard = ({
  candidate,
  onLike,
  onPass,
  onReport,
  onBlock,
  isPersonalized = true
}) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [animationClass, setAnimationClass] = useState('');

  const photos = candidate?.photos && candidate.photos.length > 0
    ? candidate.photos
    : [{ url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80' }];

  // Reset photo index when candidate changes
  useEffect(() => {
    setActivePhotoIdx(0);
    setMenuOpen(false);
    setAnimationClass('animate-fade-in');
  }, [candidate?._id]);

  // Keyboard navigation: Left Arrow -> Pass, Right Arrow -> Like
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') {
        handleAction('pass');
      } else if (e.key === 'ArrowRight') {
        handleAction('like');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [candidate?._id]);

  const handleAction = (type) => {
    if (type === 'like') {
      setAnimationClass('animate-swipe-right');
      setTimeout(() => onLike(candidate.user?._id || candidate.user), 300);
    } else {
      setAnimationClass('animate-swipe-left');
      setTimeout(() => onPass(candidate.user?._id || candidate.user), 300);
    }
  };

  const nextPhoto = (e) => {
    e.stopPropagation();
    setActivePhotoIdx((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = (e) => {
    e.stopPropagation();
    setActivePhotoIdx((prev) => (prev - 1 + photos.length) % photos.length);
  };

  if (!candidate) return null;

  return (
    <div
      className={animationClass}
      style={{
        width: '100%',
        maxWidth: '460px',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-editorial)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      {/* Photo Frame Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '460px',
          backgroundColor: '#1E191A',
          overflow: 'hidden'
        }}
      >
        <img
          src={photos[activePhotoIdx]?.url}
          alt={candidate.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'opacity 0.2s ease-in-out'
          }}
        />

        {/* Gallery Step Indicators */}
        {photos.length > 1 && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              right: '12px',
              display: 'flex',
              gap: '4px',
              zIndex: 10
            }}
          >
            {photos.map((_, idx) => (
              <div
                key={idx}
                style={{
                  flex: 1,
                  height: '3px',
                  borderRadius: '2px',
                  backgroundColor: idx === activePhotoIdx ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)',
                  transition: 'background-color 0.2s ease'
                }}
              />
            ))}
          </div>
        )}

        {/* Previous / Next tap areas */}
        {photos.length > 1 && (
          <>
            <button
              onClick={prevPhoto}
              style={{
                position: 'absolute',
                left: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(37, 32, 32, 0.4)',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextPhoto}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(37, 32, 32, 0.4)',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
              }}
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* More Actions Menu Button (Report / Block) */}
        <div style={{ position: 'absolute', top: '24px', right: '12px', zIndex: 20 }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: 'rgba(37, 32, 32, 0.55)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <MoreVertical size={18} />
          </button>

          {menuOpen && (
            <div
              style={{
                position: 'absolute',
                top: '40px',
                right: 0,
                width: '160px',
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--color-border)',
                zIndex: 30,
                padding: '4px 0'
              }}
            >
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onReport(candidate);
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
                <span>Report Profile</span>
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onBlock(candidate);
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
                <Ban size={14} />
                <span>Block User</span>
              </button>
            </div>
          )}
        </div>

        {/* Subtle photo gradient vignette */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '100px',
            background: 'linear-gradient(to top, rgba(37, 32, 32, 0.85) 0%, transparent 100%)',
            pointerEvents: 'none'
          }}
        />

        {/* Photo caption if present */}
        {photos[activePhotoIdx]?.caption && (
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '16px',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '0.8rem',
              fontWeight: 500,
              textShadow: '0 1px 2px rgba(0,0,0,0.6)'
            }}
          >
            "{photos[activePhotoIdx].caption}"
          </div>
        )}
      </div>

      {/* Profile Details Content */}
      <div style={{ padding: '20px 24px 24px 24px' }}>
        {/* Header: Name, Age, Goals */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.75rem',
                color: 'var(--color-text-main)',
                margin: 0
              }}
            >
              {candidate.name}
            </h2>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '1.4rem',
                color: 'var(--color-text-secondary)',
                fontWeight: 300
              }}
            >
              {candidate.age}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '6px',
              color: 'var(--color-text-secondary)',
              fontSize: '0.85rem'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <GraduationCap size={15} color="var(--color-primary)" />
              {candidate.department}
            </span>
            <span>•</span>
            <span>{candidate.academicYear}</span>
          </div>
        </div>

        {/* Biography */}
        {candidate.bio && (
          <p
            style={{
              fontSize: '0.92rem',
              lineHeight: 1.55,
              color: 'var(--color-text-main)',
              marginBottom: '16px',
              fontStyle: 'normal'
            }}
          >
            {candidate.bio}
          </p>
        )}

        {/* Relationship Goals */}
        {candidate.relationshipGoals && candidate.relationshipGoals.length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                fontWeight: 700,
                color: 'var(--color-text-secondary)',
                display: 'block',
                marginBottom: '6px'
              }}
            >
              Looking For
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {candidate.relationshipGoals.map((g, idx) => (
                <span
                  key={idx}
                  style={{
                    backgroundColor: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}
                >
                  {g}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Interests & Hobbies */}
        {((candidate.interests && candidate.interests.length > 0) ||
          (candidate.hobbies && candidate.hobbies.length > 0)) && (
          <div style={{ marginBottom: '14px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                fontWeight: 700,
                color: 'var(--color-text-secondary)',
                display: 'block',
                marginBottom: '6px'
              }}
            >
              Interests & Lifestyle
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {(candidate.interests || []).map((interest, idx) => (
                <span
                  key={`int-${idx}`}
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    color: 'var(--color-text-main)'
                  }}
                >
                  {interest}
                </span>
              ))}
              {(candidate.hobbies || []).map((hobby, idx) => (
                <span
                  key={`hob-${idx}`}
                  style={{
                    backgroundColor: 'var(--color-surface-subtle)',
                    border: '1px solid var(--color-border-subtle)',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    color: 'var(--color-text-secondary)'
                  }}
                >
                  {hobby}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Spoken Languages */}
        {candidate.languages && candidate.languages.length > 0 && (
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
            <span style={{ fontWeight: 600 }}>Languages:</span> {candidate.languages.join(', ')}
          </div>
        )}

        {/* Explainable AI Smart Discovery Section */}
        <WhyThisProfile
          score={candidate.recommendationScore}
          reasons={candidate.reasons}
          isPersonalized={isPersonalized}
        />
      </div>

      {/* Action Controls: Pass and Like */}
      <div
        style={{
          padding: '16px 24px 24px 24px',
          borderTop: '1px solid var(--color-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '32px',
          backgroundColor: 'var(--color-surface)'
        }}
      >
        {/* Pass Button */}
        <button
          onClick={() => handleAction('pass')}
          aria-label="Pass profile (Left Arrow)"
          title="Pass profile (Left Arrow)"
          style={{
            width: '58px',
            height: '58px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-surface)',
            border: '2px solid var(--color-border)',
            color: 'var(--color-error)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-md)',
            cursor: 'pointer',
            transition: 'transform var(--transition-fast)'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <X size={26} strokeWidth={2.5} />
        </button>

        {/* Like Button */}
        <button
          onClick={() => handleAction('like')}
          aria-label="Like profile (Right Arrow)"
          title="Like profile (Right Arrow)"
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
            border: 'none',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(118, 45, 67, 0.3)',
            cursor: 'pointer',
            transition: 'transform var(--transition-fast)'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Heart size={30} fill="#EBC9CE" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};
