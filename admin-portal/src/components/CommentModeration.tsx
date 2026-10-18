import React, { useState, useEffect } from 'react';
import { CommentItem } from '../types';
import { adminApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  MessageSquare,
  Search,
  Trash2,
  RefreshCw,
  Star,
  MapPin,
  Calendar,
  User,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Image as ImageIcon,
} from 'lucide-react';

export default function CommentModeration() {
  const { success, error: toastError } = useToast();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | 'ALL'>('ALL');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getComments(1, 100);
      setComments(data.items);
      setTotalCount(data.total);
    } catch (err: any) {
      toastError(err.message || 'ບໍ່ສາມາດໂຫຼດລາຍການຄອມເມັ້ນໄດ້');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleDelete = async (comment: CommentItem) => {
    if (
      !window.confirm(
        `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການຍ້າຍຄອມເມັ້ນຈາກ "${comment.user?.displayName || 'User'}" ໄປທີ່ຖັງຂີ້ເຫຍື້ອ (Soft Delete)?`
      )
    ) {
      return;
    }

    setDeletingId(comment.id);
    try {
      await adminApi.deleteComment(comment.id);
      success('ຍ້າຍຄອມເມັ້ນໄປທີ່ຖັງຂີ້ເຫຍື້ອສໍາເລັດແລ້ວ! (Move to Trash)');
      await fetchComments();
    } catch (err: any) {
      toastError(err.message || 'ເກີດຂໍ້ຜິດພາດໃນການລຶບ');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredComments = comments.filter((c) => {
    if (ratingFilter !== 'ALL' && c.rating !== ratingFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchText = c.content.toLowerCase().includes(q);
      const matchCommenter =
        c.user?.displayName?.toLowerCase().includes(q) ||
        (c.user?.username && c.user.username.toLowerCase().includes(q));
      const matchPlace =
        c.place?.title?.toLowerCase().includes(q) ||
        c.place?.province?.toLowerCase().includes(q);
      const matchCreator =
        c.place?.user?.displayName?.toLowerCase().includes(q) ||
        (c.place?.user?.username && c.place.user.username.toLowerCase().includes(q));

      return matchText || matchCommenter || matchPlace || matchCreator;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2 font-lao">
            <MessageSquare className="w-6 h-6 text-teal-600" />
            <span>ກວດສອບ ແລະ ຄຸ້ມຄອງຄອມເມັ້ນ (Comment Moderation)</span>
          </h2>
          <p className="text-xs text-stone-500 mt-1 font-lao">
            ສະແດງຄວາມສຳພັນຈະແຈ້ງ: ໃຜເປັນຜູ້ຂຽນຄອມເມັ້ນ • ຄອມເມັ້ນໃສ່ໂພສໃດ • ແລະ ໃຜເປັນເຈົ້າຂອງໂພສສະຖານທີ່
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchComments}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-50 border border-teal-200/60 text-teal-800 hover:bg-teal-100 text-xs font-bold shadow-xs transition-colors font-lao"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-600' : ''}`} />
            <span>ໂຫຼດໃໝ່</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="ຄົ້ນຫາ: ຊື່ຜູ້ຄອມເມັ້ນ, ຊື່ໂພສສະຖານທີ່, ຫຼື ເຈົ້າຂອງໂພສ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all font-lao"
          />
        </div>

        {/* Rating filters */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setRatingFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors font-lao ${
              ratingFilter === 'ALL'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            ທັງໝົດ ({totalCount})
          </button>
          {[5, 4, 3, 2, 1].map((r) => (
            <button
              key={r}
              onClick={() => setRatingFilter(r)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                ratingFilter === r
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <span>{r}</span>
              <Star className="w-3 h-3 fill-current" />
            </button>
          ))}
        </div>
      </div>

      {/* Structured Comments List with Crystal-Clear Relationships */}
      <div className="space-y-4">
        {filteredComments.length === 0 ? (
          <div className="bg-white p-12 text-center text-stone-400 rounded-2xl border border-stone-200 font-lao">
            ບໍ່ພົບຄອມເມັ້ນຕາມເງື່ອນໄຂ
          </div>
        ) : (
          filteredComments.map((c) => {
            const isDeleting = deletingId === c.id;
            const placeCover =
              c.place?.media && c.place.media.length > 0
                ? c.place.media[0].url
                : 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800';

            const publicPostUrl = `http://localhost:3000/post/${c.place?.slug || c.placeId}`;

            return (
              <div
                key={c.id}
                className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-shadow flex flex-col space-y-4"
              >
                {/* 1. Relationship Header Row: Target Destination Place <-> Post Creator */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100">
                  {/* Target Post Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={placeCover}
                      alt=""
                      className="w-12 h-10 rounded-lg object-cover flex-shrink-0 border border-stone-200"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 text-[10px] text-teal-700 font-bold uppercase tracking-wider">
                        <span>ສະຖານທີ່ (Destination Post)</span>
                      </div>
                      <h4 className="font-bold text-stone-900 text-xs truncate max-w-sm font-lao">
                        {c.place?.title || 'Unknown Place'}
                      </h4>
                      {c.place?.province && (
                        <p className="text-[10px] text-stone-400 flex items-center gap-1 font-lao">
                          <MapPin className="w-3 h-3 text-amber-500" />
                          <span>{c.place.province} {c.place.district ? `(${c.place.district})` : ''}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Creator of the Post & Link to Post */}
                  <div className="flex items-center gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 sm:border-l sm:pl-3 border-stone-200">
                    {c.place?.user && (
                      <div className="flex items-center gap-2">
                        {c.place.user.avatarUrl ? (
                          <img
                            src={c.place.user.avatarUrl}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover border border-amber-500/30 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center justify-center">
                            {c.place.user.displayName.charAt(0)}
                          </div>
                        )}
                        <div className="text-left">
                          <div className="text-[10px] text-stone-400 font-medium">ເຈົ້າຂອງໂພສ (Creator):</div>
                          <div className="text-xs font-bold text-stone-800 font-lao truncate max-w-[120px]">
                            {c.place.user.displayName}
                          </div>
                        </div>
                      </div>
                    )}

                    <a
                      href={publicPostUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-white border border-stone-200 text-stone-600 hover:text-teal-700 hover:bg-stone-50 transition-colors shadow-2xs"
                      title="View public destination page"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* 2. Commenter & Review Details */}
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  {/* Commenter profile */}
                  <div className="flex items-center gap-2.5">
                    {c.user?.avatarUrl ? (
                      <img
                        src={c.user.avatarUrl}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover border-2 border-teal-500/20"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 text-xs font-bold flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 text-xs font-lao">
                          {c.user?.displayName || 'Traveler'}
                        </span>
                        {c.user?.username && (
                          <span className="text-[10px] text-stone-400 font-mono">
                            @{c.user.username}
                          </span>
                        )}
                        <span className="px-2 py-0.2 rounded-full bg-teal-50 text-teal-700 text-[9px] font-semibold border border-teal-200">
                          ຜູ້ຂຽນຣີວິວ (Reviewer)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-stone-400 mt-0.5">
                        {c.user?.phoneNumber && <span>📞 {c.user.phoneNumber}</span>}
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(c.createdAt).toLocaleDateString()} {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rating Stars & Trash Action */}
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200/60">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= (c.rating || 5)
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-stone-200'
                          }`}
                        />
                      ))}
                      <span className="text-xs font-black text-amber-700 ml-1">
                        {c.rating || 5}/5
                      </span>
                    </div>

                    <button
                      onClick={() => handleDelete(c)}
                      disabled={isDeleting}
                      title="ຍ້າຍໄປຖັງຂີ້ເຫຍື້ອ (Soft Delete)"
                      className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-stone-200 hover:border-rose-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 3. Comment Content */}
                <div className="bg-stone-50/70 p-3.5 rounded-xl border border-stone-200/70">
                  <p className="text-xs text-stone-800 leading-relaxed font-lao break-words">
                    {c.content}
                  </p>

                  {/* Attached Review Images (Multi-Images) */}
                  {c.images && c.images.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-stone-200/60 flex items-center gap-2 overflow-x-auto">
                      {c.images.map((imgUrl, imgIdx) => (
                        <a
                          key={imgIdx}
                          href={imgUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative w-16 h-14 rounded-lg overflow-hidden border border-stone-200 flex-shrink-0 group hover:opacity-90 transition-opacity"
                        >
                          <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
