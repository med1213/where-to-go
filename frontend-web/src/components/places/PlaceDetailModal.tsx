'use client';

import React, { useState, useEffect } from 'react';
import { Place, PlaceComment } from '../../types/api';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  MapPin,
  Heart,
  MessageSquare,
  Clock,
  Phone,
  Send,
  Trash2,
  Star,
  CheckCircle2,
} from 'lucide-react';

interface PlaceDetailModalProps {
  place: Place | null;
  onClose: () => void;
  onRequireAuth?: () => void;
}

export default function PlaceDetailModal({
  place,
  onClose,
  onRequireAuth,
}: PlaceDetailModalProps) {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<PlaceComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isWannaGo, setIsWannaGo] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(place?.favoriteCount || 0);

  useEffect(() => {
    if (!place) return;
    setFavoriteCount(place.favoriteCount);

    // Fetch latest comments
    api.comments
      .list(place.id)
      .then((res) => setComments(res.items))
      .catch(() => {});

    // Check favorite status if logged in
    if (isAuthenticated) {
      api.favorites
        .status(place.id)
        .then((res) => setIsWannaGo(res.isWannaGo))
        .catch(() => {});
    }
  }, [place, isAuthenticated]);

  if (!place) return null;

  const handleToggleWannaGo = async () => {
    if (!isAuthenticated) {
      if (onRequireAuth) onRequireAuth();
      return;
    }

    try {
      const res = await api.favorites.toggle(place.id, { listType: 'WANNA_GO' });
      setIsWannaGo(res.isFavorited);
      setFavoriteCount((prev) => (res.isFavorited ? prev + 1 : Math.max(0, prev - 1)));
    } catch (e) {
      // ignore
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      if (onRequireAuth) onRequireAuth();
      return;
    }

    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const added = await api.comments.add(place.id, {
        content: newComment.trim(),
        rating,
      });
      setComments([added, ...comments]);
      setNewComment('');
    } catch (e) {
      // ignore
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.comments.delete(place.id, commentId);
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (e) {
      // ignore
    }
  };

  const coverImage =
    place.media && place.media.length > 0
      ? place.media[0].url
      : 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&q=80';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-stone-200 shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col">
        {/* Hero Image & Controls */}
        <div className="relative aspect-[16/9] w-full bg-stone-900 flex-shrink-0">
          <img src={coverImage} alt={place.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-black/20 to-black/30" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Bottom Title Bar */}
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <div className="flex items-center gap-2 mb-1.5">
              {place.category && (
                <span className="px-2.5 py-0.5 rounded-full bg-teal-600 text-white text-[11px] font-semibold">
                  {place.category.name}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-amber-300 font-medium">
                <MapPin className="w-3.5 h-3.5" />
                {place.province} {place.district ? `• ${place.district}` : ''}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold leading-tight drop-shadow-md">
              {place.title}
            </h2>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Quick Action Bar: Wanna Go & Price */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <button
              onClick={handleToggleWannaGo}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${
                isWannaGo
                  ? 'bg-rose-500 text-white shadow-rose-200'
                  : 'bg-stone-100 text-stone-700 hover:bg-rose-50 hover:text-rose-600 border border-stone-200'
              }`}
            >
              <Heart className={`w-4 h-4 ${isWannaGo ? 'fill-current' : ''}`} />
              {isWannaGo ? 'In Your "I Wanna Go" List' : 'Mark as "I Wanna Go"'}
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-black/10 text-[10px]">
                {favoriteCount}
              </span>
            </button>

            {place.priceRange && (
              <span className="text-xs font-semibold text-stone-700 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200">
                Ticket: {place.priceRange}
              </span>
            )}
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-bold text-stone-400 mb-2">
              About This Attraction
            </h4>
            <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
              {place.description}
            </p>
          </div>

          {/* Details & Location */}
          {place.address && (
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-xs text-stone-600 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0" />
              <span>Address: {place.address}</span>
            </div>
          )}

          {/* Community Travel Tips & Comments */}
          <div className="pt-4 border-t border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-teal-600" />
                Community Tips & Reviews ({comments.length})
              </h4>
            </div>

            {/* Add Comment Input */}
            {isAuthenticated ? (
              <form onSubmit={handleAddComment} className="mb-6 space-y-2">
                <div className="flex items-center gap-2 text-xs text-stone-600">
                  <span>Your Rating:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setRating(s)}
                        className={`p-1 ${rating >= s ? 'text-amber-500' : 'text-stone-300'}`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share helpful tips for visiting this place..."
                    className="flex-1 px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingComment || !newComment.trim()}
                    className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-teal-700 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Post
                  </button>
                </div>
              </form>
            ) : (
              <div className="mb-4 p-3 bg-stone-50 rounded-xl text-xs text-stone-600 text-center border border-stone-200">
                <p>
                  <button
                    onClick={onRequireAuth}
                    className="font-bold text-teal-700 hover:underline"
                  >
                    Sign in
                  </button>{' '}
                  to leave travel tips and comments for this place.
                </p>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-3">
              {comments.length === 0 ? (
                <p className="text-xs text-stone-400 py-2">
                  No travel tips yet. Be the first to share your experience!
                </p>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/60 flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {comment.user.avatarUrl ? (
                          <img
                            src={comment.user.avatarUrl}
                            alt=""
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          comment.user.displayName.charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-stone-900">
                            {comment.user.displayName}
                          </span>
                          {comment.rating && (
                            <span className="flex items-center gap-0.5 text-[10px] text-amber-600 font-semibold">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              {comment.rating}/5
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-700 mt-1">{comment.content}</p>
                      </div>
                    </div>

                    {/* Soft Delete if owner or admin */}
                    {user && (user.id === comment.userId || user.role === 'ADMIN') && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        title="Soft delete comment"
                        className="text-stone-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
