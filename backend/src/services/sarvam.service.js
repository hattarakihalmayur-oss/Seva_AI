import envConfig from '../config/env.js';
import logger from '../utils/logger.js';

const SARVAM_BASE_URL = 'https://api.sarvam.ai';

/**
 * Backend-only client for Sarvam AI APIs.
 * The SARVAM_API_KEY is held exclusively in server environment memory.
 */
const SARVAM_LANG_MAP = {
  kn: 'kn-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  mr: 'mr-IN',
  bn: 'bn-IN',
  en: 'en-IN',
  'kn-IN': 'kn-IN',
  'hi-IN': 'hi-IN',
  'ta-IN': 'ta-IN',
  'te-IN': 'te-IN',
  'mr-IN': 'mr-IN',
  'bn-IN': 'bn-IN',
  'en-IN': 'en-IN',
};

class SarvamService {
  constructor() {
    this.apiKey = envConfig.SARVAM_API_KEY;
    this.baseUrl = SARVAM_BASE_URL;
    this.translationCache = new Map();
  }

  isConfigured() {
    return Boolean(
      this.apiKey &&
      this.apiKey.trim() !== '' &&
      !this.apiKey.startsWith('dummy_')
    );
  }

  getHeaders(contentType = 'application/json') {
    const headers = {
      'api-subscription-key': this.apiKey,
    };
    if (contentType) {
      headers['Content-Type'] = contentType;
    }
    return headers;
  }

  /**
   * Chat completions / Text reasoning via Sarvam API
   */
  async chatCompletion({ messages, model = 'sarvam-105b-conversations', temperature = 0.3, maxTokens = 800 }) {
    if (!this.isConfigured()) {
      logger.info('Sarvam API key not configured or in development mode. Using deterministic engine fallback.');
      return null;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        logger.warn(`Sarvam Chat API returned ${response.status}: ${errorText}`);
        return null;
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || null;
    } catch (error) {
      clearTimeout(timeout);
      logger.warn(`Sarvam Chat request failed (${error.name === 'AbortError' ? 'Timeout' : error.message}). Falling back.`);
      return null;
    }
  }

  /**
   * Multilingual Translation via Sarvam API with in-memory caching and fallback
   */
  async translate({ text, sourceLang = 'en-IN', targetLang = 'hi-IN' }) {
    if (!text || typeof text !== 'string' || !text.trim()) return text;

    const src = SARVAM_LANG_MAP[sourceLang] || sourceLang;
    const tgt = SARVAM_LANG_MAP[targetLang] || targetLang;

    if (src === tgt) return text;

    const cacheKey = `${src}->${tgt}:${text.trim()}`;
    if (this.translationCache.has(cacheKey)) {
      return this.translationCache.get(cacheKey);
    }

    if (!this.isConfigured()) {
      return null;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${this.baseUrl}/translate`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          input: text.trim(),
          source_language_code: src,
          target_language_code: tgt,
          mode: 'formal',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        logger.warn(`Sarvam Translation API status ${response.status}: ${errBody}`);
        return null;
      }

      const data = await response.json();
      const translated = data.translated_text || null;
      if (translated) {
        this.translationCache.set(cacheKey, translated);
      }
      return translated;
    } catch (err) {
      logger.warn('Sarvam Translation API error', err.message);
      return null;
    }
  }

  /**
   * Batch translation for multiple strings with caching
   */
  async translateBatch({ texts, sourceLang = 'en-IN', targetLang = 'hi-IN' }) {
    if (!Array.isArray(texts) || texts.length === 0) return [];

    const results = [];
    for (const item of texts) {
      if (!item || typeof item !== 'string') {
        results.push(item);
        continue;
      }
      const translated = await this.translate({ text: item, sourceLang, targetLang });
      results.push(translated || item);
    }
    return results;
  }

  /**
   * Speech-to-Text (STT) via Sarvam API (model: saaras:v3)
   */
  async speechToText({ audioBase64, mimeType = 'audio/wav', languageCode = 'hi-IN', customApiKey = null }) {
    const key = customApiKey || this.apiKey;
    if (!key || key.startsWith('dummy_')) {
      return {
        success: false,
        fallback: true,
        message: 'Sarvam API key is not configured for speech-to-text. Web Speech API client handling active.',
      };
    }

    try {
      // Build binary audio buffer from base64
      const audioBuffer = Buffer.from(audioBase64, 'base64');
      const ext = mimeType.includes('webm') ? 'webm' : mimeType.includes('mp4') ? 'm4a' : 'wav';
      const blob = new Blob([audioBuffer], { type: mimeType });

      const formData = new FormData();
      formData.append('file', blob, `recording.${ext}`);
      formData.append('model', 'saaras:v3');
      const targetLang = SARVAM_LANG_MAP[languageCode] || languageCode;
      formData.append('language_code', targetLang);

      const response = await fetch(`${this.baseUrl}/speech-to-text`, {
        method: 'POST',
        headers: {
          'api-subscription-key': key,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.warn(`Sarvam STT returned status ${response.status}: ${errorText}`);
        return {
          success: false,
          fallback: true,
          status: response.status,
          error: `Sarvam STT error (${response.status}): ${errorText}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        transcript: data.transcript || '',
        languageCode: data.language_code || targetLang,
      };
    } catch (error) {
      logger.error('Sarvam STT processing error', error);
      return { success: false, fallback: true, error: error.message };
    }
  }

  /**
   * Text-to-Speech (TTS) via Sarvam API (model: bulbul:v3)
   */
  async textToSpeech({ text, languageCode = 'hi-IN', speaker = 'shubh', customApiKey = null }) {
    const key = customApiKey || this.apiKey;
    if (!key || key.startsWith('dummy_')) {
      return {
        success: false,
        fallback: true,
        message: 'Sarvam API key not configured. Speech synthesis client synthesis active.',
      };
    }

    try {
      const targetLang = SARVAM_LANG_MAP[languageCode] || languageCode;
      const response = await fetch(`${this.baseUrl}/text-to-speech`, {
        method: 'POST',
        headers: {
          'api-subscription-key': key,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: [text.slice(0, 1000)], // Sarvam TTS requires 'inputs' as an array
          target_language_code: targetLang,
          model: 'bulbul:v3',
          speaker: speaker || 'shubh',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.warn(`Sarvam TTS returned status ${response.status}: ${errorText}`);
        return {
          success: false,
          fallback: true,
          status: response.status,
          error: `Sarvam TTS error (${response.status}): ${errorText}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        audioBase64: data.audios?.[0] || data.audio || null,
      };
    } catch (error) {
      logger.error('Sarvam TTS error', error);
      return { success: false, fallback: true, error: error.message };
    }
  }
}

export const sarvamService = new SarvamService();
export default sarvamService;
