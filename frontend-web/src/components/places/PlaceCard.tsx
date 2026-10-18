import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Place } from '../../types/api';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Eye, MessageSquare, Heart, Share2 } from 'lucide-react';
import ShareModal from '../common/ShareModal';

interface PlaceCardProps {
  place: Place;
  onOpenDetail?: (place: Place) => void;
  onRequireAuth?: () => void;
}

export default function PlaceCard({ place, onOpenDetail, onRequireAuth }: PlaceCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [favoriteCount, setFavoriteCount] = useState(place.favoriteCount);
  const [isWannaGo, setIsWannaGo] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const coverImage =
    place.media && place.media.length > 0
      ? place.media.find((m) => m.isCover)?.url || place.media[0].url
      : 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&q=80';

  const postUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/post/${place.slug || place.id}`
      : `/post/${place.slug || place.id}`;

  const handleCardClick = () => {
    if (onOpenDetail) {
      onOpenDetail(place);
    } else {
      router.push(`/post/${place.slug || place.id}`);
    }
  };

  const handleToggleWannaGo = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      if (onRequireAuth) onRequireAuth();
      return;
    }

    setIsToggling(true);
    try {
      const res = await api.favorites.toggle(place.id, { listType: 'WANNA_GO' });
      setIsWannaGo(res.isFavorited);
      setFavoriteCount((prev) => (res.isFavorited ? prev + 1 : Math.max(0, prev - 1)));
    } catch (err) {
      // ignore
    } finally {
      setIsToggling(false);
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsShareOpen(true);
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className="group bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full"
      >
        {/* Cover Image Container */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
          <img
            src={coverImage}
            alt={place.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />

          {/* Gradient Shadow */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-black/10 to-transparent" />

          {/* Category & Top Liked Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
            {place.category && (
              <div className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[11px] font-bold text-teal-800 shadow-sm border border-stone-100">
                {place.category.name}
              </div>
            )}
            {favoriteCount >= 50 && (
              <div className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-black shadow-sm flex items-center gap-1">
                <span>🏆 Top Liked & Reviews</span>
              </div>
            )}
          </div>

          {/* Share & 'I Wanna Go' Buttons */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleShareClick}
              title="Share Place (Facebook, WhatsApp, Copy Link...)"
              className="p-2 rounded-full backdrop-blur-md bg-white/85 text-stone-700 hover:bg-white hover:text-teal-700 transition-all shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleToggleWannaGo}
              disabled={isToggling}
              title="Mark as 'I Wanna Go' (ຢາກໄປ)"
              className={`p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${
                isWannaGo
                  ? 'bg-rose-500 text-white scale-110'
                  : 'bg-white/85 text-stone-700 hover:bg-white hover:text-rose-500'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isWannaGo ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Bottom Bar on Image: Location ONLY (Price overlay removed per request) */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center text-white text-xs font-medium">
            <div className="flex items-center gap-1 drop-shadow-sm bg-stone-950/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
              <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span className="truncate max-w-[220px]">
                {place.province} {place.district ? `(${place.district})` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1 justify-between">
          <div>
            {place.user && (
              <div className="flex items-center gap-1.5 mb-1.5 text-[11px] text-stone-500">
                {place.user.avatarUrl ? (
                  <img
                    src={place.user.avatarUrl}
                    alt=""
                    className="w-4 h-4 rounded-full object-cover border border-teal-500/20"
                  />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-teal-100 text-teal-800 text-[9px] font-bold flex items-center justify-center">
                    {place.user.displayName.charAt(0)}
                  </div>
                )}
                <span className="truncate max-w-[190px] font-medium text-stone-500">
                  ໂພສໂດຍ: <span className="font-semibold text-stone-800">{place.user.displayName}</span>
                </span>
              </div>
            )}
            <h3 className="font-bold text-stone-900 text-base leading-snug group-hover:text-teal-700 transition-colors line-clamp-1">
              {place.title}
            </h3>
            <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed font-lao">
              {place.description
                ? place.description.length > 75
                  ? `${place.description.substring(0, 75).trim()}...`
                  : place.description
                : ''}
            </p>

            {/* Price Information in Card Details (Clean & Organized, NOT on image) */}
            {(place.priceLao || place.priceForeigner || place.priceRange) && (
              <div className="mt-2.5 pt-2 border-t border-stone-100 flex flex-wrap items-center gap-2 text-[11px]">
                {place.priceLao && (
                  <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 font-semibold border border-teal-200/60">
                    🇱🇦 {place.priceLao}
                  </span>
                )}
                {place.priceForeigner && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-semibold border border-amber-200/60">
                    🌐 {place.priceForeigner}
                  </span>
                )}
                {!place.priceLao && !place.priceForeigner && place.priceRange && (
                  <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium">
                    {place.priceRange}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Meta counters: Favorites, Comments, Views */}
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-stone-600 font-medium">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                {favoriteCount} wanna go
              </span>
              <span className="flex items-center gap-1 text-stone-500">
                <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
                {place.commentCount || 0}
              </span>
            </div>

            <span className="flex items-center gap-1 text-stone-400">
              <Eye className="w-3.5 h-3.5" />
              {place.viewCount || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Share Modal Dialog */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title={place.title}
        url={postUrl}
        coverImage={coverImage}
        category={place.category?.name}
        province={place.province}
      />
    </>
  );
}
