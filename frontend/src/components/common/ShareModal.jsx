import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Copy,
  Check,
  Share2,
  ExternalLink,
  MessageCircle,
  Linkedin,
  Instagram,
  Sparkles,
  Wifi,
  Globe,
  Laptop,
  AlertCircle,
  Edit2,
} from 'lucide-react';

/**
 * ShareModal
 *
 * Provides instant 1-click sharing to:
 * 1. WhatsApp
 * 2. Copy Link (Clipboard)
 * 3. Instagram (Auto-copies link + instructions for Story/DM/Bio + opens Instagram)
 * 4. LinkedIn
 * Plus smart URL detection for localhost, Wi-Fi Network IP, and Public Tunnel links.
 */
export default function ShareModal({
  isOpen,
  onClose,
  title = 'BharatSeva AI — Government Schemes & Citizen Services Portal',
  text = 'Explore and check your eligibility for 1,000+ Central and State Government schemes with BharatSeva AI.',
  url = typeof window !== 'undefined' ? window.location.href : '',
}) {
  const [copied, setCopied] = useState(false);
  const [instagramNotice, setInstagramNotice] = useState(false);
  const [editingCustomUrl, setEditingCustomUrl] = useState(false);

  // Default network Wi-Fi IP and public tunnel for seamless mobile WhatsApp sharing
  const localWifiIp = '10.193.93.79';
  const defaultTunnel = 'https://hungry-swan-99.loca.lt';

  // Saved public URL in localStorage
  const [customPublicUrl, setCustomPublicUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bharatseva_share_tunnel_url') || defaultTunnel;
    }
    return defaultTunnel;
  });

  // URL mode: 'public' | 'wifi' | 'current'
  const isLocalhost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );

  const [urlMode, setUrlMode] = useState(isLocalhost ? 'public' : 'current');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset transient feedback on open/close
  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
      setInstagramNotice(false);
      setEditingCustomUrl(false);
    }
  }, [isOpen]);

  // Compute active target URL based on mode
  const activeUrl = useMemo(() => {
    if (typeof window === 'undefined') return url || '';

    const currentPath = window.location.pathname + window.location.search + window.location.hash;

    if (!isLocalhost || urlMode === 'current') {
      return url || window.location.href;
    }

    if (urlMode === 'wifi') {
      return `http://${localWifiIp}:3000${currentPath}`;
    }

    if (urlMode === 'public') {
      const base = customPublicUrl.replace(/\/+$/, '');
      return `${base}${currentPath}`;
    }

    return url || window.location.href;
  }, [url, isLocalhost, urlMode, customPublicUrl]);

  if (!isOpen) return null;

  // Save custom public URL
  const handleSaveCustomUrl = (newVal) => {
    const trimmed = newVal.trim();
    setCustomPublicUrl(trimmed);
    try {
      localStorage.setItem('bharatseva_share_tunnel_url', trimmed);
    } catch {}
  };

  // 1. Copy Link Handler
  const handleCopy = async (textToCopy = activeUrl) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const input = document.createElement('textarea');
        input.value = textToCopy;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  // 2. WhatsApp Handler
  const handleWhatsAppShare = () => {
    // Crucial for WhatsApp: URL on a distinct new line with https/http ensures clickable hyperlink
    const waText = `${title}\n\n${text}\n\n👉 Open Portal:\n${activeUrl.trim()}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // 3. LinkedIn Handler
  const handleLinkedInShare = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(activeUrl)}`;
    window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
  };

  // 4. Instagram Handler
  const handleInstagramShare = async () => {
    await handleCopy(activeUrl);
    setInstagramNotice(true);

    if (navigator.share && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title,
          text,
          url: activeUrl,
        });
        return;
      } catch (err) {}
    }

    setTimeout(() => {
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
    }, 400);
  };

  // 5. Native Share (Mobile)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: activeUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Native share failed', err);
        }
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-600 p-5 sm:p-6 text-white flex-shrink-0">
          <button
            onClick={onClose}
            aria-label="Close share dialog"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xs">
              <Share2 className="w-4 h-4 text-white" />
            </span>
            <span className="text-xs uppercase tracking-wider font-extrabold text-white/90">
              Share With Citizens
            </span>
          </div>

          <h3 className="text-xl font-extrabold text-white leading-tight">
            Share BharatSeva AI
          </h3>
          <p className="text-xs text-white/90 mt-1 line-clamp-1">
            Share schemes and citizen welfare services directly to friends and family.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {/* Localhost Link Explanation & Selectable Mode */}
          {isLocalhost && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-[11px] text-amber-900">
                  <span className="font-bold">WhatsApp Link Tip: </span>
                  Links containing <code className="bg-amber-100 px-1 py-0.2 rounded font-mono font-bold text-amber-800">localhost</code> cannot open on phones because "localhost" means the phone itself. Choose your link type below:
                </div>
              </div>

              {/* Mode Toggle Tabs */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-amber-100/60 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setUrlMode('public')}
                  className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    urlMode === 'public'
                      ? 'bg-white text-emerald-800 font-bold shadow-xs'
                      : 'text-amber-800 hover:text-amber-950'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Public / WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUrlMode('wifi')}
                  className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    urlMode === 'wifi'
                      ? 'bg-white text-orange-800 font-bold shadow-xs'
                      : 'text-amber-800 hover:text-amber-950'
                  }`}
                >
                  <Wifi className="w-3.5 h-3.5 text-orange-600" />
                  <span>Same Wi-Fi</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUrlMode('current')}
                  className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    urlMode === 'current'
                      ? 'bg-white text-slate-800 font-bold shadow-xs'
                      : 'text-amber-800 hover:text-amber-950'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5 text-slate-600" />
                  <span>This PC only</span>
                </button>
              </div>

              {/* Explanation of chosen mode */}
              <p className="text-[10px] text-amber-800 px-1">
                {urlMode === 'public' && (
                  <span>
                    ✅ <strong>Public Link:</strong> Works on WhatsApp for anyone on mobile data, 4G/5G, or any Wi-Fi.
                  </span>
                )}
                {urlMode === 'wifi' && (
                  <span>
                    📶 <strong>Wi-Fi Link:</strong> Works on your phone when connected to the same Wi-Fi router.
                  </span>
                )}
                {urlMode === 'current' && (
                  <span>
                    💻 <strong>Localhost Link:</strong> Only opens on this computer's browser.
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Target Preview Box with edit capability for public link */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                भ
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{title}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[11px] text-emerald-700 font-mono truncate font-medium">
                    {activeUrl}
                  </span>
                  {urlMode === 'public' && (
                    <button
                      type="button"
                      onClick={() => setEditingCustomUrl(!editingCustomUrl)}
                      className="text-[10px] text-slate-500 hover:text-orange-600 flex items-center gap-0.5 underline flex-shrink-0"
                    >
                      <Edit2 className="w-2.5 h-2.5" />
                      <span>{editingCustomUrl ? 'Done' : 'Change'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Custom Public Tunnel / Domain editor if toggled */}
            {editingCustomUrl && urlMode === 'public' && (
              <div className="mt-3 pt-2.5 border-t border-slate-200">
                <label className="text-[10px] font-bold text-slate-600 block mb-1">
                  Custom Tunnel / Live Domain URL:
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="url"
                    value={customPublicUrl}
                    onChange={(e) => handleSaveCustomUrl(e.target.value)}
                    placeholder="https://your-tunnel.loca.lt or https://your-site.com"
                    className="flex-1 text-xs px-2.5 py-1.5 border border-slate-300 rounded-xl font-mono focus:outline-none focus:border-orange-500"
                  />
                  <button
                    type="button"
                    onClick={() => setEditingCustomUrl(false)}
                    className="px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-xl"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Share Channels Grid */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2.5">
              Choose Share Platform
            </label>

            <div className="grid grid-cols-2 gap-3">
              {/* 1. WhatsApp Button */}
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="group flex items-center gap-3 p-3.5 rounded-2xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 transition-all text-left shadow-2xs hover:shadow-md"
              >
                <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 2C6.516 2 2.029 6.488 2.029 12.003c0 1.764.461 3.486 1.336 5.008L2 22l5.127-1.346a9.98 9.98 0 004.904 1.35h.004c5.514 0 10.003-4.489 10.003-10.004C22.038 6.488 17.55 2 12.031 2zm0 18.272a8.27 8.27 0 01-4.223-1.155l-.303-.18-3.137.823.837-3.058-.198-.315a8.258 8.258 0 01-1.267-4.382c0-4.568 3.717-8.285 8.291-8.285 4.57 0 8.287 3.717 8.287 8.285 0 4.569-3.717 8.286-8.292 8.286zm4.544-6.205c-.249-.125-1.474-.728-1.703-.811-.228-.083-.394-.125-.561.125-.166.249-.643.811-.789.977-.145.166-.291.187-.54.062s-1.054-.388-2.008-1.239c-.742-.662-1.243-1.48-1.389-1.729-.145-.249-.015-.384.109-.508.112-.112.249-.291.374-.436.124-.145.166-.249.249-.415.083-.166.042-.312-.021-.436-.062-.125-.561-1.35-.769-1.85-.202-.488-.408-.422-.561-.43l-.478-.008c-.166 0-.436.062-.664.312-.228.249-.872.852-.872 2.078 0 1.226.893 2.41 1.018 2.576.125.166 1.756 2.682 4.254 3.761.594.257 1.059.41 1.421.525.597.19 1.141.163 1.571.099.479-.072 1.474-.602 1.682-1.185.208-.582.208-1.08.145-1.185-.062-.104-.228-.166-.477-.291z" />
                  </svg>
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                    WhatsApp
                  </span>
                  <span className="text-[10px] text-emerald-700 font-medium">
                    Chat & Status
                  </span>
                </div>
              </button>

              {/* 2. LinkedIn Button */}
              <button
                type="button"
                onClick={handleLinkedInShare}
                className="group flex items-center gap-3 p-3.5 rounded-2xl border border-sky-200 bg-sky-50/60 hover:bg-sky-100/80 transition-all text-left shadow-2xs hover:shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-[#0A66C2] text-white flex items-center justify-center flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <Linkedin className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-900 group-hover:text-sky-700">
                    LinkedIn
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Post to Network
                  </span>
                </div>
              </button>

              {/* 3. Instagram Button */}
              <button
                type="button"
                onClick={handleInstagramShare}
                className="group flex items-center gap-3 p-3.5 rounded-2xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100/80 transition-all text-left shadow-2xs hover:shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#fd1d1d] via-[#e1306c] to-[#833ab4] text-white flex items-center justify-center flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <Instagram className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-900 group-hover:text-rose-700">
                    Instagram
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Story / Bio / DM
                  </span>
                </div>
              </button>

              {/* 4. Native Device Share or More */}
              <button
                type="button"
                onClick={navigator.share ? handleNativeShare : () => handleCopy(activeUrl)}
                className="group flex items-center gap-3 p-3.5 rounded-2xl border border-orange-200 bg-orange-50/60 hover:bg-orange-100/80 transition-all text-left shadow-2xs hover:shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-900 group-hover:text-orange-700">
                    {navigator.share ? 'More Apps' : 'Copy Link'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {navigator.share ? 'Native share sheet' : 'Quick Clipboard'}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Instagram Notice Toast if activated */}
          {instagramNotice && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 animate-in fade-in duration-150">
              <Sparkles className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="text-[11px] text-rose-900">
                <span className="font-bold">Link Copied!</span> Opening Instagram... You can now paste the link directly into your Instagram Story link sticker, bio, or direct message (DM).
              </div>
            </div>
          )}

          {/* Direct Copy Link Bar */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Or Copy Formatted Link
            </label>
            <div className="flex items-center gap-2 p-1.5 pl-3 bg-slate-100/80 border border-slate-200 rounded-2xl focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
              <input
                type="text"
                readOnly
                value={activeUrl}
                aria-label="Share URL link"
                className="bg-transparent text-xs text-slate-800 font-mono w-full focus:outline-none truncate select-all"
              />
              <button
                type="button"
                onClick={() => handleCopy(activeUrl)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all flex-shrink-0 shadow-xs ${
                  copied
                    ? 'bg-emerald-600 text-white shadow-emerald-200'
                    : 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-200'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 animate-in zoom-in" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 flex-shrink-0">
          <span>BharatSeva AI Citizen Network</span>
          <button
            onClick={onClose}
            className="font-semibold text-slate-600 hover:text-slate-900"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
