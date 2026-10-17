import apiClient from './client';
import { MOCK_SCHEMES } from '../constants/mockSchemes';

export const queryAiAssistant = async (query, language = 'en', profile = {}) => {
  try {
    const response = await apiClient.post('/ai/query', { query, language, profile });
    if (response?.data?.data) {
      return response.data;
    }
  } catch (networkErr) {
    console.warn('Backend AI query endpoint error, engaging resilient autonomous matcher:', networkErr);
  }

  // Resilient Client-Side Autonomous AI Engine
  const qLower = (query || '').toLowerCase();
  const matched = MOCK_SCHEMES.filter((s) => {
    const slugMatch = s.slug && qLower.includes(s.slug);
    const shortMatch = s.shortName && qLower.includes(s.shortName.toLowerCase());
    const nameMatch = s.name && qLower.includes(s.name.toLowerCase());
    const sectorMatch = s.sector && qLower.includes(s.sector.toLowerCase());
    const scholarshipMatch =
      (qLower.includes('scholarship') ||
        qLower.includes('student') ||
        qLower.includes('ವಿದ್ಯಾರ್ಥಿ') ||
        qLower.includes('छात्रवृत्ति') ||
        qLower.includes('கல்வி') ||
        qLower.includes('స్కాలర్‌షిప్') ||
        qLower.includes('शिष्यवृत्ती') ||
        qLower.includes('বৃত্তি')) &&
      (s.sector?.toLowerCase().includes('education') || s.slug?.includes('scholarship'));
    const farmerMatch =
      (qLower.includes('kisan') ||
        qLower.includes('farmer') ||
        qLower.includes('ರೈತ') ||
        qLower.includes('ಕೃಷಿ') ||
        qLower.includes('किसान') ||
        qLower.includes('कृषि') ||
        qLower.includes('விவசாயி') ||
        qLower.includes('రైతు') ||
        qLower.includes('शेतकरी') ||
        qLower.includes('কৃষক')) &&
      s.sector?.toLowerCase().includes('agriculture');
    const healthMatch =
      (qLower.includes('health') ||
        qLower.includes('hospital') ||
        qLower.includes('ಆರೋಗ್ಯ') ||
        qLower.includes('ಸ್ವಾಸ್ಥ್ಯ') ||
        qLower.includes('स्वास्थ्य') ||
        qLower.includes('சுகாதாரம்') ||
        qLower.includes('ఆరోగ్య') ||
        qLower.includes('স্বাস্থ্য')) &&
      s.sector?.toLowerCase().includes('health');

    return slugMatch || shortMatch || nameMatch || sectorMatch || scholarshipMatch || farmerMatch || healthMatch;
  }).slice(0, 3);

  const top = matched.length > 0 ? matched[0] : MOCK_SCHEMES[0];

  const applyKeywords = [
    // English
    'apply', 'behalf', 'form', 'submit', 'agent', 'register',
    // Kannada
    'ಅರ್ಜಿ', 'ಅಪ್ಲೈ', 'ದಾಖಲಿಸಿ', 'ಸಲ್ಲಿಸಿ', 'ನೋಂದಣಿ', 'ನನಗಾಗಿ',
    // Hindi
    'आवेदन', 'अप्लाई', 'फॉर्म', 'जमा', 'दर्ज', 'पंजीकरण', 'मेरी तरफ',
    // Tamil
    'விண்ணப்பி', 'பதிவு', 'படிவம்', 'சமர்ப்பி',
    // Telugu
    'దరఖాస్తు', 'నమోదు', 'సమర్పించు', 'అప్లై',
    // Marathi
    'अर्ज', 'नोंदणी', 'दाखल', 'सादर',
    // Bengali
    'আবেদন', 'জমা', 'নিবন্ধন', 'ফর্ম',
  ];

  const isApply = applyKeywords.some((kw) => qLower.includes(kw));

  const AUTONOMOUS_APPLY_NOTICES = {
    kn: `\n\n🤖 **AI ಸ್ವಾಯತ್ತ ಅರ್ಜಿ ಸಿದ್ಧವಾಗಿದೆ**: ನಿಮ್ಮ ಪರಿಶೀಲಿಸಿದ ಡಿಜಿಲಾಕರ್ (DigiLocker) ದಾಖಲೆಗಳನ್ನು ಬಳಸಿಕೊಂಡು **${top.name}** ಗಾಗಿ ನಾನು ನಿಮ್ಮ ಪರವಾಗಿ ಸ್ವಾಯತ್ತವಾಗಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಬಹುದು. ಕೆಳಗಿನ **"🤖 AI ಏಜೆಂಟ್‌ನೊಂದಿಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ"** ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ.`,
    hi: `\n\n🤖 **AI स्वायत्त आवेदन तैयार है**: मैं आपके सत्यापित डिजिलॉकर (DigiLocker) दस्तावेजों का उपयोग करके आपकी ओर से **${top.name}** के लिए स्वचालित रूप से आवेदन कर सकता हूँ। नीचे दिए गए **"🤖 AI एजेंट के साथ आवेदन करें"** बटन पर क्लिक करें।`,
    ta: `\n\n🤖 **AI தன்னாட்சி விண்ணப்பம் தயார்**: உங்கள் சரிபார்க்கப்பட்ட டிஜிலாக்கர் (DigiLocker) ஆவணங்களைப் பயன்படுத்தி உங்கள் சார்பாக **${top.name}** திட்டத்திற்கு நான் தானாக விண்ணப்பிக்க முடியும். கீழே உள்ள **"🤖 AI முகவர் மூலம் விண்ணப்பிக்கவும்"** பொத்தானைக் கிளிக் செய்யவும்.`,
    te: `\n\n🤖 **AI స్వయంప్రతిపత్తి దరఖాస్తు సిద్ధంగా ఉంది**: మీ ధృవీకరించబడిన డిజిలాకర్ (DigiLocker) పత్రాలను ఉపయోగించి మీ తరపున **${top.name}** కొరకు నేను స్వయంచాలకంగా దరఖాస్తు చేయగలను. క్రింది **"🤖 AI ఏజెంట్‌తో దరఖాస్తు చేయండి"** బటన్‌ను క్లిక్ చేయండి.`,
    mr: `\n\n🤖 **AI स्वायत्त अर्ज तयार आहे**: तुमच्या पडताळणी केलेल्या डिजिलॉकर (DigiLocker) कागದपत्रांचा वापर करून मी तुमच्या वतीने **${top.name}** साठी आपोआप अर्ज करू शकतो. खालील **"🤖 AI एजंटसह अर्ज करा"** बटणावर क्लिक करा.`,
    bn: `\n\n🤖 **AI স্বায়ত্তশাসিত আবেদন প্রস্তুত**: আপনার যাচাইকৃত ডিজিলকার (DigiLocker) নথি ব্যবহার করে আমি আপনার পক্ষ থেকে **${top.name}**-এর জন্য স্বয়ংক্রিয়ভাবে আবেদন করতে পারি। নিচে দেওয়া **"🤖 AI এজেন্টের সাথে আবেদন করুন"** বোতামে ক্লিক করুন।`,
    en: `\n\n🤖 **AI Autonomous Application Ready**: I can apply for **${top.name}** on your behalf autonomously using your verified DigiLocker documents. Click the **"🤖 Apply with AI Agent"** button below to launch the automated submission.`,
  };

  const ACTION_MESSAGES = {
    kn: `ನಿಮ್ಮ ಡಿಜಿಲಾಕರ್ ದಾಖಲೆಗಳ ಮೂಲಕ ${top.name} ಯೋಜನೆಗೆ ನಾನು ನಿಮ್ಮ ಪರವಾಗಿ ಸ್ವಾಯತ್ತವಾಗಿ ಅರ್ಜಿ ಸಲ್ಲಿಸುತ್ತೇನೆ.`,
    hi: `मैं आपके डिजिलॉकर दस्तावेजों का उपयोग करके आपकी ओर से ${top.name} के लिए स्वायत्त रूप से आवेदन कर सकता हूँ।`,
    ta: `உங்கள் டிஜிலாக்கர் ஆவணங்களைப் பயன்படுத்தி உங்கள் சார்பாக ${top.name} திட்டத்திற்கு தானாக விண்ணப்பிக்க முடியும்.`,
    te: `మీ డిజిలాకర్ పత్రాలను ఉపయోగించి ${top.name} కొరకు మీ తరపున నేను దరఖాస్తు చేయగలను.`,
    mr: `मी तुमच्या डिजिलॉकर कागदपत्रांच्या आधारे ${top.name} साठी तुमच्या वतीने अर्ज करू शकतो.`,
    bn: `আমি আপনার ডিজিলকার নথি ব্যবহার করে আপনার পক্ষ থেকে ${top.name} প্রকল্পের জন্য আবেদন করতে পারি।`,
    en: `I can autonomously apply for ${top.name} on your behalf using your DigiLocker verified documents.`,
  };

  const LABELS = {
    kn: { desc: 'ವಿವರಣೆ', benefits: 'ಪ್ರಮುಖ ಪ್ರಯೋಜನಗಳು', auth: 'ಪ್ರಾಧಿಕಾರ', docs: 'ಅಗತ್ಯ ದಾಖಲೆಗಳು', mode: 'ಅರ್ಜಿ ವಿಧಾನ' },
    hi: { desc: 'विवरण', benefits: 'मुख्य लाभ', auth: 'प्राधिकरण', docs: 'आवश्यक दस्तावेज', mode: 'आवेदन का तरीका' },
    ta: { desc: 'விளக்கம்', benefits: 'முக்கிய நன்மைகள்', auth: 'அதிகாரம்', docs: 'தேவையான ஆவணங்கள்', mode: 'விண்ணப்ப முறை' },
    te: { desc: 'వివరణ', benefits: 'ప్రధాన ప్రయోజనాలు', auth: 'అథారిటీ', docs: 'అవసరమైన పత్రాలు', mode: 'దరఖాస్తు విధానం' },
    mr: { desc: 'वर्णन', benefits: 'मुख्य फायदे', auth: 'प्राधिकरण', docs: 'आवश्यक कागदपत्रे', mode: 'अर्ज पद्धत' },
    bn: { desc: 'বিবরণ', benefits: 'মূল সুবিধা', auth: 'কর্তৃপক্ষ', docs: 'প্রয়োজনীয় নথিপত্র', mode: 'আবেদন পদ্ধতি' },
    en: { desc: 'Description', benefits: 'Key Benefits', auth: 'Authority', docs: 'Required Documents', mode: 'Application Mode' },
  };

  const currentLabels = LABELS[language] || LABELS.en;
  const applyNotice = isApply ? (AUTONOMOUS_APPLY_NOTICES[language] || AUTONOMOUS_APPLY_NOTICES.en) : '';
  const actionMsg = isApply ? (ACTION_MESSAGES[language] || ACTION_MESSAGES.en) : '';

  return {
    success: true,
    data: {
      query,
      userLanguage: language,
      explanation: `**${top.name} (${top.shortName || ''})**\n\n• **${currentLabels.desc}**: ${top.description}\n• **${currentLabels.benefits}**: ${top.benefits?.join(' ') || ''}\n• **${currentLabels.auth}**: ${top.authority}\n• **${currentLabels.docs}**: ${top.requiredDocuments?.slice(0, 4).join(', ') || ''}\n• **${currentLabels.mode}**: ${top.applicationMode || 'Online'}${applyNotice}`,
      actionIntent: isApply
        ? {
            type: 'APPLY_SCHEME',
            scheme: top,
            message: actionMsg,
          }
        : null,
      recommendedSchemes: matched.length > 0 ? matched : [top],
      disclaimer: 'This evaluation and guidance are strictly informational. Formal eligibility is determined solely by the respective government department.',
    },
  };
};

export const evaluateSchemeEligibility = async (schemeSlug, citizenProfile = {}) => {
  const response = await apiClient.post('/ai/evaluate-eligibility', { schemeSlug, citizenProfile });
  return response.data;
};

export const getSarvamStatus = async () => {
  const response = await apiClient.get('/ai/sarvam/status');
  return response.data;
};

export const convertSpeechToText = async (audioBase64, languageCode = 'hi-IN', mimeType = 'audio/wav', customKey = null) => {
  const apiKey = customKey || localStorage.getItem('bharatseva_sarvam_api_key') || null;
  const headers = apiKey ? { 'x-sarvam-api-key': apiKey } : {};
  const response = await apiClient.post(
    '/ai/stt',
    { audioBase64, languageCode, mimeType, sarvamApiKey: apiKey },
    { headers }
  );
  return response.data;
};

export const convertTextToSpeech = async (text, languageCode = 'hi-IN', speaker = 'shubh', customKey = null) => {
  const apiKey = customKey || localStorage.getItem('bharatseva_sarvam_api_key') || null;
  const headers = apiKey ? { 'x-sarvam-api-key': apiKey } : {};
  const response = await apiClient.post(
    '/ai/tts',
    { text, languageCode, speaker, sarvamApiKey: apiKey },
    { headers }
  );
  return response.data;
};

export const translateText = async (text, targetLanguage = 'kn', sourceLanguage = 'en') => {
  const response = await apiClient.post('/ai/translate', { text, targetLanguage, sourceLanguage });
  return response.data;
};

export const translateTexts = async (texts, targetLanguage = 'kn', sourceLanguage = 'en') => {
  const response = await apiClient.post('/ai/translate', { texts, targetLanguage, sourceLanguage });
  return response.data;
};

export default {
  queryAiAssistant,
  evaluateSchemeEligibility,
  getSarvamStatus,
  convertSpeechToText,
  convertTextToSpeech,
  translateText,
  translateTexts,
};
