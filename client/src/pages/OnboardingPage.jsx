import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  Trash2,
  Star,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  User,
  Heart,
  ImageIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { profileApi } from '../services/api.js';
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
  'Astronomy',
  'Economics',
  'Psychology'
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
  'Museums & Galleries',
  'Cycling',
  'Chess'
];

const GOAL_OPTIONS = [
  'Long-term relationship',
  'Short-term relationship',
  'Casual dating',
  'Friendship & Study partner',
  'Open to exploring'
];

const LANGUAGE_OPTIONS = [
  'English',
  'Hindi',
  'Marathi',
  'Gujarati',
  'Tamil',
  'Telugu',
  'Malayalam',
  'Bengali',
  'Punjabi',
  'French',
  'German',
  'Spanish'
];

export const OnboardingPage = () => {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [name, setName] = useState(profile?.name || '');
  const [gender, setGender] = useState(profile?.gender || 'Woman');
  const [genderPreference, setGenderPreference] = useState(
    profile?.genderPreference || ['Everyone']
  );
  const [department, setDepartment] = useState(profile?.department || 'Computer Engineering');
  const [academicYear, setAcademicYear] = useState(
    profile?.academicYear || 'Third Year (TE)'
  );
  const [height, setHeight] = useState(profile?.height || '');
  const [languages, setLanguages] = useState(profile?.languages || ['English', 'Hindi']);

  const [photos, setPhotos] = useState(profile?.photos || []);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [bio, setBio] = useState(profile?.bio || '');
  const [relationshipGoals, setRelationshipGoals] = useState(
    profile?.relationshipGoals || ['Long-term relationship']
  );
  const [interests, setInterests] = useState(profile?.interests || ['Coding', 'Music']);
  const [hobbies, setHobbies] = useState(profile?.hobbies || ['Cafe Hopping', 'Reading']);

  useEffect(() => {
    if (profile) {
      if (profile.name) setName(profile.name);
      if (profile.gender) setGender(profile.gender);
      if (profile.department) setDepartment(profile.department);
      if (profile.academicYear) setAcademicYear(profile.academicYear);
      if (profile.photos) setPhotos(profile.photos);
      if (profile.bio) setBio(profile.bio);
      if (profile.relationshipGoals?.length) setRelationshipGoals(profile.relationshipGoals);
      if (profile.interests?.length) setInterests(profile.interests);
      if (profile.hobbies?.length) setHobbies(profile.hobbies);
      if (profile.languages?.length) setLanguages(profile.languages);
    }
  }, [profile]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (photos.length >= 6) {
      setError('Maximum 6 photos allowed.');
      return;
    }

    setUploadingPhoto(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('photo', file);
      const res = await profileApi.uploadPhoto(formData);
      if (res.success && res.data) {
        setPhotos(res.data.photos);
        await refreshProfile();
      }
    } catch (err) {
      setError(err.message || 'Photo upload failed. Maximum size is 5MB.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    try {
      const res = await profileApi.deletePhoto(photoId);
      if (res.success && res.data) {
        setPhotos(res.data.photos);
        await refreshProfile();
      }
    } catch (err) {
      setError(err.message || 'Failed to remove photo.');
    }
  };

  const handleSetPrimary = async (photoId) => {
    try {
      const res = await profileApi.setPrimaryPhoto(photoId);
      if (res.success && res.data) {
        setPhotos(res.data.photos);
        await refreshProfile();
      }
    } catch (err) {
      setError(err.message || 'Failed to set primary photo.');
    }
  };

  const saveCurrentStep = async () => {
    setError('');
    setLoading(true);

    try {
      const payload = {
        name,
        gender,
        genderPreference,
        department,
        academicYear,
        height: height ? Number(height) : null,
        languages,
        bio,
        relationshipGoals,
        interests,
        hobbies
      };

      const res = await profileApi.updateMyProfile(payload);
      if (res.success) {
        await refreshProfile();
        return true;
      }
    } catch (err) {
      setError(err.message || 'Failed to save profile progress.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!name.trim()) {
        setError('Please enter your name.');
        return;
      }
      const saved = await saveCurrentStep();
      if (saved) setStep(2);
    } else if (step === 2) {
      if (photos.length === 0) {
        setError('Please upload at least 1 photo to make your profile discoverable.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (relationshipGoals.length === 0) {
        setError('Please choose at least one relationship goal.');
        return;
      }
      if (interests.length === 0) {
        setError('Please select at least one interest for Smart Discovery recommendations.');
        return;
      }
      const saved = await saveCurrentStep();
      if (saved) {
        navigate('/discover');
      }
    }
  };

  return (
    <div
      style={{
        flex: 1,
        padding: '40px 20px',
        backgroundColor: 'var(--color-bg)',
        display: 'flex',
        justifyContent: 'center'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          backgroundColor: 'var(--color-surface)',
          padding: '40px',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-editorial)',
          border: '1px solid var(--color-border)'
        }}
      >
        {/* Progress Bar & Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span
              style={{
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: 700,
                color: 'var(--color-primary)'
              }}
            >
              Step {step} of 3
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              {step === 1 && 'Basic & Academic Info'}
              {step === 2 && 'Profile Photographs'}
              {step === 3 && 'Interests & AI Recommendations'}
            </span>
          </div>

          <div
            style={{
              height: '4px',
              backgroundColor: 'var(--color-border)',
              borderRadius: '2px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${(step / 3) * 100}%`,
                height: '100%',
                backgroundColor: 'var(--color-primary)',
                transition: 'width var(--transition-normal)'
              }}
            />
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--color-error-bg)',
              color: 'var(--color-error)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              marginBottom: '24px'
            }}
          >
            {error}
          </div>
        )}

        {/* STEP 1: Basic & Academic */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--color-primary)', margin: 0 }}>
              Tell us about yourself
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', margin: 0 }}>
              Your basic academic and personal identity details.
            </p>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Preferred Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                style={{
                  width: '100%',
                  padding: '12px 14px',
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
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="Woman">Woman</option>
                  <option value="Man">Man</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Interested in Seeing
                </label>
                <select
                  value={genderPreference[0] || 'Everyone'}
                  onChange={(e) => setGenderPreference([e.target.value])}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="Everyone">Everyone</option>
                  <option value="Woman">Women</option>
                  <option value="Man">Men</option>
                  <option value="Non-binary">Non-binary people</option>
                </select>
              </div>
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
                  placeholder="e.g. Computer Engineering"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Height in cm (optional)
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="e.g. 175"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                Languages You Speak
              </label>
              <ChipSelect
                options={LANGUAGE_OPTIONS}
                selected={languages}
                onChange={setLanguages}
              />
            </div>
          </div>
        )}

        {/* STEP 2: Photographs */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--color-primary)', margin: 0 }}>
              Add Profile Photos
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', margin: 0 }}>
              Upload authentic photographs of yourself. At least 1 photo is required.
            </p>

            {/* Photo Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '14px',
                marginTop: '10px'
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
                    alt="Upload"
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

              {/* Upload Tile */}
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
                    gap: '8px',
                    cursor: uploadingPhoto ? 'wait' : 'pointer',
                    color: 'var(--color-text-secondary)',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploadingPhoto}
                    style={{ display: 'none' }}
                  />
                  <Upload size={24} color="var(--color-primary)" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    {uploadingPhoto ? 'Uploading...' : 'Add Photo'}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                    JPG, PNG, WEBP &lt; 5MB
                  </span>
                </label>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Lifestyle & Compatibility (AI Inputs) */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Sparkles size={20} color="var(--color-primary)" />
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--color-primary)', margin: 0 }}>
                  Smart Discovery Profile
                </h2>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                These attributes power the WeDate Smart Discovery recommendation engine to match you with compatible students.
              </p>
            </div>

            {/* Relationship Goals */}
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

            {/* Interests */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                Academic & Personal Interests
              </label>
              <ChipSelect
                options={ALL_INTERESTS}
                selected={interests}
                onChange={setInterests}
              />
            </div>

            {/* Hobbies */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                Hobbies & Lifestyle Activities
              </label>
              <ChipSelect
                options={ALL_HOBBIES}
                selected={hobbies}
                onChange={setHobbies}
              />
            </div>

            {/* Biography */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Biography
              </label>
              <textarea
                rows={4}
                maxLength={600}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share a short introduction, favorite weekend spots, or what you enjoy discussing..."
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  outline: 'none',
                  fontSize: '0.92rem',
                  lineHeight: 1.5,
                  resize: 'vertical'
                }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', float: 'right', marginTop: '4px' }}>
                {bio.length} / 600 characters
              </span>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '36px',
            paddingTop: '20px',
            borderTop: '1px solid var(--color-border)'
          }}
        >
          {step > 1 ? (
            <Button variant="ghost" onClick={() => setStep(step - 1)}>
              <ArrowLeft size={16} /> Back
            </Button>
          ) : (
            <div />
          )}

          <Button variant="primary" size="lg" onClick={handleNext} loading={loading}>
            {step === 3 ? (
              <>
                Complete Profile & Discover <CheckCircle size={18} />
              </>
            ) : (
              <>
                Continue <ArrowRight size={18} />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
