import mongoose from 'mongoose';

/**
 * DigiLocker OAuth 2.0 CSRF State Token Model
 * Stores transient state tokens with automatic 10-minute expiration.
 */
const digiLockerStateSchema = new mongoose.Schema(
  {
    state: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    requestedScopes: {
      type: [String],
      default: ['openid'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600, // 10 minutes TTL
    },
  },
  {
    timestamps: false,
  }
);

export const DigiLockerState = mongoose.model('DigiLockerState', digiLockerStateSchema);
export default DigiLockerState;
