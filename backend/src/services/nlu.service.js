import sarvamService from './sarvam.service.js';
import logger from '../utils/logger.js';

/**
 * Natural Language Understanding Service:
 * Extracts user intent, target sector, and demographic attributes from citizen queries.
 */

const INTENT_TYPES = [
  'DISCOVER_SCHEMES',
  'CHECK_ELIGIBILITY',
  'REQUIRED_DOCUMENTS',
  'APPLICATION_STEPS',
  'BENEFIT_INQUIRY',
  'GENERAL_QUERY',
];

export async function extractIntentAndAttributes(queryText, userLanguage = 'en') {
  if (!queryText || !queryText.trim()) {
    return {
      intent: 'GENERAL_QUERY',
      keywords: [],
      extractedAttributes: {},
      language: userLanguage,
    };
  }

  const cleanQuery = queryText.trim().slice(0, 500); // Prevent overflow

  // Rule-based entity & keyword matching
  const lower = cleanQuery.toLowerCase();
  const extractedAttributes = {};
  const keywords = [];

  // 1. Occupation / Sector detection
  if (lower.includes('farmer') || lower.includes('kisan') || lower.includes('agriculture') || lower.includes('ರೈತ') || lower.includes('किसान') || lower.includes('விவசாயி') || lower.includes('రైతు')) {
    extractedAttributes.occupation = 'Farmer';
    keywords.push('Agriculture', 'Farmer', 'PM-KISAN');
  } else if (lower.includes('health') || lower.includes('hospital') || lower.includes('ayushman') || lower.includes('ಆರೋಗ್ಯ') || lower.includes('बीमारी') || lower.includes('மருத்துவம்')) {
    extractedAttributes.sector = 'Healthcare';
    keywords.push('Healthcare', 'PM-JAY', 'Insurance');
  } else if (lower.includes('women') || lower.includes('lady') || lower.includes('female') || lower.includes('gruha') || lower.includes('ಮಹಿಳೆ') || lower.includes('महिला') || lower.includes('பெண்')) {
    extractedAttributes.gender = 'Female';
    keywords.push('Women', 'Gruha Lakshmi');
  } else if (lower.includes('house') || lower.includes('home') || lower.includes('awas') || lower.includes('housing') || lower.includes('ಮನೆ') || lower.includes('मकान') || lower.includes('வீடு')) {
    extractedAttributes.housingNeed = true;
    keywords.push('Housing', 'PMAY');
  } else if (lower.includes('vendor') || lower.includes('street') || lower.includes('cart') || lower.includes('svanidhi') || lower.includes('వ్యాపారి') || lower.includes('व्यापारी')) {
    extractedAttributes.occupation = 'Street Vendor';
    keywords.push('Street Vendor', 'Micro-loan', 'PM SVANidhi');
  } else if (lower.includes('girl') || lower.includes('sukanya') || lower.includes('daughter') || lower.includes('ಹೆಣ್ಣುಮಗು') || lower.includes('बेटी')) {
    extractedAttributes.targetChild = 'Girl Child';
    keywords.push('Girl Child', 'Sukanya Samriddhi');
  }

  // 2. Intent detection
  let intent = 'DISCOVER_SCHEMES';
  if (lower.includes('document') || lower.includes('paper') || lower.includes('ದಾಖಲೆ') || lower.includes('दस्तावेज') || lower.includes('சான்றிதழ்')) {
    intent = 'REQUIRED_DOCUMENTS';
  } else if (lower.includes('eligible') || lower.includes('qualify') || lower.includes('ಅರ್ಹ') || lower.includes('पात्र') || lower.includes('தகுதி')) {
    intent = 'CHECK_ELIGIBILITY';
  } else if (lower.includes('apply') || lower.includes('how to') || lower.includes('ಅರ್ಜಿ') || lower.includes('आवेदन') || lower.includes('விண்ணப்பிப்பது')) {
    intent = 'APPLICATION_STEPS';
  } else if (lower.includes('benefit') || lower.includes('amount') || lower.includes('money') || lower.includes('ಹಣ') || lower.includes('रुपये')) {
    intent = 'BENEFIT_INQUIRY';
  }

  // 3. State detection
  const states = ['Karnataka', 'Maharashtra', 'Tamil Nadu', 'Uttar Pradesh', 'Bihar', 'West Bengal', 'Telangana'];
  for (const s of states) {
    if (lower.includes(s.toLowerCase())) {
      extractedAttributes.state = s;
      break;
    }
  }

  // 4. If Sarvam AI is configured, enhance understanding via LLM with strict JSON schema
  if (sarvamService.isConfigured()) {
    try {
      const prompt = `Analyze this citizen query in India: "${cleanQuery}".
Output ONLY valid JSON matching this schema:
{"intent": "DISCOVER_SCHEMES"|"CHECK_ELIGIBILITY"|"REQUIRED_DOCUMENTS"|"APPLICATION_STEPS", "keywords": string[], "occupation": string|null, "state": string|null}`;

      const aiResponse = await sarvamService.chatCompletion({
        messages: [
          { role: 'system', content: 'You are a civic query intent parser. Output strict JSON only.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1,
      });

      if (aiResponse) {
        const parsed = JSON.parse(aiResponse.replace(/```json|```/g, '').trim());
        if (parsed.intent && INTENT_TYPES.includes(parsed.intent)) {
          intent = parsed.intent;
        }
        if (Array.isArray(parsed.keywords)) {
          keywords.push(...parsed.keywords);
        }
        if (parsed.occupation && !extractedAttributes.occupation) {
          extractedAttributes.occupation = parsed.occupation;
        }
        if (parsed.state && !extractedAttributes.state) {
          extractedAttributes.state = parsed.state;
        }
      }
    } catch (aiErr) {
      logger.debug('Sarvam parsing fallback to deterministic parser', aiErr);
    }
  }

  return {
    intent,
    keywords: Array.from(new Set(keywords)),
    extractedAttributes,
    queryText: cleanQuery,
  };
}

export default {
  extractIntentAndAttributes,
};
