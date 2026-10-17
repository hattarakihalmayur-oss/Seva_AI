import Scheme from '../models/Scheme.model.js';
import { processCitizenQuery } from '../services/recommendation.service.js';
import { evaluateSchemeEligibility } from '../services/eligibility.service.js';
import sarvamService from '../services/sarvam.service.js';
import logger from '../utils/logger.js';

/**
 * POST /api/ai/query
 * Process citizen natural language query in any supported Indian language
 */
export async function handleCitizenQuery(req, res, next) {
  try {
    const { query, language = 'en', profile = {} } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Query text is required.',
          code: 'MISSING_QUERY',
          statusCode: 400,
        },
      });
    }

    // Merge logged-in user profile if authenticated
    const combinedProfile = {
      ...(req.user ? req.user.toObject() : {}),
      ...profile,
    };

    const result = await processCitizenQuery({
      query: query.trim(),
      userLanguage: language,
      userProfile: combinedProfile,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error handling citizen AI query', error);
    next(error);
  }
}

/**
 * POST /api/ai/evaluate-eligibility
 * Deterministic eligibility evaluation for a specific scheme
 */
export async function handleEligibilityEvaluation(req, res, next) {
  try {
    const { schemeSlug, citizenProfile = {} } = req.body;

    if (!schemeSlug) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'schemeSlug is required.',
          code: 'MISSING_SCHEME_SLUG',
          statusCode: 400,
        },
      });
    }

    // Fetch scheme from database
    const scheme = await Scheme.findOne({ slug: schemeSlug.toLowerCase().trim() }).lean();
    if (!scheme) {
      return res.status(404).json({
        success: false,
        error: {
          message: `Scheme '${schemeSlug}' was not found.`,
          code: 'SCHEME_NOT_FOUND',
          statusCode: 404,
        },
      });
    }

    const mergedProfile = {
      ...(req.user ? req.user.toObject() : {}),
      ...citizenProfile,
    };

    const evaluation = evaluateSchemeEligibility(scheme, mergedProfile);

    res.status(200).json({
      success: true,
      data: evaluation,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/ai/sarvam/status
 * Check Sarvam AI speech integration status
 */
export async function handleSarvamStatus(req, res) {
  const isConfigured = sarvamService.isConfigured();
  res.status(200).json({
    success: true,
    data: {
      configured: isConfigured,
      sttModel: 'saaras:v3',
      ttsModel: 'bulbul:v3',
      supportedLanguages: [
        { code: 'kn-IN', name: 'Kannada (ಕನ್ನಡ)' },
        { code: 'hi-IN', name: 'Hindi (हिन्दी)' },
        { code: 'ta-IN', name: 'Tamil (தமிழ்)' },
        { code: 'te-IN', name: 'Telugu (తెలుగు)' },
        { code: 'mr-IN', name: 'Marathi (मराठी)' },
        { code: 'bn-IN', name: 'Bengali (বাংলা)' },
        { code: 'en-IN', name: 'Indian English' },
      ],
      features: ['Speech-to-Text (STT)', 'Text-to-Speech (TTS)', 'Multilingual Translation'],
    },
  });
}

/**
 * POST /api/ai/stt
 * Speech to text conversion proxy powered by Sarvam AI (model: saaras:v3)
 */
export async function handleSpeechToText(req, res, next) {
  try {
    const { audioBase64, languageCode = 'hi-IN', mimeType = 'audio/wav', sarvamApiKey } = req.body;
    const customApiKey = req.headers['x-sarvam-api-key'] || sarvamApiKey;

    if (!audioBase64) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'audioBase64 payload is required.',
          code: 'MISSING_AUDIO',
        },
      });
    }

    const result = await sarvamService.speechToText({
      audioBase64,
      languageCode,
      mimeType,
      customApiKey,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/ai/tts
 * Text to speech conversion proxy powered by Sarvam AI (model: bulbul:v3)
 */
export async function handleTextToSpeech(req, res, next) {
  try {
    const { text, languageCode = 'hi-IN', speaker = 'shubh', sarvamApiKey } = req.body;
    const customApiKey = req.headers['x-sarvam-api-key'] || sarvamApiKey;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Text is required for speech synthesis.',
          code: 'MISSING_TEXT',
        },
      });
    }

    const result = await sarvamService.textToSpeech({
      text: text.trim(),
      languageCode,
      speaker,
      customApiKey,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/ai/translate
 * Multilingual translation endpoint powered by Sarvam AI with caching and fallback
 */
export async function handleTranslation(req, res, next) {
  try {
    const { text, texts, targetLanguage = 'kn', sourceLanguage = 'en' } = req.body;

    if (!text && (!texts || !Array.isArray(texts))) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Either "text" or "texts" array is required for translation.',
          code: 'MISSING_TRANSLATION_INPUT',
        },
      });
    }

    if (texts && Array.isArray(texts)) {
      const translatedBatch = await sarvamService.translateBatch({
        texts,
        sourceLang: sourceLanguage,
        targetLang: targetLanguage,
      });

      return res.status(200).json({
        success: true,
        data: {
          translations: translatedBatch,
          targetLanguage,
        },
      });
    }

    const translatedText = await sarvamService.translate({
      text,
      sourceLang: sourceLanguage,
      targetLang: targetLanguage,
    });

    return res.status(200).json({
      success: true,
      data: {
        translatedText: translatedText || text,
        originalText: text,
        targetLanguage,
      },
    });
  } catch (error) {
    logger.warn('AI translation controller error, returning fallback:', error.message);
    // Graceful fallback to input
    return res.status(200).json({
      success: true,
      data: {
        translatedText: req.body?.text || '',
        translations: req.body?.texts || [],
        targetLanguage: req.body?.targetLanguage || 'en',
        fallback: true,
      },
    });
  }
}
export default {
  handleCitizenQuery,
  handleEligibilityEvaluation,
  handleSpeechToText,
  handleTextToSpeech,
  handleTranslation,
  handleSarvamStatus,
};


