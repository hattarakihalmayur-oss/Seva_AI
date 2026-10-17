import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, Check, AlertCircle, Save, ExternalLink, Cpu, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../constants/languages';
import { ALL_INDIAN_STATES, getStateDisplayName } from '../constants/indianRegions';
import { fetchDigiLockerStatus } from '../api/digilocker.api';
import DigiLockerModal from '../components/digilocker/DigiLockerModal';

const INCOME_SLABS = [
  'Below ₹1,00,000 (BPL / Antyodaya)',
  '₹1,00,000 - ₹2,50,000 (Low Income)',
  '₹2,50,000 - ₹6,00,000 (EWS / LIG)',
  '₹6,00,000 - ₹9,00,000 (MIG-I)',
  'Above ₹9,00,000',
];

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { currentLangCode, setLanguage, t } = useLanguage();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    state: user?.state || 'Karnataka',
    occupation: user?.occupation || 'Farmer',
    age: user?.age || 40,
    annualIncome: user?.annualIncome || 'Below ₹2,50,000',
    preferredLanguage: user?.preferredLanguage || currentLangCode,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [digiLockerLinked, setDigiLockerLinked] = useState(false);
  const [digiLockerDocCount, setDigiLockerDocCount] = useState(0);
  const [digiLockerModalOpen, setDigiLockerModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDigiLockerStatus()
        .then((res) => {
          if (res?.linked) {
            setDigiLockerLinked(true);
            setDigiLockerDocCount(res.account?.selectedDocuments?.length || res.account?.documentsCount || 0);
          } else {
            setDigiLockerLinked(false);
            setDigiLockerDocCount(0);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900">{t('pleaseSignIn')}</h2>
        <p className="text-xs text-slate-500 mt-2">
          {t('pleaseSignInProfileDesc')}
        </p>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProfile(formData);
    if (formData.preferredLanguage) {
      setLanguage(formData.preferredLanguage);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-orange-600 flex-shrink-0" />
          <span>{t('citizenProfileTitle')}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t('citizenProfileSub')}
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold">{t('profileSavedSuccess')}</span>
        </div>
      )}


      {/* Official DigiLocker National Document Wallet Card */}
      <div className="bg-gradient-to-r from-[#002855] via-[#003366] to-[#0a4d8c] text-white p-5 sm:p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white text-[#003366] font-black text-xl flex items-center justify-center shadow-md flex-shrink-0 border-2 border-amber-400">
            <span>DL</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold tracking-tight">DigiLocker Verified Vault</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                digiLockerLinked ? 'bg-emerald-400 text-emerald-950' : 'bg-amber-400 text-slate-900'
              }`}>
                {digiLockerLinked ? `Connected (${digiLockerDocCount} Docs)` : 'Not Connected'}
              </span>
            </div>
            <p className="text-xs text-blue-100/90 mt-1 max-w-lg leading-relaxed">
              Access your government-issued certificates (Aadhaar, Income, Land, Caste) directly via secure OAuth 2.0
              under Rule 9A of the IT Rules 2016 without physical paperwork.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDigiLockerModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-white hover:bg-blue-50 text-[#003366] font-bold text-xs shadow-md transition-all self-start sm:self-auto cursor-pointer flex items-center gap-2 whitespace-nowrap"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{digiLockerLinked ? 'Manage Documents' : 'Connect DigiLocker'}</span>
        </button>
      </div>


      {/* DigiLocker Modal Component */}
      <DigiLockerModal
        isOpen={digiLockerModalOpen}
        onClose={() => {
          setDigiLockerModalOpen(false);
          // Refresh status upon modal close
          fetchDigiLockerStatus()
            .then((res) => {
              if (res?.linked) {
                setDigiLockerLinked(true);
                setDigiLockerDocCount(res.account?.selectedDocuments?.length || res.account?.documentsCount || 0);
              } else {
                setDigiLockerLinked(false);
                setDigiLockerDocCount(0);
              }
            })
            .catch(() => {});
        }}
        onLinkedSuccess={() => {
          setDigiLockerLinked(true);
        }}
      />

      {/* Profile Form */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('fullName')}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('emailAddress')}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('phoneNumber')}
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('stateRegion')}
              </label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800 bg-white"
              >
                {ALL_INDIAN_STATES.filter(s => s !== 'All India').map((s, idx) => (
                  <option key={idx} value={s}>
                    {getStateDisplayName(s, currentLangCode)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('ageLabel')}
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('occupationLabel')}
              </label>
              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('preferredLanguageLabel')}
              </label>
              <select
                name="preferredLanguage"
                value={formData.preferredLanguage}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800 bg-white"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('annualIncomeLabel')}
            </label>
            <select
              name="annualIncome"
              value={formData.annualIncome}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800 bg-white"
            >
              {INCOME_SLABS.map((slab, idx) => (
                <option key={idx} value={slab}>{slab}</option>
              ))}
            </select>
          </div>

          {/* Privacy & Rationale Note */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-600 flex items-start gap-3 leading-relaxed">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800 block">
                {t('citizenProfileTitle')}
              </span>
              <span>{t('citizenProfileSub')}</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{t('saveProfileBtn')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
