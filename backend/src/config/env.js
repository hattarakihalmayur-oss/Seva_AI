import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import '../utils/dnsFix.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend root if not already provided by host environment
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function normalizeMongoUri(rawUri) {
  if (!rawUri || typeof rawUri !== 'string') return rawUri;
  let uri = rawUri;
  if (uri.includes('cluster0.39xxkjj.mongodb.net')) {
    uri = uri
      .replace('mongodb+srv://', 'mongodb://')
      .replace(
        'cluster0.39xxkjj.mongodb.net',
        'ac-owfxzof-shard-00-00.39xxkjj.mongodb.net:27017,ac-owfxzof-shard-00-01.39xxkjj.mongodb.net:27017,ac-owfxzof-shard-00-02.39xxkjj.mongodb.net:27017'
      );
    if (!uri.includes('ssl=')) {
      uri += (uri.includes('?') ? '&' : '?') + 'ssl=true';
    }
    if (!uri.includes('authSource=')) {
      uri += (uri.includes('?') ? '&' : '?') + 'authSource=admin';
    }
  } else if (uri.includes('cluster0.2fc0vrt.mongodb.net')) {
    uri = uri
      .replace('mongodb+srv://', 'mongodb://')
      .replace(
        'cluster0.2fc0vrt.mongodb.net',
        'ac-uafuzkf-shard-00-00.2fc0vrt.mongodb.net:27017,ac-uafuzkf-shard-00-01.2fc0vrt.mongodb.net:27017,ac-uafuzkf-shard-00-02.2fc0vrt.mongodb.net:27017'
      );
    if (!uri.includes('ssl=')) {
      uri += (uri.includes('?') ? '&' : '?') + 'ssl=true';
    }
    if (!uri.includes('authSource=')) {
      uri += (uri.includes('?') ? '&' : '?') + 'authSource=admin';
    }
  }
  return uri;
}

/**
 * Validates and sanitizes environment variables for BharatSeva backend.
 * Fails fast with descriptive non-sensitive messages when required settings are absent.
 */
function validateAndLoadConfig() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const port = parseInt(process.env.PORT, 10) || 5000;
  const rawMongoUri = process.env.MONGODB_URI;
  const mongoUri = normalizeMongoUri(rawMongoUri);
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
  const sarvamApiKey = process.env.SARVAM_API_KEY;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const corsOriginsRaw = process.env.CORS_ORIGINS || 'http://localhost:3000';

  const errors = [];

  // Required checks
  if (!mongoUri) {
    errors.push('MONGODB_URI is required. Please provide a valid MongoDB connection string.');
  }

  if (!jwtSecret) {
    errors.push('JWT_SECRET is required for token security.');
  } else if (nodeEnv === 'production') {
    if (jwtSecret.length < 32) {
      errors.push('JWT_SECRET must be at least 32 characters in production.');
    }
    if (jwtSecret.toLowerCase().includes('secret') || jwtSecret.toLowerCase().includes('dummy') || jwtSecret.toLowerCase().includes('default')) {
      errors.push('JWT_SECRET appears to use a default or insecure string in production.');
    }
  }

  // Parse CORS origins
  const corsOrigins = corsOriginsRaw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (errors.length > 0) {
    const errorMessage = `[BharatSeva Backend Startup Error] Environment configuration invalid:\n- ${errors.join('\n- ')}`;
    // In production or when strictly enforcing, fail fast
    if (nodeEnv === 'production') {
      throw new Error(errorMessage);
    } else {
      console.warn(`\x1b[33m⚠️  Configuration Warning:\x1b[0m\n${errorMessage}`);
    }
  }

  return Object.freeze({
    NODE_ENV: nodeEnv,
    PORT: port,
    MONGODB_URI: mongoUri || 'mongodb://localhost:27017/bharatseva',
    JWT_SECRET: jwtSecret || 'dev_temporary_bharatseva_secret_key_32chars',
    JWT_EXPIRES_IN: jwtExpiresIn,
    SARVAM_API_KEY: sarvamApiKey || '',
    FRONTEND_URL: frontendUrl,
    CORS_ORIGINS: corsOrigins.length > 0 ? corsOrigins : ['http://localhost:3000'],
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    // DigiLocker / MeriPehchaan OAuth 2.0
    DIGILOCKER_CLIENT_ID: process.env.DIGILOCKER_CLIENT_ID || '',
    DIGILOCKER_CLIENT_SECRET: process.env.DIGILOCKER_CLIENT_SECRET || '',
    DIGILOCKER_REDIRECT_URI:
      process.env.DIGILOCKER_REDIRECT_URI || `${frontendUrl.replace(':3000', ':5000')}/api/digilocker/callback`,
    DIGILOCKER_AUTH_URL:
      process.env.DIGILOCKER_AUTH_URL || 'https://digilocker.meripehchaan.gov.in/public/oauth2/1/authorize',
    DIGILOCKER_TOKEN_URL:
      process.env.DIGILOCKER_TOKEN_URL || 'https://digilocker.meripehchaan.gov.in/public/oauth2/1/token',
    DIGILOCKER_API_BASE_URL:
      process.env.DIGILOCKER_API_BASE_URL || 'https://digilocker.meripehchaan.gov.in/public/oauth2/1',
    DIGILOCKER_ENV: process.env.DIGILOCKER_ENV || 'sandbox',
    digilockerConfigured: Boolean(
      process.env.DIGILOCKER_CLIENT_ID &&
      process.env.DIGILOCKER_CLIENT_SECRET &&
      !process.env.DIGILOCKER_CLIENT_ID.includes('your_digilocker')
    ),
    isProduction: nodeEnv === 'production',
    isDevelopment: nodeEnv === 'development',
    isTest: nodeEnv === 'test',
  });
}

export const envConfig = validateAndLoadConfig();

/**
 * Returns safe telemetry summary without revealing sensitive credentials.
 */
export function getSafeConfigSummary() {
  return {
    nodeEnv: envConfig.NODE_ENV,
    port: envConfig.PORT,
    frontendUrl: envConfig.FRONTEND_URL,
    allowedCorsOrigins: envConfig.CORS_ORIGINS,
    databaseConfigured: Boolean(envConfig.MONGODB_URI),
    sarvamConfigured: Boolean(envConfig.SARVAM_API_KEY && envConfig.SARVAM_API_KEY !== 'dummy_sarvam_key_phase1_local'),
    digilockerConfigured: envConfig.digilockerConfigured,
    jwtConfigured: Boolean(envConfig.JWT_SECRET),
  };
}

export default envConfig;
