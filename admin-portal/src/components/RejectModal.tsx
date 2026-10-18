import React, { useState } from 'react';
import { Place } from '../types';
import { adminApi } from '../services/api';
import { X, AlertCircle } from 'lucide-react';

interface RejectModalProps {
  place: Place | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RejectModal({
  place,
  onClose,
  onSuccess,
}: RejectModalProps) {
  const [reason, setReason] = useState('ຮູບພາບບໍ່ແຈ້ງຊັດເຈນ ຫຼື ຂໍ້ມູນສະຖານທີ່ບໍ່ຄົບຖ້ວນ');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!place) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await adminApi.rejectPlace(place.id, reason);
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(`Error rejecting place: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-stone-200 shadow-xl overflow-hidden">
        <div className="bg-rose-700 px-6 py-4 text-white flex items-center justify-between">
          <h3 className="font-bold text-sm font-lao">ປະຕິເສດສະຖານທີ່ (Reject Place)</h3>
          <button onClick={onClose} className="p-1 text-rose-200 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-xs">
            <span className="text-stone-400 block font-lao">ສະຖານທີ່:</span>
            <span className="font-bold text-stone-900 font-lao">{place.title}</span>
            <span className="text-stone-500 block text-[11px] font-lao mt-0.5">{place.province}</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5 font-lao">
              ເຫດຜົນການປະຕິເສດ (Rejection Reason) <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              required
              className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-600 focus:bg-white font-lao"
            />
            <p className="text-[11px] text-stone-400 mt-1 font-lao">
              ເຫດຜົນນີ້ຈະຖືກບັນທຶກ ແລະ ແຈ້ງຕໍ່ຜູ້ໂພສຕ໌ເພື່ອໃຫ້ປັບປຸງແກ້ໄຂ
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl font-lao"
            >
              ຍົກເລີກ (Cancel)
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm shadow-rose-700/20 font-lao disabled:opacity-50"
            >
              {isSubmitting ? 'ກຳລັງບັນທຶກ...' : 'ຢືນຢັນການປະຕິເສດ (Confirm Reject)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
