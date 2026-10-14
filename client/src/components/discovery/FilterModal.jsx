import React, { useState } from 'react';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';
import { ChipSelect } from '../common/ChipSelect.jsx';

const DEPARTMENTS = [
  'All Departments',
  'Computer Engineering',
  'Information Technology',
  'Electronics & Telecom',
  'Data Science',
  'Artificial Intelligence',
  'Biomedical',
  'Management Studies'
];

const ACADEMIC_YEARS = [
  'All Years',
  'First Year (FE)',
  'Second Year (SE)',
  'Third Year (TE)',
  'Final Year (BE)',
  'Postgraduate (PG)'
];

const GENDERS = ['Everyone', 'Woman', 'Man', 'Non-binary'];

const POPULAR_INTERESTS = [
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
  'Theatre'
];

export const FilterModal = ({ isOpen, onClose, filters, onApply }) => {
  const [minAge, setMinAge] = useState(filters.minAge || 18);
  const [maxAge, setMaxAge] = useState(filters.maxAge || 30);
  const [gender, setGender] = useState(filters.gender || 'Everyone');
  const [department, setDepartment] = useState(filters.department || 'All Departments');
  const [academicYear, setAcademicYear] = useState(filters.academicYear || 'All Years');
  const [interests, setInterests] = useState(filters.interests || []);

  const handleClear = () => {
    setMinAge(18);
    setMaxAge(30);
    setGender('Everyone');
    setDepartment('All Departments');
    setAcademicYear('All Years');
    setInterests([]);
  };

  const handleApply = () => {
    onApply({
      minAge: Number(minAge),
      maxAge: Number(maxAge),
      gender: gender === 'Everyone' ? '' : gender,
      department: department === 'All Departments' ? '' : department,
      academicYear: academicYear === 'All Years' ? '' : academicYear,
      interests
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Discovery Filters">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Age Range */}
        <div>
          <label style={{ fontSize: '0.9rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
            Age Range ({minAge} – {maxAge} years)
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Min Age: {minAge}</span>
              <input
                type="range"
                min="18"
                max="35"
                value={minAge}
                onChange={(e) => setMinAge(Math.min(Number(e.target.value), maxAge))}
                style={{ width: '100%', accentColor: 'var(--color-primary)' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Max Age: {maxAge}</span>
              <input
                type="range"
                min="18"
                max="35"
                value={maxAge}
                onChange={(e) => setMaxAge(Math.max(Number(e.target.value), minAge))}
                style={{ width: '100%', accentColor: 'var(--color-primary)' }}
              />
            </div>
          </div>
        </div>

        {/* Gender Preference */}
        <div>
          <label style={{ fontSize: '0.9rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
            Interested in Seeing
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {GENDERS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  border: gender === g ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                  backgroundColor: gender === g ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: gender === g ? '#FFFFFF' : 'var(--color-text-main)',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Academic Department */}
        <div>
          <label style={{ fontSize: '0.9rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
            Academic Department
          </label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-main)',
              outline: 'none'
            }}
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Academic Year */}
        <div>
          <label style={{ fontSize: '0.9rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
            Academic Year
          </label>
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-main)',
              outline: 'none'
            }}
          >
            {ACADEMIC_YEARS.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>

        {/* Interests */}
        <div>
          <label style={{ fontSize: '0.9rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
            Filter by Interests
          </label>
          <ChipSelect
            options={POPULAR_INTERESTS}
            selected={interests}
            onChange={setInterests}
          />
        </div>

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '12px',
            paddingTop: '16px',
            borderTop: '1px solid var(--color-border)'
          }}
        >
          <Button variant="ghost" onClick={handleClear}>
            Reset Filters
          </Button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleApply}>
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
