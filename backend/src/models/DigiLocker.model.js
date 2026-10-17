import mongoose from 'mongoose';
import crypto from 'crypto';
import envConfig from '../config/env.js';

// Encryption helper for OAuth tokens using AES-256-GCM
const ENCRYPTION_ALGO = 'aes-256-gcm';
function getEncryptionKey() {
  return crypto.createHash('sha256').update(envConfig.JWT_SECRET || 'fallback_secret_for_digilocker').digest();
}

export function encryptToken(text) {
  if (!text) return null;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGO, getEncryptionKey(), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  return {
    encrypted,
    iv: iv.toString('hex'),
    tag,
  };
}

export function decryptToken(encryptedData) {
  if (!encryptedData || !encryptedData.encrypted || !encryptedData.iv || !encryptedData.tag) {
    return null;
  }
  try {
    const decipher = crypto.createDecipheriv(
      ENCRYPTION_ALGO,
      getEncryptionKey(),
      Buffer.from(encryptedData.iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Failed to decrypt DigiLocker OAuth token:', err);
    return null;
  }
}

/**
 * File record as returned by DigiLocker /files/issued API
 */
const availableFileSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, default: 'pdf' },
    size: { type: String, default: '' },
    date: { type: String, default: '' },
    uri: { type: String, required: true },
    docType: { type: String, default: 'OTHER' },
    issuer: { type: String, default: 'Government of India' },
    description: { type: String, default: '' },
  },
  { _id: false }
);

/**
 * Verified document representation in BharatSeva schema
 */
const verifiedDocumentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    docType: {
      type: String,
      required: true,
      enum: [
        'AADHAAR',
        'PAN',
        'INCOME_CERTIFICATE',
        'RATION_CARD',
        'LAND_RECORD',
        'CASTE_CERTIFICATE',
        'BANK_PASSBOOK',
        'DOMICILE_CERTIFICATE',
        'DISABILITY_CERTIFICATE',
        'EDUCATION_MARKSHEET',
        'OTHER',
      ],
    },
    name: { type: String, required: true },
    issuer: { type: String, required: true },
    docNumber: { type: String, required: true },
    issueDate: { type: String, default: '2024-04-15' },
    validUntil: { type: String, default: 'Permanent / 2029-03-31' },
    verificationStatus: {
      type: String,
      enum: ['VERIFIED', 'PENDING', 'EXPIRED'],
      default: 'VERIFIED',
    },
    digitalSeal: { type: String, required: true },
    uri: { type: String, default: '' },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const digiLockerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    linked: {
      type: Boolean,
      default: false,
    },
    linkedAt: {
      type: Date,
    },
    digilockerId: {
      type: String,
      trim: true,
    },
    aadhaarMasked: {
      type: String,
      trim: true,
    },
    panNumber: {
      type: String,
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    dob: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      trim: true,
    },
    address: {
      street: { type: String, default: '' },
      district: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
    },
    // Encrypted OAuth 2.0 Token Details
    oauthToken: {
      encrypted: { type: String },
      iv: { type: String },
      tag: { type: String },
      tokenType: { type: String, default: 'Bearer' },
      scope: { type: String, default: 'openid' },
      expiresAt: { type: Date },
    },
    // Documents available in citizen's approved DigiLocker issued files
    availableFiles: [availableFileSchema],
    // Specific documents user has voluntarily authorized to share for scheme eligibility
    selectedDocuments: [{ type: String }],
    // Active verified documents mapped into scheme application schema
    documents: [verifiedDocumentSchema],
    // Citizen consent tracking
    consentGivenAt: { type: Date },
    consentDeclaration: { type: String },
  },
  {
    timestamps: true,
  }
);

export const DigiLocker = mongoose.model('DigiLocker', digiLockerSchema);
export default DigiLocker;
