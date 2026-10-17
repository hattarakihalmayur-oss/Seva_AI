import mongoose from 'mongoose';

const savedSchemeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    scheme: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scheme',
      required: true,
    },
    schemeSlug: {
      type: String,
      required: true,
      index: true,
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
    savedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate bookmarks for same user and scheme
savedSchemeSchema.index({ user: 1, schemeSlug: 1 }, { unique: true });

export const SavedScheme = mongoose.model('SavedScheme', savedSchemeSchema);
export default SavedScheme;
