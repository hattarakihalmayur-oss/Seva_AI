import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Bookmark,
  ExternalLink,
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { fetchSchemeDetails } from '../api/schemes.api';
import { evaluateSchemeEligibility } from '../api/ai.api';
import { MOCK_SCHEMES } from '../constants/mockSchemes';
import EligibilityBadge from '../components/common/EligibilityBadge';
import { DetailSkeleton } from '../components/common/LoadingSkeleton';
import DeadlineBadge from '../components/common/DeadlineBadge';
import ShareButton from '../components/common/ShareButton';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useSchemeTranslator, SchemeBilingualText } from '../services/schemeTranslator';
import AgentApplicationModal from '../components/agent/AgentApplicationModal';

export default function SchemeDetailPage() {
  const { id } = useParams();
  const { isSchemeSaved, toggleSaveScheme, user } = useAuth();
  const { t, currentLangCode, isEnglish } = useLanguage();

  const [rawScheme, setRawScheme] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agentModalOpen, setAgentModalOpen] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchSchemeDetails(id)
      .then((res) => {
        if (isMounted) {
          if (res?.data) {
            setRawScheme(res.data);
            evaluateSchemeEligibility(res.data.slug, user || {})
              .then((evalRes) => {
                if (isMounted && evalRes?.data) {
                  setAssessment(evalRes.data);
                }
              })
              .catch(() => {});
          } else {
            const fallback = MOCK_SCHEMES.find((s) => s.id === id || s.slug === id);
            setRawScheme(fallback);
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          const fallback = MOCK_SCHEMES.find((s) => s.id === id || s.slug === id);
          setRawScheme(fallback);
        }
      })

      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, user]);

  // Direct continue if returned from login
  useEffect(() => {
    if (user && (location.state?.autoApply || sessionStorage.getItem('bharatseva_pending_apply_scheme'))) {
      setAgentModalOpen(true);
      sessionStorage.removeItem('bharatseva_pending_apply_scheme');
    }
  }, [user, location.state]);

  const scheme = useSchemeTranslator(rawScheme, currentLangCode);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <DetailSkeleton />
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900">{t('schemeNotFound')}</h2>
        <p className="text-xs text-slate-500 mt-2">
          {t('schemeNotFoundDesc')}
        </p>
        <Link
          to="/schemes"
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('backToDiscovery')}</span>
        </Link>
      </div>
    );
  }

  const schemeIdentifier = scheme.slug || scheme.id;
  const isSaved = isSchemeSaved(schemeIdentifier);

  const handleSave = () => {
    if (!user) {
      alert(t('pleaseSignIn'));
      return;
    }
    toggleSaveScheme(schemeIdentifier);
  };

  const currentCategory = assessment?.category || scheme.assessmentCategory;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Button & Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/schemes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('backToSchemes')}</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Share Scheme Button */}
          <ShareButton
            variant="subtle"
            label={t('share') || 'Share'}
            title={`${scheme.name} — BharatSeva AI`}
            text={`Check your eligibility and full details for "${scheme.name}" on BharatSeva AI:`}
          />

          <button
            onClick={handleSave}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isSaved
                ? 'bg-orange-50 text-orange-700 border-orange-200'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-orange-600 text-orange-600' : ''}`} />
            <span>{isSaved ? t('savedToProfile') : t('saveScheme')}</span>
          </button>

          {scheme.officialLink && (
            <a
              href={scheme.officialLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <span>{t('applyOnOfficialPortal')}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${
              scheme.type === 'Central'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {scheme.type === 'Central' ? t('centralSchemeTag') : `${scheme.state} ${t('stateSchemeTag', { pure: true })}`}
          </span>
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
            <SchemeBilingualText
              translated={scheme.sector}
              english={scheme.sectorEn}
              isEnglish={isEnglish}
            />
          </span>
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
            {t('stateTerritory')}: {scheme.state}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
          <SchemeBilingualText
            translated={scheme.name}
            english={scheme.nameEn}
            isEnglish={isEnglish}
            layout="inline"
          />
        </h1>

        <div className="text-xs sm:text-sm text-slate-600 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <SchemeBilingualText
            translated={scheme.authority}
            english={scheme.authorityEn}
            isEnglish={isEnglish}
          />
        </div>

        {/* Provenance & Eligibility Bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-500">{t('eligibilityStatusLabel')}</span>
            <EligibilityBadge category={currentCategory} size="lg" />
          </div>

          <div className="flex items-center gap-4 text-slate-500 text-[11px]">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{t('verifiedDateLabel')} {scheme.lastVerifiedDate}</span>
            </span>
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{scheme.dataClassification === 'DEMO_VERIFIED' ? t('demoVerifiedLabel') : t('officialDataLabel')}</span>
            </span>
          </div>
        </div>

        {/* Application Deadline & Instant Reminder Banner */}
        <div className="pt-2">
          <DeadlineBadge scheme={scheme} size="lg" />
        </div>

        {scheme.autoDiscovered && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-fuchsia-50 to-purple-50 border border-purple-200 text-xs text-purple-900 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0 font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold flex items-center gap-1.5">
                <span>{t('autoDiscoveredBadge')}</span>
              </div>
              <div className="text-[11px] text-purple-700 mt-0.5">
                {t('autoDiscoveredNotice')} &middot; {scheme.discoveredSource || 'myscheme.gov.in / Official Portal'}
              </div>
            </div>
          </div>
        )}

        {assessment?.summary && (
          <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-200">
            <strong>{t('eligibilitySummaryHeading')}</strong> {assessment.summary}
          </div>
        )}
      </div>

      {/* Overview & Key Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-orange-600" />
            <span>{t('overview')}</span>
          </h3>

          <SchemeBilingualText
            translated={scheme.description}
            english={scheme.descriptionEn}
            isEnglish={isEnglish}
            layout="block"
          />

          <div className="pt-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              {t('targetBeneficiaries')}
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {scheme.bilingualBeneficiaries?.map((b, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-800 text-xs font-medium border border-orange-100"
                >
                  <SchemeBilingualText
                    translated={b.translated}
                    english={b.english}
                    isEnglish={isEnglish}
                    layout="inline"
                  />
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>{t('keyBenefits')}</span>
          </h3>
          <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
            {scheme.bilingualBenefits?.map((benefit, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <SchemeBilingualText
                    translated={benefit.translated}
                    english={benefit.english}
                    isEnglish={isEnglish}
                    layout="block"
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Structured Eligibility Criteria with Evaluated State */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>{t('eligibilityCriteria')}</span>
          </h3>
        </div>

        <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
          {scheme.bilingualCriteria?.map((crit, idx) => (
            <div key={idx} className="p-4 flex items-start gap-3 bg-slate-50/50">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div className="flex-1">
                <SchemeBilingualText
                  translated={crit.translatedLabel}
                  english={crit.englishLabel}
                  isEnglish={isEnglish}
                  layout="block"
                />
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mt-1">
                  {crit.mandatory ? t('mandatoryRequirement') : t('conditionalRequirement')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Required Documents Checklist */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-600" />
          <span>{t('requiredDocuments')}</span>
        </h3>
        <p className="text-xs text-slate-500">
          {t('trustDocsSub')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {scheme.bilingualDocuments?.map((doc, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/60 flex items-start gap-3 text-xs text-slate-800 font-medium"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 mt-1.5"></span>
              <div className="flex-1">
                <SchemeBilingualText
                  translated={doc.translated}
                  english={doc.english}
                  isEnglish={isEnglish}
                  layout="inline"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step-by-Step Application Guide */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-orange-600" />
          <span>{t('stepByStepGuide')}</span>
        </h3>

        <div className="space-y-4">
          {scheme.bilingualSteps?.map((step, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <div className="w-7 h-7 rounded-xl bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-2xs">
                {idx + 1}
              </div>
              <div className="flex-1 pt-0.5">
                <SchemeBilingualText
                  translated={step.translated}
                  english={step.english}
                  isEnglish={isEnglish}
                  layout="block"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-slate-100 space-y-4">
          {/* AI Seva Agent Auto-Apply Highlight Box */}
          <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-emerald-500/10 border-2 border-orange-500/30 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-600 text-white flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI Seva Agent Active
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  100% Paperless with DigiLocker
                </span>
              </div>
              <h4 className="text-base font-extrabold text-slate-900">
                Apply Automatically with AI Agent
              </h4>
              <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                Our autonomous agent will fetch your verified Aadhaar, Bank DBT, and Land Records from DigiLocker, auto-populate the application, and submit on your behalf.
              </p>
            </div>

            <button
              onClick={() => {
                if (!user) {
                  sessionStorage.setItem('bharatseva_pending_apply_scheme', JSON.stringify(scheme));
                  navigate('/login', {
                    state: {
                      from: location,
                      applyScheme: scheme,
                    },
                  });
                  return;
                }
                setAgentModalOpen(true);
              }}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-transform active:scale-[0.99] flex-shrink-0 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Apply with DigiLocker AI Agent</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div>
              <span className="text-xs font-semibold text-slate-500 block">{t('applicationModeLabel')}</span>
              <span className="text-sm font-bold text-slate-900">{scheme.applicationMode}</span>
            </div>

            {scheme.officialLink && (
              <a
                href={scheme.officialLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center justify-center gap-2 transition-colors"
              >
                <span>{t('openApplicationPortal')} (External)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Regulatory Disclaimer */}
      <div className="p-5 rounded-2xl bg-slate-100 text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-700">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>{t('importantRegulatoryDisclaimer')}</span>
        </div>
        <p className="leading-relaxed text-[11px]">
          {t('regulatoryDisclaimerText')}
        </p>
      </div>

      {/* AI Agent Autonomous Application Modal */}
      <AgentApplicationModal
        isOpen={agentModalOpen}
        onClose={() => setAgentModalOpen(false)}
        scheme={rawScheme || scheme}
        onApplicationSubmitted={() => setAlreadyApplied(true)}
      />
    </div>
  );
}
