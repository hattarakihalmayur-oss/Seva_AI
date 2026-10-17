import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Bookmark,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { fetchSchemes } from '../api/schemes.api';
import { fetchSavedSchemes } from '../api/savedSchemes.api';
import { fetchUserApplications } from '../api/application.api';
import { fetchDigiLockerStatus } from '../api/digilocker.api';
import SchemeCard from '../components/common/SchemeCard';
import DigiLockerModal from '../components/digilocker/DigiLockerModal';
import { ShieldCheck, FileText } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { currentLanguage, t } = useLanguage();
  const [schemes, setSchemes] = useState([]);
  const [savedCount, setSavedCount] = useState(0);
  const [appsCount, setAppsCount] = useState(0);
  const [digiLockerLinked, setDigiLockerLinked] = useState(false);
  const [digiLockerDocCount, setDigiLockerDocCount] = useState(0);
  const [digiLockerModalOpen, setDigiLockerModalOpen] = useState(false);
  const [digiLockerNotice, setDigiLockerNotice] = useState(null);

  // Check for DigiLocker OAuth 2.0 return URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dlStatus = params.get('digilocker');
    const msg = params.get('message');

    if (dlStatus === 'success') {
      setDigiLockerNotice({
        type: 'success',
        text: 'DigiLocker vault successfully connected via OAuth 2.0! Your verified government documents are active.',
      });
      setDigiLockerLinked(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (dlStatus === 'denied') {
      setDigiLockerNotice({
        type: 'warning',
        text: msg ? decodeURIComponent(msg) : 'DigiLocker authorization was cancelled or denied by citizen.',
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (dlStatus === 'error') {
      setDigiLockerNotice({
        type: 'error',
        text: msg ? decodeURIComponent(msg) : 'DigiLocker authorization failed. Please try connecting again.',
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    fetchSchemes({ limit: 6 })
      .then((res) => {
        if (res?.data) {
          setSchemes(res.data);
        }
      })
      .catch(() => {});

    if (user) {
      fetchSavedSchemes()
        .then((res) => {
          if (res?.data) {
            setSavedCount(res.data.length);
          }
        })
        .catch(() => {});

      fetchUserApplications()
        .then((res) => {
          if (res?.data) {
            setAppsCount(res.data.length);
          }
        })
        .catch(() => {});

      fetchDigiLockerStatus()
        .then((res) => {
          if (res?.linked) {
            setDigiLockerLinked(true);
            setDigiLockerDocCount(res.account?.selectedDocuments?.length || res.account?.documentsCount || 0);
          } else {
            setDigiLockerLinked(false);
            setDigiLockerDocCount(0);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
          <LayoutDashboard className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">{t('signInDashboard')}</h2>
        <p className="text-xs text-slate-500">
          {t('signInDashboardDesc')}
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            to="/login"
            className="px-5 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold"
          >
            {t('login')}
          </Link>
          <Link
            to="/register"
            className="px-5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold"
          >
            {t('register')}
          </Link>
        </div>
      </div>
    );
  }

  // Filter personalized schemes matching user state or occupation
  const recommendedSchemes = schemes.filter((scheme) => {
    const matchesState = scheme.state === 'All India' || scheme.state === user.state;
    const matchesOccupation =
      !user.occupation ||
      scheme.occupations?.some((occ) => user.occupation.toLowerCase().includes(occ.toLowerCase()));
    return matchesState && (matchesOccupation || scheme.assessmentCategory === 'Appears Eligible');
  }).slice(0, 3);

  const displayRecommendations = recommendedSchemes.length > 0 ? recommendedSchemes : schemes.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-emerald-700 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
              {t('citizenPortalBadge')}
            </span>
            <span className="text-xs text-orange-100">
              {t('liveDatabaseConnected')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('namasteUser')}, {user.name}!
          </h1>
          <p className="text-xs sm:text-sm text-orange-100">
            {user.occupation} &middot; {user.state} &middot; {t('preferredLangLabel')}: {currentLanguage.nativeName} ({currentLanguage.name})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/profile"
            className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-xs transition-colors flex items-center gap-1.5"
          >
            <User className="w-3.5 h-3.5" />
            <span>{t('editProfileDetails')}</span>
          </Link>
          <Link
            to="/chat"
            className="px-4 py-2 rounded-xl bg-white text-orange-700 text-xs font-bold shadow-xs hover:bg-orange-50 transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('aiChatConsult')}</span>
          </Link>
        </div>
      </div>

      {/* DigiLocker OAuth Callback Notice */}
      {digiLockerNotice && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-in fade-in shadow-xs ${
            digiLockerNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : digiLockerNotice.type === 'warning'
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-red-50 border-red-300 text-red-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {digiLockerNotice.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0" />
            )}
            <span className="font-semibold">{digiLockerNotice.text}</span>
          </div>
          <button
            onClick={() => setDigiLockerNotice(null)}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Applications Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              My Applications
            </span>
            <div className="text-2xl font-black text-orange-600 mt-1">{appsCount}</div>
            <Link to="/applications" className="text-xs font-semibold text-orange-600 hover:underline mt-1 inline-block">
              Track Status &rarr;
            </Link>
          </div>
          <div className="p-3 rounded-2xl bg-orange-50 text-orange-600">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* DigiLocker Vault Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                DigiLocker Vault
              </span>
              <span className="text-[9px] font-bold bg-blue-100 text-[#003366] px-1.5 py-0.2 rounded font-sans">
                Govt of India
              </span>
            </div>
            <div className={`text-base font-black mt-1 ${digiLockerLinked ? 'text-emerald-600' : 'text-slate-500'}`}>
              {digiLockerLinked ? `Verified (${digiLockerDocCount} Docs)` : 'Not Connected'}
            </div>
            <button
              onClick={() => setDigiLockerModalOpen(true)}
              className="text-xs font-semibold text-[#003366] hover:underline mt-1 inline-block text-left cursor-pointer font-bold"
            >
              {digiLockerLinked ? 'Manage Documents &rarr;' : 'Connect DigiLocker &rarr;'}
            </button>
          </div>
          <div className={`p-3 rounded-2xl ${digiLockerLinked ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-[#003366]'}`}>
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Saved Schemes Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {t('mySavedSchemesTitle')}
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{savedCount}</div>
            <Link to="/saved" className="text-xs font-semibold text-orange-600 hover:underline mt-1 inline-block">
              {t('viewDetails')} &rarr;
            </Link>
          </div>
          <div className="p-3 rounded-2xl bg-orange-50 text-orange-600">
            <Bookmark className="w-6 h-6" />
          </div>
        </div>

        {/* Eligible Schemes Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {t('eligibleBadge')}
            </span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{displayRecommendations.length}</div>
            <span className="text-xs text-slate-500 mt-1 inline-block">
              {t('activeProfile')}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* DigiLocker Official Government Document Wallet Banner */}
      <div className="bg-gradient-to-r from-[#002855] via-[#003366] to-[#0a4d8c] text-white p-5 sm:p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white text-[#003366] font-black text-xl flex items-center justify-center shadow-md flex-shrink-0 border-2 border-amber-400">
            <span>DL</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold tracking-tight">DigiLocker Official Document Wallet</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-900">
                Digital India
              </span>
            </div>
            <p className="text-xs text-blue-100/90 mt-1 max-w-xl leading-relaxed">
              Connect your verified DigiLocker account to securely access and authorize government certificates
              (UIDAI Aadhaar, Land Records, Income &amp; Caste Certificates) for paperless welfare scheme matching.
            </p>
          </div>
        </div>

        <button
          onClick={() => setDigiLockerModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-white hover:bg-blue-50 text-[#003366] font-bold text-xs shadow-md transition-all self-start md:self-auto cursor-pointer flex items-center gap-2 whitespace-nowrap"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{digiLockerLinked ? 'Manage Verified Vault' : 'Connect DigiLocker'}</span>
        </button>
      </div>

      {/* Recommended Schemes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {t('recommendedSchemesTitle')}
            </h2>
            <p className="text-xs text-slate-500">
              {t('recommendedSchemesSub')}
            </p>
          </div>
          <Link
            to="/schemes"
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            <span>{t('viewAllSchemes')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayRecommendations.map((scheme) => (
            <SchemeCard
              key={scheme.slug || scheme.id}
              scheme={{ ...scheme, id: scheme.slug || scheme.id }}
            />
          ))}
        </div>
      </div>

      <DigiLockerModal
        isOpen={digiLockerModalOpen}
        onClose={() => setDigiLockerModalOpen(false)}
        onLinkedSuccess={() => setDigiLockerLinked(true)}
      />
    </div>
  );
}
