import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Globe, ExternalLink, Heart } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function Footer() {
  const { supportedLanguages, currentLanguage, setLanguage, t } = useLanguage();

  return (
    <footer className="bg-white border-t border-slate-200 mt-16 text-slate-600">
      {/* Top Disclaimer Banner */}
      <div className="bg-amber-50/80 border-b border-amber-100 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-start sm:items-center gap-3 text-xs text-amber-900">
          <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5 sm:mt-0" />
          <p className="leading-relaxed">
            <strong>{t('publicDisclaimerTitle')}</strong> {t('publicDisclaimerText')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                भ
              </div>
              <span className="font-extrabold text-slate-900 tracking-tight text-base">BharatSeva AI</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('footerDescription')}
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                <span>{t('verifiedPortalsBadge')}</span>
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-xs space-y-2">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              {t('platformNav')}
            </h4>
            <ul className="space-y-1.5">
              <li><Link to="/" className="hover:text-orange-600 transition-colors">{t('home')}</Link></li>
              <li><Link to="/schemes" className="hover:text-orange-600 transition-colors">{t('schemes')}</Link></li>
              <li><Link to="/chat" className="hover:text-orange-600 transition-colors">{t('chat')}</Link></li>
              <li><Link to="/saved" className="hover:text-orange-600 transition-colors">{t('saved')}</Link></li>
              <li><Link to="/language" className="hover:text-orange-600 transition-colors">{t('allLanguageSettings')}</Link></li>
            </ul>
          </div>

          {/* Official Portals */}
          <div className="text-xs space-y-2">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              {t('authoritativePortals')}
            </h4>
            <ul className="space-y-1.5">
              <li>
                <a href="https://www.india.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-orange-600 transition-colors inline-flex items-center gap-1">
                  <span>National Portal of India</span>
                  <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                </a>
              </li>
              <li>
                <a href="https://www.myscheme.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-orange-600 transition-colors inline-flex items-center gap-1">
                  <span>myScheme Portal</span>
                  <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                </a>
              </li>
              <li>
                <a href="https://pmkisan.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-orange-600 transition-colors inline-flex items-center gap-1">
                  <span>PM-KISAN Samman Nidhi</span>
                  <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                </a>
              </li>
              <li>
                <a href="https://beneficiary.nha.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-orange-600 transition-colors inline-flex items-center gap-1">
                  <span>Ayushman Bharat (PM-JAY)</span>
                  <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* Multilingual Selector */}
          <div className="text-xs space-y-2">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              {t('availableLanguages')}
            </h4>
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {supportedLanguages.map((lang) => {
                const isSelected = currentLanguage.code === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`text-left px-2.5 py-1.5 rounded-lg border text-[11px] transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-orange-600 text-white border-orange-600 font-bold'
                        : 'bg-slate-50 hover:bg-orange-50 border-slate-200 text-slate-700 hover:text-orange-700'
                    }`}
                  >
                    <span>{lang.nativeName}</span>
                    <span className={`text-[10px] ${isSelected ? 'text-orange-100' : 'text-slate-400'}`}>
                      {lang.code.toUpperCase()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <p>&copy; {new Date().getFullYear()} {t('footerCopyright')}</p>
          <p className="flex items-center gap-1">
            {t('builtWithPride')}
          </p>
        </div>
      </div>
    </footer>
  );
}
