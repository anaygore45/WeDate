import mongoose from 'mongoose';

const swipeSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    target: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    action: {
      type: String,
      enum: ['like', 'pass'],
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate swipes between the same actor and target
swipeSchema.index({ actor: 1, target: 1 }, { unique: true });

const Swipe = mongoose.model('Swipe', swipeSchema);
export default Swipe;
