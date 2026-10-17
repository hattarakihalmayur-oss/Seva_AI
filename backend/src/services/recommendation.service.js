import Scheme from '../models/Scheme.model.js';
import { evaluateSchemeEligibility } from './eligibility.service.js';
import sarvamService from './sarvam.service.js';
import logger from '../utils/logger.js';
import { autoDiscoverAndSaveScheme } from './schemeDiscovery.service.js';

/**
 * Common stop words to exclude when calculating distinctive name match
 */
const STOP_WORDS = new Set([
  'pradhan', 'mantri', 'yojana', 'yojna', 'scheme', 'national', 'central',
  'state', 'bharat', 'india', 'government', 'kendra', 'mission', 'shasan',
  'and', 'for', 'the', 'in', 'of', 'to', 'a', 'an', 'is', 'what', 'how',
  'tell', 'me', 'about', 'can', 'i', 'get', 'apply', 'my', 'any'
]);

/**
 * Extract candidate scheme name from natural language query
 */
export function extractQueriedSchemeName(query) {
  if (!query) return null;

  const patterns = [
    /(?:about|for|is|details of|regarding|know about|status of)\s+([a-zA-Z0-9\s\-]+?)(?:\s+(?:scheme|yojana|yojna|scholarship|pariyojana|nidhi))?$/i,
    /([a-zA-Z0-9\s\-]{3,35})\s+(?:scheme|yojana|yojna|scholarship|pariyojana|nidhi)/i,
    /(?:scheme|yojana|yojna|scholarship)\s+([a-zA-Z0-9\s\-]{3,35})/i,
  ];

  for (const pattern of patterns) {
    const match = query.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].trim();
      const words = candidate.split(/\s+/).filter((w) => !STOP_WORDS.has(w.toLowerCase()));
      if (words.length > 0 && candidate.length >= 3) {
        return candidate;
      }
    }
  }

  return null;
}

/**
 * Multilingual fallback templates for unavailable schemes
 */
const UNAVAILABLE_SCHEME_TEMPLATES = {
  en: (name) =>
    `The scheme "${name || 'you enquired about'}" is currently not available in our verified repository. I will check and update that scheme soon! Our team verifies all guidelines from official government gazettes before adding them.`,
  hi: (name) =>
    `"${name || 'जिस योजना'}" के बारे में आपने पूछा है, वह वर्तमान में हमारी सत्यापित निर्देशिका में उपलब्ध नहीं है। मैं जल्द ही इस योजना की जांच करके इसे अपडेट करूंगा! हमारी टीम आधिकारिक सरकारी स्रोतों से दिशानिर्देशों का सत्यापन कर रही है।`,
  kn: (name) =>
    `ನೀವು ವಿಚಾರಿಸಿದ "${name || 'ಯೋಜನೆ'}" ಪ್ರಸ್ತುತ ನಮ್ಮ ಪರಿಶೀಲಿಸಿದ ಪಟ್ಟಿಯಲ್ಲಿ ಲಭ್ಯವಿಲ್ಲ. ನಾನು ಶೀಘ್ರದಲ್ಲೇ ಈ ಯೋಜನೆಯನ್ನು ಪರಿಶೀಲಿಸಿ ಅಪ್‌ಡೇಟ್ ಮಾಡುತ್ತೇನೆ! ನಮ್ಮ ತಂಡವು ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಮೂಲಗಳಿಂದ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸುತ್ತಿದೆ.`,
  ta: (name) =>
    `நீங்கள் கேட்ட "${name || 'திட்டம்'}" தற்போது எங்கள் சரிபார்க்கப்பட்ட களஞ்சியத்தில் கிடைக்கவில்லை. நான் விரைவில் இந்த திட்டத்தை சரிபார்த்து புதுப்பிக்கிறேன்!`,
  te: (name) =>
    `మీరు అడిగిన "${name || 'పథకం'}" ప్రస్తుతం మా ధృవీకరించబడిన డైరెక్టరీలో అందుబాటులో లేదు. నేను త్వరలోనే ఈ పథకాన్ని తనిఖీ చేసి అప్‌డేట్ చేస్తాను!`,
  mr: (name) =>
    `तुम्ही विचारलेली "${name || 'योजना'}" सध्या आमच्या पडताळणी केलेल्या यादीत उपलब्ध नाही. मी लवकरच या योजनेची पडताळणी करून ती अपडेट करेन!`,
  bn: (name) =>
    `আপনি যে "${name || 'প্রকল্পের'}" বিষয়ে জানতে চেয়েছেন তা বর্তমানে আমাদের তালিকায় নেই। আমি শীঘ্রই এই প্রকল্পটি যাচাই করে আপডেট করব!`,
  gu: (name) =>
    `તમે પૂછેલી "${name || 'યોજના'}" હાલમાં અમારા ડેટાબેઝમાં ઉપલબ્ધ નથી. હું ટૂંક સમયમાં આ યોજનાની ચકાસણી કરીને તેને અપડેટ કરીશ!`,
  ml: (name) =>
    `നിങ്ങൾ ചോദിച്ച "${name || 'പദ്ധതി'}" നിലവിൽ ഞങ്ങളുടെ വിവരശേഖരത്തിൽ ലഭ്യമല്ല. ഞാൻ ഉടൻ തന്നെ ഈ പദ്ധതി പരിശോധിച്ച് അപ്‌ഡേറ്റ് ചെയ്യുന്നതാണ്!`,
  pa: (name) =>
    `ਜਿਸ "${name || 'ਸਕੀਮ'}" ਬਾਰੇ ਤੁਸੀਂ ਪੁੱਛਿਆ ਹੈ ਉਹ ਇਸ ਵੇਲੇ ਸਾਡੇ ਡੇਟਾਬੇਸ ਵਿੱਚ ਉਪਲਬਧ ਨਹੀਂ ਹੈ। ਮੈਂ ਜਲਦੀ ਹੀ ਇਸਦੀ ਜਾਂਚ ਕਰਕੇ ਇਸਨੂੰ ਅਪਡੇਟ ਕਰਾਂਗਾ!`,
  or: (name) =>
    `ଆପଣ ପଚାରିଥିବା "${name || 'ଯୋଜନା'}" ବର୍ତ୍ତମାନ ଆମ ତାଲିକାରେ ଉପଲବ୍ଧ ନାହିଁ। ମୁଁ ଖୁବ୍ ଶୀଘ୍ର ଏହି ଯୋଜନା ଯାଞ୍ଚ କରି ଅପଡେଟ୍ କରିବି!`,
};

/**
 * Recommendation & Grounded Multilingual Explanation Service:
 * Matches extracted attributes against Scheme documents and generates
 * factual explanations strictly grounded in DB records.
 */
export async function processCitizenQuery({ query, userLanguage = 'en', userProfile = {} }) {
  // 1. Fetch all active schemes from database
  const allSchemes = await Scheme.find({}).lean();
  const lowerQuery = query.toLowerCase();

  // Detect if user is asking about a specific scheme
  const schemeIndicators = ['scheme', 'yojana', 'yojna', 'scholarship', 'pariyojana', 'nidhi', 'kendra', 'mission', 'योजना', 'ಯೋಜನೆ', 'திட்டம்', 'పథకం'];
  const queriedSchemeName = extractQueriedSchemeName(query);
  const isAskingSpecificScheme = schemeIndicators.some((word) => lowerQuery.includes(word)) || Boolean(queriedSchemeName);

  // 2. Score and rank matching schemes
  const scoredSchemes = allSchemes.map((scheme) => {
    let score = 0;
    const lowerSlug = scheme.slug.toLowerCase();
    const lowerShortName = scheme.shortName.toLowerCase();
    const lowerName = scheme.name.toLowerCase();

    // Direct match with slug or short name
    if (lowerQuery.includes(lowerSlug) || lowerQuery.includes(lowerShortName)) {
      score += 60;
    }

    // Match acronyms and words from short name (e.g. 'ssp', 'kisan', 'solar')
    const shortWords = lowerShortName.split(/[\s\-()]+/).filter((w) => w.length >= 3 && !STOP_WORDS.has(w));
    for (const w of shortWords) {
      if (lowerQuery.includes(w)) {
        score += 35;
      }
    }

    // Direct match with queried scheme candidate name
    if (queriedSchemeName) {
      const lowerCandidate = queriedSchemeName.toLowerCase();
      if (lowerSlug.includes(lowerCandidate) || lowerShortName.includes(lowerCandidate) || lowerName.includes(lowerCandidate)) {
        score += 50;
      }
    }

    // Check distinctive words in name (excluding generic stop words)
    const nameWords = lowerName.split(/[\s\-()]+/).filter((w) => w.length >= 3 && !STOP_WORDS.has(w));
    for (const w of nameWords) {
      if (lowerQuery.includes(w)) {
        score += 20;
      }
    }

    // Specific acronym booster for SSP Scholarship in English and all Indian scripts
    const isSspAcronym =
      lowerQuery.includes('ssp') ||
      lowerQuery.includes('ಎಸ್ಎಸ್ಪಿ') ||
      lowerQuery.includes('ಎಸ್.ಎಸ್.ಪಿ') ||
      lowerQuery.includes('एसएसपी') ||
      lowerQuery.includes('एस.एस.पी') ||
      lowerQuery.includes('எஸ்பி') ||
      lowerQuery.includes('எஸ்எஸ்பி') ||
      lowerQuery.includes('ఎస్ఎస్పీ') ||
      lowerQuery.includes('ఎస్.ఎస్.పీ') ||
      lowerQuery.includes('এসএসপি');
    if (isSspAcronym && (scheme.slug?.includes('ssp') || scheme.shortName?.toLowerCase().includes('ssp'))) {
      score += 70;
    }

    // Check sector
    if (scheme.sector && lowerQuery.includes(scheme.sector.toLowerCase())) {
      score += 25;
    }

    // Multilingual Domain keyword semantic boosters
    const isScholarshipQuery =
      lowerQuery.includes('scholarship') ||
      lowerQuery.includes('student') ||
      lowerQuery.includes('college') ||
      lowerQuery.includes('matric') ||
      lowerQuery.includes('ssp') ||
      lowerQuery.includes('ವಿದ್ಯಾರ್ಥಿ') ||
      lowerQuery.includes('ವಿದ್ಯಾರ್ಥಿವೇತನ') ||
      lowerQuery.includes('छात्रवृत्ति') ||
      lowerQuery.includes('छात्र') ||
      lowerQuery.includes('విద్యార్థి') ||
      lowerQuery.includes('స్కాలర్‌షిప్') ||
      lowerQuery.includes('கல்வி உதவித்தொகை') ||
      lowerQuery.includes('மாணவர்') ||
      lowerQuery.includes('शिष्यवृत्ती') ||
      lowerQuery.includes('विद्यार्थी') ||
      lowerQuery.includes('বৃত্তি') ||
      lowerQuery.includes('ছাত্র');
    if (isScholarshipQuery && (scheme.sector?.toLowerCase().includes('education') || scheme.slug?.includes('scholarship') || scheme.occupations?.includes('Student'))) {
      score += 45;
    }

    const isFarmerQuery =
      lowerQuery.includes('kisan') ||
      lowerQuery.includes('farmer') ||
      lowerQuery.includes('crop') ||
      lowerQuery.includes('krishi') ||
      lowerQuery.includes('agriculture') ||
      lowerQuery.includes('किसान') ||
      lowerQuery.includes('कृषि') ||
      lowerQuery.includes('खेती') ||
      lowerQuery.includes('ರೈತ') ||
      lowerQuery.includes('ಕೃಷಿ') ||
      lowerQuery.includes('రైతు') ||
      lowerQuery.includes('వ్యవసాయం') ||
      lowerQuery.includes('விவசாயி') ||
      lowerQuery.includes('உழவர்') ||
      lowerQuery.includes('शेतकरी') ||
      lowerQuery.includes('कृषी') ||
      lowerQuery.includes('কৃষক') ||
      lowerQuery.includes('কৃষি');
    if (isFarmerQuery && (scheme.sector?.toLowerCase().includes('agriculture') || scheme.occupations?.includes('Farmer'))) {
      score += 45;
      if (scheme.slug === 'pm-kisan') {
        score += 30; // Direct boost for PM-Kisan
      }
    }

    const isHealthQuery =
      lowerQuery.includes('health') ||
      lowerQuery.includes('hospital') ||
      lowerQuery.includes('ayushman') ||
      lowerQuery.includes('medical') ||
      lowerQuery.includes('insurance') ||
      lowerQuery.includes('स्वास्थ्य') ||
      lowerQuery.includes('आयुष्मान') ||
      lowerQuery.includes('अस्पताल') ||
      lowerQuery.includes('ಆರೋಗ್ಯ') ||
      lowerQuery.includes('ಆಯುಷ್ಮಾನ್') ||
      lowerQuery.includes('ఆరోగ్య') ||
      lowerQuery.includes('ఆయుష్మాన్') ||
      lowerQuery.includes('சுகாதாரம்') ||
      lowerQuery.includes('ஆயுஷ்மான்') ||
      lowerQuery.includes('आरोग्य') ||
      lowerQuery.includes('आयुष्मान') ||
      lowerQuery.includes('স্বাস্থ্য') ||
      lowerQuery.includes('আয়ুষ্মান');
    if (isHealthQuery && scheme.sector?.toLowerCase().includes('health')) {
      score += 45;
    }

    const isSolarQuery =
      lowerQuery.includes('solar') ||
      lowerQuery.includes('bijli') ||
      lowerQuery.includes('electricity') ||
      lowerQuery.includes('surya') ||
      lowerQuery.includes('सोलर') ||
      lowerQuery.includes('सूर्य') ||
      lowerQuery.includes('बिजली') ||
      lowerQuery.includes('ಸೌರ') ||
      lowerQuery.includes('ಸೂರ್ಯ') ||
      lowerQuery.includes('ಸೌರಶಕ್ತಿ') ||
      lowerQuery.includes('సౌర') ||
      lowerQuery.includes('సూర్య') ||
      lowerQuery.includes('சூரிய') ||
      lowerQuery.includes('सौर') ||
      lowerQuery.includes('সূর্য') ||
      lowerQuery.includes('সৌর');
    if (isSolarQuery && (scheme.slug?.includes('solar') || scheme.slug?.includes('surya') || scheme.sector?.toLowerCase().includes('energy'))) {
      score += 45;
    }

    // Check target beneficiaries & occupations
    if (scheme.occupations) {
      for (const occ of scheme.occupations) {
        if (occ && lowerQuery.includes(occ.toLowerCase())) {
          score += 30;
        }
      }
    }

    // Description text match
    if (scheme.description && lowerQuery.length > 5 && scheme.description.toLowerCase().includes(lowerQuery)) {
      score += 20;
    }

    // Profile match boost
    if (userProfile.state && (scheme.state === userProfile.state || scheme.state === 'All India')) {
      score += 10;
    }
    if (userProfile.occupation && scheme.occupations?.some((o) => userProfile.occupation.toLowerCase().includes(o.toLowerCase()))) {
      score += 20;
    }

    return {
      scheme,
      score,
      assessment: evaluateSchemeEligibility(scheme, userProfile),
    };
  });

  // Sort descending by score
  scoredSchemes.sort((a, b) => b.score - a.score);

  const maxScore = scoredSchemes.length > 0 ? scoredSchemes[0].score : 0;
  let explanation = '';
  let finalMatches = [];

  // ── CASE 1: Specific scheme requested, but NOT YET in our database ──────
  if (isAskingSpecificScheme && maxScore < 35) {
    const candidateName = queriedSchemeName || query.replace(/(?:scheme|yojana|details|how to apply|what is|tell me about)/gi, '').trim();
    
    // Autonomous auto-discovery from official portals without requiring admin permission
    let discoveredScheme = null;
    try {
      discoveredScheme = await autoDiscoverAndSaveScheme(candidateName);
    } catch (discErr) {
      logger.warn(`Auto-discovery in recommendation service failed: ${discErr.message}`);
    }

    if (discoveredScheme) {
      finalMatches = [
        {
          scheme: discoveredScheme,
          score: 100,
          assessment: evaluateSchemeEligibility(discoveredScheme, userProfile),
        },
      ];

      explanation = `✨ **Newly Discovered Government Scheme**: **${discoveredScheme.name}**\n\n`;
      explanation += `• **Description**: ${discoveredScheme.description}\n`;
      explanation += `• **Administering Authority**: ${discoveredScheme.authority}\n`;
      explanation += `• **Application Deadline / Last Date**: ${discoveredScheme.applicationDeadline || 'Open for FY 2026-27'}\n`;
      if (discoveredScheme.benefits && discoveredScheme.benefits.length > 0) {
        explanation += `• **Key Benefits**: ${discoveredScheme.benefits.join(' ')}\n`;
      }
      if (discoveredScheme.eligibilityCriteria && discoveredScheme.eligibilityCriteria.length > 0) {
        explanation += `• **Eligibility**: ${discoveredScheme.eligibilityCriteria.map((c) => c.label).join('; ')}\n`;
      }
      if (discoveredScheme.requiredDocuments && discoveredScheme.requiredDocuments.length > 0) {
        explanation += `• **Required Documents**: ${discoveredScheme.requiredDocuments.join(', ')}\n`;
      }
      if (discoveredScheme.officialLink) {
        explanation += `• **Official Portal**: [${discoveredScheme.officialLink}](${discoveredScheme.officialLink})\n`;
      }
      explanation += `\n*(This scheme was automatically discovered from official portal records and added to the BharatSeva repository).*`;
    } else {
      const templateFn = UNAVAILABLE_SCHEME_TEMPLATES[userLanguage] || UNAVAILABLE_SCHEME_TEMPLATES.en;
      explanation = templateFn(candidateName);

      // Look for alternative schemes in a related sector/occupation with moderate relevance (score >= 15)
      const alternatives = scoredSchemes.filter((item) => item.score >= 15).slice(0, 3);
      if (alternatives.length > 0) {
        finalMatches = alternatives;
        if (userLanguage === 'en') {
          explanation += ` In the meantime, here are related verified schemes you can explore:`;
        }
      } else {
        finalMatches = [];
      }
    }

  // ── CASE 2: Specific scheme IS AVAILABLE in database (Score >= 35) ────────────
  } else if (maxScore >= 35) {
    const primaryMatch = scoredSchemes[0].scheme;
    finalMatches = scoredSchemes.filter((item) => item.score >= 25).slice(0, 3);

    explanation = `**${primaryMatch.name} (${primaryMatch.shortName})**\n\n`;
    explanation += `• **Description**: ${primaryMatch.description}\n`;
    explanation += `• **Key Benefits**: ${primaryMatch.benefits.join(' ')}\n`;
    explanation += `• **Administering Authority**: ${primaryMatch.authority}\n`;

    if (primaryMatch.eligibilityCriteria && primaryMatch.eligibilityCriteria.length > 0) {
      explanation += `• **Eligibility**: ${primaryMatch.eligibilityCriteria.map((c) => c.label).join('; ')}\n`;
    }

    if (primaryMatch.requiredDocuments && primaryMatch.requiredDocuments.length > 0) {
      explanation += `• **Required Documents**: ${primaryMatch.requiredDocuments.slice(0, 4).join(', ')}\n`;
    }

    if (primaryMatch.applicationMode) {
      explanation += `• **Application Mode**: ${primaryMatch.applicationMode}\n`;
    }

    if (primaryMatch.officialLink) {
      explanation += `• **Official Portal**: [${primaryMatch.officialLink}](${primaryMatch.officialLink})`;
    }

  // ── CASE 3: General discovery enquiry (score between 20 and 34) ────────────────
  } else if (maxScore >= 20) {
    finalMatches = scoredSchemes.filter((item) => item.score >= 20).slice(0, 3);
    const topScheme = finalMatches[0]?.scheme;
    explanation = `Based on your enquiry, here are verified government welfare programs from our directory: ${topScheme ? `${topScheme.name} (${topScheme.shortName}) - ${topScheme.benefits[0]}` : ''}`;

  // ── CASE 4: Low match / Unclear query ─────────────────────────────────────────
  } else {
    const candidateName = queriedSchemeName || query.trim();
    const templateFn = UNAVAILABLE_SCHEME_TEMPLATES[userLanguage] || UNAVAILABLE_SCHEME_TEMPLATES.en;
    explanation = templateFn(candidateName);
    finalMatches = [];
  }

  // 4. Autonomous Application Intent Detection (Multilingual: en, kn, hi, ta, te, mr, bn)
  const APPLY_KEYWORDS = [
    'apply', 'register', 'submit', 'behalf', 'form', 'auto', 'agent', 'digilocker', 'process', 'claim',
    // Kannada
    'ಅರ್ಜಿ', 'ಅರ್ಜಿಹಾಕಿ', 'ಸಲ್ಲಿಸಿ', 'ನೋಂದಣಿ', 'ಡಿಜಿಲಾಕರ್', 'ಅಪ್ಲೈ', 'ಹಾಕಿ',
    // Hindi
    'आवेदन', 'पंजीकरण', 'फॉर्म', 'अप्लाई', 'जमा', 'भरना', 'डिजिलॉकर',
    // Tamil
    'விண்ணப்பிக்க', 'பதிவு', 'படிவம்', 'சமர்ப்பிக்க', 'டிஜிலாக்கர்',
    // Telugu
    'దరఖాస్తు', 'నమోదు', 'సమర్పించండి', 'డిజిలాకర్',
    // Marathi
    'अर्ज', 'नोंदणी', 'सबमिट', 'डिजिलॉकर',
    // Bengali
    'আবেদন', 'নিবন্ধন', 'জমা', 'ডিজিলকার',
  ];

  const isApplyIntent = APPLY_KEYWORDS.some((kw) => lowerQuery.includes(kw));

  const AUTONOMOUS_APPLY_NOTICES = {
    en: (name) => `\n\n🤖 **AI Autonomous DigiLocker Application Ready**: I can apply for **${name}** on your behalf autonomously using your verified DigiLocker documents. Click the **"🤖 Apply with AI Agent"** button below to launch the automated submission.`,
    kn: (name) => `\n\n🤖 **ಸ್ವಾಯತ್ತ ಡಿಜಿಲಾಕರ್ ಅರ್ಜಿ ಸಿದ್ಧವಾಗಿದೆ**: ನಿಮ್ಮ ಪರಿಶೀಲಿಸಿದ ಡಿಜಿಲಾಕರ್ ದಾಖಲೆಗಳನ್ನು ಬಳಸಿ ನಾನು ನಿಮ್ಮ ಪರವಾಗಿ **${name}** ಯೋಜನೆಗೆ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಬಹುದು. ಅರ್ಜಿಯನ್ನು ಪ್ರಾರಂಭಿಸಲು ಕೆಳಗಿನ **"🤖 Apply with Agent"** ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ.`,
    hi: (name) => `\n\n🤖 **स्वायत्त डिजिलॉकर आवेदन तैयार है**: मैं आपके सत्यापित डिजिलॉकर दस्तावेजों का उपयोग करके आपकी ओर से **${name}** के लिए स्वचालित रूप से आवेदन कर सकता हूँ। आवेदन शुरू करने के लिए नीचे दिए गए **"🤖 Apply with Agent"** बटन पर क्लिक करें।`,
    ta: (name) => `\n\n🤖 **தானியங்கி டிஜிலாக்கர் விண்ணப்பம் தயார்**: உங்கள் சரிபார்க்கப்பட்ட டிஜிலாக்கர் ஆவணங்களைப் பயன்படுத்தி உங்கள் சார்பாக **${name}** திட்டத்திற்கு நான் தானாகவே விண்ணப்பிக்க முடியும். தொடங்க கீழே உள்ள **"🤖 Apply with Agent"** பொத்தானைக் கிளிக் செய்யவும்.`,
    te: (name) => `\n\n🤖 **స్వయంప్రతిపత్తి డిజిలాకర్ దరఖాస్తు సిద్ధంగా ఉంది**: మీ ధృవీకరించిన డిజిలాకర్ పత్రాలను ఉపయోగించి మీ తరపున **${name}** కోసం నేను స్వయంచాలకంగా దరఖాస్తు చేయగలను. ప్రారంభించడానికి క్రింది **"🤖 Apply with Agent"** బటన్‌ను క్లిక్ చేయండి.`,
    mr: (name) => `\n\n🤖 **स्वायत्त डिजिलॉकर अर्ज सज्ज आहे**: तुमच्या पडताळणी केलेल्या डिजिलॉकर कागदपत्रांचा वापर करून मी तुमच्या वतीने **${name}** साठी आपोआप अर्ज करू शकतो. अर्ज सुरू करण्यासाठी खालील **"🤖 Apply with Agent"** बटणावर क्लिक करा.`,
    bn: (name) => `\n\n🤖 **স্বয়ংক্রিয় ডিজিলকার আবেদন প্রস্তুত**: আপনার যাচাইকৃত ডিজিলকার নথি ব্যবহার করে আমি আপনার পক্ষে **${name}** প্রকল্পের জন্য স্বয়ংক্রিয়ভাবে আবেদন করতে পারি। আবেদন শুরু করতে নিচের **"🤖 Apply with Agent"** বাটনে ক্লিক করুন।`,
  };

  const ACTION_MESSAGES = {
    en: (name) => `I can autonomously apply for ${name} on your behalf using your DigiLocker verified documents.`,
    kn: (name) => `ನಿಮ್ಮ ಪರಿಶೀಲಿಸಿದ ಡಿಜಿಲಾಕರ್ ದಾಖಲೆಗಳನ್ನು ಬಳಸಿ ನಾನು ನಿಮ್ಮ ಪರವಾಗಿ ${name} ಯೋಜನೆಗೆ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಬಹುದು.`,
    hi: (name) => `मैं आपके सत्यापित डिजिलॉकर दस्तावेजों का उपयोग करके आपकी ओर से ${name} के लिए स्वचालित रूप से आवेदन कर सकता हूँ।`,
    ta: (name) => `உங்கள் சரிபார்க்கப்பட்ட டிஜிலாக்கர் ஆவணங்களைப் பயன்படுத்தி உங்கள் சார்பாக ${name} திட்டத்திற்கு நான் தானாகவே விண்ணப்பிக்க முடியும்.`,
    te: (name) => `మీ ధృవీకరించిన డిజిలాకర్ పత్రాలను ఉపయోగించి మీ తరపున ${name} కోసం నేను స్వయంచాలకంగా దరఖాస్తు చేయగలను.`,
    mr: (name) => `तुमच्या पडताळणी केलेल्या डिजिलॉकर कागदपत्रांचा वापर करून मी तुमच्या वतीने ${name} साठी आपोआप अर्ज करू शकतो.`,
    bn: (name) => `আপনার যাচাইকৃত ডিজিলকার নথি ব্যবহার করে আমি আপনার পক্ষে ${name} প্রকল্পের জন্য স্বয়ংক্রিয়ভাবে আবেদন করতে পারি।`,
  };

  let actionIntent = null;
  const topMatch = finalMatches[0]?.scheme;
  if (topMatch) {
    const actionMsgFn = ACTION_MESSAGES[userLanguage] || ACTION_MESSAGES.en;
    actionIntent = {
      type: 'APPLY_SCHEME',
      scheme: {
        id: topMatch._id || topMatch.slug,
        slug: topMatch.slug,
        name: topMatch.name,
        shortName: topMatch.shortName,
        sector: topMatch.sector,
        authority: topMatch.authority,
        officialLink: topMatch.officialLink,
      },
      message: actionMsgFn(topMatch.name),
    };

    if (isApplyIntent) {
      const noticeFn = AUTONOMOUS_APPLY_NOTICES[userLanguage] || AUTONOMOUS_APPLY_NOTICES.en;
      explanation += noticeFn(topMatch.name);
    }
  }

  // 5. Grounded Multilingual Translation via Sarvam if non-English and not pre-templated
  if (userLanguage !== 'en' && sarvamService.isConfigured() && !UNAVAILABLE_SCHEME_TEMPLATES[userLanguage]) {
    try {
      const targetSarvamCode = `${userLanguage}-IN`;
      const translated = await sarvamService.translate({
        text: explanation,
        sourceLang: 'en-IN',
        targetLang: targetSarvamCode,
      });
      if (translated) {
        explanation = translated;
      }
    } catch (transErr) {
      logger.debug('Sarvam translation fallback', transErr);
    }
  }

  return {
    query,
    userLanguage,
    explanation,
    actionIntent,
    recommendedSchemes: finalMatches.map((m) => ({
      id: m.scheme._id || m.scheme.slug,
      slug: m.scheme.slug,
      name: m.scheme.name,
      shortName: m.scheme.shortName,
      sector: m.scheme.sector,
      type: m.scheme.type,
      state: m.scheme.state,
      authority: m.scheme.authority,
      benefits: m.scheme.benefits,
      requiredDocuments: m.scheme.requiredDocuments,
      applicationMode: m.scheme.applicationMode,
      officialLink: m.scheme.officialLink,
      sourceAuthority: m.scheme.sourceAuthority,
      lastVerifiedDate: m.scheme.lastVerifiedDate,
      dataClassification: m.scheme.dataClassification,
      assessment: m.assessment,
    })),
    disclaimer: 'This evaluation and guidance are strictly informational. Formal eligibility is determined solely by the respective government department.',
  };
}

export default {
  processCitizenQuery,
  extractQueriedSchemeName,
};
