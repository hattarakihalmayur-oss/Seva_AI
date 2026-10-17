import http from 'http';
import { execSync } from 'child_process';
import app from './app.js';
import envConfig from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { seedSchemesIfEmpty } from './utils/seedData.js';
import logger from './utils/logger.js';

let server;

function autoFreePort(port) {
  if (process.platform !== 'win32') return;
  try {
    const stdout = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf-8' });
    const lines = stdout.trim().split(/\r?\n/);
    let freed = false;
    for (const line of lines) {
      if (line.includes('LISTENING')) {
        const parts = line.trim().split(/\s+/);
        const pid = parseInt(parts[parts.length - 1], 10);
        if (pid && pid !== process.pid) {
          logger.warn(`Port ${port} occupied by stale process (PID ${pid}). Releasing port automatically...`);
          try {
            execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
            freed = true;
          } catch {}
        }
      }
    }
    if (freed) {
      const waitUntil = Date.now() + 500;
      while (Date.now() < waitUntil) {}
    }
  } catch {
    // Port is free
  }
}

async function startServer() {
  try {
    logger.info(`Starting BharatSeva AI Server in [${envConfig.NODE_ENV}] mode...`);

    // Connect to database
    const conn = await connectDB();
    if (conn) {
      await seedSchemesIfEmpty();
    }

    // Auto-free port if a stale process is lingering
    autoFreePort(envConfig.PORT);

    // Create HTTP Server
    server = http.createServer(app);

    let retryCount = 0;
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE' && retryCount === 0) {
        retryCount++;
        logger.warn(`Port ${envConfig.PORT} in use, forcing release and retrying...`);
        autoFreePort(envConfig.PORT);
        setTimeout(() => {
          server.listen(envConfig.PORT, () => {
            logger.info(`🚀 BharatSeva AI Backend running on port ${envConfig.PORT}`);
            logger.info(`📍 Health Check: http://localhost:${envConfig.PORT}/api/health`);
          });
        }, 500);
        return;
      }
      logger.error('HTTP Server error', err);
      process.exit(1);
    });

    server.listen(envConfig.PORT, () => {
      logger.info(`🚀 BharatSeva AI Backend running on port ${envConfig.PORT}`);
      logger.info(`📍 Health Check: http://localhost:${envConfig.PORT}/api/health`);
      logger.info(`🌐 Allowed CORS Origins: ${envConfig.CORS_ORIGINS.join(', ')}`);
    });

  } catch (error) {
    logger.error('Fatal error during server startup', error);
    process.exit(1);
  }
}

// Graceful shutdown handling
async function gracefulShutdown(signal) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');
      await disconnectDB();
      logger.info('Graceful shutdown complete.');
      process.exit(0);
    });

    // Force exit if shutdown hangs beyond 10s
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', error);
  process.exit(1);
});

startServer();

export { server };
