import React, { useState, useEffect } from 'react';
import {
  Upload,
  Trash2,
  Star,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  Save,
  Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { profileApi, aiApi } from '../services/api.js';
import { Button } from '../components/common/Button.jsx';
import { ChipSelect } from '../components/common/ChipSelect.jsx';

const ALL_INTERESTS = [
  'Coding',
  'AI & Machine Learning',
  'Design',
  'Music',
  'Film & Cinema',
  'Photography',
  'Literature',
  'Philosophy',
  'Debating',
  'Robotics',
  'Theatre',
  'Astronomy'
];

const ALL_HOBBIES = [
  'Cafe Hopping',
  'Trekking & Hiking',
  'Guitar / Jamming',
  'Gaming',
  'Reading',
  'Cooking & Baking',
  'Badminton',
  'Fitness & Gym',
  'Podcasts',
  'Museums & Galleries'
];

const GOAL_OPTIONS = [
  'Long-term relationship',
  'Short-term relationship',
  'Casual dating',
  'Friendship & Study partner',
  'Open to exploring'
];

export const ProfilePage = () => {
  const { profile, refreshProfile } = useAuth();

  const [name, setName] = useState(profile?.name || '');
  const [department, setDepartment] = useState(profile?.department || '');
  const [academicYear, setAcademicYear] = useState(profile?.academicYear || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [height, setHeight] = useState(profile?.height || '');
  const [interests, setInterests] = useState(profile?.interests || []);
  const [hobbies, setHobbies] = useState(profile?.hobbies || []);
  const [relationshipGoals, setRelationshipGoals] = useState(profile?.relationshipGoals || []);
  const [isVisible, setIsVisible] = useState(profile?.isVisible ?? true);

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  // Gemini AI Bio Assistant State
  const [enhancingBio, setEnhancingBio] = useState(false);
  const [bioSuggestions, setBioSuggestions] = useState([]);
  const [showBioSuggestions, setShowBioSuggestions] = useState(false);
  const [bioEnhanceError, setBioEnhanceError] = useState(null);

  const handleAiBioEnhance = async () => {
    if (showBioSuggestions && bioSuggestions.length > 0) {
      setShowBioSuggestions(false);
      return;
    }

    setEnhancingBio(true);
    setBioEnhanceError(null);
    setShowBioSuggestions(true);

    try {
      const res = await aiApi.enhanceBio(bio, 'authentic');
      if (res.success && res.data?.suggestions) {
        setBioSuggestions(res.data.suggestions);
      } else {
        setBioEnhanceError(res.message || 'Could not generate bio suggestions.');
      }
    } catch (err) {
      if (err.response?.data?.code === 'AI_NOT_CONFIGURED') {
        setBioEnhanceError('Configure GEMINI_API_KEY in server environment to enable AI bio polish.');
      } else {
        setBioEnhanceError(err.response?.data?.message || err.message || 'AI Assistant is currently unavailable.');
      }
    } finally {
      setEnhancingBio(false);
    }
  };

  const handleApplyBioSuggestion = (suggestedBio) => {
    setBio(suggestedBio);
    setShowBioSuggestions(false);
  };

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setDepartment(profile.department || '');
      setAcademicYear(profile.academicYear || '');
      setBio(profile.bio || '');
      setHeight(profile.height || '');
      setInterests(profile.interests || []);
      setHobbies(profile.hobbies || []);
      setRelationshipGoals(profile.relationshipGoals || []);
      setIsVisible(profile.isVisible ?? true);
    }
  }, [profile]);

  const handleSave = async (e) => {
    e?.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await profileApi.updateMyProfile({
        name,
        department,
        academicYear,
        bio,
        height: height ? Number(height) : null,
        interests,
        hobbies,
        relationshipGoals
      });

      if (res.success) {
        await refreshProfile();
        setSuccessMessage('Profile details saved successfully.');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVisibility = async () => {
    try {
      const res = await profileApi.toggleVisibility(!isVisible);
      if (res.success) {
        setIsVisible(res.data.isVisible);
        await refreshProfile();
      }
    } catch (err) {
      setError(err.message || 'Failed to toggle visibility.');
    }
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('photo', file);
      await profileApi.uploadPhoto(formData);
      await refreshProfile();
    } catch (err) {
      setError(err.message || 'Photo upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    try {
      await profileApi.deletePhoto(photoId);
      await refreshProfile();
    } catch (err) {
      setError(err.message || 'Failed to remove photo.');
    }
  };

  const handleSetPrimary = async (photoId) => {
    try {
      await profileApi.setPrimaryPhoto(photoId);
      await refreshProfile();
    } catch (err) {
      setError(err.message || 'Failed to set primary photo.');
    }
  };

  const photos = profile?.photos || [];

  return (
    <div style={{ flex: 1, padding: '36px 20px', backgroundColor: 'var(--color-bg)' }}>
      <div className="container" style={{ maxWidth: '780px' }}>
        {/* Header with Visibility Badge */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '28px',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '2.4rem',
                color: 'var(--color-primary)',
                margin: '0 0 6px 0'
              }}
            >
              My Profile
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', margin: 0 }}>
              Manage your photographs, academic details, and recommendation preferences
            </p>
          </div>

          <Button
            variant={isVisible ? 'secondary' : 'outline'}
            size="sm"
            icon={isVisible ? Eye : EyeOff}
            onClick={handleToggleVisibility}
          >
            {isVisible ? 'Discoverable' : 'Hidden from Discovery'}
          </Button>
        </div>

        {successMessage && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--color-success-bg)',
              color: 'var(--color-success)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.9rem',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Check size={18} /> {successMessage}
          </div>
        )}

        {error && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--color-error-bg)',
              color: 'var(--color-error)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.9rem',
              marginBottom: '20px'
            }}
          >
            {error}
          </div>
        )}

        {/* Photos Card */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            marginBottom: '28px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.4rem',
              color: 'var(--color-text-main)',
              marginBottom: '8px'
            }}
          >
            Photo Gallery ({photos.length}/6)
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
            The primary photo appears first in the discovery deck.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: '14px'
            }}
          >
            {photos.map((photo) => (
              <div
                key={photo._id}
                style={{
                  position: 'relative',
                  height: '160px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: photo.isPrimary ? '2px solid var(--color-primary)' : '1px solid var(--color-border)'
                }}
              >
                <img
                  src={photo.url}
                  alt="My photo"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {photo.isPrimary && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '6px',
                      left: '6px',
                      backgroundColor: 'var(--color-primary)',
                      color: '#FFF',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}
                  >
                    Primary
                  </div>
                )}

                <div
                  style={{
                    position: 'absolute',
                    bottom: '6px',
                    right: '6px',
                    display: 'flex',
                    gap: '4px'
                  }}
                >
                  {!photo.isPrimary && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(photo._id)}
                      title="Set as primary"
                      style={{
                        backgroundColor: 'rgba(37,32,32,0.7)',
                        color: '#FFF',
                        padding: '4px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      <Star size={14} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(photo._id)}
                    title="Delete photo"
                    style={{
                      backgroundColor: 'rgba(179,58,74,0.85)',
                      color: '#FFF',
                      padding: '4px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            {photos.length < 6 && (
              <label
                style={{
                  height: '160px',
                  borderRadius: 'var(--radius-md)',
                  border: '2px dashed var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: uploading ? 'wait' : 'pointer',
                  color: 'var(--color-text-secondary)'
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadPhoto}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
                <Upload size={22} color="var(--color-primary)" />
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  {uploading ? 'Uploading...' : 'Add Photo'}
                </span>
              </label>
            )}
          </div>
        </div>

        {/* Profile Attributes Form */}
        <form
          onSubmit={handleSave}
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '22px'
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.4rem',
              color: 'var(--color-text-main)',
              margin: 0
            }}
          >
            Profile Information
          </h3>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                outline: 'none',
                fontSize: '0.95rem'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Academic Year
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Height in cm
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="e.g. 178"
              style={{
                width: '180px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                outline: 'none',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                Biography
              </label>
              <button
                type="button"
                onClick={handleAiBioEnhance}
                disabled={enhancingBio}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  border: '1px solid var(--color-accent)',
                  borderRadius: 'var(--radius-full)',
                  padding: '3px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: enhancingBio ? 'not-allowed' : 'pointer'
                }}
              >
                {enhancingBio ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                <span>{enhancingBio ? 'AI Coach thinking...' : '✨ Polish with AI Coach'}</span>
              </button>
            </div>

            <textarea
              rows={4}
              maxLength={600}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others about your studies, passions, favorite campus spots, or weekend hobbies..."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                outline: 'none',
                fontSize: '0.95rem',
                resize: 'vertical'
              }}
            />

            {/* AI Bio Suggestions Panel */}
            {showBioSuggestions && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '14px',
                  backgroundColor: 'var(--color-surface-subtle)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  animation: 'slideUp 0.25s ease-out'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={15} color="var(--color-primary)" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                      Gemini Bio Coach Suggestions
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowBioSuggestions(false)}
                    style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
                  >
                    Dismiss
                  </button>
                </div>

                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', margin: '0 0 10px 0' }}>
                  Preserves your authentic voice and stated hobbies while making your profile more engaging.
                </p>

                {enhancingBio ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', fontSize: '0.8rem', padding: '12px 0' }}>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Crafting authentic bio enhancements...</span>
                  </div>
                ) : bioEnhanceError ? (
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    <strong style={{ color: 'var(--color-error)' }}>Notice: </strong>
                    {bioEnhanceError}
                  </div>
                ) : bioSuggestions.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {bioSuggestions.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '12px',
                          backgroundColor: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-sm)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                            {item.tone}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleApplyBioSuggestion(item.bio)}
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              color: '#FFFFFF',
                              backgroundColor: 'var(--color-primary)',
                              border: 'none',
                              borderRadius: 'var(--radius-full)',
                              padding: '3px 10px',
                              cursor: 'pointer'
                            }}
                          >
                            Use This Bio
                          </button>
                        </div>
                        <p style={{ margin: '0 0 6px 0', fontSize: '0.85rem', color: 'var(--color-text-main)', lineHeight: 1.5 }}>
                          "{item.bio}"
                        </p>
                        {item.coachTip && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                            Coach Tip: {item.coachTip}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              Relationship Goals
            </label>
            <ChipSelect
              options={GOAL_OPTIONS}
              selected={relationshipGoals}
              onChange={setRelationshipGoals}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              Interests
            </label>
            <ChipSelect
              options={ALL_INTERESTS}
              selected={interests}
              onChange={setInterests}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              Hobbies & Lifestyle
            </label>
            <ChipSelect
              options={ALL_HOBBIES}
              selected={hobbies}
              onChange={setHobbies}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <Button type="submit" variant="primary" size="lg" icon={Save} loading={saving}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
