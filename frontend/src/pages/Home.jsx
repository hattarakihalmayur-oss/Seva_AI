import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Languages,
  FileCheck2,
  Compass,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { fetchSchemes } from '../api/schemes.api';
import { MOCK_SCHEMES } from '../constants/mockSchemes';
import SchemeCard from '../components/common/SchemeCard';
import VoiceInputButton from '../components/common/VoiceInputButton';

export default function Home() {
  const { currentLanguage, t, tText } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredSchemes, setFeaturedSchemes] = useState(MOCK_SCHEMES.slice(0, 3));

  useEffect(() => {
    fetchSchemes({ limit: 3 })
      .then((res) => {
        if (res?.data && res.data.length > 0) {
          setFeaturedSchemes(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/schemes?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/schemes');
    }
  };

  const handleVoiceTranscript = (transcript) => {
    if (!transcript) return;
    setSearchQuery(transcript);
    const lower = transcript.toLowerCase();
    const applyKeywords = [
      'apply', 'behalf', 'form', 'submit', 'agent', 'register', 'scholarship',
      'ಅರ್ಜಿ', 'ಅಪ್ಲೈ', 'ದಾಖಲಿಸಿ', 'ಸಲ್ಲಿಸಿ', 'ನೋಂದಣಿ',
      'आवेदन', 'अप्लाई', 'फॉर्म', 'जमा', 'दर्ज', 'पंजीकरण',
      'விண்ணப்பி', 'பதிவு', 'படிவம்',
      'దరఖాస్తు', 'నమోదు', 'సమర్పించు',
      'अर्ज', 'नोंदणी',
      'আবেদন', 'নিবন্ধন',
    ];
    const isApply = applyKeywords.some((kw) => lower.includes(kw));
    if (isApply) {
      navigate(`/chat?q=${encodeURIComponent(transcript.trim())}`, { state: { query: transcript.trim() } });
    } else {
      navigate(`/schemes?q=${encodeURIComponent(transcript.trim())}`);
    }
  };

  const categories = [
    { key: 'catFarmers', query: 'Farmer' },
    { key: 'catHealthcare', query: 'Healthcare' },
    { key: 'catWomen', query: 'Women' },
    { key: 'catHousing', query: 'Housing' },
    { key: 'catVendors', query: 'Vendor' },
    { key: 'catStudents', query: 'Student' },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/70 via-white to-slate-50 pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-100">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-semibold border border-orange-200">
            <Sparkles className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
            <span>{t('heroBadge')}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {currentLanguage.greeting}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            {currentLanguage.subtitle}
          </p>

          {/* Search Bar with Integrated Voice Input */}
          <div className="max-w-2xl mx-auto mt-6">
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center bg-white p-2 rounded-2xl shadow-lg border border-slate-200 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-transparent transition-all"
            >
              <Search className="w-5 h-5 text-slate-400 ml-3 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={tText('searchPlaceholder')}
                className="w-full px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
              />

              <div className="flex items-center gap-2 pr-1">
                <VoiceInputButton
                  onTranscriptReady={handleVoiceTranscript}
                  className="border-0 bg-orange-50 hover:bg-orange-100"
                />

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <span>{t('searchButton')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs text-slate-400 font-medium">{t('quickCategories')}</span>
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => navigate(`/schemes?q=${encodeURIComponent(cat.query)}`)}
                className="px-3 py-1 rounded-full bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-200 text-xs text-slate-600 hover:text-orange-700 transition-colors shadow-2xs"
              >
                {t(cat.key)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Provenance Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-orange-50 text-orange-600">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-extrabold text-slate-900">{t('trustLanguages')}</div>
              <div className="text-xs text-slate-500">{t('trustLanguagesSub')}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-extrabold text-slate-900">{t('trustVerified')}</div>
              <div className="text-xs text-slate-500">{t('trustVerifiedSub')}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-extrabold text-slate-900">{t('trustDocs')}</div>
              <div className="text-xs text-slate-500">{t('trustDocsSub')}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-extrabold text-slate-900">{t('trustEngine')}</div>
              <div className="text-xs text-slate-500">{t('trustEngineSub')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Schemes Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{t('featuredTitle')}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{t('featuredSubtitle')}</p>
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
          {featuredSchemes.map((scheme) => (
            <SchemeCard
              key={scheme.slug || scheme.id}
              scheme={{ ...scheme, id: scheme.slug || scheme.id }}
            />
          ))}
        </div>
      </section>

      {/* How BharatSeva AI Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
              {t('howItWorksBadge')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-white">
              {t('howItWorksTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2">
              {t('howItWorksSubtitle')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
              <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl">
                <span className="text-2xl font-black text-orange-500">01</span>
                <h4 className="text-sm font-bold mt-2">{t('step1Title')}</h4>
                <p className="text-xs text-slate-400 mt-1">
                  {t('step1Desc')}
                </p>
              </div>

              <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl">
                <span className="text-2xl font-black text-amber-500">02</span>
                <h4 className="text-sm font-bold mt-2">{t('step2Title')}</h4>
                <p className="text-xs text-slate-400 mt-1">
                  {t('step2Desc')}
                </p>
              </div>

              <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl">
                <span className="text-2xl font-black text-emerald-500">03</span>
                <h4 className="text-sm font-bold mt-2">{t('step3Title')}</h4>
                <p className="text-xs text-slate-400 mt-1">
                  {t('step3Desc')}
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/chat"
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md transition-colors inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t('tryAiAssistant')}</span>
              </Link>
              <Link
                to="/schemes"
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
              >
                {t('browseAllSchemes')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
