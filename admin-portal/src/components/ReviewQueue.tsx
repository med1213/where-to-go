import React, { useState } from 'react';
import { Place } from '../types';
import { adminApi } from '../services/api';
import {
  Check,
  X,
  MapPin,
  Clock,
  User,
  Phone,
  Tag,
  DollarSign,
  AlertCircle,
  Eye,
} from 'lucide-react';

import { useToast } from '../context/ToastContext';

interface ReviewQueueProps {
  places: Place[];
  onRefresh: () => void;
  onOpenRejectModal: (place: Place) => void;
}

export default function ReviewQueue({
  places,
  onRefresh,
  onOpenRejectModal,
}: ReviewQueueProps) {
  const { success, error: toastError } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (placeId: string, title: string) => {
    setProcessingId(placeId);
    try {
      await adminApi.approvePlace(placeId);
      success(`ອະນຸມັດ "${title}" ສຳເລັດແລ້ວ! (Place approved successfully)`);
      onRefresh();
    } catch (err: any) {
      toastError(`Error approving place: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  if (places.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center max-w-lg mx-auto shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-stone-900 font-lao">ບໍ່ມີສະຖານທີ່ລໍຖ້າການອະນຸມັດ</h3>
        <p className="text-xs text-stone-500 mt-1 font-lao">
          All submitted attractions have been reviewed! New traveler submissions will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-stone-900 font-lao">
            ລາຍການສະຖານທີ່ລໍຖ້າອະນຸມັດ (Pending Review Queue)
          </h2>
          <p className="text-xs text-stone-500 font-lao">
            ກວດສອບລາຍລະອຽດ, ຮູບພາບ ແລະ ລາຄາກ່ອນອະນຸມັດໃຫ້ສະແດງໃນໜ້າເວັບ
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold font-lao">
          {places.length} ລາຍການລໍຖ້າ
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {places.map((place) => {
          const coverImage =
            place.media && place.media.length > 0
              ? place.media[0].url
              : 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800';

          const isActionBusy = processingId === place.id;

          return (
            <div
              key={place.id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row"
            >
              {/* Photo & Category */}
              <div className="md:w-72 relative bg-stone-100 aspect-video md:aspect-auto flex-shrink-0">
                <img
                  src={coverImage}
                  alt={place.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-stone-950/70 backdrop-blur-md text-white text-[11px] font-semibold">
                  {place.category?.name || 'Attraction'}
                </span>
                <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-amber-500 text-stone-950 text-[10px] font-extrabold uppercase tracking-wide">
                  PENDING REVIEW
                </span>
              </div>

              {/* Body Content */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-stone-900 leading-snug font-lao">
                        {place.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-teal-700 font-medium mt-1 font-lao">
                        <MapPin className="w-3.5 h-3.5 text-teal-600" />
                        <span>{place.province}</span>
                        {place.district && <span>• ເມືອງ {place.district}</span>}
                      </div>
                    </div>

                    {/* Submitter User Info */}
                    {place.user && (
                      <div className="text-right text-xs bg-stone-50 border border-stone-200/80 px-3 py-1.5 rounded-xl">
                        <span className="text-[10px] text-stone-400 block font-lao">ຜູ້ໂພສຕ໌ (Submitter)</span>
                        <span className="font-semibold text-stone-800">{place.user.displayName}</span>
                        {place.user.phoneNumber && (
                          <span className="block text-[11px] text-teal-700 font-mono">
                            📞 {place.user.phoneNumber}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-stone-600 mt-2 line-clamp-3 leading-relaxed whitespace-pre-line font-lao">
                    {place.description}
                  </p>

                  {/* Dual Pricing Box (Lao vs Foreigner) */}
                  <div className="mt-4 p-3 bg-stone-50 rounded-xl border border-stone-200/70 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Lao Price */}
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                        🇱🇦
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-stone-400 block font-lao">
                          ລາຄາຄົນລາວ (Lao Nationals)
                        </span>
                        <span className="font-bold text-stone-900 text-xs">
                          {place.priceLao || place.priceRange || 'ຟຣີ (Free / ບໍ່ລະບຸ)'}
                        </span>
                      </div>
                    </div>

                    {/* Foreigner Price */}
                    <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l sm:pl-3 border-stone-200/60">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                        🌐
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-stone-400 block font-lao">
                          ລາຄາຊາວຕ່າງຊາດ (Foreign Travelers)
                        </span>
                        <span className="font-bold text-amber-900 text-xs">
                          {place.priceForeigner || place.priceRange || 'ບໍ່ລະບຸ (Standard)'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                  <button
                    onClick={() => onOpenRejectModal(place)}
                    disabled={isActionBusy}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5 font-lao disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" />
                    ປະຕິເສດ (Reject with Reason)
                  </button>

                  <button
                    onClick={() => handleApprove(place.id, place.title)}
                    disabled={isActionBusy}
                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-semibold rounded-xl shadow-sm shadow-teal-700/20 transition-all flex items-center gap-1.5 font-lao disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {isActionBusy ? 'ກໍາລັງບັນທຶກ...' : 'ອະນຸມັດເຜີຍແຜ່ (Approve Place)'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
