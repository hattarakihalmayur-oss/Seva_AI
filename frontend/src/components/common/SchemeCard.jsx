import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, ExternalLink, ArrowRight, ShieldCheck, Sparkles, Cpu } from 'lucide-react';
import EligibilityBadge from './EligibilityBadge';
import DeadlineBadge from './DeadlineBadge';
import ShareButton from './ShareButton';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useSchemeTranslator, SchemeBilingualText } from '../../services/schemeTranslator';
import AgentApplicationModal from '../agent/AgentApplicationModal';

export default function SchemeCard({ scheme }) {
  const { isSchemeSaved, toggleSaveScheme, user } = useAuth();
  const { currentLangCode, isEnglish, t, tText } = useLanguage();

  const trScheme = useSchemeTranslator(scheme, currentLangCode);
  const isSaved = isSchemeSaved(scheme.id || scheme.slug);
  const [agentModalOpen, setAgentModalOpen] = useState(false);

  const handleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert(t('pleaseSignIn'));
      return;
    }
    toggleSaveScheme(scheme.id || scheme.slug);
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
        {/* Top Header */}
        <div className="p-5 pb-3">
          <div className="flex items-start justify-between gap-2 mb-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              {scheme.autoDiscovered && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>{t('autoDiscoveredBadge')}</span>
                </span>
              )}
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                  scheme.type === 'Central'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {scheme.type === 'Central' ? t('centralSchemeTag') : `${scheme.state} ${t('stateSchemeTag', { pure: true })}`}
              </span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                <SchemeBilingualText
                  translated={trScheme.sector}
                  english={trScheme.sectorEn}
                  isEnglish={isEnglish}
                />
              </span>
            </div>

            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <ShareButton
                variant="icon"
                title={`${trScheme.name} — BharatSeva AI`}
                text={`Check your eligibility for "${trScheme.name}" on BharatSeva AI:`}
                url={typeof window !== 'undefined' ? `${window.location.origin}/schemes/${scheme.slug || scheme.id}` : ''}
              />

              <button
                onClick={handleBookmark}
                title={isSaved ? tText('savedScheme') : tText('saveScheme')}
                className={`p-2 rounded-xl transition-colors ${
                  isSaved
                    ? 'bg-orange-50 text-orange-600 border border-orange-200'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-orange-500 text-orange-600' : ''}`} />
              </button>
            </div>
          </div>

          {/* Title */}
          <Link to={`/schemes/${scheme.slug || scheme.id}`} className="block">
            <h3 className="text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2">
              <SchemeBilingualText
                translated={trScheme.name}
                english={trScheme.nameEn}
                isEnglish={isEnglish}
              />
            </h3>
          </Link>
          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
            <SchemeBilingualText
              translated={trScheme.authority}
              english={trScheme.authorityEn}
              isEnglish={isEnglish}
            />
          </p>

          {/* Description snippet */}
          <div className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">
            <SchemeBilingualText
              translated={trScheme.description}
              english={trScheme.descriptionEn}
              isEnglish={isEnglish}
              layout="inline"
            />
          </div>

          {/* Application Deadline & Reminder Badge */}
          <div className="mt-3.5">
            <DeadlineBadge scheme={trScheme} size="sm" />
          </div>
        </div>

        {/* Middle Highlights */}
        <div className="px-5 py-2.5 bg-slate-50/70 border-t border-b border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px] text-slate-600 font-medium">
              {scheme.dataClassification === 'DEMO_VERIFIED' ? t('demoVerifiedLabel') : t('officialRecord')}
            </span>
          </div>

          <EligibilityBadge category={scheme.assessmentCategory} size="sm" />
        </div>

        {/* Footer Actions */}
        <div className="p-4 pt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Link
              to={`/schemes/${scheme.slug || scheme.id}`}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
            >
              <span>{t('viewDetails')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={() => setAgentModalOpen(true)}
              className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              title="Apply to this scheme on my behalf using AI Seva Agent"
            >
              <Cpu className="w-3 h-3 text-emerald-600" />
              <span>Apply with AI Agent</span>
            </button>
          </div>

          {scheme.officialLink && (
            <a
              href={scheme.officialLink}
              target="_blank"
              rel="noopener noreferrer"
              title={tText('openApplicationPortal')}
              className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
            >
              <span>{t('officialPortal')}</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          )}
        </div>
      </div>

      {/* AI Agent Autonomous Application Modal */}
      <AgentApplicationModal
        isOpen={agentModalOpen}
        onClose={() => setAgentModalOpen(false)}
        scheme={scheme}
      />
    </>
  );
}
