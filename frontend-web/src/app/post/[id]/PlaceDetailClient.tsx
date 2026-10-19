'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/layout/Navbar';
import { api } from '../../../lib/api';
import { Place, PlaceComment } from '../../../types/api';
import { useAuth } from '../../../context/AuthContext';
import { Language, translations } from '../../../lib/i18n';
import {
  ArrowLeft,
  MapPin,
  Heart,
  MessageSquare,
  Share2,
  Clock,
  Phone,
  Send,
  Star,
  Check,
  CheckCircle2,
  Sparkles,
  Trophy,
  ExternalLink,
  DollarSign,
  Compass,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Image as ImageIcon,
  Loader2,
  Paperclip,
  CornerDownRight,
} from 'lucide-react';
import ShareModal from '../../../components/common/ShareModal';
import { compressMultipleImages } from '../../../lib/image-compressor';
import dynamic from 'next/dynamic';

const PlaceLocationMap = dynamic(
  () => import('../../../components/places/PlaceLocationMap'),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs h-64 flex items-center justify-center text-xs text-stone-400">
        Loading map & directions...
      </div>
    ),
  }
);

interface PlaceDetailClientProps {
  id: string;
}

export default function PlaceDetailClient({ id }: PlaceDetailClientProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [lang, setLang] = useState<Language>('lo');
  const t = translations[lang];

  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<PlaceComment[]>([]);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Engagement states
  const [isWannaGo, setIsWannaGo] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Comment input states
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentFiles, setCommentFiles] = useState<File[]>([]);
  const [commentPreviews, setCommentPreviews] = useState<
    { url: string; originalSize: number; compressedSize: number }[]
  >([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [activeReviewPhoto, setActiveReviewPhoto] = useState<string | null>(null);

  // Reply states
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Language from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('wtg_lang') as Language | null;
      if (savedLang && (savedLang === 'lo' || savedLang === 'en')) {
        setLang(savedLang);
      }
    }
  }, []);

  const handleLangChange = (newLang: Language) => {
    setLang(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('wtg_lang', newLang);
    }
  };

  // Fetch Place details
  useEffect(() => {
    setLoading(true);
    api.places
      .get(id)
      .then((data) => {
        setPlace(data);
        setFavoriteCount(data.favoriteCount || 0);

        // Fetch comments
        api.comments
          .list(data.id)
          .then((res) => setComments(res.items))
          .catch(() => {});

        // Check if user favorited
        if (isAuthenticated) {
          api.favorites
            .status(data.id)
            .then((res) => setIsWannaGo(res.isWannaGo))
            .catch(() => {});
        }
      })
      .catch((err) => {
        console.error('Failed to load place details', err);
      })
      .finally(() => setLoading(false));
  }, [id, isAuthenticated]);

  const handleToggleWannaGo = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!place) return;

    try {
      const res = await api.favorites.toggle(place.id, { listType: 'WANNA_GO' });
      setIsWannaGo(res.isFavorited);
      setFavoriteCount((prev) => (res.isFavorited ? prev + 1 : Math.max(0, prev - 1)));
    } catch (e) {
      // ignore
    }
  };

  const handleShare = () => {
    setIsShareOpen(true);
  };

  const handleCommentImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressing(true);
    try {
      const rawFiles = Array.from(files);
      // Run client-side compression on all images
      const compressedResults = await compressMultipleImages(rawFiles, 1280, 1280, 0.8);

      const newFiles = compressedResults.map((r) => r.file);
      const newPreviews = compressedResults.map((r) => ({
        url: URL.createObjectURL(r.file),
        originalSize: r.originalSize,
        compressedSize: r.compressedSize,
      }));

      setCommentFiles((prev) => [...prev, ...newFiles]);
      setCommentPreviews((prev) => [...prev, ...newPreviews]);
    } catch (err) {
      console.error('Image compression failed', err);
    } finally {
      setIsCompressing(false);
      e.target.value = '';
    }
  };

  const handleRemoveCommentImage = (idxToRemove: number) => {
    setCommentFiles((prev) => prev.filter((_, i) => i !== idxToRemove));
    setCommentPreviews((prev) => prev.filter((_, i) => i !== idxToRemove));
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!place || !newComment.trim()) return;

    try {
      setIsSubmittingComment(true);

      // Upload compressed images first if any
      let uploadedUrls: string[] = [];
      if (commentFiles.length > 0) {
        const uploadRes = await api.upload.multiple(commentFiles);
        uploadedUrls = uploadRes.map((r) => r.url);
      }

      const added = await api.comments.add(place.id, {
        content: newComment.trim(),
        rating,
        images: uploadedUrls,
      });

      setComments([added, ...comments]);
      setNewComment('');
      setCommentFiles([]);
      setCommentPreviews([]);
    } catch (err) {
      console.error('Failed to add comment', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleAddReply = async (parentCommentId: string) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!place || !replyText.trim()) return;

    try {
      setIsSubmittingReply(true);
      const added = await api.comments.add(place.id, {
        content: replyText.trim(),
        parentId: parentCommentId,
      });

      setComments((prev) =>
        prev.map((c) => {
          if (c.id === parentCommentId) {
            return {
              ...c,
              replies: [...(c.replies || []), added],
            };
          }
          return c;
        })
      );
      setReplyText('');
      setReplyingToId(null);
    } catch (err) {
      console.error('Failed to post reply', err);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const images = place?.media && place.media.length > 0 ? place.media.map((m) => m.url) : [];
  const currentImage = images[activeImageIdx] || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1200&q=80';

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex flex-col text-stone-900 font-sans">
      <Navbar lang={lang} onLangChange={handleLangChange} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-teal-700 bg-white px-3.5 py-2 rounded-xl border border-stone-200 shadow-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'lo' ? 'ກັບຄືນໜ້າສຳຫຼວດ' : 'Back to Discovery'}</span>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="w-full h-96 bg-stone-200 rounded-3xl" />
            <div className="h-8 w-2/3 bg-stone-200 rounded-xl" />
            <div className="h-4 w-1/3 bg-stone-200 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 h-48 bg-stone-200 rounded-2xl" />
              <div className="h-48 bg-stone-200 rounded-2xl" />
            </div>
          </div>
        ) : !place ? (
          <div className="py-24 text-center bg-white rounded-3xl border border-stone-200 p-12 max-w-md mx-auto shadow-xs">
            <Compass className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-stone-900">
              {lang === 'lo' ? 'ບໍ່ພົບສະຖານທີ່ດັ່ງກ່າວ' : 'Destination Not Found'}
            </h2>
            <p className="text-xs text-stone-500 mt-1 mb-6">
              {lang === 'lo'
                ? 'ສະຖານທີ່ນີ້ອາດຈະຖືກລຶບ ຫຼື ຍັງຢູ່ໃນຂັ້ນຕອນກວດສອບ'
                : 'This place might have been removed or is pending approval.'}
            </p>
            <Link
              href="/"
              className="px-5 py-2.5 bg-teal-600 text-white text-xs font-semibold rounded-xl hover:bg-teal-700 shadow-sm"
            >
              {lang === 'lo' ? 'ໄປໜ້າຫຼັກ' : 'Explore Places'}
            </Link>
          </div>
        ) : (
          <div className="space-y-8 animate-fadeIn">
            {/* Gallery & Hero Section */}
            <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
              <div className="relative aspect-[16/9] md:aspect-[21/9] w-full bg-stone-900 overflow-hidden">
                <img
                  src={currentImage}
                  alt={place.title}
                  className="w-full h-full object-cover transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-black/20" />

                {/* Floating Top Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  {place.category && (
                    <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-xs font-bold text-teal-800 shadow-sm border border-stone-100">
                      {place.category.name}
                    </span>
                  )}
                  {favoriteCount >= 50 && (
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-black shadow-sm flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-amber-200" />
                      <span>{lang === 'lo' ? '🏆 ຍອດນິຍົມສູງສຸດ' : '🏆 Top Community Pick'}</span>
                    </span>
                  )}
                </div>

                {/* Engagement Action Bar */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <button
                    onClick={handleShare}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/90 hover:bg-white text-stone-800 text-xs font-semibold backdrop-blur-md shadow-sm transition-all"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">{t.copied}</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4 text-stone-600" />
                        <span>{t.share}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleToggleWannaGo}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold backdrop-blur-md shadow-sm transition-all ${
                      isWannaGo
                        ? 'bg-rose-500 text-white'
                        : 'bg-white/90 hover:bg-white text-stone-800'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isWannaGo ? 'fill-white' : 'text-rose-500'}`} />
                    <span>{favoriteCount} Wanna Go</span>
                  </button>
                </div>

                {/* Title & Province inside Hero */}
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="flex items-center gap-2 text-xs font-medium text-teal-200 mb-1 drop-shadow">
                    <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>
                      {place.province} {place.district ? `• ${place.district}` : ''}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight drop-shadow-md">
                    {place.title}
                  </h1>
                </div>

                {/* Prev / Next Arrows on Hero Image */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIdx((prev) => (prev - 1 + images.length) % images.length);
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 border border-white/20 z-10"
                      title="Previous Photo"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIdx((prev) => (prev + 1) % images.length);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 border border-white/20 z-10"
                      title="Next Photo"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Lightbox / Zoom Button */}
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  title="View Fullscreen Galleria"
                  className="absolute bottom-6 right-6 p-2.5 rounded-xl bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-all z-10 flex items-center gap-1.5 text-xs font-semibold"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Galleria ({images.length})</span>
                </button>
              </div>

              {/* Thumbnail strip if multiple photos */}
              {images.length > 1 && (
                <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center gap-3 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative w-20 h-14 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                        activeImageIdx === idx ? 'border-teal-600 scale-105 shadow-sm' : 'border-stone-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Main Content Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Description & Visitor Reviews */}
              <div className="lg:col-span-2 space-y-8">
                {/* Creator Attribution Box */}
                {place.user && (
                  <div className="bg-white p-5 rounded-3xl border border-stone-200 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-3">
                      {place.user.avatarUrl ? (
                        <img
                          src={place.user.avatarUrl}
                          alt=""
                          className="w-12 h-12 rounded-full object-cover border-2 border-teal-500/30"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-800 font-bold text-base flex items-center justify-center">
                          {place.user.displayName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                          {lang === 'lo' ? 'ຜູ້ໂພສສະຖານທີ່ (Author)' : 'Submitted by'}
                        </div>
                        <div className="text-sm font-bold text-stone-900">
                          {place.user.displayName}
                        </div>
                      </div>
                    </div>

                    <span className="px-3 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-200 text-xs font-semibold">
                      🌟 Creator
                    </span>
                  </div>
                )}

                {/* About & Description */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
                  <h2 className="text-lg font-bold text-stone-900">
                    {lang === 'lo' ? 'ກ່ຽວກັບສະຖານທີ່ (About this Place)' : 'About this Attraction'}
                  </h2>
                  <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                    {place.description || (lang === 'lo' ? 'ບໍ່ມີລາຍລະອຽດເພີ່ມເຕີມ' : 'No description provided.')}
                  </p>

                  {place.address && (
                    <div className="pt-4 border-t border-stone-100 flex items-start gap-2.5 text-xs text-stone-600">
                      <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-stone-800">{lang === 'lo' ? 'ທີ່ຕັ້ງລະອຽດ: ' : 'Address: '}</span>
                        <span>{place.address}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Visitor Reviews & Comments */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                    <div>
                      <h3 className="text-base font-bold text-stone-900">
                        {lang === 'lo' ? 'ຄຳຕິຊົມ ແລະ ຄະແນນຈາກນັກທ່ອງທ່ຽວ' : 'Visitor Reviews & Experiences'}
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {comments.length} {lang === 'lo' ? 'ຣີວິວຈາກນັກທ່ອງທ່ຽວ' : 'reviews from real travelers'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-extrabold">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                      <span>
                        {comments.length > 0
                          ? (
                              comments.reduce((acc, c) => acc + (c.rating || 5), 0) /
                              comments.length
                            ).toFixed(1)
                          : '5.0'}
                      </span>
                    </div>
                  </div>

                  {/* Add Review Form */}
                  <form onSubmit={handleAddComment} className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-700">
                        {lang === 'lo' ? 'ຂຽນຣີວິວ ແລະ ໃຫ້ຄະແນນ' : 'Leave a Review & Rating'}
                      </span>
                      {/* 5-Star Rating Selector */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setRating(star)}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`w-4 h-4 ${
                                star <= rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-stone-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea
                      rows={2}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={
                        isAuthenticated
                          ? lang === 'lo'
                            ? 'ແບ່ງປັນປະສົບການ, ເວລາທີ່ເໝາະສົມ, ສະພາບເສັ້ນທາງ...'
                            : 'Share your tips, road conditions, best time to visit...'
                          : lang === 'lo'
                            ? 'ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນເພື່ອຂຽນຣີວິວ'
                            : 'Please sign in to write a review'
                      }
                      disabled={!isAuthenticated || isSubmittingComment}
                      className="w-full p-3 rounded-xl border border-stone-200 text-xs bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                    />

                    {/* Image Previews & Compression Status */}
                    {isCompressing && (
                      <div className="flex items-center gap-2 text-xs text-teal-700 bg-teal-50 p-2.5 rounded-xl border border-teal-200 animate-pulse">
                        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                        <span>
                          {lang === 'lo'
                            ? 'ກຳລັງບີບອັດຮູບພາບທັງໝົດດ້ວຍລະບົບ WebP Compressor...'
                            : 'Compressing all images with client WebP engine...'}
                        </span>
                      </div>
                    )}

                    {commentPreviews.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-stone-500">
                          <span>
                            {lang === 'lo' ? 'ຮູບພາບທີ່ຖືກບີບອັດແລ້ວ' : 'Compressed Attachments'}{' '}
                            ({commentPreviews.length})
                          </span>
                          <span className="text-teal-700 font-medium">
                            {lang === 'lo' ? '✓ ພ້ອມອັບໂຫຼດ' : '✓ Ready to upload'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {commentPreviews.map((p, idx) => (
                            <div
                              key={idx}
                              className="relative group rounded-xl overflow-hidden border border-stone-200 bg-white w-20 h-20 shadow-xs"
                            >
                              <img src={p.url} alt="" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => handleRemoveCommentImage(idx)}
                                className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/90 text-white rounded-full transition-all"
                              >
                                <X className="w-3 h-3" />
                              </button>
                              <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] px-1 py-0.5 text-center truncate">
                                {Math.round(p.compressedSize / 1024)} KB
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      {/* Attach Photos Button */}
                      <label
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                          !isAuthenticated || isSubmittingComment || isCompressing
                            ? 'opacity-50 cursor-not-allowed bg-stone-100 text-stone-400 border-stone-200'
                            : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100 active:bg-stone-200 shadow-xs'
                        }`}
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-teal-600" />
                        <span>
                          {lang === 'lo' ? 'ແນບຮູບພາບ (ຫຼາຍຮູບ)' : 'Attach Photos (Multi)'}
                        </span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          disabled={!isAuthenticated || isSubmittingComment || isCompressing}
                          onChange={handleCommentImageSelect}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="submit"
                        disabled={
                          !isAuthenticated ||
                          isSubmittingComment ||
                          isCompressing ||
                          !newComment.trim()
                        }
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>
                          {isSubmittingComment
                            ? lang === 'lo'
                              ? 'ກຳລັງສົ່ງ...'
                              : 'Posting...'
                            : lang === 'lo'
                              ? 'ສົ່ງຣີວິວ'
                              : 'Post Review'}
                        </span>
                      </button>
                    </div>
                  </form>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {comments.length === 0 ? (
                      <p className="text-xs text-stone-400 italic text-center py-4">
                        {lang === 'lo'
                          ? 'ຍັງບໍ່ມີຄຳຕິຊົມເທື່ອ. ມາເປັນຄົນທຳອິດທີ່ຂຽນຣີວິວ!'
                          : 'No reviews yet. Be the first to share your experience!'}
                      </p>
                    ) : (
                      comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="p-4 rounded-2xl bg-stone-50 border border-stone-200/60 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold flex items-center justify-center">
                                {comment.user?.displayName.charAt(0) || 'V'}
                              </div>
                              <span className="text-xs font-bold text-stone-800">
                                {comment.user?.displayName || 'Traveler'}
                              </span>
                            </div>

                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: comment.rating || 5 }).map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                          </div>

                          <p className="text-xs text-stone-700 leading-relaxed pl-8">
                            {comment.content}
                          </p>

                          {/* Review Attached Photos Gallery */}
                          {comment.images && comment.images.length > 0 && (
                            <div className="pl-8 pt-1 flex flex-wrap gap-2">
                              {comment.images.map((imgUrl, imgIdx) => (
                                <button
                                  key={imgIdx}
                                  type="button"
                                  onClick={() => setActiveReviewPhoto(imgUrl)}
                                  className="w-16 h-16 rounded-xl overflow-hidden border border-stone-200/80 hover:opacity-90 hover:scale-105 transition-all shadow-xs"
                                >
                                  <img
                                    src={imgUrl}
                                    alt="Review photo"
                                    className="w-full h-full object-cover"
                                  />
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Reply Trigger Action */}
                          <div className="pl-8 pt-1 flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                if (!isAuthenticated) {
                                  router.push('/login');
                                  return;
                                }
                                setReplyingToId(replyingToId === comment.id ? null : comment.id);
                                setReplyText('');
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-500 hover:text-teal-700 transition-colors"
                            >
                              <CornerDownRight className="w-3.5 h-3.5 text-teal-600" />
                              <span>{lang === 'lo' ? 'ຕອບກັບ' : 'Reply'}</span>
                              {comment.replies && comment.replies.length > 0 && (
                                <span className="text-[10px] text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded-full border border-teal-200 font-bold">
                                  {comment.replies.length}
                                </span>
                              )}
                            </button>
                          </div>

                          {/* Inline Reply Input Box */}
                          {replyingToId === comment.id && (
                            <div className="pl-8 pt-2">
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder={lang === 'lo' ? 'ຂຽນຄຳຕອບກັບ...' : 'Write a reply...'}
                                  className="flex-1 text-xs px-3 py-1.5 rounded-xl border border-stone-200 bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleAddReply(comment.id);
                                    }
                                  }}
                                />
                                <button
                                  type="button"
                                  disabled={isSubmittingReply || !replyText.trim()}
                                  onClick={() => handleAddReply(comment.id)}
                                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                                >
                                  {isSubmittingReply ? '...' : lang === 'lo' ? 'ຕອບ' : 'Reply'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setReplyingToId(null)}
                                  className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg text-xs"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Nested Replies List */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="ml-8 mt-2.5 pl-3 border-l-2 border-teal-200 space-y-2">
                              {comment.replies.map((reply) => (
                                <div
                                  key={reply.id}
                                  className="bg-white p-3 rounded-xl border border-stone-200/70 shadow-2xs space-y-1"
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-[9px] font-bold flex items-center justify-center">
                                      {reply.user?.displayName.charAt(0) || 'U'}
                                    </div>
                                    <span className="text-[11px] font-bold text-stone-800">
                                      {reply.user?.displayName || 'User'}
                                    </span>
                                    <span className="text-[9px] text-teal-700 font-medium bg-teal-50 px-1.5 py-0.2 rounded-full border border-teal-200">
                                      {lang === 'lo' ? 'ຕອບກັບ' : 'Reply'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-stone-700 pl-7 leading-relaxed">
                                    {reply.content}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Location Map & Pricing */}
              <div className="space-y-6">
                {/* Interactive Map & Direct Navigation */}
                <PlaceLocationMap
                  placeTitle={place.title}
                  latitude={place.latitude}
                  longitude={place.longitude}
                  province={place.province}
                  address={place.address}
                  lang={lang}
                />

                {/* Dual Currency Pricing Card */}
                <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-teal-600" />
                    <span>{lang === 'lo' ? 'ລາຄາຄ່າທ່ຽວຊົມ (Entrance Fee)' : 'Admission & Prices'}</span>
                  </h3>

                  <div className="space-y-3">
                    <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200/70">
                      <div className="text-[11px] font-semibold text-teal-800">
                        🇱🇦 {t.priceLao}
                      </div>
                      <div className="text-lg font-black text-teal-900 mt-0.5">
                        {place.priceLao || place.priceRange || (lang === 'lo' ? 'ຟຣີ / ບໍ່ລະບຸ' : 'Free / Not specified')}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/70">
                      <div className="text-[11px] font-semibold text-amber-800">
                        🌐 {t.priceForeigner}
                      </div>
                      <div className="text-lg font-black text-amber-900 mt-0.5">
                        {place.priceForeigner || (lang === 'lo' ? 'ອີງຕາມອັດຕາແລກປ່ຽນ' : 'Standard rate')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Info Card */}
                <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-3 text-xs">
                  <h3 className="font-bold text-stone-900">
                    {lang === 'lo' ? 'ຂໍ້ມູນທົ່ວໄປ (Quick Info)' : 'Quick Info'}
                  </h3>

                  <div className="flex items-center justify-between py-2 border-b border-stone-100">
                    <span className="text-stone-500">{lang === 'lo' ? 'ແຂວງ' : 'Province'}:</span>
                    <span className="font-semibold text-stone-800">{place.province}</span>
                  </div>

                  {place.district && (
                    <div className="flex items-center justify-between py-2 border-b border-stone-100">
                      <span className="text-stone-500">{lang === 'lo' ? 'ເມືອງ' : 'District'}:</span>
                      <span className="font-semibold text-stone-800">{place.district}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between py-2 border-b border-stone-100">
                    <span className="text-stone-500">{lang === 'lo' ? 'ຍອດຜູ້ເຂົ້າຊົມ' : 'Total Views'}:</span>
                    <span className="font-semibold text-stone-800">{place.viewCount || 0}</span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className="text-stone-500">{lang === 'lo' ? 'ສະຖານະ' : 'Status'}:</span>
                    <span className="font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                      ✓ Approved
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-8 px-4 text-center text-xs text-stone-500">
        <p className="font-semibold text-stone-800">
          Copyright © 2026 Make by Med newbie DEV. All rights reserved.
        </p>
        <p className="text-stone-600 max-w-xl mx-auto leading-relaxed mt-1">
          {lang === 'lo'
            ? 'ສ້າງຂຶ້ນເພື່ອໂຄສະນາປະເທດລາວສູ່ສາຍຕາຊາວໂລກ ສຳລັບທຸກຄົນທີ່ຢາກມາທ່ຽວລາວ ແລະ ຊ່ວຍສົ່ງເສີມທຸລະກິດລາວໃຫ້ເຕີບໃຫຍ່ :)'
            : 'Use for advertise Laos country to the world who wanna visit Laos and grow Laos business :)'}
        </p>
      </footer>

      {/* Share Modal */}
      {place && (
        <ShareModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          title={place.title}
          url={typeof window !== 'undefined' ? window.location.href : `/post/${place.slug || place.id}`}
          coverImage={images[0]}
          category={place.category?.name}
          province={place.province}
        />
      )}

      {/* Fullscreen Galleria Lightbox */}
      {isLightboxOpen && place && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white z-10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">{place.title}</span>
              <span className="text-xs text-stone-400">
                ({activeImageIdx + 1} / {images.length})
              </span>
            </div>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Image with Arrows */}
          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[activeImageIdx]}
              alt=""
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl transition-all"
            />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveImageIdx((prev) => (prev - 1 + images.length) % images.length)}
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 transition-all"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImageIdx((prev) => (prev + 1) % images.length)}
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 transition-all"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 z-10" onClick={(e) => e.stopPropagation()}>
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                    activeImageIdx === idx ? 'border-amber-400 scale-105' : 'border-white/20 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Review Photo Preview Modal */}
      {activeReviewPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setActiveReviewPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setActiveReviewPhoto(null)}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={activeReviewPhoto}
              alt="Review attachment"
              className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
