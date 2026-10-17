import React from 'react';
import { CheckCircle2, HelpCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Renders the exact four assessment categories mandated by BharatSeva AI:
 * - Appears Eligible
 * - Possibly Eligible
 * - Not Enough Information
 * - Appears Ineligible
 *
 * Supports multilingual switching with English translation in parentheses.
 */
export default function EligibilityBadge({ category, size = 'sm', showIcon = true }) {
  const { t, tText } = useLanguage();
  const normalized = category ? category.trim() : 'Not Enough Information';

  const badgeConfig = {
    'Appears Eligible': {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: CheckCircle2,
      key: 'eligibleBadge',
      fallback: 'Appears Eligible',
      description: 'Applicant profile appears to satisfy known criteria.',
    },
    'Possibly Eligible': {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: AlertTriangle,
      key: 'possiblyEligibleBadge',
      fallback: 'Possibly Eligible',
      description: 'Some conditions met; supplementary records needed.',
    },
    'Not Enough Information': {
      bg: 'bg-sky-50 text-sky-800 border-sky-200',
      icon: HelpCircle,
      key: 'notEnoughInfoBadge',
      fallback: 'Not Enough Information',
      description: 'Additional demographic or land data required.',
    },
    'Appears Ineligible': {
      bg: 'bg-rose-50 text-rose-800 border-rose-200',
      icon: XCircle,
      key: 'ineligibleBadge',
      fallback: 'Appears Ineligible',
      description: 'Does not currently appear to meet primary criteria.',
    },
  };

  const config = badgeConfig[normalized] || badgeConfig['Not Enough Information'];
  const IconComponent = config.icon;
  const sizeClasses = size === 'lg' ? 'px-3 py-1.5 text-xs' : 'px-2.5 py-0.5 text-[11px]';

  return (
    <span
      title={config.description}
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border shadow-2xs ${config.bg} ${sizeClasses}`}
    >
      {showIcon && <IconComponent className={size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} />}
      <span>{t(config.key)}</span>
    </span>
  );
}
