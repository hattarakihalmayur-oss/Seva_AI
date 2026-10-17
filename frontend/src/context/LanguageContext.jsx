import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { SUPPORTED_LANGUAGES, UI_TRANSLATIONS } from '../constants/languages';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  // Retrieve saved language from localStorage or default to English
  const [currentLangCode, setCurrentLangCode] = useState(() => {
    const saved = localStorage.getItem('bharatseva_lang');
    const isValid = SUPPORTED_LANGUAGES.some((l) => l.code === saved);
    return isValid ? saved : 'en';
  });

  const currentLanguage = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === currentLangCode) || SUPPORTED_LANGUAGES[0];
  }, [currentLangCode]);

  const setLanguage = useCallback((langCode) => {
    const valid = SUPPORTED_LANGUAGES.some((l) => l.code === langCode);
    const newCode = valid ? langCode : 'en';
    setCurrentLangCode(newCode);
    try {
      localStorage.setItem('bharatseva_lang', newCode);
      window.dispatchEvent(new CustomEvent('bharatseva_language_changed', { detail: { lang: newCode } }));
    } catch {
      // Ignore storage errors in private browsing
    }
  }, []);

  /**
   * Primary React Translation Function
   *
   * Requirement 3: Display the English translation of every translated text
   * in small font inside parentheses next to the main text.
   * Example:
   *  ಯೋಜನೆಗಳು (Schemes)
   *  ಅರ್ಹತಾ ಮಾನದಂಡಗಳು (Eligibility Criteria)
   *  ಅರ್ಜಿ ಸಲ್ಲಿಸಿ (Apply Now)
   *
   * When language is English ('en'), returns the clean English text directly.
   * When language is not English:
   *   - If options?.plain === true: returns string "${translated} (${en})"
   *   - If options?.pure === true: returns string "${translated}"
   *   - Otherwise: returns JSX with styled English in small italic parentheses.
   */
  const t = useCallback(
    (key, options = {}) => {
      if (!key) return '';

      const enDict = UI_TRANSLATIONS.en || {};
      const activeDict = UI_TRANSLATIONS[currentLangCode] || enDict;

      const enText = enDict[key] || key;
      const translatedText = activeDict[key] || enText;

      // When language is English, display English without redundant parenthesis
      if (currentLangCode === 'en' || translatedText === enText) {
        return enText;
      }

      // Plain string output requested (for options, placeholders, titles)
      if (options?.plain === true || options === true) {
        return `${translatedText} (${enText})`;
      }

      // Pure translated string without English parenthetical
      if (options?.pure === true) {
        return translatedText;
      }

      // Default: Return structured JSX with small font in parentheses
      return (
        <span className="inline-flex items-baseline flex-wrap gap-x-1" data-i18n-key={key}>
          <span>{translatedText}</span>
          <span className="text-[0.78em] font-normal italic opacity-75 tracking-normal whitespace-normal">
            ({enText})
          </span>
        </span>
      );
    },
    [currentLangCode]
  );

  /**
   * Returns plain string translation: "${translated} (${en})" or "${en}"
   * Ideal for HTML input placeholders, title attributes, aria-labels, and <option> tags.
   */
  const tText = useCallback(
    (key, options = {}) => {
      const enDict = UI_TRANSLATIONS.en || {};
      const activeDict = UI_TRANSLATIONS[currentLangCode] || enDict;

      const enText = enDict[key] || key;
      const translatedText = activeDict[key] || enText;

      if (currentLangCode === 'en' || translatedText === enText) {
        return enText;
      }

      if (options?.pure === true) {
        return translatedText;
      }

      return `${translatedText} (${enText})`;
    },
    [currentLangCode]
  );

  // Pure translation helper without English parenthetical
  const tPure = useCallback(
    (key) => {
      const enDict = UI_TRANSLATIONS.en || {};
      const activeDict = UI_TRANSLATIONS[currentLangCode] || enDict;
      return activeDict[key] || enDict[key] || key;
    },
    [currentLangCode]
  );

  useEffect(() => {
    // Reflect active language in root HTML tag for accessibility & fonts
    document.documentElement.lang = currentLangCode;
  }, [currentLangCode]);

  return (
    <LanguageContext.Provider
      value={{
        currentLangCode,
        currentLanguage,
        setLanguage,
        supportedLanguages: SUPPORTED_LANGUAGES,
        t,
        tText,
        tPure,
        isEnglish: currentLangCode === 'en',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

/**
 * Reusable React Translation Component
 * Usage: <T k="applyNow" /> or <T k="schemes" />
 */
export function T({ k, plain = false, pure = false }) {
  const { t, tText, tPure } = useLanguage();
  if (pure) return <>{tPure(k)}</>;
  if (plain) return <>{tText(k)}</>;
  return <>{t(k)}</>;
}

export default LanguageContext;
