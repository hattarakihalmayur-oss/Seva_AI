import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Bell,
  CheckCircle2,
  ExternalLink,
  Download,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function DeadlineReminderModal({ scheme, isOpen, onClose }) {
  const { t, tText, isEnglish } = useLanguage();
  const [reminderSaved, setReminderSaved] = useState(false);
  const [notifStatus, setNotifStatus] = useState('default'); // 'default', 'granted', 'denied'

  const schemeId = scheme?.slug || scheme?.id || 'scheme';
  const deadlineText = scheme?.applicationDeadline || '31 March 2027 (Open for FY 2026-27)';
  const deadlineDate = scheme?.deadlineDate ? new Date(scheme.deadlineDate) : new Date('2027-03-31T23:59:59.000Z');

  // Check if reminder is already saved in localStorage
  useEffect(() => {
    if (!isOpen || !scheme) return;
    try {
      const stored = JSON.parse(localStorage.getItem('bharatseva_deadline_reminders') || '{}');
      if (stored[schemeId]) {
        setReminderSaved(true);
      }
    } catch {}

    if ('Notification' in window) {
      setNotifStatus(Notification.permission);
    }
  }, [isOpen, schemeId]);

  if (!isOpen || !scheme) return null;

  // Calculate days remaining
  const now = new Date();
  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const handleToggleReminder = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('bharatseva_deadline_reminders') || '{}');
      if (reminderSaved) {
        delete stored[schemeId];
        localStorage.setItem('bharatseva_deadline_reminders', JSON.stringify(stored));
        setReminderSaved(false);
      } else {
        stored[schemeId] = {
          name: scheme.name,
          deadline: deadlineText,
          deadlineDate: deadlineDate.toISOString(),
          officialLink: scheme.officialLink,
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem('bharatseva_deadline_reminders', JSON.stringify(stored));
        setReminderSaved(true);
      }
    } catch {}
  };

  // Google Calendar Link generator
  const handleAddToGoogleCalendar = () => {
    const title = `Deadline: Apply for ${scheme.name}`;
    const details = `BharatSeva Welfare Reminder:\n\nScheme: ${scheme.name}\nAuthority: ${scheme.authority}\nDeadline: ${deadlineText}\nOfficial Application Portal: ${scheme.officialLink || 'https://www.myscheme.gov.in'}\n\nMake sure to submit required documents before this cutoff.`;
    
    // Format YYYYMMDDTHHmmssZ
    const startDate = deadlineDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = new Date(deadlineDate.getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(scheme.officialLink || 'Online Portal')}`;
    
    window.open(gCalUrl, '_blank', 'noopener,noreferrer');
    handleToggleReminder();
  };

  // iCal (.ics) file generator & downloader
  const handleDownloadIcs = () => {
    const formatDate = (date) =>
      date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//BharatSeva AI//Welfare Application Reminder//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:bharatseva-${schemeId}-${Date.now()}@bharatseva.gov.in`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(deadlineDate)}`,
      `DTEND:${formatDate(new Date(deadlineDate.getTime() + 3600000))}`,
      `SUMMARY:Apply for ${scheme.name} (BharatSeva)`,
      `DESCRIPTION:Application deadline for ${scheme.name}. Official portal: ${scheme.officialLink || 'myscheme.gov.in'}`,
      `URL:${scheme.officialLink || 'https://www.myscheme.gov.in'}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-P3D',
      'ACTION:DISPLAY',
      `DESCRIPTION:Reminder: 3 days remaining to apply for ${scheme.name}`,
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${schemeId}-application-deadline.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    handleToggleReminder();
  };

  // Browser Notification Request
  const handleRequestBrowserNotification = async () => {
    if (!('Notification' in window)) {
      alert('Your browser does not support desktop notifications.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotifStatus(permission);

      if (permission === 'granted') {
        new Notification(`BharatSeva: Reminder Set!`, {
          body: `You will receive alerts before the deadline for ${scheme.name}.`,
          icon: '/favicon.ico',
        });
        handleToggleReminder();
      }
    } catch (e) {
      console.warn('Notification permission error', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0 shadow-xs">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-snug">
              {t('calendarReminderModalTitle')}
            </h2>
            <p className="text-xs text-slate-500 mt-1 line-clamp-1 font-medium">
              {scheme.name}
            </p>
          </div>
        </div>

        {/* Highlighted Deadline Box */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-700" />
              <span>{t('lastDateApplying')}</span>
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900 border border-amber-300">
              {diffDays > 0 ? `${diffDays} ${tText('daysRemaining')}` : tText('ongoingContinuous')}
            </span>
          </div>
          <p className="text-base font-extrabold text-slate-900">
            {deadlineText}
          </p>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            {t('deadlineNotice')}
          </p>
        </div>

        {/* One-Click Action Options */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            {t('quickActions')}
          </h3>

          {/* 1. Google Calendar Button */}
          <button
            onClick={handleAddToGoogleCalendar}
            className="w-full p-3.5 rounded-2xl bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-300 transition-all flex items-center justify-between group shadow-2xs"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                G
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-orange-700">
                  {t('addToGoogleCalendar')}
                </div>
                <div className="text-[11px] text-slate-500">
                  Sync directly with Google Calendar & phone alerts
                </div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-orange-600 transition-colors" />
          </button>

          {/* 2. Download iCal File (.ics) */}
          <button
            onClick={handleDownloadIcs}
            className="w-full p-3.5 rounded-2xl bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-300 transition-all flex items-center justify-between group shadow-2xs"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-orange-700">
                  {t('downloadCalendarEvent')}
                </div>
                <div className="text-[11px] text-slate-500">
                  Works with Outlook, Apple Calendar, and Android
                </div>
              </div>
            </div>
            <Calendar className="w-4 h-4 text-slate-400 group-hover:text-orange-600 transition-colors" />
          </button>

          {/* 3. Browser Push Notification Alert */}
          <button
            onClick={handleRequestBrowserNotification}
            className="w-full p-3.5 rounded-2xl bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-300 transition-all flex items-center justify-between group shadow-2xs"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-orange-700">
                  {t('browserNotificationAlert')}
                </div>
                <div className="text-[11px] text-slate-500">
                  {notifStatus === 'granted' ? 'Notification permission enabled' : 'Receive web push alerts before cutoff'}
                </div>
              </div>
            </div>
            {notifStatus === 'granted' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <Bell className="w-4 h-4 text-slate-400 group-hover:text-orange-600 transition-colors" />
            )}
          </button>
        </div>

        {/* Footer / Toggle Reminder status */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                reminderSaved ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
              }`}
            />
            <span className="text-xs font-semibold text-slate-700">
              {reminderSaved ? t('reminderActive') : t('setReminder')}
            </span>
          </div>

          <button
            onClick={handleToggleReminder}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
              reminderSaved
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            {reminderSaved ? t('reminderActive') : t('setReminder')}
          </button>
        </div>
      </div>
    </div>
  );
}
