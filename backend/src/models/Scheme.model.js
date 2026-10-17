import mongoose from 'mongoose';

const eligibilityRuleSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    mandatory: { type: Boolean, default: true },
    field: { type: String }, // optional machine key e.g. 'landOwnership', 'maxAge'
    operator: { type: String, enum: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'exists'], default: 'eq' },
    value: { type: mongoose.Schema.Types.Mixed },
  },
  { _id: false }
);

const schemeSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: [true, 'Scheme unique slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Scheme name is required'],
      trim: true,
      index: true,
    },
    shortName: {
      type: String,
      trim: true,
    },
    sector: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['Central', 'State'],
      required: true,
      index: true,
    },
    state: {
      type: String,
      default: 'All India',
      index: true,
    },
    authority: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    targetBeneficiaries: [{
      type: String,
      trim: true,
    }],
    benefits: [{
      type: String,
      trim: true,
    }],
    eligibilityCriteria: [eligibilityRuleSchema],
    requiredDocuments: [{
      type: String,
      trim: true,
    }],
    applicationSteps: [{
      type: String,
      trim: true,
    }],
    applicationMode: {
      type: String,
      default: 'Online & CSC',
    },
    officialLink: {
      type: String,
      trim: true,
      match: [/^https?:\/\//, 'Official link must be a valid HTTP/HTTPS URL'],
    },
    sourceAuthority: {
      type: String,
      required: true,
    },
    lastVerifiedDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    dataClassification: {
      type: String,
      enum: ['VERIFIED', 'DEMO_VERIFIED'],
      default: 'DEMO_VERIFIED',
    },
    assessmentCategory: {
      type: String,
      enum: [
        'Appears Eligible',
        'Possibly Eligible',
        'Not Enough Information',
        'Appears Ineligible',
      ],
      default: 'Not Enough Information',
    },
    minAge: {
      type: Number,
      default: 0,
    },
    maxAge: {
      type: Number,
      default: 100,
    },
    occupations: [{
      type: String,
      trim: true,
    }],
    applicationDeadline: {
      type: String,
      default: '31 March 2027 (Open for FY 2026-27)',
    },
    deadlineDate: {
      type: Date,
      default: () => new Date('2027-03-31T23:59:59.000Z'),
    },
    deadlineStatus: {
      type: String,
      enum: ['OPEN', 'CLOSING_SOON', 'EXTENDED', 'ONGOING'],
      default: 'OPEN',
    },
    autoDiscovered: {
      type: Boolean,
      default: false,
    },
    discoveredSource: {
      type: String,
      default: 'Official Government Portal',
    },
    discoveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search across name, description, authority, sector
schemeSchema.index({
  name: 'text',
  description: 'text',
  sector: 'text',
  authority: 'text',
  targetBeneficiaries: 'text',
});

export const Scheme = mongoose.model('Scheme', schemeSchema);
export default Scheme;
