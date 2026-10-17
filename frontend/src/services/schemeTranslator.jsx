import React, { useState, useEffect } from 'react';
import { SCHEME_TRANSLATIONS } from '../constants/schemeTranslations';
import { translateTexts } from '../api/ai.api';

// In-memory runtime cache for dynamic AI translations
const memoryCache = new Map();

/**
 * Translates a scheme object for the given language code.
 * Seamlessly prioritizes:
 * 1. English original (when langCode === 'en')
 * 2. Pre-compiled verified dataset (0ms latency instant switch)
 * 3. Client localStorage cache
 * 4. Sarvam AI dynamic translation via backend /api/ai/translate
 */
export function getTranslatedScheme(scheme, langCode = 'en') {
  if (!scheme) return null;
  const slug = scheme.slug || scheme.id;
  const fallbackDeadline = scheme.applicationDeadline || '31 March 2027 (Open for FY 2026-27)';

  if (langCode === 'en') {
    return {
      ...scheme,
      _isTranslated: false,
      nameEn: scheme.name,
      descriptionEn: scheme.description,
      authorityEn: scheme.authority,
      sectorEn: scheme.sector,
      applicationDeadline: fallbackDeadline,
      applicationDeadlineEn: fallbackDeadline,
      bilingualBenefits: scheme.benefits?.map((b) => ({ translated: b, english: b })) || [],
      bilingualCriteria: scheme.eligibilityCriteria?.map((c) => ({
        ...c,
        translatedLabel: c.label,
        englishLabel: c.label,
      })) || [],
      bilingualDocuments: scheme.requiredDocuments?.map((d) => ({ translated: d, english: d })) || [],
      bilingualSteps: scheme.applicationSteps?.map((s) => ({ translated: s, english: s })) || [],
      bilingualBeneficiaries: scheme.targetBeneficiaries?.map((tb) => ({ translated: tb, english: tb })) || [],
    };
  }

  // 1. Check pre-compiled verified translations
  const precompiled = SCHEME_TRANSLATIONS[slug]?.[langCode];
  if (precompiled) {
    return {
      ...scheme,
      _isTranslated: true,
      name: precompiled.name || scheme.name,
      nameEn: scheme.name,
      description: precompiled.description || scheme.description,
      descriptionEn: scheme.description,
      authority: precompiled.authority || scheme.authority,
      authorityEn: scheme.authority,
      sector: precompiled.sector || scheme.sector,
      sectorEn: scheme.sector,
      applicationDeadline: precompiled.applicationDeadline || fallbackDeadline,
      applicationDeadlineEn: fallbackDeadline,
      bilingualBenefits: (scheme.benefits || []).map((b, idx) => ({
        translated: precompiled.benefits?.[idx] || b,
        english: b,
      })),
      bilingualCriteria: (scheme.eligibilityCriteria || []).map((c, idx) => ({
        ...c,
        translatedLabel: precompiled.eligibilityCriteria?.[idx] || c.label,
        englishLabel: c.label,
      })),
      bilingualDocuments: (scheme.requiredDocuments || []).map((d, idx) => ({
        translated: precompiled.requiredDocuments?.[idx] || d,
        english: d,
      })),
      bilingualSteps: (scheme.applicationSteps || []).map((s, idx) => ({
        translated: precompiled.applicationSteps?.[idx] || s,
        english: s,
      })),
      bilingualBeneficiaries: (scheme.targetBeneficiaries || []).map((tb, idx) => ({
        translated: precompiled.targetBeneficiaries?.[idx] || tb,
        english: tb,
      })),
    };
  }

  // 2. Check localStorage / memory cache
  const cacheKey = `btr_${slug}_${langCode}`;
  if (memoryCache.has(cacheKey)) {
    const cached = memoryCache.get(cacheKey);
    return mergeDynamicTranslation(scheme, cached, fallbackDeadline);
  }

  try {
    const stored = localStorage.getItem(cacheKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      memoryCache.set(cacheKey, parsed);
      return mergeDynamicTranslation(scheme, parsed, fallbackDeadline);
    }
  } catch {
    // Ignore storage parse errors
  }

  // Fallback to formatted English structure with translation flag
  return {
    ...scheme,
    _isTranslated: false,
    _needsAsyncTranslate: true,
    nameEn: scheme.name,
    descriptionEn: scheme.description,
    authorityEn: scheme.authority,
    sectorEn: scheme.sector,
    applicationDeadline: fallbackDeadline,
    applicationDeadlineEn: fallbackDeadline,
    bilingualBenefits: scheme.benefits?.map((b) => ({ translated: b, english: b })) || [],
    bilingualCriteria: scheme.eligibilityCriteria?.map((c) => ({
      ...c,
      translatedLabel: c.label,
      englishLabel: c.label,
    })) || [],
    bilingualDocuments: scheme.requiredDocuments?.map((d) => ({ translated: d, english: d })) || [],
    bilingualSteps: scheme.applicationSteps?.map((s) => ({ translated: s, english: s })) || [],
    bilingualBeneficiaries: scheme.targetBeneficiaries?.map((tb) => ({ translated: tb, english: tb })) || [],
  };
}

function mergeDynamicTranslation(scheme, data, fallbackDeadline) {
  return {
    ...scheme,
    _isTranslated: true,
    name: data.name || scheme.name,
    nameEn: scheme.name,
    description: data.description || scheme.description,
    descriptionEn: scheme.description,
    authority: data.authority || scheme.authority,
    authorityEn: scheme.authority,
    sector: data.sector || scheme.sector,
    sectorEn: scheme.sector,
    applicationDeadline: data.applicationDeadline || scheme.applicationDeadline || fallbackDeadline,
    applicationDeadlineEn: fallbackDeadline,
    bilingualBenefits: (scheme.benefits || []).map((b, idx) => ({
      translated: data.benefits?.[idx] || b,
      english: b,
    })),
    bilingualCriteria: (scheme.eligibilityCriteria || []).map((c, idx) => ({
      ...c,
      translatedLabel: data.eligibilityCriteria?.[idx] || c.label,
      englishLabel: c.label,
    })),
    bilingualDocuments: (scheme.requiredDocuments || []).map((d, idx) => ({
      translated: data.requiredDocuments?.[idx] || d,
      english: d,
    })),
    bilingualSteps: (scheme.applicationSteps || []).map((s, idx) => ({
      translated: data.applicationSteps?.[idx] || s,
      english: s,
    })),
    bilingualBeneficiaries: (scheme.targetBeneficiaries || []).map((tb, idx) => ({
      translated: data.targetBeneficiaries?.[idx] || tb,
      english: tb,
    })),
  };
}

/**
 * React Hook for automatically resolving dynamic translations for ANY scheme
 * across all details, rules, documents, steps, benefits, and application deadlines.
 */
export function useSchemeTranslator(scheme, currentLangCode) {
  const [translatedScheme, setTranslatedScheme] = useState(() =>
    getTranslatedScheme(scheme, currentLangCode)
  );

  useEffect(() => {
    const result = getTranslatedScheme(scheme, currentLangCode);
    setTranslatedScheme(result);

    if (currentLangCode === 'en' || !scheme) return;

    const slug = scheme.slug || scheme.id;
    const cacheKey = `btr_${slug}_${currentLangCode}`;

    // If already precompiled or in cache, nothing to fetch
    if (SCHEME_TRANSLATIONS[slug]?.[currentLangCode] || memoryCache.has(cacheKey)) {
      return;
    }

    // Dynamic asynchronous translation via Sarvam AI API
    let isCancelled = false;

    // Collect all translatable fields across the entire scheme
    const textsToTranslate = [];
    const meta = {
      hasName: false,
      hasAuthority: false,
      hasSector: false,
      hasDescription: false,
      hasDeadline: false,
      benefitsCount: 0,
      criteriaCount: 0,
      docsCount: 0,
      stepsCount: 0,
      beneficiariesCount: 0,
    };

    if (scheme.name) {
      textsToTranslate.push(scheme.name);
      meta.hasName = true;
    }
    if (scheme.authority) {
      textsToTranslate.push(scheme.authority);
      meta.hasAuthority = true;
    }
    if (scheme.sector) {
      textsToTranslate.push(scheme.sector);
      meta.hasSector = true;
    }
    if (scheme.description) {
      textsToTranslate.push(scheme.description);
      meta.hasDescription = true;
    }
    if (scheme.applicationDeadline) {
      textsToTranslate.push(scheme.applicationDeadline);
      meta.hasDeadline = true;
    }

    const benefits = scheme.benefits || [];
    benefits.forEach((b) => {
      textsToTranslate.push(b);
      meta.benefitsCount++;
    });

    const criteria = scheme.eligibilityCriteria || [];
    criteria.forEach((c) => {
      textsToTranslate.push(c.label || '');
      meta.criteriaCount++;
    });

    const docs = scheme.requiredDocuments || [];
    docs.forEach((d) => {
      textsToTranslate.push(d);
      meta.docsCount++;
    });

    const steps = scheme.applicationSteps || [];
    steps.forEach((s) => {
      textsToTranslate.push(s);
      meta.stepsCount++;
    });

    const beneficiaries = scheme.targetBeneficiaries || [];
    beneficiaries.forEach((tb) => {
      textsToTranslate.push(tb);
      meta.beneficiariesCount++;
    });

    if (textsToTranslate.length === 0) return;

    translateTexts(textsToTranslate, currentLangCode, 'en')
      .then((res) => {
        if (isCancelled || !res?.data?.translations) return;
        const translations = res.data.translations;

        let ptr = 0;
        const dynName = meta.hasName ? translations[ptr++] : scheme.name;
        const dynAuthority = meta.hasAuthority ? translations[ptr++] : scheme.authority;
        const dynSector = meta.hasSector ? translations[ptr++] : scheme.sector;
        const dynDesc = meta.hasDescription ? translations[ptr++] : scheme.description;
        const dynDeadline = meta.hasDeadline ? translations[ptr++] : scheme.applicationDeadline;

        const dynBenefits = [];
        for (let i = 0; i < meta.benefitsCount; i++) {
          dynBenefits.push(translations[ptr++] || benefits[i]);
        }

        const dynCriteria = [];
        for (let i = 0; i < meta.criteriaCount; i++) {
          dynCriteria.push(translations[ptr++] || criteria[i]?.label);
        }

        const dynDocs = [];
        for (let i = 0; i < meta.docsCount; i++) {
          dynDocs.push(translations[ptr++] || docs[i]);
        }

        const dynSteps = [];
        for (let i = 0; i < meta.stepsCount; i++) {
          dynSteps.push(translations[ptr++] || steps[i]);
        }

        const dynBeneficiaries = [];
        for (let i = 0; i < meta.beneficiariesCount; i++) {
          dynBeneficiaries.push(translations[ptr++] || beneficiaries[i]);
        }

        const payload = {
          name: dynName,
          authority: dynAuthority,
          sector: dynSector,
          description: dynDesc,
          applicationDeadline: dynDeadline,
          benefits: dynBenefits,
          eligibilityCriteria: dynCriteria,
          requiredDocuments: dynDocs,
          applicationSteps: dynSteps,
          targetBeneficiaries: dynBeneficiaries,
        };

        memoryCache.set(cacheKey, payload);
        try {
          localStorage.setItem(cacheKey, JSON.stringify(payload));
        } catch {}

        setTranslatedScheme(
          mergeDynamicTranslation(scheme, payload, scheme.applicationDeadline)
        );
      })
      .catch(() => {
        // Fallback already active
      });

    return () => {
      isCancelled = true;
    };
  }, [scheme, currentLangCode]);

  return translatedScheme;
}

/**
 * Reusable Bilingual Scheme Field Component
 * Layout:
 * - 'inline': For tags, badges, document items, titles
 * - 'block': For scheme descriptions, benefits list, eligibility rules, application steps
 */
export function SchemeBilingualText({
  translated,
  english,
  isEnglish = false,
  layout = 'inline',
  className = '',
}) {
  if (isEnglish || !translated || translated === english) {
    return <span className={className}>{english || translated}</span>;
  }

  if (layout === 'block') {
    return (
      <div className={`space-y-0.5 ${className}`}>
        <div className="font-medium text-slate-800 leading-relaxed">{translated}</div>
        <div className="text-[11px] sm:text-xs text-slate-500 italic font-normal leading-normal">
          ({english})
        </div>
      </div>
    );
  }

  return (
    <span className={`inline-flex items-baseline flex-wrap gap-x-1 ${className}`}>
      <span>{translated}</span>
      <span className="text-[0.78em] font-normal italic opacity-75 whitespace-normal">
        ({english})
      </span>
    </span>
  );
}

export default {
  getTranslatedScheme,
  useSchemeTranslator,
  SchemeBilingualText,
};
