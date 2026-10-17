import React, { useState } from 'react';
import { Globe2, Check, ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LanguagePage() {
  const { currentLanguage, supportedLanguages, setLanguage, t } = useLanguage();
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSelect = async (langCode) => {
    setLanguage(langCode);
    if (user) {
      await updateProfile({ preferredLanguage: langCode });
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="text-center max-w-xl mx-auto mb-10">
        <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
          <Globe2 className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('chooseLanguageTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          {t('chooseLanguageSub')}
        </p>
      </div>

      {savedSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">
              {t('languageUpdatedSuccess')} ({currentLanguage.name} &middot; {currentLanguage.nativeName})
            </span>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
          >
            <span>{t('continueToHome')}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Grid of 7 supported languages in required order: Kannada, Hindi, Tamil, Telugu, Marathi, Bengali, English */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {supportedLanguages.map((lang) => {
          const isSelected = currentLanguage.code === lang.code;

          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleSelect(lang.code)}
              className={`p-5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between relative group ${
                isSelected
                  ? 'bg-orange-50/70 border-orange-500 ring-2 ring-orange-500/30 shadow-md'
                  : 'bg-white border-slate-200 hover:border-orange-300 hover:shadow-xs'
              }`}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}

              <div>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                  {lang.sarvamCode}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{lang.nativeName}</h3>
                <p className="text-xs text-slate-600 font-medium">{lang.name}</p>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">Sample:</span>
                <span className="text-[11px] font-semibold text-slate-700 truncate max-w-[170px]">
                  {lang.greeting}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-10 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
        <p className="leading-relaxed">
          <strong>{t('multilingualIntegrityTitle')}:</strong> {t('multilingualIntegrityDesc')}
        </p>
      </div>
    </div>
  );
}
