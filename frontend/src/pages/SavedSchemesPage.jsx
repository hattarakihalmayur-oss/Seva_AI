import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { fetchSavedSchemes } from '../api/savedSchemes.api';
import SchemeCard from '../components/common/SchemeCard';
import EmptyState from '../components/common/EmptyState';
import { SchemeCardSkeleton } from '../components/common/LoadingSkeleton';

export default function SavedSchemesPage() {
  const { user } = useAuth();
  const { t, tText } = useLanguage();
  const [savedSchemes, setSavedSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSaved = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetchSavedSchemes();
      if (res?.data) {
        setSavedSchemes(res.data.map((item) => item.scheme).filter(Boolean));
      }
    } catch {
      setSavedSchemes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSaved();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
          <Bookmark className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">{t('signInToViewSaved')}</h2>
        <p className="text-xs text-slate-500">
          {t('signInSavedDesc')}
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Bookmark className="w-6 h-6 text-orange-600" />
            <span>{t('savedSchemesTitle')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t('savedSchemesSubtitle')}
          </p>
        </div>

        <Link
          to="/schemes"
          className="px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Search className="w-3.5 h-3.5" />
          <span>{t('discoverMore')}</span>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SchemeCardSkeleton />
          <SchemeCardSkeleton />
        </div>
      ) : savedSchemes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedSchemes.map((scheme) => (
            <SchemeCard
              key={scheme.slug || scheme.id}
              scheme={{ ...scheme, id: scheme.slug || scheme.id }}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bookmark}
          title={tText('noSavedYet')}
          description={tText('noSavedDesc')}
          actionLabel={tText('viewAllSchemes')}
          actionTo="/schemes"
        />
      )}
    </div>
  );
}
