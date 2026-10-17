import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LogIn,
  AlertCircle,
  Sparkles,
  KeyRound,
  Mail,
  Phone,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { generateLoginOtp } from '../api/auth.api';

export default function LoginPage() {
  const { login, loginWithOtp, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // Authentication mode: 'otp' (default) or 'password'
  const [loginMode, setLoginMode] = useState('otp');

  // Mobile OTP state
  const [mobile, setMobile] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [generatedDemoOtp, setGeneratedDemoOtp] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpLoading, setOtpLoading] = useState(false);

  // Password state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Status & notifications
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Target destination and pending scheme
  const from = location.state?.from?.pathname || '/dashboard';
  const applyScheme = location.state?.applyScheme || (() => {
    try {
      const stored = sessionStorage.getItem('bharatseva_pending_apply_scheme');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  // Countdown timer for resending OTP
  useEffect(() => {
    let timer;
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setInfoMessage('');

    const cleanPhone = mobile.replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setOtpLoading(true);
    try {
      const res = await generateLoginOtp(cleanPhone);
      setOtpSent(true);
      setGeneratedDemoOtp(res.otp || '123456');
      setOtpCountdown(30);
      setInfoMessage(res.message || `OTP sent to +91 ******${cleanPhone.slice(-4)}`);
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || 'Failed to send OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    const cleanPhone = mobile.replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (!otp || otp.trim().length !== 6) {
      setError('Please enter the 6-digit OTP received on your mobile.');
      return;
    }

    try {
      await loginWithOtp(cleanPhone, otp.trim());
      handleSuccessfulLogin();
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || 'Invalid or expired OTP.');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError(t('allFieldsRequired') || 'All fields are required.');
      return;
    }

    try {
      await login(email, password);
      handleSuccessfulLogin();
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || 'Authentication failed.');
    }
  };

  const handleSuccessfulLogin = () => {
    if (applyScheme) {
      // Direct continue to scheme application!
      navigate(from, {
        replace: true,
        state: { autoApply: true, scheme: applyScheme },
      });
    } else {
      navigate(from, { replace: true });
    }
  };

  const handleFillDemoMobile = () => {
    setMobile('9876543210');
    setError('');
  };

  const handleFillDemoPassword = () => {
    setEmail('ramesh.farmer@example.com');
    setPassword('DemoCitizen@2026');
    setError('');
  };

  const handleAutoFillOtp = () => {
    setOtp(generatedDemoOtp || '123456');
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Pending Scheme Direct Application Header */}
        {applyScheme && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200 text-xs flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-orange-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-2xs mt-0.5">
              🤖
            </div>
            <div>
              <p className="font-bold text-orange-900">
                Sign In to Apply for Scheme
              </p>
              <p className="text-[11px] text-orange-800 leading-snug mt-0.5">
                Applying for <strong>{applyScheme.name}</strong>. Once signed in, your DigiLocker AI application will continue automatically.
              </p>
            </div>
          </div>
        )}

        {/* Title Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto shadow-2xs font-bold text-xl">
            भ
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {t('citizenLoginTitle') || 'Citizen Sign In'}
          </h1>
          <p className="text-xs text-slate-500">
            {t('citizenLoginSub') || 'Access government welfare schemes and DigiLocker services'}
          </p>
        </div>

        {/* Tabs: Mobile OTP vs Password */}
        <div className="flex p-1 bg-slate-100 rounded-2xl text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => {
              setLoginMode('otp');
              setError('');
            }}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              loginMode === 'otp'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Mobile OTP</span>
            <span className="text-[9px] bg-orange-100 text-orange-800 px-1.5 py-0.2 rounded-full font-semibold">
              Fast
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginMode('password');
              setError('');
            }}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              loginMode === 'password'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Password</span>
          </button>
        </div>

        {/* Errors & Alerts */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {infoMessage && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* MODE 1: MOBILE OTP SIGN IN */}
        {loginMode === 'otp' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Enter Mobile Number (Aadhaar / DigiLocker linked)
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-300 bg-slate-50 text-slate-600 text-xs font-bold">
                  +91
                </span>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="9876543210"
                  maxLength={10}
                  disabled={otpLoading}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800 font-medium"
                />
              </div>
            </div>

            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={otpLoading || !mobile.trim()}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {otpLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Generating OTP...</span>
                  </span>
                ) : (
                  <>
                    <span>Generate OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-3.5 animate-in fade-in duration-200">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Enter 6-Digit OTP
                    </label>
                    {otpCountdown > 0 ? (
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Resend in {otpCountdown}s</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-[11px] font-bold text-orange-600 hover:underline cursor-pointer"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="• • • • • •"
                    maxLength={6}
                    autoFocus
                    required
                    className="w-full px-3 py-2.5 text-center tracking-[0.4em] font-mono text-base font-bold border border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900 bg-orange-50/20"
                  />
                </div>

                {/* Instant Demo OTP helper badge */}
                <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-between text-xs text-orange-950">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
                    <span>Demo OTP: <strong>{generatedDemoOtp || '123456'}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFillOtp}
                    className="text-[10px] font-bold bg-white text-orange-700 hover:bg-orange-100 px-2 py-0.5 rounded-md border border-orange-200 shadow-2xs cursor-pointer"
                  >
                    Auto-fill
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.trim().length !== 6}
                  className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{loading ? 'Verifying OTP...' : 'Verify OTP & Sign In'}</span>
                </button>
              </form>
            )}

            {/* Quick Mobile Demo Fill */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
              <div className="flex items-center justify-between text-slate-700 font-semibold">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                  <span>Test Mobile: <strong>+91 9876543210</strong></span>
                </span>
                <button
                  type="button"
                  onClick={handleFillDemoMobile}
                  className="text-[10px] text-orange-700 underline font-bold cursor-pointer"
                >
                  Use Demo Mobile
                </button>
              </div>
              <p className="text-[10px] text-slate-500">
                Works for any 10-digit number. Existing profiles are loaded; new numbers get auto-provisioned.
              </p>
            </div>
          </div>
        )}

        {/* MODE 2: EMAIL & PASSWORD SIGN IN */}
        {loginMode === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('emailAddress') || 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  {t('passwordLabel') || 'Password'}
                </label>
                <span className="text-[11px] text-orange-600 hover:underline cursor-pointer">
                  {t('forgotPassword') || 'Forgot?'}
                </span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? (t('authenticating') || 'Signing In...') : (t('signInBtn') || 'Sign In with Password')}</span>
            </button>

            {/* Demo Fast-Fill Box */}
            <div className="p-3 bg-orange-50/70 border border-orange-200/80 rounded-2xl text-xs space-y-1">
              <div className="flex items-center justify-between text-orange-900 font-semibold">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                  <span>Demo Citizen Password</span>
                </span>
                <button
                  type="button"
                  onClick={handleFillDemoPassword}
                  className="text-[10px] text-orange-700 underline font-bold cursor-pointer"
                >
                  Fill Demo
                </button>
              </div>
              <p className="text-[10px] text-orange-800">
                ramesh.farmer@example.com &middot; DemoCitizen@2026
              </p>
            </div>
          </form>
        )}

        {/* Footer Link to Register */}
        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>{t('dontHaveAccount') || "Don't have an account?"} </span>
          <Link
            to="/register"
            state={location.state}
            className="font-bold text-orange-600 hover:underline"
          >
            {t('registerHere') || 'Register with Mobile Number'}
          </Link>
        </div>
      </div>
    </div>
  );
}
