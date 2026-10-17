import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  FileCheck2,
  Lock,
  ExternalLink,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
  CreditCard,
  Landmark,
  Award,
  ChevronRight,
  Info,
  CheckSquare,
  Square,
  Eye,
  KeyRound,
  FileQuestion,
  Sparkles,
} from 'lucide-react';
import {
  fetchDigiLockerStatus,
  fetchDigiLockerAuthUrl,
  selectDigiLockerDocuments,
  disconnectDigiLocker,
  fetchDigiLockerDocument,
} from '../../api/digilocker.api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getAgentTranslation } from '../../services/agentTranslator';

export default function DigiLockerModal({ isOpen, onClose, onLinkedSuccess }) {
  const { user } = useAuth();
  const { currentLangCode } = useLanguage();
  const at = (key) => getAgentTranslation(key, currentLangCode);

  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [savingSelection, setSavingSelection] = useState(false);
  const [statusData, setStatusData] = useState(null);
  const [selectedDocIds, setSelectedDocIds] = useState([]);
  const [selectedDocPreview, setSelectedDocPreview] = useState(null);
  const [consentChecked, setConsentChecked] = useState(true);
  const [noticeMessage, setNoticeMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadStatus();
    }
  }, [isOpen]);

  const loadStatus = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetchDigiLockerStatus();
      if (res?.success) {
        setStatusData(res);
        if (res.account?.selectedDocuments) {
          setSelectedDocIds(res.account.selectedDocuments);
        } else if (res.account?.availableFiles) {
          // By default, select all available documents if previously unset
          setSelectedDocIds(res.account.availableFiles.map((f) => f.id));
        }
      } else {
        setStatusData(null);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to check DigiLocker status.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initiate official DigiLocker OAuth 2.0 flow
   */
  const handleConnectOAuth = async () => {
    if (!consentChecked) {
      alert('Please check the consent box to proceed with official DigiLocker authorization.');
      return;
    }

    setRedirecting(true);
    setErrorMessage(null);
    try {
      const res = await fetchDigiLockerAuthUrl();
      if (res?.authUrl) {
        // Redirect browser to official DigiLocker / MeriPehchaan OAuth 2.0 authorization page
        window.location.href = res.authUrl;
      } else {
        throw new Error('Authorization URL could not be generated.');
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || err.message || 'Failed to initialize DigiLocker OAuth 2.0 redirect.'
      );
      setRedirecting(false);
    }
  };

  /**
   * Save citizen voluntary document selections
   */
  const handleSaveSelection = async () => {
    setSavingSelection(true);
    setErrorMessage(null);
    try {
      const res = await selectDigiLockerDocuments(
        selectedDocIds,
        'Voluntary consent confirmed by citizen to share selected verified documents for scheme eligibility evaluation.'
      );
      if (res?.success) {
        setNoticeMessage('Document sharing preferences saved successfully!');
        setTimeout(() => setNoticeMessage(null), 3500);
        await loadStatus();
        if (onLinkedSuccess) {
          onLinkedSuccess(statusData?.account);
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save document selection.');
    } finally {
      setSavingSelection(false);
    }
  };

  /**
   * Toggle a document's selection
   */
  const toggleDocSelection = (docId) => {
    setSelectedDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  /**
   * Select / Deselect all available documents
   */
  const toggleSelectAll = () => {
    const available = statusData?.account?.availableFiles || [];
    if (selectedDocIds.length === available.length) {
      setSelectedDocIds([]);
    } else {
      setSelectedDocIds(available.map((f) => f.id));
    }
  };

  /**
   * Disconnect and revoke vault access
   */
  const handleDisconnect = async () => {
    if (
      !window.confirm(
        'Are you sure you want to disconnect DigiLocker? BharatSeva AI will revoke authorized tokens and purge stored document metadata from your account.'
      )
    ) {
      return;
    }
    setLoading(true);
    try {
      await disconnectDigiLocker();
      await loadStatus();
      setNoticeMessage('DigiLocker vault has been disconnected and tokens revoked.');
      setTimeout(() => setNoticeMessage(null), 3500);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to disconnect DigiLocker.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isLinked = statusData?.linked;
  const isConfigured = statusData?.isConfigured;
  const account = statusData?.account;
  const availableFiles = account?.availableFiles || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* DigiLocker Official Header */}
        <div className="bg-gradient-to-r from-[#002855] via-[#003366] to-[#0b4d8c] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3.5">
            {/* DigiLocker Official Emblem Logo Badge */}
            <div className="w-12 h-12 rounded-2xl bg-white text-[#003366] font-black text-xl flex items-center justify-center shadow-lg border-2 border-amber-400/80">
              <span className="tracking-tight text-blue-900">DL</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight">DigiLocker National Vault</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-900 shadow-xs">
                  Government of India
                </span>
              </div>
              <p className="text-xs text-blue-100/90 mt-0.5">
                Ministry of Electronics &amp; Information Technology (MeitY) · Rule 9A IT Rules 2016
              </p>
            </div>
          </div>
        </div>

        {/* Notices & Alerts */}
        {noticeMessage && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{noticeMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block">Authorization Notice:</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#003366] animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Connecting to DigiLocker security gateway...</p>
            </div>
          ) : !isLinked ? (
            /* UNLINKED STATE: Permission Explanation & OAuth 2.0 Connection */
            <div className="space-y-5">
              {/* Official DigiLocker Explanation */}
              <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-4.5 space-y-2">
                <div className="flex items-center gap-2 text-blue-950 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-blue-700" />
                  <span>Secure Government Document Access</span>
                </div>
                <p className="text-xs text-blue-900/80 leading-relaxed">
                  DigiLocker allows Indian citizens to securely share verified government records—including Aadhaar,
                  income certificates, land records, and marksheets—directly from official issuing authorities without
                  paper photocopies or manual notarization.
                </p>
              </div>

              {/* Check if Credentials Configured */}
              {isConfigured ? (
                /* LIVE OAUTH 2.0 AUTHORIZATION FLOW */
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Permissions &amp; Documents Requested:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {statusData?.requestedDocumentsExplanation?.map((doc, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                          <span className="font-bold text-slate-900 block">{doc.type}</span>
                          <span className="text-[11px] text-slate-500 leading-snug block">{doc.purpose}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Privacy & Consent Guarantee */}
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-xs text-amber-950">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Lock className="w-4 h-4 text-amber-700" />
                      <span>Privacy &amp; Security Principles:</span>
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-[11px] text-amber-900">
                      <li>We only request permissions required for scheme matching and application autofill.</li>
                      <li>No document is ever accessed or shared without your voluntary, explicit consent.</li>
                      <li>You can disconnect and revoke access at any time with a single click.</li>
                      <li>We never store your DigiLocker password or OTP.</li>
                    </ul>
                  </div>

                  {/* Citizen Consent Checkbox */}
                  <label className="flex items-start gap-2.5 cursor-pointer p-2 bg-slate-50 rounded-xl border border-slate-200">
                    <input
                      type="checkbox"
                      checked={consentChecked}
                      onChange={(e) => setConsentChecked(e.target.checked)}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-[11px] text-slate-700 leading-tight">
                      I hereby voluntarily authorize BharatSeva AI to redirect me to the official Government of India
                      DigiLocker portal to grant OAuth 2.0 consent for scheme eligibility verification.
                    </span>
                  </label>

                  {/* Connect Button */}
                  <button
                    type="button"
                    onClick={handleConnectOAuth}
                    disabled={redirecting || !consentChecked}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#002855] via-[#003366] to-[#0a4d8c] hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {redirecting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Redirecting to DigiLocker Authorization Gateway...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-amber-400" />
                        <span>Connect DigiLocker (Redirect to Official Portal)</span>
                        <ExternalLink className="w-3.5 h-3.5 ml-1" />
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* DEVELOPER / ONBOARDING SETUP GUIDE (When credentials are not in .env) */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs flex items-center gap-1.5 text-amber-900">
                        <KeyRound className="w-4 h-4 text-amber-700" />
                        <span>DigiLocker OAuth 2.0 Credentials Required</span>
                      </span>
                      <span className="text-[10px] font-bold bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full">
                        Pending Onboarding
                      </span>
                    </div>
                    <p className="text-xs text-amber-900 leading-relaxed">
                      To connect real citizen DigiLocker accounts via government OAuth 2.0, register your application on
                      the official API Setu or DigiLocker Partners developer portal.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Setup &amp; Registration Checklist:
                    </h4>
                    <div className="space-y-2 text-xs">
                      {statusData?.configurationGuide?.steps?.map((step, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="text-slate-700 leading-relaxed">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-100 rounded-xl font-mono text-[11px] text-slate-700 space-y-1">
                    <div className="text-[10px] text-slate-500 font-sans font-bold">Whitelisted Callback URL:</div>
                    <div className="select-all bg-white p-2 rounded-lg border border-slate-300 text-blue-900 break-all">
                      {statusData?.configurationGuide?.redirectUri || 'http://localhost:5000/api/digilocker/callback'}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <a
                      href="https://apisetu.gov.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline"
                    >
                      <span>Visit API Setu Developer Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={loadStatus}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Re-check Configuration</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* LINKED STATE: Connected Account & Document Selection */
            <div className="space-y-5">
              {/* Connected Account Overview */}
              <div className="bg-gradient-to-br from-[#002855] to-[#003b7a] text-white rounded-2xl p-4.5 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                      DigiLocker Connected &amp; Verified
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-blue-100 bg-white/10 px-2 py-0.5 rounded-md">
                    {account.digilockerId}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs border-t border-white/10">
                  <div>
                    <span className="text-[10px] text-blue-200 block">Account Holder</span>
                    <span className="font-bold text-white truncate block">{account.fullName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-blue-200 block">DigiLocker ID</span>
                    <span className="font-bold font-mono text-blue-100">{account.digilockerId}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-blue-200 block">Authorized Documents</span>
                    <span className="font-bold text-emerald-300">
                      {selectedDocIds.length} of {availableFiles.length} Selected
                    </span>
                  </div>
                </div>
              </div>

              {/* Document Selection and Permissions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Available Issued Documents ({availableFiles.length})
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Select only the documents you voluntarily choose to share for welfare scheme matching:
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
                  >
                    {selectedDocIds.length === availableFiles.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                {availableFiles.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <FileQuestion className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-semibold text-slate-700">No issued documents found in your DigiLocker account.</p>
                    <p className="text-[11px] text-slate-500">
                      You can pull certificates from government issuers in the DigiLocker app and re-sync your vault here.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {availableFiles.map((file) => {
                      const isSelected = selectedDocIds.includes(file.id);

                      return (
                        <div
                          key={file.id}
                          className={`p-3 rounded-2xl border transition-all text-left flex items-start gap-2.5 cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50/50 border-blue-400 shadow-2xs'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                          onClick={() => toggleDocSelection(file.id)}
                        >
                          <button
                            type="button"
                            className="mt-0.5 text-blue-700 flex-shrink-0 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDocSelection(file.id);
                            }}
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-blue-700" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold text-slate-900 truncate block">
                                {file.name}
                              </span>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase flex-shrink-0">
                                {file.docType}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                              {file.issuer}
                            </span>
                            <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                              <span>{file.date ? `Issued: ${file.date}` : 'Verified record'}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDocPreview(file);
                                }}
                                className="text-blue-600 hover:underline flex items-center gap-0.5 font-semibold"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Preview</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Document Details Modal / Drawer */}
              {selectedDocPreview && (
                <div className="p-4 bg-slate-50 border border-slate-300 rounded-2xl space-y-2 text-xs animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <FileCheck2 className="w-4 h-4 text-blue-700" />
                      <span>{selectedDocPreview.name}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedDocPreview(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Issuer Authority:</span>
                      <span className="font-semibold">{selectedDocPreview.issuer}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Document Category:</span>
                      <span className="font-semibold">{selectedDocPreview.docType}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block text-[10px]">National URI / Reference:</span>
                      <span className="font-mono text-[10px] break-all">{selectedDocPreview.uri || selectedDocPreview.id}</span>
                    </div>
                  </div>
                  <div className="pt-1 text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Digitally certified under Section 9A of the IT Act (Govt of India).</span>
                  </div>
                </div>
              )}

              {/* Action Toolbar */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  Disconnect &amp; Revoke Vault
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSelection}
                    disabled={savingSelection}
                    className="px-5 py-2 text-xs font-bold bg-[#003366] hover:bg-[#002244] text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {savingSelection ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Save Document Permissions ({selectedDocIds.length})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
