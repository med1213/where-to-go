import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Place, CategoryItem, ProvinceItem, DistrictItem } from '../types';
import { useToast } from '../context/ToastContext';
import {
  X,
  Upload,
  Plus,
  MapPin,
  Tag,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Trash2,
  Star,
  Layers,
} from 'lucide-react';

interface AdminEditPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  place: Place | null;
  onSuccess: () => void;
}

export default function AdminEditPlaceModal({
  isOpen,
  onClose,
  place,
  onSuccess,
}: AdminEditPlaceModalProps) {
  const { success, error: toastError } = useToast();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [provinces, setProvinces] = useState<ProvinceItem[]>([]);
  const [districts, setDistricts] = useState<DistrictItem[]>([]);

  const [form, setForm] = useState({
    title: '',
    categoryId: '',
    provinceId: '',
    districtId: '',
    province: '',
    district: '',
    address: '',
    description: '',
    priceLao: '',
    priceForeigner: '',
  });

  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && place) {
      adminApi.getCategories().then(setCategories).catch(console.error);
      adminApi.getProvinces().then(setProvinces).catch(console.error);

      // Populate current place details
      setForm({
        title: place.title || '',
        categoryId: place.categoryId ? String(place.categoryId) : '',
        provinceId: place.provinceId ? String(place.provinceId) : '',
        districtId: place.districtId ? String(place.districtId) : '',
        province: place.province || '',
        district: place.district || '',
        address: place.address || '',
        description: place.description || '',
        priceLao: place.priceLao || '',
        priceForeigner: place.priceForeigner || '',
      });

      // Extract existing images
      const existingUrls =
        place.media && place.media.length > 0
          ? place.media.map((m) => m.url)
          : [];
      setMediaUrls(existingUrls);

      // If province exists, load its districts
      if (place.provinceId) {
        adminApi
          .getProvinceDetail(String(place.provinceId))
          .then((res) => setDistricts(res.districts || []))
          .catch(() => setDistricts([]));
      }
    }
  }, [isOpen, place]);

  if (!isOpen || !place) return null;

  const handleProvinceChange = (provIdStr: string) => {
    const provId = parseInt(provIdStr, 10);
    const prov = provinces.find((p) => p.id === provId);
    setForm((prev) => ({
      ...prev,
      provinceId: provIdStr,
      province: prov ? prov.nameEn : '',
      districtId: '',
      district: '',
    }));

    if (prov && prov.districts) {
      setDistricts(prov.districts);
    } else if (provId) {
      adminApi
        .getProvinceDetail(String(provId))
        .then((res) => setDistricts(res.districts || []))
        .catch(() => setDistricts([]));
    } else {
      setDistricts([]);
    }
  };

  const handleDistrictChange = (distIdStr: string) => {
    const distId = parseInt(distIdStr, 10);
    const dist = districts.find((d) => d.id === distId);
    setForm((prev) => ({
      ...prev,
      districtId: distIdStr,
      district: dist ? dist.nameEn : '',
    }));
  };

  const handleMultiFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingImages(true);
      setError(null);
      const newUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await adminApi.uploadImage(file);
        if (res.url) {
          newUrls.push(res.url);
        }
      }

      setMediaUrls((prev) => [...prev, ...newUrls]);
      success(`ອັບໂຫຼດ ${newUrls.length} ຮູບພາບ WebP ສໍາເລັດ!`);
    } catch (err: any) {
      const msg = err.message || 'Image upload failed';
      setError(msg);
      toastError(msg);
    } finally {
      setUploadingImages(false);
      // Reset input value to allow re-uploading the same file if needed
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setMediaUrls((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSetCoverImage = (index: number) => {
    setMediaUrls((prev) => {
      const copy = [...prev];
      const [chosen] = copy.splice(index, 1);
      return [chosen, ...copy];
    });
    success('ກຳນົດເປັນຮູບໜ້າປົກ (Cover Photo) ແລ້ວ');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Please provide a place title');
      return;
    }
    if (!form.categoryId) {
      setError('Please select a category');
      return;
    }
    if (!form.province) {
      setError('Please select a province');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload: any = {
        title: form.title.trim(),
        categoryId: parseInt(form.categoryId, 10),
        province: form.province,
        provinceId: form.provinceId ? parseInt(form.provinceId, 10) : undefined,
        district: form.district || undefined,
        districtId: form.districtId ? parseInt(form.districtId, 10) : undefined,
        address: form.address || undefined,
        description: form.description || undefined,
        priceLao: form.priceLao || undefined,
        priceForeigner: form.priceForeigner || undefined,
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
      };

      await adminApi.updatePlace(place.id, payload);
      success(`ອັບເດດ "${form.title}" ສໍາເລັດແລ້ວ!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.message || 'Failed to update place';
      setError(msg);
      toastError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              ✏️
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-lg font-lao">
                ແກ້ໄຂສະຖານທີ່ (Edit Place Post)
              </h3>
              <p className="text-xs text-stone-500 font-lao">
                ອັບເດດຂໍ້ມູນ, ລາຄາ, ແລະ ຄັງຮູບພາບ (Image Galleria)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Title & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 font-lao">
                ຊື່ສະຖານທີ່ (Place Title) *
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 font-lao">
                ໝວດໝູ່ (Category) *
              </label>
              <select
                required
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer"
              >
                <option value="">ເລືອກໝວດໝູ່ (Select Category)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Province & District */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 font-lao">
                ແຂວງ (Province) *
              </label>
              <select
                required
                value={form.provinceId}
                onChange={(e) => handleProvinceChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer"
              >
                <option value="">ເລືອກແຂວງ (Select Province)</option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nameLo} • {p.nameEn} ({p.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 font-lao">
                ເມືອງ (District)
              </label>
              <select
                value={form.districtId}
                onChange={(e) => handleDistrictChange(e.target.value)}
                disabled={districts.length === 0}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 disabled:opacity-50 cursor-pointer"
              >
                <option value="">ເລືອກເມືອງ (Select District)</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nameLo} • {d.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Address & Specific Location */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5 font-lao">
              ທີ່ຢູ່ລະອຽດ ຫຼື ຈຸດສັງເກດ (Address / Landmark)
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          {/* Dual Currency Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-teal-50/50 rounded-2xl border border-teal-100">
            <div>
              <label className="block text-xs font-bold text-teal-900 mb-1 font-lao">
                🇱🇦 ລາຄາຄົນລາວ (Lao Nationals Price)
              </label>
              <input
                type="text"
                placeholder="ຕົວຢ່າງ: 10,000 LAK ຫຼື ຟຣີ"
                value={form.priceLao}
                onChange={(e) => setForm({ ...form, priceLao: e.target.value })}
                className="w-full px-3.5 py-2 bg-white border border-teal-200 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-900 mb-1 font-lao">
                🌐 ລາຄາຊາວຕ່າງຊາດ (Foreigner USD / LAK)
              </label>
              <input
                type="text"
                placeholder="ຕົວຢ່າງ: 25,000 LAK ($1.20)"
                value={form.priceForeigner}
                onChange={(e) => setForm({ ...form, priceForeigner: e.target.value })}
                className="w-full px-3.5 py-2 bg-white border border-amber-200 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5 font-lao">
              ລາຍລະອຽດສະຖານທີ່ (Description)
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 leading-relaxed"
            />
          </div>

          {/* Multi-Image Galleria Manager */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-stone-800 font-lao">
                  ຄັງຮູບພາບສະຖານທີ່ (Image Galleria - Multi Images)
                </label>
                <p className="text-[11px] text-stone-500 font-lao">
                  ສາມາດອັບໂຫຼດຫຼາຍຮູບພ້ອມກັນ (Auto WebP ປັບຂະໜາດ) • ຮູບທຳອິດຄືຮູບໜ້າປົກ
                </p>
              </div>

              {/* Upload trigger button */}
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl border border-teal-200/60 text-xs font-bold cursor-pointer transition-colors shadow-2xs">
                <Upload className="w-3.5 h-3.5 text-teal-600" />
                <span>+ ເພີ່ມຮູບພາບ (Upload Photos)</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleMultiFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {uploadingImages && (
              <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-2xl flex items-center gap-2.5 text-teal-800 text-xs font-medium">
                <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                <span>ກຳລັງອັບໂຫຼດ ແລະ ແປງໄຟລ໌ເປັນ WebP ຄຸນນະພາບສູງ...</span>
              </div>
            )}

            {/* Galleria Grid */}
            {mediaUrls.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                {mediaUrls.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative group aspect-[4/3] rounded-xl overflow-hidden bg-stone-200 border-2 transition-all shadow-xs"
                    style={{ borderColor: idx === 0 ? '#0D9488' : '#E7E5E4' }}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />

                    {/* Cover badge */}
                    {idx === 0 && (
                      <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-teal-700 text-white text-[10px] font-black shadow-sm flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                        <span>Cover</span>
                      </span>
                    )}

                    {/* Overlay Actions on Hover */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => handleSetCoverImage(idx)}
                          title="Set as Cover Photo"
                          className="p-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-sm"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        title="Remove Image"
                        className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50 text-xs text-stone-400">
                <ImageIcon className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                <p>ຍັງບໍ່ມີຮູບພາບໃນຄັງ (No photos in gallery yet)</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploadingImages}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>ກຳລັງບັນທຶກ...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ບັນທຶກການແກ້ໄຂ (Save Changes)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
