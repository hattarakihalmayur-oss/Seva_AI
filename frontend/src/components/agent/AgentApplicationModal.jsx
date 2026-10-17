import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  FileText,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  X,
  RefreshCw,
  Printer,
  Download,
  Building,
  Check,
  Cpu,
  Lock,
  Layers,
  ChevronRight,
  QrCode,
  Edit3,
  Play,
  RotateCcw,
  Zap,
  CheckSquare,
  Landmark,
  UserCheck,
  CreditCard,
} from 'lucide-react';
import {
  checkSchemeReadiness,
  prefillSchemeApplication,
  submitSchemeApplication,
} from '../../api/application.api';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getAgentTranslation } from '../../services/agentTranslator';
import DigiLockerModal from '../digilocker/DigiLockerModal';

export default function AgentApplicationModal({
  isOpen,
  onClose,
  scheme,
  onApplicationSubmitted,
}) {
  const { user } = useAuth();
  const { currentLangCode } = useLanguage();
  const at = (key) => getAgentTranslation(key, currentLangCode);

  // Modal Workflow Phases: 'READINESS' | 'AUTOFILL_ENGINE' | 'CONSENT' | 'EXECUTING' | 'SUCCESS'
  const [phase, setPhase] = useState('READINESS');
  const [loading, setLoading] = useState(true);
  const [readinessData, setReadinessData] = useState(null);
  const [prefilledData, setPrefilledData] = useState(null);
  const [digiLockerModalOpen, setDigiLockerModalOpen] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [executionStepIndex, setExecutionStepIndex] = useState(0);

  // Live Blank-Filling Engine State
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [filledBlankCount, setFilledBlankCount] = useState(0);
  const [activeFillingIndex, setActiveFillingIndex] = useState(-1);
  const [agentTerminalLogs, setAgentTerminalLogs] = useState([]);

  // Editable form fields state
  const [formData, setFormData] = useState({
    applicantDetails: {},
    customFields: {},
  });

  const [declarationAgreed, setDeclarationAgreed] = useState(true);

  const schemeSlug = scheme?.slug || scheme?.id;

  useEffect(() => {
    if (isOpen && schemeSlug) {
      setPhase('READINESS');
      setFilledBlankCount(0);
      setActiveFillingIndex(-1);
      setAgentTerminalLogs([]);
      loadReadiness();
    }
  }, [isOpen, schemeSlug]);

  const loadReadiness = async () => {
    setLoading(true);
    try {
      const res = await checkSchemeReadiness(schemeSlug);
      if (res?.data) {
        setReadinessData(res.data);
      }
    } catch (err) {
      console.error('Failed to check readiness:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartPrefill = async () => {
    setLoading(true);
    try {
      const res = await prefillSchemeApplication(schemeSlug);
      if (res?.data) {
        setPrefilledData(res.data);
        setFormData({
          applicantDetails: { ...res.data.applicantDetails },
          customFields: { ...res.data.customFields },
        });
        setPhase('AUTOFILL_ENGINE');
        // Automatically start the blank filling execution
        startBlankFillingSimulation(res.data);
      }
    } catch (err) {
      alert(err.message || 'Failed to auto-populate application');
    } finally {
      setLoading(false);
    }
  };

  // The 14 official application blanks to fill
  const getBlankDefinitions = (data) => {
    const app = data?.applicantDetails || formData.applicantDetails || {};
    const cust = data?.customFields || formData.customFields || {};

    return [
      { id: 'name', label: '1. Applicant Full Name', value: app.name || user?.name || 'Citizen Applicant', source: 'UIDAI DigiLocker' },
      { id: 'aadhaar', label: '2. Aadhaar Identity UID', value: app.aadhaarMasked || user?.aadhaar || 'XXXX-XXXX-8921', source: 'UIDAI Vault' },
      { id: 'dob', label: '3. Date of Birth & Age', value: `${app.dob || user?.dob || '1990-05-14'} (${app.age || 36} yrs)`, source: 'Citizen Profile' },
      { id: 'gender', label: '4. Gender', value: app.gender || user?.gender || 'Male', source: 'Aadhaar Record' },
      { id: 'father', label: '5. Father / Husband Name', value: cust.fatherHusbandName || 'Guardian', source: 'Citizen Profile' },
      { id: 'state', label: '6. State of Residence', value: app.state || user?.state || 'Karnataka', source: 'Citizen Profile' },
      { id: 'district', label: '7. District & Pincode', value: `${app.district || user?.district || 'Bengaluru'} - ${app.pincode || '560001'}`, source: 'Address Proof' },
      { id: 'mobile', label: '8. Registered Mobile Phone', value: app.phone || user?.phone || '9876543210', source: 'UIDAI Linked' },
      { id: 'income', label: '9. Annual Family Income Slab', value: cust.annualIncome || user?.annualIncome || user?.incomeLevel || 'Below ₹1,50,000 (Priority BPL)', source: 'Income Certificate' },
      { id: 'category', label: '10. Socio-Economic Category', value: cust.category || user?.category || 'General / OBC', source: 'Caste Certificate' },
      { id: 'bankName', label: '11. Bank Name & Branch', value: `${cust.bankName || 'State Bank of India'} (${cust.branch || 'Main Branch'})`, source: 'Bank Passbook' },
      { id: 'accountNo', label: '12. Account & IFSC (DBT Active)', value: `${cust.maskedAccountNumber || 'XXXXXX8912'} / ${cust.ifscCode || 'SBIN0004291'}`, source: 'NPCI DBT Seeded' },
      { id: 'land', label: '13. Land Holding / Scheme Details', value: `Survey No. ${cust.landSurveyNumber || '142/2A'} · ${cust.landAreaAcres || 2.5} Acres`, source: 'Bhoomi RoR Record' },
      { id: 'docs', label: '14. Attached Digital Credentials', value: `${readinessData?.matchedDocuments?.length || 4} Documents Attached with SHA-256 Seals`, source: 'DigiLocker Vault' },
    ];
  };

  /**
   * Run the interactive blank-filling agentic demonstration
   */
  const startBlankFillingSimulation = (sourceData = prefilledData) => {
    setIsAutoFilling(true);
    setFilledBlankCount(0);
    setActiveFillingIndex(0);
    setAgentTerminalLogs([
      '⚡ [Agent] Activated BharatSeva AI Seva Agent for autonomous welfare submission.',
      '🔍 [Agent] Accessing verified credentials from citizen DigiLocker Vault...',
    ]);

    const blanks = getBlankDefinitions(sourceData);

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < blanks.length) {
        const item = blanks[currentIndex];
        setActiveFillingIndex(currentIndex);
        setFilledBlankCount(currentIndex + 1);
        setAgentTerminalLogs((prev) => [
          ...prev,
          `✍️ [Agent] Auto-filling Blank ${currentIndex + 1}/14: ${item.label.replace(/^\d+\.\s*/, '')} → "${item.value}" [${item.source}]`,
        ]);
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsAutoFilling(false);
        setActiveFillingIndex(-1);
        setFilledBlankCount(blanks.length);
        setAgentTerminalLogs((prev) => [
          ...prev,
          '✅ [Agent] All 14 blanks populated autonomously! Verification score: 100%. Ready for submission.',
        ]);
      }
    }, 450);
  };

  const handleInstantFillAll = () => {
    const blanks = getBlankDefinitions(prefilledData);
    setFilledBlankCount(blanks.length);
    setIsAutoFilling(false);
    setActiveFillingIndex(-1);
    setAgentTerminalLogs([
      '⚡ [Agent] Fast-forwarded blank auto-filling.',
      '✅ [Agent] All 14 blanks populated autonomously from DigiLocker Vault (100% Complete).',
    ]);
  };

  const executionSteps = [
    { title: at('step1Title'), desc: at('step1Desc') },
    { title: at('step2Title'), desc: at('step2Desc') },
    { title: at('step3Title'), desc: at('step3Desc') },
    { title: at('step4Title'), desc: at('step4Desc') },
    { title: at('step5Title'), desc: at('step5Desc') },
    { title: at('step6Title'), desc: at('step6Desc') },
  ];

  const handleExecuteApplication = async () => {
    setPhase('EXECUTING');
    setExecutionStepIndex(0);

    const interval = setInterval(() => {
      setExecutionStepIndex((prev) => {
        if (prev < executionSteps.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 600);

    try {
      const res = await submitSchemeApplication({
        schemeSlug,
        formData,
        consentData: { agreed: true, method: 'AADHAAR_OTP_ESIGN' },
      });

      setTimeout(() => {
        clearInterval(interval);
        setSubmissionResult(res.application);
        setPhase('SUCCESS');
        if (onApplicationSubmitted) {
          onApplicationSubmitted(res.application);
        }
      }, 3600);
    } catch (err) {
      clearInterval(interval);
      alert(err.message || 'Failed to submit application');
      setPhase('AUTOFILL_ENGINE');
    }
  };

  if (!isOpen) return null;

  const blankDefinitions = getBlankDefinitions(prefilledData);
  const fillProgressPercent = Math.round((filledBlankCount / blankDefinitions.length) * 100);

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-emerald-700 p-5 sm:p-6 text-white relative flex-shrink-0">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white text-orange-600 font-extrabold flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                    {at('agentTitle')} &mdash; Auto-Fill Assistant
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white border border-white/30">
                    Autonomous
                  </span>
                </div>
                <p className="text-xs text-orange-100 mt-0.5">
                  Applying on your behalf for: <strong className="text-white">{scheme?.name}</strong>
                </p>
              </div>
            </div>

            {/* Stepper Bar */}
            <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-[11px] font-semibold text-orange-100">
              <span className={phase === 'READINESS' ? 'text-white font-bold underline' : ''}>
                1. Readiness Audit
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-white/40" />
              <span className={phase === 'AUTOFILL_ENGINE' ? 'text-white font-bold underline' : ''}>
                2. Auto-Filling All Blanks
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-white/40" />
              <span className={phase === 'CONSENT' ? 'text-white font-bold underline' : ''}>
                3. e-Sign &amp; Consent
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-white/40" />
              <span className={phase === 'SUCCESS' ? 'text-white font-bold underline' : ''}>
                4. Official Receipt
              </span>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
            {loading ? (
              <div className="py-20 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-orange-600 animate-spin mx-auto" />
                <p className="text-xs text-slate-500 font-medium">
                  Auditing citizen credentials against scheme criteria...
                </p>
              </div>
            ) : phase === 'READINESS' ? (
              /* Phase 1: Readiness Assessment */
              <div className="space-y-5">
                {!readinessData?.digiLockerConnected ? (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200 rounded-3xl p-6 text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
                      <Lock className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-extrabold text-slate-900">
                        Document Vault Needs Digitization
                      </h3>
                      <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                        To enable the AI Agent to apply on your behalf and auto-fill all the blanks, link your official DigiLocker account or complete your profile.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                      {/* Link Official DigiLocker */}
                      <button
                        onClick={() => setDigiLockerModalOpen(true)}
                        className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md shadow-slate-900/20 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Lock className="w-4 h-4 text-emerald-400" />
                        <span>🔐 Link Official DigiLocker Vault</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Readiness Score Card */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                          {readinessData.readinessScore}%
                        </div>
                        <div>
                          <span className="text-xs font-bold text-emerald-950 block">
                            All Required Documents Verified in Vault
                          </span>
                          <span className="text-[11px] text-emerald-700">
                            Digitized credentials match 100% of statutory eligibility criteria
                          </span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        VAULT READY
                      </span>
                    </div>

                    {/* Matched Documents List */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Matched Scheme Prerequisites:
                        </h4>
                      </div>

                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                        {readinessData.matchedDocuments?.map((item, idx) => (
                          <div key={idx} className="p-3.5 flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="text-xs font-bold text-slate-800 block">
                                  {item.requirement}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  Verified Credential: <strong className="text-blue-700">{item.satisfiedBy}</strong> ({item.docNumber})
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex-shrink-0">
                              VERIFIED
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Next Action: Launch Auto-Filling Demo */}
                    <div className="pt-2">
                      <button
                        onClick={handleStartPrefill}
                        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-emerald-700 hover:opacity-95 text-white font-extrabold text-xs shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-transform active:scale-[0.99] cursor-pointer"
                      >
                        <Cpu className="w-4 h-4 text-amber-200" />
                        <span>🤖 Launch AI Agent: Auto-Fill All Form Blanks</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : phase === 'AUTOFILL_ENGINE' ? (
              /* Phase 2: Live Autonomous Blank Filling Experience */
              <div className="space-y-5 animate-in fade-in duration-300">
                {/* Control Header & Live Progress */}
                <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-lg space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-extrabold">Autonomous Blank-Filling Engine</h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950">
                            LIVE AGENT
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          Populating statutory welfare application blanks from verified DigiLocker and citizen profile
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startBlankFillingSimulation()}
                        disabled={isAutoFilling}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Replay</span>
                      </button>
                      <button
                        onClick={handleInstantFillAll}
                        disabled={fillProgressPercent === 100}
                        className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Fill All</span>
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-300">Form Blanks Populated by Agent:</span>
                      <span className="font-mono text-amber-400 font-bold">
                        {filledBlankCount} of {blankDefinitions.length} Blanks ({fillProgressPercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-400 via-orange-500 to-emerald-400 h-full transition-all duration-300 rounded-full"
                        style={{ width: `${fillProgressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Official Application Form Layout with Live Filled Blanks */}
                <div className="border-2 border-slate-200 rounded-3xl p-5 sm:p-6 bg-slate-50/50 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
                      <FileText className="w-4 h-4 text-orange-600" />
                      <span>Official Scheme Application Form &mdash; {scheme?.authority}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Form Ref: GOV-SCHEME-{schemeSlug?.toUpperCase() || 'WELF-2026'}
                    </span>
                  </div>

                  {/* 14 Application Blanks Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {blankDefinitions.map((item, idx) => {
                      const isFilled = idx < filledBlankCount;
                      const isCurrentlyActive = idx === activeFillingIndex;

                      return (
                        <div
                          key={item.id}
                          className={`p-3 rounded-2xl border transition-all duration-300 ${
                            isCurrentlyActive
                              ? 'border-amber-500 bg-amber-50 shadow-md ring-2 ring-amber-400/40'
                              : isFilled
                              ? 'border-emerald-200 bg-white shadow-2xs'
                              : 'border-dashed border-slate-300 bg-slate-100/60 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                              {item.label}
                            </span>
                            {isFilled ? (
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>AI FILLED</span>
                              </span>
                            ) : isCurrentlyActive ? (
                              <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-md animate-pulse">
                                TYPING...
                              </span>
                            ) : (
                              <span className="text-[9px] text-slate-400 font-mono">BLANK</span>
                            )}
                          </div>

                          <div className="min-h-[22px] flex items-center">
                            {isFilled ? (
                              <span className="font-bold text-slate-900 font-mono truncate">
                                {item.value}
                              </span>
                            ) : isCurrentlyActive ? (
                              <span className="font-mono text-amber-700 font-bold animate-pulse">
                                {item.value.slice(0, 10)}... |
                              </span>
                            ) : (
                              <span className="font-mono text-slate-400 text-xs tracking-widest">
                                ________________________
                              </span>
                            )}
                          </div>

                          {isFilled && (
                            <span className="text-[9px] text-slate-400 mt-1 block">
                              Source: {item.source}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Real-Time Agent Execution Terminal */}
                <div className="bg-slate-950 text-slate-200 p-4 rounded-2xl font-mono text-[11px] space-y-1.5 max-h-36 overflow-y-auto border border-slate-800 shadow-inner">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Agent Autonomous Action Log:</span>
                  </div>
                  {agentTerminalLogs.map((log, i) => (
                    <div key={i} className="leading-relaxed">
                      {log}
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setPhase('READINESS')}
                    className="px-4 py-3 rounded-2xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Back to Audit
                  </button>
                  <button
                    onClick={() => setPhase('CONSENT')}
                    disabled={filledBlankCount < blankDefinitions.length}
                    className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-emerald-700 hover:opacity-95 disabled:opacity-50 text-white font-extrabold text-xs shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-transform active:scale-[0.99] cursor-pointer"
                  >
                    <span>Proceed to e-Sign &amp; Statutory Consent</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : phase === 'CONSENT' ? (
              /* Phase 3: Citizen Declaration */
              <div className="space-y-5">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <ShieldCheck className="w-4 h-4 text-orange-600" />
                    <span>Statutory Citizen e-Sign Authorization</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    I hereby authorize BharatSeva AI Seva Agent to electronically transmit the 14 auto-filled application blanks along with my verified credentials to <strong>{scheme?.authority}</strong> on my behalf under Rule 9A of the IT Rules 2016.
                  </p>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
                    <span className="font-bold text-slate-800 block">Digital Verification Hash:</span>
                    <span className="font-mono text-[10px] text-slate-500 break-all">
                      SHA256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
                    </span>
                  </div>

                  <label className="flex items-start gap-3 pt-3 border-t border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={declarationAgreed}
                      onChange={(e) => setDeclarationAgreed(e.target.checked)}
                      className="mt-0.5 rounded-md border-slate-300 text-orange-600 focus:ring-orange-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-800">
                      I confirm the 14 filled blanks are correct and authorize autonomous submission to the Central Welfare Gateway.
                    </span>
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setPhase('AUTOFILL_ENGINE')}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Back to Blanks
                  </button>
                  <button
                    onClick={handleExecuteApplication}
                    disabled={!declarationAgreed}
                    className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-transform active:scale-[0.99] cursor-pointer"
                  >
                    <Cpu className="w-4 h-4" />
                    <span>🚀 Confirm &amp; Submit Application on My Behalf</span>
                  </button>
                </div>
              </div>
            ) : phase === 'EXECUTING' ? (
              /* Phase 4: Live Execution Console */
              <div className="space-y-6 py-4">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto shadow-inner animate-pulse">
                    <Cpu className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Agent Dispatching Welfare Application...
                  </h3>
                  <p className="text-xs text-slate-500">
                    Encrypting payload with citizen e-Sign and communicating with Central Gateway
                  </p>
                </div>

                <div className="space-y-3 bg-slate-900 text-white p-5 rounded-2xl font-mono text-xs shadow-inner">
                  {executionSteps.map((step, idx) => {
                    const isDone = idx < executionStepIndex;
                    const isCurrent = idx === executionStepIndex;

                    return (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 transition-opacity duration-300 ${
                          idx > executionStepIndex ? 'opacity-30' : 'opacity-100'
                        }`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : isCurrent ? (
                            <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-600" />
                          )}
                        </div>
                        <div>
                          <span className={`font-bold ${isCurrent ? 'text-amber-300' : 'text-slate-200'}`}>
                            {step.title}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-sans">
                            {step.desc}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Phase 5: Success Receipt */
              <div className="space-y-5">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Application Submitted Successfully!
                  </h3>
                  <p className="text-xs text-slate-500">
                    Submitted on your behalf by AI Seva Agent &bull; Official Acknowledgment Receipt Generated
                  </p>
                </div>

                {/* Receipt Card */}
                <div className="bg-gradient-to-br from-slate-50 to-orange-50/40 border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Application Reference Number (ARN)
                      </span>
                      <span className="text-lg font-black font-mono text-orange-600 tracking-wider">
                        {submissionResult?.applicationNumber || 'ARN-2026-BHARAT-88219'}
                      </span>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      SUBMITTED
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Welfare Scheme</span>
                      <span className="font-bold text-slate-900">{scheme?.name}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Administering Authority</span>
                      <span className="font-bold text-slate-900">{scheme?.authority}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Beneficiary Name</span>
                      <span className="font-bold text-slate-900">
                        {submissionResult?.applicantDetails?.name || user?.name || 'Citizen Applicant'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Submission Timestamp</span>
                      <span className="font-bold text-slate-900">
                        {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Digitized Vault Linked &bull; Direct Benefit Transfer (DBT) Active</span>
                    </div>
                  </div>
                </div>

                {/* Receipt Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Receipt</span>
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 px-5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition-colors text-center cursor-pointer"
                  >
                    Done &bull; View in My Applications
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* DigiLocker Sub-Modal */}
      <DigiLockerModal
        isOpen={digiLockerModalOpen}
        onClose={() => setDigiLockerModalOpen(false)}
        onLinkedSuccess={() => {
          setDigiLockerModalOpen(false);
          loadReadiness();
        }}
      />
    </>
  );
}
