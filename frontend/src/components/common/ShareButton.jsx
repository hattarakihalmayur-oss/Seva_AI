import React, { useState } from 'react';
import { Share2 } from 'lucide-react';
import ShareModal from './ShareModal';

export default function ShareButton({
  title,
  text,
  url,
  variant = 'default', // 'default' | 'icon' | 'primary' | 'subtle'
  className = '',
  label = 'Share',
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Variant styling
  let baseStyle = 'inline-flex items-center gap-1.5 transition-all text-xs font-semibold';
  
  if (variant === 'icon') {
    baseStyle = 'p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors';
  } else if (variant === 'primary') {
    baseStyle += ' px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-xs';
  } else if (variant === 'subtle') {
    baseStyle += ' px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs';
  } else {
    // Default
    baseStyle += ' px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 text-slate-700 shadow-2xs';
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`${baseStyle} ${className}`}
        title="Share with WhatsApp, Instagram, LinkedIn, or Copy Link"
      >
        <Share2 className="w-3.5 h-3.5 flex-shrink-0" />
        {variant !== 'icon' && <span>{label}</span>}
      </button>

      <ShareModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={title}
        text={text}
        url={url}
      />
    </>
  );
}
