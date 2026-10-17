import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import hpp from 'hpp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import envConfig from './config/env.js';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { sanitizeInputs } from './middleware/sanitize.middleware.js';
import { requestContext } from './middleware/requestContext.middleware.js';

const app = express();

// ──────────────────────────────────────────────────────────────────────────────
// 1. REQUEST CONTEXT — attach unique ID + timing to every request
// ──────────────────────────────────────────────────────────────────────────────
app.use(requestContext);

// ──────────────────────────────────────────────────────────────────────────────
// 2. COMPRESSION — gzip all responses >1kb, improves transfer performance
// ──────────────────────────────────────────────────────────────────────────────
app.use(compression({
  // Only compress text/JSON-like content types; skip already-compressed assets
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
  level: 6, // Balance between speed and compression ratio
}));

// ──────────────────────────────────────────────────────────────────────────────
// 3. SECURITY HTTP HEADERS (Helmet)
// ──────────────────────────────────────────────────────────────────────────────
app.use(
  helmet({
    // Content-Security-Policy: allow only self + Google Fonts + no inline scripts
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: envConfig.isProduction ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false, // Required for some embedded external resources
  })
);

// ──────────────────────────────────────────────────────────────────────────────
// 4. CORS — strict origin allowlist from environment
// ──────────────────────────────────────────────────────────────────────────────
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    const isAllowed =
      envConfig.CORS_ORIGINS.some(
        (allowedOrigin) =>
          allowedOrigin === origin ||
          allowedOrigin === '*' ||
          allowedOrigin.replace(/\/+$/, '') === origin.replace(/\/+$/, '')
      ) ||
      origin.endsWith('.onrender.com') ||
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1');

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy blocks access from origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID', 'X-Response-Time'],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// ──────────────────────────────────────────────────────────────────────────────
// 5. HPP — HTTP Parameter Pollution prevention
//    Silently removes duplicate query/body params; keeps only the last value
// ──────────────────────────────────────────────────────────────────────────────
app.use(hpp());

// ──────────────────────────────────────────────────────────────────────────────
// 6. GLOBAL RATE LIMITER — broad protection; per-route limiters are stricter
// ──────────────────────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: envConfig.RATE_LIMIT_WINDOW_MS,
  max: envConfig.RATE_LIMIT_MAX_REQUESTS,
  skip: () => envConfig.isDevelopment || envConfig.isTest,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      statusCode: 429,
    },
  },
});
app.use('/api', globalLimiter);

// ──────────────────────────────────────────────────────────────────────────────
// 7. BODY PARSERS & COOKIE PARSER
// ──────────────────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ──────────────────────────────────────────────────────────────────────────────
// 8. INPUT SANITIZATION — strip XSS patterns from all incoming data
// ──────────────────────────────────────────────────────────────────────────────
app.use(sanitizeInputs);

// ──────────────────────────────────────────────────────────────────────────────
// 9. REQUEST LOGGING (development only)
// ──────────────────────────────────────────────────────────────────────────────
if (envConfig.isDevelopment) {
  app.use(morgan('dev'));
}

// ──────────────────────────────────────────────────────────────────────────────
// 10. API ROUTES
// ──────────────────────────────────────────────────────────────────────────────
app.use('/api', apiRoutes);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');

// Serve built frontend if available (e.g. single-service full-stack Render deployment)
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  // Root status endpoint for standalone API service (e.g. separate Render Web Service)
  app.get('/', (req, res) => {
    res.json({
      service: 'BharatSeva AI API',
      status: 'online',
      version: '1.0.0',
      backendUrl: envConfig.BACKEND_URL,
      frontendUrl: envConfig.FRONTEND_URL,
      apiHealthEndpoint: `${envConfig.BACKEND_URL}/api/health`,
      corsOrigins: envConfig.CORS_ORIGINS,
    });
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// 11. ERROR HANDLERS — order matters; 404 first, then centralized error handler
// ──────────────────────────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
