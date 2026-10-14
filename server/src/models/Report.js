import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    reason: {
      type: String,
      required: [true, 'Report reason is required'],
      enum: [
        'Harassment or bullying',
        'Inappropriate or explicit photos',
        'Spam or commercial promotion',
        'Fake profile or impersonation',
        'Underage user',
        'Hate speech',
        'Other safety concern'
      ]
    },
    details: {
      type: String,
      trim: true,
      maxlength: [1000, 'Details cannot exceed 1000 characters'],
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending',
      index: true
    }
  },
  {
    timestamps: true
  }
);

reportSchema.index({ reporter: 1, reportedUser: 1, createdAt: -1 });

const Report = mongoose.model('Report', reportSchema);
export default Report;
