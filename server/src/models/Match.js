import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    ],
    // Deterministic canonical string for uniqueness: `${id1}_${id2}` sorted
    pairKey: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    deactivatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    deactivatedAt: {
      type: Date,
      default: null
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

matchSchema.pre('validate', function (next) {
  if (this.users && this.users.length === 2) {
    const ids = [this.users[0].toString(), this.users[1].toString()].sort();
    this.pairKey = `${ids[0]}_${ids[1]}`;
  }
  next();
});

const Match = mongoose.model('Match', matchSchema);
export default Match;
