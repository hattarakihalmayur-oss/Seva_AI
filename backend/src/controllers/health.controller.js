import envConfig, { getSafeConfigSummary } from '../config/env.js';
import { getDBStatus } from '../config/db.js';

const startTime = Date.now();

/**
 * Controller for GET /api/health
 * Returns service status, database connectivity, and runtime metrics without exposing secrets.
 */
export function getHealthStatus(req, res) {
  const dbStatus = getDBStatus();
  const memoryUsage = process.memoryUsage();

  const healthPayload = {
    status: 'ok',
    service: 'BharatSeva AI Backend Service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: (Date.now() - startTime) / 1000,
    environment: envConfig.NODE_ENV,
    database: dbStatus,
    telemetry: {
      nodeVersion: process.version,
      memory: {
        rssMb: Math.round(memoryUsage.rss / (1024 * 1024) * 100) / 100,
        heapUsedMb: Math.round(memoryUsage.heapUsed / (1024 * 1024) * 100) / 100,
        heapTotalMb: Math.round(memoryUsage.heapTotal / (1024 * 1024) * 100) / 100,
      },
    },
    configuration: getSafeConfigSummary(),
  };

  res.status(200).json(healthPayload);
}

export default {
  getHealthStatus,
};
