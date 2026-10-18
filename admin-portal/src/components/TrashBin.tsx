import React, { useState } from 'react';
import { TrashData } from '../types';
import { adminApi } from '../services/api';
import { RotateCcw, Trash2, AlertTriangle, Check, MapPin, MessageSquare, User } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface TrashBinProps {
  trash: TrashData | null;
  onRefresh: () => void;
}

export default function TrashBin({ trash, onRefresh }: TrashBinProps) {
  const { success, error: toastError } = useToast();
  const [activeSubTab, setActiveSubTab] = useState<'places' | 'comments' | 'users'>('places');
  const [processingId, setProcessingId] = useState<string | null>(null);

  if (!trash) return null;

  const handleRestorePlace = async (id: string, title: string) => {
    setProcessingId(id);
    try {
      await adminApi.restorePlace(id);
      success(`ກູ້ຄືນສະຖານທີ່ "${title}" ສຳເລັດແລ້ວ!`);
      onRefresh();
    } catch (e: any) {
      toastError(`Error: ${e.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRestoreComment = async (id: string) => {
    setProcessingId(id);
    try {
      await adminApi.restoreComment(id);
      success(`ກູ້ຄືນຄອມເມັ້ນສຳເລັດແລ້ວ!`);
      onRefresh();
    } catch (e: any) {
      toastError(`Error: ${e.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRestoreUser = async (id: string, name: string) => {
    setProcessingId(id);
    try {
      await adminApi.restoreUser(id);
      success(`ກູ້ຄືນບັນຊີຜູ້ໃຊ້ "${name}" ສຳເລັດແລ້ວ!`);
      onRefresh();
    } catch (e: any) {
      toastError(`Error: ${e.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handlePermanentDeletePlace = async (id: string, title: string) => {
    if (
      !confirm(
        `⚠️ ຄຳເຕືອນ: ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບ "${title}" ຖາວອນ? ຂໍ້ມູນ ແລະ ຮູບພາບທັງໝົດຈະບໍ່ສາມາດກູ້ຄືນໄດ້ອີກ! (Permanent deletion cannot be undone!)`
      )
    ) {
      return;
    }

    setProcessingId(id);
    try {
      await adminApi.hardDeletePlace(id);
      success(`ລຶບຖາວອນ "${title}" ແລ້ວ!`);
      onRefresh();
    } catch (e: any) {
      toastError(`Error: ${e.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-rose-600" />
            <h2 className="text-lg font-bold text-stone-900 font-lao">
              ຖັງຂີ້ເຫຍື້ອລະບົບ (Soft-Deleted Trash Bin)
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1 font-lao">
            ລາຍການທັງໝົດທີ່ຖືກລຶບແບບ Soft Delete ສາມາດກູ້ຄືນ (Restore) ໄດ້ທຸກເວລາ ໂດຍຂໍ້ມູນບໍ່ສູນຫາຍ
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex bg-stone-100 p-1 rounded-xl self-start sm:self-auto border border-stone-200/60 font-lao">
          <button
            onClick={() => setActiveSubTab('places')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'places'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            ສະຖານທີ່ ({trash.places.length})
          </button>
          <button
            onClick={() => setActiveSubTab('comments')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'comments'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            ຄອມເມັ້ນ ({trash.comments.length})
          </button>
          <button
            onClick={() => setActiveSubTab('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'users'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            ບັນຊີຜູ້ໃຊ້ ({trash.users.length})
          </button>
        </div>
      </div>

      {/* Content based on sub-tab */}
      {activeSubTab === 'places' && (
        <div>
          {trash.places.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-xs text-stone-400 font-lao">
              ຖັງຂີ້ເຫຍື້ອສະຖານທີ່ວ່າງເປົ່າ (No soft-deleted places)
            </div>
          ) : (
            <div className="space-y-3">
              {trash.places.map((place) => (
                <div
                  key={place.id}
                  className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm font-lao">{place.title}</h4>
                      <p className="text-xs text-stone-500 font-lao">
                        {place.province} • ລຶບເມື່ອ: {place.deletedAt ? new Date(place.deletedAt).toLocaleString() : 'Recently'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleRestorePlace(place.id, place.title)}
                      disabled={processingId === place.id}
                      className="px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-semibold rounded-xl border border-teal-200 transition-colors flex items-center gap-1.5 font-lao disabled:opacity-50"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      ກູ້ຄືນ (Restore)
                    </button>
                    <button
                      onClick={() => handlePermanentDeletePlace(place.id, place.title)}
                      disabled={processingId === place.id}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5 font-lao disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      ລຶບຖາວອນ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'comments' && (
        <div>
          {trash.comments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-xs text-stone-400 font-lao">
              ບໍ່ມີຄອມເມັ້ນໃນຖັງຂີ້ເຫຍື້ອ (No trashed comments)
            </div>
          ) : (
            <div className="space-y-3">
              {trash.comments.map((c) => (
                <div
                  key={c.id}
                  className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-stone-900 font-lao">{c.content}</p>
                      <p className="text-[11px] text-stone-400 font-lao mt-0.5">
                        ສະຖານທີ່: {c.place?.title || 'Unknown'} • ໂດຍ: {c.user?.displayName || 'User'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRestoreComment(c.id)}
                    disabled={processingId === c.id}
                    className="px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-semibold rounded-xl border border-teal-200 transition-colors flex items-center gap-1.5 font-lao self-end sm:self-auto disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    ກູ້ຄືນ (Restore)
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'users' && (
        <div>
          {trash.users.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-xs text-stone-400 font-lao">
              ບໍ່ມີບັນຊີຜູ້ໃຊ້ໃນຖັງຂີ້ເຫຍື້ອ (No soft-deleted users)
            </div>
          ) : (
            <div className="space-y-3">
              {trash.users.map((u) => (
                <div
                  key={u.id}
                  className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-900 font-lao">{u.displayName}</p>
                      <p className="text-[11px] text-stone-400 font-mono">
                        {u.username ? `@${u.username}` : ''} {u.phoneNumber ? `• 📞 ${u.phoneNumber}` : ''}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRestoreUser(u.id, u.displayName)}
                    disabled={processingId === u.id}
                    className="px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-semibold rounded-xl border border-teal-200 transition-colors flex items-center gap-1.5 font-lao self-end sm:self-auto disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    ກູ້ຄືນບັນຊີ (Restore User)
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
