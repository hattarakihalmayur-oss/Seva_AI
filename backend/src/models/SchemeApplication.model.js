import mongoose from 'mongoose';

const auditStepSchema = new mongoose.Schema(
  {
    step: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ['SUCCESS', 'INFO', 'WARNING'], default: 'SUCCESS' },
  },
  { _id: false }
);

const attachedDocSchema = new mongoose.Schema(
  {
    docType: { type: String, required: true },
    name: { type: String, required: true },
    docNumber: { type: String, required: true },
    issuer: { type: String, required: true },
    verificationStatus: { type: String, default: 'VERIFIED' },
    digitalSeal: { type: String, required: true },
  },
  { _id: false }
);

const schemeApplicationSchema = new mongoose.Schema(
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
    schemeName: {
      type: String,
      required: true,
    },
    schemeSector: {
      type: String,
      default: 'General Welfare',
    },
    authority: {
      type: String,
      default: 'Government of India',
    },
    applicationNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: [
        'SUBMITTED',
        'DOCUMENTS_VERIFIED',
        'UNDER_REVIEW',
        'APPROVED',
        'REJECTED',
        'ACTION_REQUIRED',
      ],
      default: 'SUBMITTED',
      index: true,
    },
    appliedVia: {
      type: String,
      default: 'DIGILOCKER_AI_AGENT',
    },
    applicantDetails: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, default: '' },
      age: { type: Number },
      gender: { type: String },
      state: { type: String },
      district: { type: String },
      pincode: { type: String },
      aadhaarMasked: { type: String },
      panNumber: { type: String },
    },
    attachedDocuments: [attachedDocSchema],
    formData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    citizenDeclaration: {
      agreed: { type: Boolean, default: true },
      consentTimestamp: { type: Date, default: Date.now },
      consentMethod: { type: String, default: 'DIGITAL_CONSENT_AADHAAR' },
    },
    agentAuditLog: [auditStepSchema],
    acknowledgmentReceipt: {
      arn: { type: String, required: true },
      qrData: { type: String },
      timestamp: { type: Date, default: Date.now },
      portalUrl: { type: String },
      beneficiaryRef: { type: String },
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Composite index to check user's existing application for a scheme
schemeApplicationSchema.index({ user: 1, schemeSlug: 1 });

export const SchemeApplication = mongoose.model('SchemeApplication', schemeApplicationSchema);
export default SchemeApplication;
