import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import schemeRoutes from './scheme.routes.js';
import savedSchemeRoutes from './savedScheme.routes.js';
import aiRoutes from './ai.routes.js';
import digilockerRoutes from './digilocker.routes.js';
import applicationRoutes from './application.routes.js';

const router = Router();

// Mount API routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/schemes', schemeRoutes);
router.use('/saved-schemes', savedSchemeRoutes);
router.use('/ai', aiRoutes);
router.use('/digilocker', digilockerRoutes);
router.use('/applications', applicationRoutes);

// Base API index
router.get('/', (req, res) => {
  res.json({
    name: 'BharatSeva AI REST API',
    version: '1.0.0',
    description: 'Multilingual welfare scheme discovery and eligibility platform API',
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        profile: 'PUT /api/auth/profile',
      },
      schemes: {
        list: 'GET /api/schemes',
        detail: 'GET /api/schemes/:identifier',
        seed: 'POST /api/schemes/seed',
      },
      savedSchemes: {
        list: 'GET /api/saved-schemes',
        save: 'POST /api/saved-schemes',
        remove: 'DELETE /api/saved-schemes/:schemeSlug',
        check: 'GET /api/saved-schemes/check/:schemeSlug',
      },
      ai: {
        query: 'POST /api/ai/query',
        evaluateEligibility: 'POST /api/ai/evaluate-eligibility',
        speechToText: 'POST /api/ai/stt',
        textToSpeech: 'POST /api/ai/tts',
      },
    },
    phase: 'Phase 5 - Production-Ready, Security-Hardened',
  });
});

export default router;
