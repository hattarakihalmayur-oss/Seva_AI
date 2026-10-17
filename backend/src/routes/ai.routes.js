import { Router } from 'express';
import {
  handleCitizenQuery,
  handleEligibilityEvaluation,
  handleSpeechToText,
  handleTextToSpeech,
  handleTranslation,
  handleSarvamStatus,
} from '../controllers/ai.controller.js';
import { aiLimiter } from '../middleware/rateLimiters.middleware.js';
import { validateAiQuery } from '../middleware/validate.middleware.js';
import { optionalProtect } from '../middleware/auth.middleware.js';

const router = Router();

// Apply AI-specific rate limiter to all AI routes
router.use(aiLimiter);

// GET /api/ai/sarvam/status — Sarvam speech engine status & model info
router.get('/sarvam/status', handleSarvamStatus);

// POST /api/ai/query — public (auth optional for profile enrichment)
router.post('/query', validateAiQuery, handleCitizenQuery);

// POST /api/ai/evaluate-eligibility — public
router.post('/evaluate-eligibility', handleEligibilityEvaluation);

// POST /api/ai/translate — public multilingual translation service
router.post('/translate', handleTranslation);

// POST /api/ai/stt — speech-to-text powered by Sarvam AI saaras:v3
router.post('/stt', handleSpeechToText);

// POST /api/ai/tts — text-to-speech powered by Sarvam AI bulbul:v3
router.post('/tts', handleTextToSpeech);

export default router;

