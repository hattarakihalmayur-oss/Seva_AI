import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Globe2,
  Bookmark,
  MessageSquare,
  Search,
  User,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Check,
  Share2,
  FileText,
  Cpu,
} from 'lucide-react';
import ShareButton from './ShareButton';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { currentLanguage, supportedLanguages, setLanguage, t, isEnglish } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const savedCount = user?.savedSchemes?.length || 0;

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 via-amber-500 to-emerald-600 flex items-center justify-center text-white shadow-md font-bold text-xl group-hover:scale-105 transition-transform">
              भ
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900 group-hover:text-orange-600 transition-colors flex items-center gap-1.5">
                BharatSeva AI
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 bg-orange-100 text-orange-700 rounded-sm">
                  AI Seva
                </span>
              </span>
              <p className="text-[10px] text-slate-500 -mt-0.5">
                {t('subBrand')}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                isActive('/') ? 'bg-orange-50 text-orange-600 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {t('home')}
            </Link>

            <Link
              to="/schemes"
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                isActive('/schemes') ? 'bg-orange-50 text-orange-600 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Search className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{t('schemes')}</span>
            </Link>

            <Link
              to="/chat"
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                isActive('/chat')
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-xs'
                  : 'text-orange-600 bg-orange-50 hover:bg-orange-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{t('chat')}</span>
            </Link>

            <Link
              to="/saved"
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 relative ${
                isActive('/saved') ? 'bg-orange-50 text-orange-600 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{t('saved')}</span>
              {savedCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-orange-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {savedCount}
                </span>
              )}
            </Link>

            <Link
              to="/applications"
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                isActive('/applications') ? 'bg-orange-50 text-orange-600 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{t('applications') || 'Applications'}</span>
            </Link>
          </div>

          {/* Right Hand Actions: Share, Language & Auth */}
          <div className="hidden md:flex items-center space-x-2.5">
            {/* Share Portal Button */}
            <ShareButton
              variant="subtle"
              label={t('share') || 'Share'}
              title="BharatSeva AI — Government Schemes & Citizen Services Portal"
              text="Explore, check eligibility, and apply for 1,000+ government welfare schemes with BharatSeva AI."
            />

            {/* Language Selector Dropdown with clear selected language indicator */}
            <div className="relative">
              <button
                type="button"
                id="language-selector-button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-orange-200 bg-orange-50/50 hover:bg-orange-100/70 text-xs font-medium text-slate-800 transition-all shadow-2xs"
                title={currentLanguage.name}
              >
                <Globe2 className="w-4 h-4 text-orange-600 flex-shrink-0" />
                <div className="flex items-baseline gap-1">
                  <span className="font-bold text-slate-900">{currentLanguage.nativeName}</span>
                  {!isEnglish && (
                    <span className="text-[11px] text-slate-500 font-normal">
                      ({currentLanguage.name})
                    </span>
                  )}
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {langDropdownOpen && (
                <div
                  onMouseLeave={() => setLangDropdownOpen(false)}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5 mb-1 flex items-center justify-between">
                    <span>{t('selectLanguage')}</span>
                    <span className="text-orange-600 font-semibold text-[10px]">7 Languages</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto py-0.5">
                    {supportedLanguages.map((lang) => {
                      const isSelected = currentLanguage.code === lang.code;
                      return (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code);
                            setLangDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                            isSelected
                              ? 'font-bold text-orange-700 bg-orange-50/80 border-r-2 border-orange-600'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-900">{lang.nativeName}</span>
                            <span className="text-[11px] text-slate-500 font-normal">{lang.name}</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-orange-600 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                  <div className="pt-2 mt-1 border-t border-slate-100 px-3">
                    <Link
                      to="/language"
                      onClick={() => setLangDropdownOpen(false)}
                      className="text-[11px] font-semibold text-orange-600 hover:text-orange-700 flex items-center justify-between py-1"
                    >
                      <span>{t('allLanguageSettings')}</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Auth Buttons / Profile Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-6 h-6 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 max-w-[100px] truncate">
                    {user?.name || 'Citizen'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div
                    onMouseLeave={() => setUserDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-orange-50 flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t('dashboard')}</span>
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-orange-50 flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t('profile')}</span>
                    </Link>

                    <div className="pt-1 mt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5 text-red-500" />
                        <span>{t('logout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-xs transition-colors"
                >
                  {t('register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger, Share button & Quick language switcher */}
          <div className="flex md:hidden items-center gap-1.5">
            <ShareButton
              variant="icon"
              className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-700"
              title="BharatSeva AI — Government Schemes & Citizen Services Portal"
              text="Explore, check eligibility, and apply for 1,000+ government welfare schemes with BharatSeva AI."
            />

            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-50 border border-orange-200 text-xs font-semibold text-orange-700"
              title="Change Language"
            >
              <Globe2 className="w-3.5 h-3.5 text-orange-600" />
              <span>{currentLanguage.nativeName}</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Language Selector Dropdown */}
        {langDropdownOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 shadow-lg">
            <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
              <span>{t('selectLanguage')}</span>
              <button onClick={() => setLangDropdownOpen(false)} className="text-slate-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {supportedLanguages.map((lang) => {
                const isSelected = currentLanguage.code === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setLangDropdownOpen(false);
                    }}
                    className={`p-2 rounded-xl text-left text-xs border flex items-center justify-between ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50 font-bold text-orange-700'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{lang.nativeName}</div>
                      <div className="text-[10px] text-slate-500">{lang.name}</div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-orange-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top duration-200">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {t('home')}
          </Link>

          <Link
            to="/schemes"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {t('schemes')}
          </Link>

          <Link
            to="/chat"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold bg-orange-50 text-orange-700"
          >
            {t('chat')}
          </Link>

          <Link
            to="/saved"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {t('saved')} ({savedCount})
          </Link>


          {/* Mobile Drawer Share Button */}
          <div className="pt-1 pb-1">
            <ShareButton
              label="Share BharatSeva AI"
              variant="subtle"
              className="w-full justify-center py-2.5 bg-orange-50/70 border-orange-200 text-orange-700"
              title="BharatSeva AI — Government Schemes & Citizen Services Portal"
              text="Explore, check eligibility, and apply for 1,000+ government welfare schemes with BharatSeva AI."
            />
          </div>

          {/* Mobile Language Selector in Drawer */}
          <div className="pt-2 pb-1 border-t border-slate-100">
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              {t('selectLanguage')}
            </p>
            <div className="grid grid-cols-2 gap-1.5 px-1">
              {supportedLanguages.map((lang) => {
                const isSelected = currentLanguage.code === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-left text-xs transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-orange-600 text-white font-bold'
                        : 'bg-slate-50 text-slate-700 hover:bg-orange-50'
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

          <div className="pt-3 border-t border-slate-100 space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700"
                >
                  {t('dashboard')}
                </Link>
                <Link
                  to="/applications"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700"
                >
                  {t('applications') || 'My Applications & DigiLocker'}
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700"
                >
                  {t('profile')}
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-red-600"
                >
                  {t('logout')}
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-semibold border border-slate-200 rounded-xl"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-semibold bg-orange-600 text-white rounded-xl"
                >
                  {t('register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
