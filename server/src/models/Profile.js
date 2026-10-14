import mongoose from 'mongoose';
import { RELATIONSHIP_GOALS } from '../config/recommendationConfig.js';

const photoSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, default: '' },
  isPrimary: { type: Boolean, default: false },
  caption: { type: String, default: '' }
});

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 60
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required']
    },
    age: {
      type: Number,
      min: 18,
      index: true
    },
    gender: {
      type: String,
      enum: ['Woman', 'Man', 'Non-binary', 'Other'],
      required: [true, 'Gender is required']
    },
    genderPreference: {
      type: [String],
      enum: ['Woman', 'Man', 'Non-binary', 'Everyone'],
      default: ['Everyone']
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      index: true
    },
    academicYear: {
      type: String,
      enum: [
        'First Year (FE)',
        'Second Year (SE)',
        'Third Year (TE)',
        'Final Year (BE)',
        'Postgraduate (PG)'
      ],
      required: [true, 'Academic year is required'],
      index: true
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [600, 'Bio cannot exceed 600 characters'],
      default: ''
    },
    interests: {
      type: [String],
      default: []
    },
    hobbies: {
      type: [String],
      default: []
    },
    relationshipGoals: {
      type: [String],
      enum: RELATIONSHIP_GOALS,
      default: ['Open to exploring']
    },
    height: {
      type: Number,
      min: 100,
      max: 230,
      default: null
    },
    languages: {
      type: [String],
      default: ['English']
    },
    photos: {
      type: [photoSchema],
      default: []
    },
    socialLinks: {
      instagram: { type: String, trim: true, default: '' },
      linkedin: { type: String, trim: true, default: '' },
      spotify: { type: String, trim: true, default: '' }
    },
    isVisible: {
      type: Boolean,
      default: true,
      index: true
    },
    isCompleted: {
      type: Boolean,
      default: false,
      index: true
    },
    filterPreferences: {
      minAge: { type: Number, default: 18 },
      maxAge: { type: Number, default: 30 },
      genders: { type: [String], default: [] },
      department: { type: String, default: '' },
      academicYear: { type: String, default: '' }
    }
  },
  {
    timestamps: true
  }
);

// Calculate and set age automatically from dateOfBirth before validation/save
profileSchema.pre('validate', function (next) {
  if (this.dateOfBirth) {
    const today = new Date();
    const dob = new Date(this.dateOfBirth);
    let calculatedAge = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      calculatedAge--;
    }
    this.age = calculatedAge;
  }

  // Ensure first photo is marked primary if none is
  if (this.photos && this.photos.length > 0) {
    const hasPrimary = this.photos.some((p) => p.isPrimary);
    if (!hasPrimary) {
      this.photos[0].isPrimary = true;
    }
  }

  // Check completion criteria: name, age >= 18, department, academic year, at least 1 photo
  if (
    this.name &&
    this.age >= 18 &&
    this.department &&
    this.academicYear &&
    this.photos &&
    this.photos.length >= 1
  ) {
    this.isCompleted = true;
  } else {
    this.isCompleted = false;
  }

  next();
});

const Profile = mongoose.model('Profile', profileSchema);
export default Profile;
