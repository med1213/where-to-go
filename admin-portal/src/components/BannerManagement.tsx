import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { BannerItem, Place } from '../types';
import {
  Sliders,
  PlusCircle,
  Eye,
  Trash2,
  Edit3,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Upload,
  RefreshCw,
  Image as ImageIcon,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  MapPin,
  AlertCircle,
  Layers,
} from 'lucide-react';

interface BannerManagementProps {
  places?: Place[];
}

export default function BannerManagement({ places = [] }: BannerManagementProps) {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form State
  const [titleLo, setTitleLo] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [subtitleLo, setSubtitleLo] = useState('');
  const [subtitleEn, setSubtitleEn] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // Simulator / Preview State
  const [previewIdx, setPreviewIdx] = useState(0);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchBanners = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.getBanners();
      setBanners(data);
    } catch (err: any) {
      console.error('Failed to load banners:', err);
      setError(err.message || 'Failed to load banners');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openCreateModal = () => {
    setEditingBanner(null);
    setTitleLo('');
    setTitleEn('');
    setSubtitleLo('');
    setSubtitleEn('');
    setImageUrl('');
    setLinkUrl('');
    setPlaceId('');
    setSortOrder(banners.length);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (b: BannerItem) => {
    setEditingBanner(b);
    setTitleLo(b.titleLo || '');
    setTitleEn(b.titleEn || '');
    setSubtitleLo(b.subtitleLo || '');
    setSubtitleEn(b.subtitleEn || '');
    setImageUrl(b.imageUrl || '');
    setLinkUrl(b.linkUrl || '');
    setPlaceId(b.placeId || '');
    setSortOrder(b.sortOrder ?? 0);
    setIsActive(b.isActive ?? true);
    setIsModalOpen(true);
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('wtg_admin_token');
      const res = await fetch('http://localhost:4000/api/v1/upload/image', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setImageUrl(data.url);
      showToast('ອັບໂຫຼດຮູບພາບ ແລະ ບີບອັດເປັນ WebP ສຳເລັດ!');
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleLo.trim()) {
      alert('ກະລຸນາປ້ອນຫົວຂໍ້ພາສາລາວ (Please enter Lao title)');
      return;
    }
    if (!imageUrl.trim()) {
      alert('ກະລຸນາເລືອກຮູບພາບ Banner (Please provide an image)');
      return;
    }

    setIsSaving(true);
    try {
      const payload: Partial<BannerItem> = {
        titleLo: titleLo.trim(),
        titleEn: titleEn.trim() || null,
        subtitleLo: subtitleLo.trim() || null,
        subtitleEn: subtitleEn.trim() || null,
        imageUrl: imageUrl.trim(),
        linkUrl: linkUrl.trim() || null,
        placeId: placeId.trim() || null,
        sortOrder: Number(sortOrder) || 0,
        isActive,
      };

      if (editingBanner) {
        await adminApi.updateBanner(editingBanner.id, payload);
        showToast('ອັບເດດ Banner Slider ສຳເລັດແລ້ວ!');
      } else {
        await adminApi.createBanner(payload);
        showToast('ສ້າງ Banner Slider ໃໝ່ສຳເລັດແລ້ວ!');
      }

      setIsModalOpen(false);
      fetchBanners();
    } catch (err: any) {
      alert('Save failed: ' + (err.message || 'Error occurred'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (b: BannerItem) => {
    try {
      await adminApi.toggleBannerActive(b.id);
      setBanners((prev) =>
        prev.map((item) => (item.id === b.id ? { ...item, isActive: !item.isActive } : item))
      );
      showToast(`ປ່ຽນສະຖານະ Banner ເປັນ ${!b.isActive ? 'Active (ເປີດໃຊ້)' : 'Inactive (ປິດ)'}`);
    } catch (err: any) {
      alert('Failed to toggle status: ' + err.message);
    }
  };

  const handleDelete = async (b: BannerItem) => {
    if (!confirm(`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບ Banner "${b.titleLo}"?`)) return;

    try {
      await adminApi.deleteBanner(b.id);
      setBanners((prev) => prev.filter((item) => item.id !== b.id));
      showToast('ລຶບ Banner ສຳເລັດແລ້ວ');
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  };

  const activeBanners = banners.filter((b) => b.isActive);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-teal-800 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-teal-600 animate-slideDown">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold mb-2">
            <Sliders className="w-3.5 h-3.5" />
            <span>Hero Showcase & Marketing Engine</span>
          </div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight">
            ຈັດການ Banner Slider ໜ້າທຳອິດ (Hero Banner Slider Modules)
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            ຄວບຄຸມສະໄລ້ໂປຣໂມດສະຖານທີ່ຍອດນິຍົມ, ຮູບພາບແບນເນີ, ລິ້ງເຊື່ອມຕໍ່, ແລະ ລຳດັບການສະແດງຜົນ
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchBanners}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>ໂຫຼດຂໍ້ມູນໃໝ່</span>
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-amber-300" />
            <span>ເພີ່ມ Banner ໃໝ່ (New Banner)</span>
          </button>
        </div>
      </div>

      {/* 🌟 Live Slider Simulator / Preview */}
      {activeBanners.length > 0 && (
        <div className="bg-stone-900 p-6 rounded-3xl border border-stone-800 shadow-lg text-white space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                Live Simulator Preview (ການສະແດງຜົນຕົວຈິງໜ້າເວັບ)
              </span>
            </div>
            <span className="text-[11px] text-stone-400">
              Active: {previewIdx + 1} / {activeBanners.length} ສະໄລ້
            </span>
          </div>

          {/* Interactive Slide Viewer */}
          <div className="relative aspect-[21/9] max-h-[340px] rounded-2xl overflow-hidden border border-white/10 group">
            <img
              src={activeBanners[previewIdx % activeBanners.length]?.imageUrl}
              alt={activeBanners[previewIdx % activeBanners.length]?.titleLo}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

            {/* Slide Text Content */}
            <div className="absolute bottom-6 left-6 right-6 z-10 space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/90 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                <Sparkles className="w-3 h-3 text-amber-200" />
                <span>Featured Showcase • Order #{activeBanners[previewIdx % activeBanners.length]?.sortOrder}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {activeBanners[previewIdx % activeBanners.length]?.titleLo}
              </h3>
              {activeBanners[previewIdx % activeBanners.length]?.titleEn && (
                <p className="text-xs text-stone-300 font-medium">
                  {activeBanners[previewIdx % activeBanners.length]?.titleEn}
                </p>
              )}
              {activeBanners[previewIdx % activeBanners.length]?.subtitleLo && (
                <p className="text-xs text-stone-400 line-clamp-1 max-w-xl">
                  {activeBanners[previewIdx % activeBanners.length]?.subtitleLo}
                </p>
              )}
            </div>

            {/* Next / Prev Controls */}
            {activeBanners.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setPreviewIdx(
                      (prev) => (prev - 1 + activeBanners.length) % activeBanners.length
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/10 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setPreviewIdx((prev) => (prev + 1) % activeBanners.length)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/10 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Banner Cards Grid */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-600" />
            <h3 className="font-bold text-sm text-stone-900">
              ລາຍການ Banner ທັງໝົດ ({banners.length} ລາຍການ)
            </h3>
          </div>
          <span className="text-xs text-stone-500">
            ເປີດໃຊ້ງານ: <strong className="text-teal-700">{activeBanners.length}</strong> | ປິດ: {banners.length - activeBanners.length}
          </span>
        </div>

        {banners.length === 0 && !isLoading ? (
          <div className="py-12 text-center space-y-3">
            <ImageIcon className="w-12 h-12 text-stone-300 mx-auto" />
            <p className="text-stone-500 text-xs">ຍັງບໍ່ທັນມີ Banner ໃນລະບົບ</p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>ສ້າງ Banner ທຳອິດ</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {banners.map((b) => (
              <div
                key={b.id}
                className={`flex flex-col justify-between rounded-2xl border transition-all overflow-hidden ${
                  b.isActive
                    ? 'border-stone-200 bg-white hover:border-teal-300 shadow-xs'
                    : 'border-stone-200 bg-stone-50/70 opacity-75'
                }`}
              >
                {/* Image Header with Badges */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-stone-900">
                  <img
                    src={b.imageUrl}
                    alt={b.titleLo}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-black/60 text-white font-mono text-[10px] font-bold backdrop-blur-md">
                      #{b.sortOrder}
                    </span>
                    <button
                      onClick={() => handleToggleActive(b)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors ${
                        b.isActive
                          ? 'bg-emerald-500 text-white'
                          : 'bg-stone-600 text-stone-200'
                      }`}
                    >
                      {b.isActive ? 'Active (ສະແດງ)' : 'Inactive (ປິດ)'}
                    </button>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-stone-900 leading-snug line-clamp-1">
                      {b.titleLo}
                    </h4>
                    {b.titleEn && (
                      <p className="text-[11px] text-stone-500 font-medium line-clamp-1">
                        {b.titleEn}
                      </p>
                    )}
                    {b.subtitleLo && (
                      <p className="text-xs text-stone-400 line-clamp-2 mt-1">
                        {b.subtitleLo}
                      </p>
                    )}
                  </div>

                  {/* Destination Info */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                    <span className="inline-flex items-center gap-1 truncate max-w-[180px]">
                      <ExternalLink className="w-3 h-3 text-stone-400 flex-shrink-0" />
                      <span className="truncate">{b.linkUrl || (b.placeId ? `Place: ${b.placeId.slice(0, 8)}...` : 'No link')}</span>
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(b)}
                        className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-600 transition-colors"
                        title="ແກ້ໄຂ Banner"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(b)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors"
                        title="ລຶບ Banner"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🌟 Create / Edit Banner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-stone-200 shadow-2xl p-6 sm:p-7 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-stone-900">
                    {editingBanner ? 'ແກ້ໄຂ Banner Slider' : 'ເພີ່ມ Banner Slider ໃໝ່'}
                  </h3>
                  <p className="text-xs text-stone-400">
                    Hero Showcase Banner Configuration
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl hover:bg-stone-100 text-stone-400 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Image Preview & Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-700">
                  ຮູບພາບ Banner (Image) *
                </label>
                {imageUrl && (
                  <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden border border-stone-200 bg-stone-900 mb-2">
                    <img src={imageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-stone-200 hover:border-teal-500 bg-stone-50 hover:bg-teal-50/50 text-xs font-semibold text-stone-600 hover:text-teal-700 transition-all">
                    <Upload className="w-4 h-4" />
                    <span>{isUploading ? 'ກຳລັງອັບໂຫຼດ...' : 'ອັບໂຫຼດຮູບໃໝ່ (WebP)'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                </div>

                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="ຫຼື ວາງ URL ຮູບພາບໂດຍກົງ (https://...)"
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                />
              </div>

              {/* Title Lao */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ຫົວຂໍ້ພາສາລາວ (Title Lao) *
                </label>
                <input
                  type="text"
                  value={titleLo}
                  onChange={(e) => setTitleLo(e.target.value)}
                  placeholder="ຕົວຢ່າງ: ທ່ຽວລາວປີ 2026: ສໍາຜັດມົນສະເໜ່ເມືອງມໍລະດົກໂລກ ຫຼວງພະບາງ"
                  required
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                />
              </div>

              {/* Title English */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ຫົວຂໍ້ພາສາອັງກິດ (Title English)
                </label>
                <input
                  type="text"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="e.g. Visit Laos 2026: Experience the World Heritage Town of Luang Prabang"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                />
              </div>

              {/* Subtitle Lao */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ຄຳອະທິບາຍສັ້ນ (Subtitle Lao)
                </label>
                <input
                  type="text"
                  value={subtitleLo}
                  onChange={(e) => setSubtitleLo(e.target.value)}
                  placeholder="ຕົວຢ່າງ: ນ້ຳຕົກຕາດກວາງຊີ, ພູສີ, ວັດຊຽງທອງ ແລະ ວິຖີຊີວິດແຄມຂອງ"
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                />
              </div>

              {/* Link Target or Place select */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    ເລືອກສະຖານທີ່ເຊື່ອມຕໍ່ (Link to Place)
                  </label>
                  <select
                    value={placeId}
                    onChange={(e) => {
                      setPlaceId(e.target.value);
                      const selected = places.find((p) => p.id === e.target.value);
                      if (selected) {
                        setLinkUrl(`/post/${selected.slug || selected.id}`);
                        if (!titleLo) setTitleLo(selected.title);
                      }
                    }}
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                  >
                    <option value="">-- ເລືອກສະຖານທີ່ (Select Place) --</option>
                    {places.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.province})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    ລິ້ງປາຍທາງ (Link URL)
                  </label>
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="/post/kuang-si-falls ຫຼື https://..."
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                  >
                  </input>
                </div>
              </div>

              {/* Sort Order and Active Switch */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    ລຳດັບການສະແດງ (Sort Order)
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    min={0}
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    ສະຖານະ (Status)
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-stone-100 text-stone-600 border border-stone-200'
                    }`}
                  >
                    {isActive ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-stone-400" />}
                    <span>{isActive ? 'Active (ເປີດໃຊ້)' : 'Inactive (ປິດ)'}</span>
                  </button>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 text-xs font-semibold"
                >
                  ຍົກເລີກ (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs disabled:opacity-50"
                >
                  {isSaving ? 'ກຳລັງບັນທຶກ...' : editingBanner ? 'ບັນທຶກການແກ້ໄຂ' : 'ສ້າງ Banner ໃໝ່'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
