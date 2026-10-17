import mongoose from 'mongoose';
import dns from 'node:dns';
import envConfig from './env.js';
import logger from '../utils/logger.js';

// Ensure reliable SRV DNS resolution on Windows networks
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {
  // Ignore if restricted in sandboxed environments
}

let isConnectedBefore = false;

// Format URI for safe logging (stripping credentials)
export function getSafeDatabaseUri(rawUri) {
  if (!rawUri) return 'not_configured';
  try {
    return rawUri.replace(/(mongodb(?:\+srv)?:\/\/)([^:]+:[^@]+@)?([^/?#]+)(.*)/, (match, protocol, auth, host, rest) => {
      const cleanAuth = auth ? '****:****@' : '';
      return `${protocol}${cleanAuth}${host}`;
    });
  } catch {
    return 'mongodb://[REDACTED]';
  }
}

/**
 * Configure Mongoose settings and event listeners
 */
export function setupMongooseEvents() {
  mongoose.connection.on('connected', () => {
    isConnectedBefore = true;
    logger.info(`MongoDB connected successfully to ${getSafeDatabaseUri(envConfig.MONGODB_URI)}`);
  });

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error', err);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB connection lost. State: Disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected successfully.');
  });
}

/**
 * Establish connection to MongoDB instance
 */
export async function connectDB() {
  setupMongooseEvents();

  const options = {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
    connectTimeoutMS: 10000,
    autoIndex: envConfig.isDevelopment, // Build indexes automatically in dev only
  };

  try {
    logger.info(`Attempting to connect to MongoDB at ${getSafeDatabaseUri(envConfig.MONGODB_URI)}...`);
    const conn = await mongoose.connect(envConfig.MONGODB_URI, options);
    return conn;
  } catch (error) {
    logger.error(`Initial MongoDB connection failed (${getSafeDatabaseUri(envConfig.MONGODB_URI)})`, error);
    if (envConfig.isProduction) {
      // In production, exit process on database startup failure
      throw error;
    } else {
      logger.warn('Running in development mode without active MongoDB. Telemetry will reflect disconnected status.');
      return null;
    }
  }
}

/**
 * Disconnect cleanly from database (used for graceful shutdown and tests)
 */
export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected cleanly.');
  }
}

/**
 * Returns structured connection status for health checks
 */
export function getDBStatus() {
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    99: 'uninitialized',
  };

  const state = mongoose.connection.readyState;
  const statusName = stateMap[state] || 'unknown';

  return {
    status: statusName,
    isConnected: state === 1,
    targetHost: getSafeDatabaseUri(envConfig.MONGODB_URI),
    modelsLoaded: Object.keys(mongoose.models).length,
  };
}

export default {
  connectDB,
  disconnectDB,
  getDBStatus,
  getSafeDatabaseUri,
};
