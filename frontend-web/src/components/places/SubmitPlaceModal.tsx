'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Category, CreatePlaceDto, Province, District } from '../../types/api';
import { translations, Language } from '../../lib/i18n';
import {
  X,
  Plus,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Image as ImageIcon,
  Info,
  UploadCloud,
  FileCheck,
  DollarSign,
  Banknote,
  Loader2,
  Star,
  Trash2,
} from 'lucide-react';

interface SubmitPlaceModalProps {
  isOpen: boolean;
  categories: Category[];
  onClose: () => void;
  onSuccess?: () => void;
  onRequireLogin?: () => void;
  lang?: Language;
}

export default function SubmitPlaceModal({
  isOpen,
  categories,
  onClose,
  onSuccess,
  onRequireLogin,
  lang = 'lo',
}: SubmitPlaceModalProps) {
  const { isAuthenticated } = useAuth();
  const t = translations[lang];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number>(categories[0]?.id || 1);

  // Provinces & Districts
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number>(1);
  const [selectedProvinceName, setSelectedProvinceName] = useState<string>('Vientiane Capital');
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | undefined>(undefined);
  const [selectedDistrictName, setSelectedDistrictName] = useState<string>('');

  const [address, setAddress] = useState('');

  // Dual Currency Pricing
  const [priceLao, setPriceLao] = useState('');
  const [priceForeigner, setPriceForeigner] = useState('');

  // Image Upload with WebP conversion
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Load 18 provinces from backend
  useEffect(() => {
    if (isOpen) {
      api.provinces
        .list()
        .then((res) => {
          setProvinces(res);
          if (res.length > 0) {
            setSelectedProvinceId(res[0].id);
            setSelectedProvinceName(res[0].nameLo || res[0].nameEn);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // Load districts when selected province changes
  useEffect(() => {
    if (selectedProvinceId) {
      api.provinces
        .districts(selectedProvinceId)
        .then((res) => {
          setDistricts(res);
          if (res.length > 0) {
            setSelectedDistrictId(res[0].id);
            setSelectedDistrictName(res[0].nameLo || res[0].nameEn);
          } else {
            setSelectedDistrictId(undefined);
            setSelectedDistrictName('');
          }
        })
        .catch(() => {
          setDistricts([]);
          setSelectedDistrictId(undefined);
          setSelectedDistrictName('');
        });
    }
  }, [selectedProvinceId]);

  if (!isOpen) return null;

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center border border-stone-200 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
            <Info className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-900">{t.navLogin}</h3>
          <p className="text-xs text-stone-500 mt-1 mb-6 leading-relaxed">
            {lang === 'lo'
              ? 'ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນເພື່ອໂພສ ແລະ ແບ່ງປັນສະຖານທີ່ທ່ອງທ່ຽວ'
              : 'You must be signed in with a phone number or username to share spots in Laos.'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                if (onRequireLogin) onRequireLogin();
              }}
              className="flex-1 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl"
            >
              {t.navLogin} / {t.navRegister}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle Multiple Images File Upload with WebP conversion
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(t.uploading);
    setErrorMessage(null);

    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const res = await api.upload.single(files[i]);
        if (res.url) newUrls.push(res.url);
      }
      setMediaUrls((prev) => [...prev, ...newUrls]);
      setUploadProgress(
        lang === 'lo'
          ? `ປ່ຽນເປັນ WebP ສຳເລັດ ${newUrls.length} ຮູບ`
          : `Converted ${newUrls.length} photos to WebP`
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload and convert image');
      setUploadProgress(null);
    } finally {
      setIsUploading(false);
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim() || !description.trim()) {
      setErrorMessage(lang === 'lo' ? 'ກະລຸນາປ້ອນຊື່ ແລະ ລາຍລະອຽດສະຖານທີ່' : 'Please fill in both title and description.');
      return;
    }

    setIsLoading(true);

    const dto: CreatePlaceDto = {
      title: title.trim(),
      description: description.trim(),
      categoryId: Number(categoryId),
      province: selectedProvinceName,
      provinceId: selectedProvinceId,
      district: selectedDistrictName || undefined,
      districtId: selectedDistrictId,
      address: address.trim() || undefined,
      priceLao: priceLao.trim() ? `${priceLao.trim()} ₭` : undefined,
      priceForeigner: priceForeigner.trim() ? `${priceForeigner.trim()}` : undefined,
      mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
    };

    try {
      await api.places.submit(dto);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 1800);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit place. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-stone-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 to-teal-700 px-6 py-5 text-white flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base">{t.navSharePlace}</h3>
            <p className="text-xs text-teal-100/80">
              {lang === 'lo' ? 'ແບ່ງປັນນ້ຳຕົກຕາດ, ຮ້ານກາເຟ, ຈຸດຊົມວິວ ຫຼື ວັດວາອາຮາມ' : 'Share a waterfall, cafe, karst peak, or temple'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-teal-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitted ? (
            <div className="py-8 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-stone-900 text-base">
                {lang === 'lo' ? 'ສົ່ງຂໍ້ມູນສະຖານທີ່ສຳເລັດ!' : 'Submission Received!'}
              </h4>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                {lang === 'lo'
                  ? 'ສະຖານທີ່ຈະຢູ່ໃນສະຖານະ PENDING (ລໍຖ້າອະນຸມັດ) ແລະ ຈະສະແດງຫຼັງຈາກ Admin ກວດສອບ'
                  : 'Your place was submitted with status PENDING and will be publicly visible after admin review.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {lang === 'lo' ? 'ຊື່ສະຖານທີ່' : 'Place Name'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={lang === 'lo' ? 'ເຊັ່ນ: ຕາດກວາງຊີ (Kuang Si Waterfall)' : 'e.g. Kuang Si Falls'}
                  required
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs focus:ring-2 focus:ring-teal-600 focus:bg-white"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {lang === 'lo' ? 'ໝວດໝູ່' : 'Category'} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs focus:ring-2 focus:ring-teal-600 focus:bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Province & District Dropdowns */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {lang === 'lo' ? 'ແຂວງ (18 ແຂວງ)' : 'Province'} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedProvinceId}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      setSelectedProvinceId(id);
                      const p = provinces.find((prov) => prov.id === id);
                      if (p) setSelectedProvinceName(p.nameLo || p.nameEn);
                    }}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs focus:ring-2 focus:ring-teal-600 focus:bg-white"
                  >
                    {provinces.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nameLo} ({p.nameEn})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {lang === 'lo' ? 'ເມືອງ' : 'District'}
                  </label>
                  <select
                    value={selectedDistrictId || ''}
                    disabled={districts.length === 0}
                    onChange={(e) => {
                      const id = e.target.value ? Number(e.target.value) : undefined;
                      setSelectedDistrictId(id);
                      const d = districts.find((dist) => dist.id === id);
                      setSelectedDistrictName(d ? d.nameLo || d.nameEn : '');
                    }}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs focus:ring-2 focus:ring-teal-600 focus:bg-white disabled:opacity-60"
                  >
                    <option value="">{districts.length > 0 ? (lang === 'lo' ? '-- ເລືອກເມືອງ --' : '-- Select District --') : (lang === 'lo' ? 'ບໍ່ມີຂໍ້ມູນເມືອງ' : 'No districts')}</option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nameLo} ({d.nameEn})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {lang === 'lo' ? 'ລາຍລະອຽດ & ບັນຍາກາດ' : 'Description & Highlights'} <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder={lang === 'lo' ? 'ອະທິບາຍຄວາມງາມ, ທາງໄປ, ຈຸດພິເສດ, ເວລາທີ່ຄວນທ່ຽວ...' : 'Describe the atmosphere, trails, activities...'}
                  required
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs focus:ring-2 focus:ring-teal-600 focus:bg-white"
                />
              </div>

              {/* Dual Currency Pricing (LAK and USD) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                    <Banknote className="w-3.5 h-3.5 text-teal-600" />
                    <span>{t.priceLao} (LAK ₭)</span>
                  </label>
                  <input
                    type="text"
                    value={priceLao}
                    onChange={(e) => setPriceLao(e.target.value)}
                    placeholder="e.g. 10,000"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs focus:ring-2 focus:ring-teal-600 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t.priceForeigner} (USD / LAK)</span>
                  </label>
                  <input
                    type="text"
                    value={priceForeigner}
                    onChange={(e) => setPriceForeigner(e.target.value)}
                    placeholder="e.g. $2.00 / 25,000 ₭"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs focus:ring-2 focus:ring-teal-600 focus:bg-white font-mono"
                  />
                </div>
              </div>

              {/* Multi-Image Upload with WebP Conversion & Galleria */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-stone-700">
                    {t.uploadImageWebp}
                  </label>
                  <span className="text-[10px] text-stone-400">
                    {mediaUrls.length} {lang === 'lo' ? 'ຮູບພາບໃນຄັງ' : 'photos'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 p-3 border-2 border-dashed border-stone-300 hover:border-teal-500 rounded-2xl bg-stone-50/70 hover:bg-teal-50/20 transition-all text-xs text-stone-600">
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 text-teal-600 animate-spin" />
                    ) : (
                      <UploadCloud className="w-4 h-4 text-teal-600" />
                    )}
                    <span>{uploadProgress || (lang === 'lo' ? '+ ເພີ່ມຮູບພາບ (ເລືອກຫຼາຍຮູບໄດ້)' : '+ Upload Photos (Multi-select)')}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Galleria Preview Grid */}
                {mediaUrls.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
                    {mediaUrls.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative group aspect-square rounded-xl overflow-hidden bg-stone-100 border-2 transition-all shadow-xs"
                        style={{ borderColor: idx === 0 ? '#0D9488' : '#E7E5E4' }}
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-teal-700 text-white text-[9px] font-black shadow-xs">
                            Cover
                          </span>
                        )}

                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => handleSetCoverImage(idx)}
                              title="Set as Cover Photo"
                              className="p-1 rounded bg-teal-600 text-white hover:bg-teal-700"
                            >
                              <Star className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            title="Remove Photo"
                            className="p-1 rounded bg-rose-600 text-white hover:bg-rose-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || isUploading}
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md shadow-teal-900/10 disabled:opacity-50"
                >
                  {isLoading ? 'Submitting...' : 'Submit for Approval'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
