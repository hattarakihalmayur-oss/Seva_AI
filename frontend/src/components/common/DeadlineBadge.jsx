import React, { useState } from 'react';
import { Calendar, Bell, Clock, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import DeadlineReminderModal from './DeadlineReminderModal';

export default function DeadlineBadge({
  scheme,
  size = 'md', // 'sm' (for cards) or 'lg' (for detail page)
  className = '',
}) {
  const { t, tText, isEnglish } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);

  if (!scheme) return null;

  const deadline = scheme.applicationDeadline || '31 March 2027 (Open for FY 2026-27)';
  const deadlineDate = scheme.deadlineDate ? new Date(scheme.deadlineDate) : new Date('2027-03-31T23:59:59.000Z');

  const now = new Date();
  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  if (size === 'sm') {
    return (
      <>
        <div
          className={`flex items-center justify-between gap-1.5 py-1.5 px-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-slate-800 ${className}`}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <div className="text-[11px] truncate">
              <span className="font-semibold text-slate-700">{t('lastDateApplying')}: </span>
              <span className="font-bold text-amber-900">{deadline}</span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setModalOpen(true);
            }}
            title={tText('setReminder')}
            className="p-1 rounded-lg text-amber-700 hover:text-amber-900 hover:bg-amber-100 transition-colors flex-shrink-0 flex items-center gap-1 text-[10px] font-bold"
          >
            <Bell className="w-3 h-3" />
            <span>{t('setReminder')}</span>
          </button>
        </div>

        <DeadlineReminderModal
          scheme={scheme}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      </>
    );
  }

  // Size === 'lg' (Scheme detail page prominent banner)
  return (
    <>
      <div
        className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50/60 border border-amber-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${className}`}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 shadow-2xs mt-0.5">
            <Calendar className="w-5 h-5 text-amber-700" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-amber-900 tracking-wide uppercase">
                {t('lastDateApplying')}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                {diffDays > 0 ? `${diffDays} ${tText('daysRemaining')}` : tText('ongoingContinuous')}
              </span>
            </div>

            <p className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">
              {deadline}
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 self-start sm:self-center"
        >
          <Bell className="w-3.5 h-3.5" />
          <span>{t('setReminder')}</span>
        </button>
      </div>

      <DeadlineReminderModal
        scheme={scheme}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
