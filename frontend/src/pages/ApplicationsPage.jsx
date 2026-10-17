import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Printer,
  ChevronDown,
  ChevronUp,
  Cpu,
  RefreshCw,
  Sparkles,
  Search,
  Building,
  QrCode,
  X,
  CreditCard,
  UserCheck,
  Landmark,
  Layers,
} from 'lucide-react';
import { fetchUserApplications } from '../api/application.api';
import { fetchDigiLockerStatus, syncDigiLockerDocuments } from '../api/digilocker.api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getAgentTranslation } from '../services/agentTranslator';
import DigiLockerModal from '../components/digilocker/DigiLockerModal';

export default function ApplicationsPage() {
  const { user } = useAuth();
  const { t, currentLangCode } = useLanguage();
  const at = (key) => getAgentTranslation(key, currentLangCode);

  const [activeTab, setActiveTab] = useState('APPLICATIONS'); // 'APPLICATIONS' | 'DIGILOCKER'
  const [applications, setApplications] = useState([]);
  const [digiLockerAccount, setDigiLockerAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [expandedAppId, setExpandedAppId] = useState(null);
  const [digiLockerModalOpen, setDigiLockerModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [appsRes, dlRes] = await Promise.all([
        fetchUserApplications().catch(() => ({ data: [] })),
        fetchDigiLockerStatus().catch(() => ({ linked: false, account: null })),
      ]);

      if (appsRes?.data) setApplications(appsRes.data);
      if (dlRes?.linked) setDigiLockerAccount(dlRes.account);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncVault = async () => {
    setSyncing(true);
    try {
      const res = await syncDigiLockerDocuments();
      if (res?.success) {
        setDigiLockerAccount((prev) => ({ ...prev, documents: res.documents }));
      }
    } catch (err) {
      alert(err.message || 'Failed to sync');
    } finally {
      setSyncing(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
          <FileText className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Sign in to View Applications</h2>
        <p className="text-xs text-slate-500">
          Track the welfare scheme applications submitted by you or the AI Seva Agent.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-xl bg-orange-600 text-white text-xs font-bold"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
              Citizen Application Hub
            </span>
            <span className="text-xs text-slate-300">
              Direct Benefit Transfer & Welfare Tracking
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            My Applications & DigiLocker Vault
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Track status of government welfare schemes submitted autonomously by AI Seva Agent.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setDigiLockerModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-colors flex items-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>
              {digiLockerAccount ? at('vaultConnected') : at('linkDigiLockerNow')}
            </span>
          </button>
          <Link
            to="/schemes"
            className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-xs transition-colors flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            <span>{t('schemes') || 'Schemes'}</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('APPLICATIONS')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'APPLICATIONS'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{at('stepArn')} ({applications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('DIGILOCKER')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'DIGILOCKER'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{at('digilockerTitle')} ({digiLockerAccount?.documents?.length || 0})</span>
        </button>
      </div>

      {/* Tab 1: Applications Tracker */}
      {activeTab === 'APPLICATIONS' && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-orange-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Loading citizen applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No applications lodged yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore government welfare schemes and let the <strong>AI Seva Agent</strong> apply on your behalf using verified DigiLocker records.
              </p>
              <Link
                to="/schemes"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 text-white text-xs font-bold shadow-md hover:bg-orange-700 transition-colors"
              >
                <span>Browse Schemes to Apply</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => {
                const isExpanded = expandedAppId === app._id;

                return (
                  <div
                    key={app._id}
                    className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-all"
                  >
                    <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-200">
                            {app.schemeSector || 'Welfare'}
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-500">
                            ARN: <strong className="text-orange-600">{app.applicationNumber}</strong>
                          </span>
                          <span className="text-[10px] text-slate-400">
                            &bull; Submitted {new Date(app.submittedAt).toLocaleDateString()}
                          </span>
                        </div>

                        <h3 className="text-base font-extrabold text-slate-900">
                          {app.schemeName}
                        </h3>
                        <p className="text-xs text-slate-500">
                          Authority: <strong>{app.authority}</strong> &bull; Beneficiary:{' '}
                          <strong>{app.applicantDetails?.name}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{app.status}</span>
                        </span>

                        <button
                          onClick={() => setSelectedReceipt(app)}
                          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </button>

                        <button
                          onClick={() => setExpandedAppId(isExpanded ? null : app._id)}
                          className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
                          title="View Agent Audit Trail"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Agent Audit Trail */}
                    {isExpanded && (
                      <div className="bg-slate-900 text-white p-5 border-t border-slate-800 space-y-4">
                        <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                          <span className="flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-orange-400" />
                            Autonomous AI Seva Agent Execution Trail
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            Verified via DigiLocker SHA-256
                          </span>
                        </div>

                        <div className="space-y-2.5 font-mono text-xs">
                          {app.agentAuditLog?.map((log, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <span className="font-bold text-slate-200">{log.step}: </span>
                                <span className="text-slate-400 font-sans">{log.message}</span>
                              </div>
                              <span className="text-[10px] text-slate-500">
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                          ))}
                        </div>

                        {app.attachedDocuments?.length > 0 && (
                          <div className="pt-3 border-t border-slate-800">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                              Attached Verified Credentials:
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {app.attachedDocuments.map((doc, idx) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-[10px] text-slate-300 border border-slate-700 flex items-center gap-1.5"
                                >
                                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                  <span>{doc.name}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: DigiLocker Vault */}
      {activeTab === 'DIGILOCKER' && (
        <div className="space-y-6">
          {!digiLockerAccount ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">DigiLocker Not Linked</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Connect your DigiLocker vault to view your verified documents and enable the AI Agent to apply to schemes seamlessly.
              </p>
              <button
                onClick={() => setDigiLockerModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors inline-flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Link DigiLocker Now</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Vault Overview */}
              <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
                    DigiLocker ID: {digiLockerAccount.digilockerId}
                  </span>
                  <h2 className="text-xl font-extrabold">{digiLockerAccount.fullName}</h2>
                  <p className="text-xs text-blue-100">
                    Aadhaar: <span className="font-mono">{digiLockerAccount.aadhaarMasked}</span> &bull; Status:{' '}
                    <strong className="text-emerald-300">National Gateway Synchronized</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSyncVault}
                    disabled={syncing}
                    className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                    <span>Sync Repository</span>
                  </button>
                  <button
                    onClick={() => setDigiLockerModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-white text-blue-900 hover:bg-blue-50 text-xs font-bold transition-colors"
                  >
                    Manage Vault
                  </button>
                </div>
              </div>

              {/* Documents Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {digiLockerAccount.documents?.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
                          {doc.docType.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          VERIFIED
                        </span>
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-900 pt-1">{doc.name}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{doc.issuer}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
                      <span>No: {doc.docNumber}</span>
                      <span className="text-emerald-700 font-bold font-sans text-[10px]">Active</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Official Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-600 text-white font-extrabold text-sm flex items-center justify-center">
                  भ
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Official Application Receipt
                  </h3>
                  <span className="text-xs text-slate-500">
                    BharatSeva AI Seva Autonomous Application
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-200/80 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-orange-700 tracking-wider">
                Application Reference Number
              </span>
              <div className="text-lg font-black font-mono text-orange-950">
                {selectedReceipt.applicationNumber}
              </div>
            </div>

            <div className="space-y-2 text-xs divide-y divide-slate-100 border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Scheme Name</span>
                <span className="font-bold text-slate-900">{selectedReceipt.schemeName}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Ministry / Authority</span>
                <span className="font-semibold text-slate-800">{selectedReceipt.authority}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Citizen Name</span>
                <span className="font-bold text-slate-900">
                  {selectedReceipt.applicantDetails?.name}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Aadhaar (Masked)</span>
                <span className="font-mono text-slate-800">
                  {selectedReceipt.applicantDetails?.aadhaarMasked}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Submission Timestamp</span>
                <span className="font-semibold text-slate-800">
                  {new Date(selectedReceipt.submittedAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Current Status</span>
                <span className="font-bold text-emerald-600">{selectedReceipt.status}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Copy</span>
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="py-2.5 px-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}


      {/* DigiLocker Sub-Modal */}
      <DigiLockerModal
        isOpen={digiLockerModalOpen}
        onClose={() => setDigiLockerModalOpen(false)}
        onLinkedSuccess={() => {
          setDigiLockerModalOpen(false);
          loadAllData();
        }}
      />
    </div>
  );
}
