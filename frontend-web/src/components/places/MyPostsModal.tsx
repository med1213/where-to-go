'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Place } from '../../types/api';
import { translations, Language } from '../../lib/i18n';
import {
  X,
  Compass,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  Trash2,
  Edit2,
  Check,
  RefreshCw,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import ShareModal from '../common/ShareModal';

interface MyPostsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onPlaceUpdated?: () => void;
}

export default function MyPostsModal({
  isOpen,
  onClose,
  lang,
  onPlaceUpdated,
}: MyPostsModalProps) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sharingPlace, setSharingPlace] = useState<Place | null>(null);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    priceLao: '',
    priceForeigner: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const t = translations[lang];

  const fetchMyPlaces = async () => {
    setIsLoading(true);
    setMsg(null);
    try {
      const data = await api.places.myPlaces();
      setPlaces(data);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to load your posts' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMyPlaces();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleShare = (place: Place) => {
    setSharingPlace(place);
  };

  const handleDelete = async (place: Place) => {
    if (!window.confirm(t.confirmDeletePost)) return;

    try {
      await api.places.delete(place.id);
      setMsg({ type: 'success', text: 'ໂພສຖືກລຶບສໍາເລັດແລ້ວ' });
      await fetchMyPlaces();
      if (onPlaceUpdated) onPlaceUpdated();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to delete post' });
    }
  };

  const openEdit = (p: Place) => {
    setEditingPlace(p);
    setEditForm({
      title: p.title,
      description: p.description,
      priceLao: p.priceLao || '',
      priceForeigner: p.priceForeigner || '',
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlace) return;

    setIsSubmitting(true);
    try {
      await api.places.update(editingPlace.id, editForm);
      setMsg({ type: 'success', text: 'ອັບເດດໂພສສໍາເລັດແລ້ວ' });
      setEditingPlace(null);
      await fetchMyPlaces();
      if (onPlaceUpdated) onPlaceUpdated();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to update place' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-stone-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 to-teal-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">{t.myPostsTitle}</h3>
              <p className="text-xs text-teal-100/80">
                {places.length} {lang === 'lo' ? 'ສະຖານທີ່ທີ່ທ່ານແບ່ງປັນ' : 'spots shared by you'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-teal-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {msg && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                msg.type === 'error'
                  ? 'bg-rose-50 border border-rose-200 text-rose-700'
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              }`}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{msg.text}</span>
            </div>
          )}

          {isLoading ? (
            <div className="py-12 text-center text-stone-400 flex flex-col items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-teal-600" />
              <span className="text-xs">Loading your posts...</span>
            </div>
          ) : places.length === 0 ? (
            <div className="py-12 text-center text-stone-400">
              <Compass className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-stone-700">{t.myPostsEmpty}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {places.map((place) => {
                const cover = place.media?.[0]?.url || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=600';
                const isCopied = copiedId === place.id;

                return (
                  <div
                    key={place.id}
                    className="p-4 rounded-2xl border border-stone-200 hover:border-teal-400/40 bg-stone-50/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={cover}
                        alt=""
                        className="w-16 h-16 rounded-xl object-cover border border-stone-200 flex-shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-stone-900 text-sm line-clamp-1">
                            {place.title}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              place.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : place.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-800 animate-pulse'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {place.status === 'APPROVED' && t.statusApproved}
                            {place.status === 'PENDING' && t.statusPending}
                            {place.status === 'REJECTED' && t.statusRejected}
                          </span>
                        </div>

                        <p className="text-[11px] text-stone-500">
                          {place.province} {place.district ? `• ${place.district}` : ''} • {place.category?.name}
                        </p>

                        {/* Dual Currency Price Display */}
                        {(place.priceLao || place.priceForeigner) && (
                          <div className="flex items-center gap-2 text-[10px] text-teal-700 font-semibold">
                            {place.priceLao && <span>🇱🇦 {place.priceLao}</span>}
                            {place.priceForeigner && <span>🌐 {place.priceForeigner}</span>}
                          </div>
                        )}

                        {/* Metrics: views, likes, comments */}
                        <div className="flex items-center gap-3 text-stone-400 text-[11px] pt-1">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5 text-stone-500" />
                            {place.viewCount} {t.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-50" />
                            {place.favoriteCount} {t.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                            {place.commentCount || place._count?.comments || 0} {t.comments}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons: Share, Edit, Delete */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        onClick={() => handleShare(place)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                          isCopied
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                        title="Copy Share Link"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                        <span>{isCopied ? t.copied : t.share}</span>
                      </button>

                      <button
                        onClick={() => openEdit(place)}
                        className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                        title={t.editPost}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(place)}
                        className="p-2 rounded-xl bg-white border border-stone-200 text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title={t.deletePost}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Edit Modal Popup */}
        {editingPlace && (
          <div className="p-6 border-t border-stone-200 bg-stone-50 animate-in fade-in">
            <h4 className="font-bold text-stone-900 text-sm mb-3">
              {t.editPost}: {editingPlace.title}
            </h4>
            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Place Title
                </label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  required
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t.priceLao} (LAK ₭)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 20,000 ₭"
                    value={editForm.priceLao}
                    onChange={(e) => setEditForm({ ...editForm, priceLao: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t.priceForeigner} (USD $ / LAK ₭)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. $2.00 / 50,000 ₭"
                    value={editForm.priceForeigner}
                    onChange={(e) => setEditForm({ ...editForm, priceForeigner: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPlace(null)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {sharingPlace && (
        <ShareModal
          isOpen={!!sharingPlace}
          onClose={() => setSharingPlace(null)}
          title={sharingPlace.title}
          url={typeof window !== 'undefined' ? `${window.location.origin}/post/${sharingPlace.slug || sharingPlace.id}` : `/post/${sharingPlace.slug || sharingPlace.id}`}
          coverImage={sharingPlace.media && sharingPlace.media.length > 0 ? (sharingPlace.media.find(m => m.isCover)?.url || sharingPlace.media[0].url) : undefined}
          category={sharingPlace.category?.name}
          province={sharingPlace.province}
        />
      )}
    </div>
  );
}
