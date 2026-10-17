import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, X, RefreshCw, SlidersHorizontal, Sparkles } from 'lucide-react';
import { fetchSchemes } from '../api/schemes.api';
import { MOCK_SCHEMES } from '../constants/mockSchemes';
import SchemeCard from '../components/common/SchemeCard';
import EmptyState from '../components/common/EmptyState';
import { SchemeCardSkeleton } from '../components/common/LoadingSkeleton';
import VoiceInputButton from '../components/common/VoiceInputButton';
import { useLanguage } from '../context/LanguageContext';
import {
  ALL_INDIAN_STATES,
  ALL_INDIAN_SECTORS,
  getStateDisplayName,
  getSectorDisplayName,
} from '../constants/indianRegions';

export default function SchemeSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentLanguage, t, tText } = useLanguage();

  const initialQuery = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedSector, setSelectedSector] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedAssessment, setSelectedAssessment] = useState('All');

  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNewlyDiscovered, setIsNewlyDiscovered] = useState(false);

  // Robust client-side filter helper that works even when API is cold-starting or offline
  const filterDataset = (dataset, query, type, sector, state, assessment) => {
    return dataset.filter((scheme) => {
      // 1. Text Search matching across all relevant fields
      if (query && query.trim()) {
        const q = query.trim().toLowerCase();
        const matchesName = scheme.name?.toLowerCase().includes(q);
        const matchesShort = scheme.shortName?.toLowerCase().includes(q);
        const matchesDesc = scheme.description?.toLowerCase().includes(q);
        const matchesAuthority = scheme.authority?.toLowerCase().includes(q);
        const matchesSector = scheme.sector?.toLowerCase().includes(q);
        const matchesState = scheme.state?.toLowerCase().includes(q);
        const matchesBeneficiary = Array.isArray(scheme.targetBeneficiaries) &&
          scheme.targetBeneficiaries.some((b) => b?.toLowerCase().includes(q));
        const matchesTags = Array.isArray(scheme.tags) &&
          scheme.tags.some((t) => t?.toLowerCase().includes(q));

        if (!matchesName && !matchesShort && !matchesDesc && !matchesAuthority && !matchesSector && !matchesState && !matchesBeneficiary && !matchesTags) {
          return false;
        }
      }

      // 2. Type Filter (Central / State)
      if (type !== 'All' && scheme.type !== type) {
        return false;
      }

      // 3. Sector Filter
      if (sector !== 'All' && scheme.sector !== sector) {
        return false;
      }

      // 4. State Filter
      if (state !== 'All') {
        if (state === 'All India') {
          if (scheme.state !== 'All India') return false;
        } else {
          if (scheme.state !== 'All India' && scheme.state !== state) return false;
        }
      }

      // 5. Assessment Category
      if (assessment !== 'All' && scheme.assessmentCategory !== assessment) {
        return false;
      }

      return true;
    });
  };

  // Fetch schemes from API with instant resilient fallback
  const loadSchemes = async () => {
    setLoading(true);
    setIsNewlyDiscovered(false);
    try {
      const params = { limit: 100 };
      if (searchTerm.trim()) params.q = searchTerm.trim();
      if (selectedType !== 'All') params.type = selectedType;
      if (selectedSector !== 'All') params.sector = selectedSector;
      if (selectedState !== 'All') params.state = selectedState;
      if (selectedAssessment !== 'All') params.assessmentCategory = selectedAssessment;

      const response = await fetchSchemes(params);
      if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
        setSchemes(response.data);
        if (response.newlyDiscovered || response.data.some((s) => s.autoDiscovered)) {
          setIsNewlyDiscovered(true);
        }
      } else {
        // Fallback to client dataset with active filters applied
        const clientFiltered = filterDataset(MOCK_SCHEMES, searchTerm, selectedType, selectedSector, selectedState, selectedAssessment);
        setSchemes(clientFiltered);
      }
    } catch {
      // Graceful fallback to client dataset with active filters applied
      const clientFiltered = filterDataset(MOCK_SCHEMES, searchTerm, selectedType, selectedSector, selectedState, selectedAssessment);
      setSchemes(clientFiltered);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadSchemes();
  }, [searchTerm, selectedType, selectedSector, selectedState, selectedAssessment]);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null && q !== searchTerm) {
      setSearchTerm(q);
    }
  }, [searchParams]);

  // Extract all sectors (standard welfare sectors + any custom from database)
  const sectors = useMemo(() => {
    const set = new Set(ALL_INDIAN_SECTORS);
    (schemes.length > 0 ? schemes : MOCK_SCHEMES).forEach((s) => {
      if (s.sector) set.add(s.sector);
    });
    return ['All', ...Array.from(set)];
  }, [schemes]);

  // All 28 Indian States + 8 Union Territories + All India
  const states = useMemo(() => {
    return ['All', ...ALL_INDIAN_STATES];
  }, []);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('All');
    setSelectedSector('All');
    setSelectedState('All');
    setSelectedAssessment('All');
    setSearchParams({});
  };

  const hasActiveFilters =
    searchTerm ||
    selectedType !== 'All' ||
    selectedSector !== 'All' ||
    selectedState !== 'All' ||
    selectedAssessment !== 'All';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('searchPageTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t('searchPageSubtitle')}
        </p>
      </div>

      {/* Search Bar & Voice Input */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 flex items-center bg-white p-2 rounded-2xl border border-slate-200 shadow-xs focus-within:ring-2 focus-within:ring-orange-500 transition-all">
          <Search className="w-5 h-5 text-slate-400 ml-2.5 flex-shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={tText('searchPageInputPlaceholder')}
            className="w-full px-3 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <VoiceInputButton
            onTranscriptReady={(t) => {
              if (!t) return;
              const lower = t.toLowerCase();
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
                navigate(`/chat?q=${encodeURIComponent(t.trim())}`, { state: { query: t.trim() } });
              } else {
                setSearchTerm(t);
              }
            }}
            className="border-0 bg-orange-50 hover:bg-orange-100 ml-1"
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-2xl flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t('resetFilters')}</span>
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <SlidersHorizontal className="w-4 h-4 text-orange-600" />
          <span>{t('filterBy')}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              {t('filterGovType')}
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-700"
            >
              <option value="All">{tText('allGovTypes')}</option>
              <option value="Central">{tText('centralGovSchemes')}</option>
              <option value="State">{tText('stateGovSchemes')}</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              {t('filterStateRegion')}
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-700"
            >
              {states.map((st, idx) => (
                <option key={idx} value={st}>
                  {st === 'All' ? tText('allStates') : getStateDisplayName(st, currentLanguage?.code)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              {t('filterSector')}
            </label>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-700"
            >
              {sectors.map((sec, idx) => (
                <option key={idx} value={sec}>
                  {sec === 'All' ? tText('allSectors') : getSectorDisplayName(sec, currentLanguage?.code)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              {t('filterAssessment')}
            </label>
            <select
              value={selectedAssessment}
              onChange={(e) => setSelectedAssessment(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-700"
            >
              <option value="All">{tText('allCategories')}</option>
              <option value="Appears Eligible">{tText('eligibleBadge')}</option>
              <option value="Possibly Eligible">{tText('possiblyEligibleBadge')}</option>
              <option value="Not Enough Information">{tText('notEnoughInfoBadge')}</option>
              <option value="Appears Ineligible">{tText('ineligibleBadge')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Auto-Discovered Notice Banner */}
      {isNewlyDiscovered && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-fuchsia-50 to-purple-50 border border-purple-200 flex items-center justify-between gap-3 text-purple-900 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0 font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold">{t('autoDiscoveredBadge')}</div>
              <div className="text-[11px] text-purple-700 mt-0.5">{t('autoDiscoveredNotice')}</div>
            </div>
          </div>
        </div>
      )}

      {/* Results Count & Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-slate-600">
            <span>{t('showingSchemes')} </span>
            <strong className="text-slate-900">{schemes.length} </strong>
            <span>{t('welfareSchemesCount')}</span>
          </p>
          <span className="text-[11px] text-slate-400">
            {t('verifiedWithOfficial')}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SchemeCardSkeleton />
            <SchemeCardSkeleton />
            <SchemeCardSkeleton />
          </div>
        ) : schemes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schemes.map((scheme) => (
              <SchemeCard key={scheme.slug || scheme.id} scheme={{ ...scheme, id: scheme.slug || scheme.id }} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={tText('noSchemesFound')}
            description={tText('noSchemesDesc')}
            actionLabel={tText('resetSearchFilters')}
            onAction={clearFilters}
          />
        )}
      </div>
    </div>
  );
}
