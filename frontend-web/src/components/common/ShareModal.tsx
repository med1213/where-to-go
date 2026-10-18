'use client';

import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Share2,
  ExternalLink,
  MessageCircle,
  Send,
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
  coverImage?: string;
  category?: string;
  province?: string;
}

export default function ShareModal({
  isOpen,
  onClose,
  title,
  url,
  coverImage,
  category,
  province,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: `ໄປທ່ອງທ່ຽວສະຖານທີ່ນີ້ກັນ! ${title} (${province || 'ລາວ'})`,
          url,
        });
      } catch (err) {
        // User cancelled or unsupported
      }
    } else {
      handleCopyLink();
    }
  };

  const shareText = `ໄປທ່ອງທ່ຽວສະຖານທີ່ນີ້ກັນ! ${title} • WhereToGo Laos`;
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(shareText);

  const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`;
  const telegramUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
  const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`;
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;

  const openPopup = (shareLink: string) => {
    window.open(shareLink, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden transform transition-all p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">ແບ່ງປັນສະຖານທີ່ (Share)</h3>
              <p className="text-xs text-stone-500">Share this spot to friends & social apps</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Spot Preview */}
        <div className="mt-4 p-3 bg-stone-50 rounded-2xl flex items-center gap-3 border border-stone-100">
          {coverImage && (
            <img
              src={coverImage}
              alt={title}
              className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
            />
          )}
          <div className="min-w-0 flex-1">
            {category && (
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                {category}
              </span>
            )}
            <h4 className="font-bold text-stone-900 text-sm truncate mt-0.5">{title}</h4>
            {province && <p className="text-xs text-stone-500 truncate">{province}</p>}
          </div>
        </div>

        {/* Copy Link Section */}
        <div className="mt-5">
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
            ຄັດລອກລິ້ງ (Copy URL Link)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={url}
              className="flex-1 px-3 py-2 text-xs bg-stone-100 text-stone-700 rounded-xl border border-stone-200 font-mono truncate select-all focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-sm ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-teal-700 text-white hover:bg-teal-800'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>ຄັດລອກແລ້ວ!</span>
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

        {/* Social App Sharing Grid */}
        <div className="mt-5">
          <label className="block text-xs font-semibold text-stone-700 mb-2">
            ແບ່ງປັນໄປຍັງແອັບ (Share to Apps)
          </label>
          <div className="grid grid-cols-4 gap-2.5">
            {/* Facebook */}
            <button
              onClick={() => openPopup(fbShareUrl)}
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl border border-stone-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
                f
              </div>
              <span className="text-[11px] font-semibold text-stone-700 mt-1.5">Facebook</span>
            </button>

            {/* WhatsApp */}
            <button
              onClick={() => openPopup(whatsappUrl)}
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl border border-stone-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <MessageCircle className="w-5 h-5 fill-current" />
              </div>
              <span className="text-[11px] font-semibold text-stone-700 mt-1.5">WhatsApp</span>
            </button>

            {/* Telegram */}
            <button
              onClick={() => openPopup(telegramUrl)}
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl border border-stone-200 hover:border-sky-400 hover:bg-sky-50/50 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-[#229ED9] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <Send className="w-4 h-4 mr-0.5" />
              </div>
              <span className="text-[11px] font-semibold text-stone-700 mt-1.5">Telegram</span>
            </button>

            {/* Line / X */}
            <button
              onClick={() => openPopup(lineUrl)}
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl border border-stone-200 hover:border-green-400 hover:bg-green-50/50 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-[#06C755] text-white flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-105 transition-transform">
                LINE
              </div>
              <span className="text-[11px] font-semibold text-stone-700 mt-1.5">LINE</span>
            </button>
          </div>
        </div>

        {/* Native More Apps Button (if supported or as backup) */}
        {hasNativeShare && (
          <div className="mt-4 pt-3 border-t border-stone-100">
            <button
              onClick={handleNativeShare}
              className="w-full py-2.5 px-4 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
              <span>ແບ່ງປັນຜ່ານແອັບອື່ນໆ (More Apps on Device...)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
