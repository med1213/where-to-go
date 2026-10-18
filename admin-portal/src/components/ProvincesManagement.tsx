import React, { useState, useEffect } from 'react';
import { ProvinceItem, DistrictItem } from '../types';
import { adminApi } from '../services/api';
import {
  Map,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Search,
  X,
  Check,
  Building2,
  Compass,
  Layers,
} from 'lucide-react';

export default function ProvincesManagement() {
  const [provinces, setProvinces] = useState<ProvinceItem[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<ProvinceItem | null>(null);
  const [districts, setDistricts] = useState<DistrictItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Province Modal state
  const [isProvinceModalOpen, setIsProvinceModalOpen] = useState(false);
  const [editingProvince, setEditingProvince] = useState<ProvinceItem | null>(null);
  const [provinceForm, setProvinceForm] = useState({
    code: '',
    nameLo: '',
    nameEn: '',
    slug: '',
    highlight: '',
  });

  // District Modal state
  const [isDistrictModalOpen, setIsDistrictModalOpen] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState<DistrictItem | null>(null);
  const [districtForm, setDistrictForm] = useState({
    code: '',
    nameLo: '',
    nameEn: '',
    slug: '',
  });

  const fetchProvinces = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await adminApi.getProvinces();
      setProvinces(data);
      if (data.length > 0 && !selectedProvince) {
        setSelectedProvince(data[0]);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'ບໍ່ສາມາດໂຫຼດລາຍການແຂວງໄດ້');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDistricts = async (provId: number) => {
    try {
      const data = await adminApi.getDistricts(provId);
      setDistricts(data);
    } catch (err: any) {
      console.error('Error fetching districts:', err);
    }
  };

  useEffect(() => {
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      fetchDistricts(selectedProvince.id);
    }
  }, [selectedProvince]);

  // Province Actions
  const openCreateProvince = () => {
    setEditingProvince(null);
    setProvinceForm({ code: '', nameLo: '', nameEn: '', slug: '', highlight: '' });
    setIsProvinceModalOpen(true);
  };

  const openEditProvince = (prov: ProvinceItem) => {
    setEditingProvince(prov);
    setProvinceForm({
      code: prov.code,
      nameLo: prov.nameLo,
      nameEn: prov.nameEn,
      slug: prov.slug,
      highlight: prov.highlight || '',
    });
    setIsProvinceModalOpen(true);
  };

  const handleSaveProvince = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provinceForm.code || !provinceForm.nameLo || !provinceForm.nameEn) {
      setErrorMsg('ກະລຸນາປ້ອນຂໍ້ມູນແຂວງໃຫ້ຄົບຖ້ວນ');
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      if (editingProvince) {
        await adminApi.updateProvince(editingProvince.id, provinceForm);
        setSuccessMsg(`ແກ້ໄຂຂໍ້ມູນແຂວງ "${provinceForm.nameLo}" ສໍາເລັດ`);
      } else {
        await adminApi.createProvince(provinceForm);
        setSuccessMsg(`ເພີ່ມແຂວງ "${provinceForm.nameLo}" ສໍາເລັດ`);
      }
      setIsProvinceModalOpen(false);
      await fetchProvinces();
    } catch (err: any) {
      setErrorMsg(err.message || 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກແຂວງ');
    }
  };

  const handleDeleteProvince = async (prov: ProvinceItem) => {
    if (!window.confirm(`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບແຂວງ "${prov.nameLo}"?`)) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await adminApi.deleteProvince(prov.id);
      setSuccessMsg(`ລຶບແຂວງ "${prov.nameLo}" ສໍາເລັດ`);
      await fetchProvinces();
    } catch (err: any) {
      setErrorMsg(err.message || 'ເກີດຂໍ້ຜິດພາດໃນການລຶບ');
    }
  };

  // District Actions
  const openCreateDistrict = () => {
    if (!selectedProvince) return;
    setEditingDistrict(null);
    setDistrictForm({ code: '', nameLo: '', nameEn: '', slug: '' });
    setIsDistrictModalOpen(true);
  };

  const openEditDistrict = (dist: DistrictItem) => {
    setEditingDistrict(dist);
    setDistrictForm({
      code: dist.code || '',
      nameLo: dist.nameLo,
      nameEn: dist.nameEn,
      slug: dist.slug,
    });
    setIsDistrictModalOpen(true);
  };

  const handleSaveDistrict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvince || !districtForm.nameLo || !districtForm.slug) {
      setErrorMsg('ກະລຸນາປ້ອນຂໍ້ມູນເມືອງໃຫ້ຄົບຖ້ວນ');
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      if (editingDistrict) {
        await adminApi.updateDistrict(editingDistrict.id, districtForm);
        setSuccessMsg(`ແກ້ໄຂເມືອງ "${districtForm.nameLo}" ສໍາເລັດ`);
      } else {
        await adminApi.createDistrict(selectedProvince.id, districtForm);
        setSuccessMsg(`ເພີ່ມເມືອງ "${districtForm.nameLo}" ສໍາເລັດ`);
      }
      setIsDistrictModalOpen(false);
      await fetchDistricts(selectedProvince.id);
      await fetchProvinces();
    } catch (err: any) {
      setErrorMsg(err.message || 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກເມືອງ');
    }
  };

  const handleDeleteDistrict = async (dist: DistrictItem) => {
    if (!window.confirm(`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບເມືອງ "${dist.nameLo}"?`)) return;

    try {
      await adminApi.deleteDistrict(dist.id);
      setSuccessMsg(`ລຶບເມືອງ "${dist.nameLo}" ສໍາເລັດ`);
      if (selectedProvince) {
        await fetchDistricts(selectedProvince.id);
        await fetchProvinces();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'ເກີດຂໍ້ຜິດພາດໃນການລຶບເມືອງ');
    }
  };

  const filteredProvinces = provinces.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.nameLo.toLowerCase().includes(q) ||
      p.nameEn.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Map className="w-6 h-6 text-teal-600" />
            <span>ຈັດການແຂວງ & ເມືອງ (Provinces & Districts)</span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            ຄຸ້ມຄອງຂໍ້ມູນ 18 ແຂວງທົ່ວປະເທດລາວ ແລະ ເມືອງຕ່າງໆ ພ້ອມເຊື່ອມໂຍງກັບສະຖານທີ່ທ່ອງທ່ຽວ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchProvinces}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold shadow-sm transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-600' : ''}`} />
            <span>ໂຫຼດໃໝ່</span>
          </button>

          <button
            onClick={openCreateProvince}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-900/10 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>ເພີ່ມແຂວງໃໝ່</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
          {successMsg}
        </div>
      )}

      {/* Main Split Layout: Left Provinces, Right Districts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Province List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="ຄົ້ນຫາແຂວງ (Lao, En, Code)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all font-lao"
              />
            </div>
            <span className="text-xs font-bold text-stone-500 whitespace-nowrap">
              {filteredProvinces.length} ແຂວງ
            </span>
          </div>

          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredProvinces.map((prov) => {
              const isSelected = selectedProvince?.id === prov.id;
              return (
                <div
                  key={prov.id}
                  onClick={() => setSelectedProvince(prov)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-teal-50/80 border-teal-500 shadow-sm'
                      : 'bg-white border-stone-200 hover:border-teal-300 hover:bg-stone-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isSelected
                          ? 'bg-teal-600 text-white shadow-sm'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {prov.code}
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 text-xs font-lao">
                        {prov.nameLo}
                      </h4>
                      <p className="text-[11px] text-stone-500 font-medium">{prov.nameEn}</p>
                      {prov.highlight && (
                        <p className="text-[10px] text-teal-700 line-clamp-1 mt-0.5">
                          ✨ {prov.highlight}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[10px] font-bold">
                        {prov._count?.districts || 0} ເມືອງ
                      </span>
                      <p className="text-[10px] text-teal-600 font-semibold mt-0.5">
                        {prov._count?.places || 0} ສະຖານທີ່
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditProvince(prov);
                        }}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                        title="Edit Province"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProvince(prov);
                        }}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Province"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Districts for Selected Province */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          {selectedProvince ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 text-[10px] font-bold">
                      {selectedProvince.code}
                    </span>
                    <h3 className="font-bold text-stone-900 text-base font-lao">
                      {selectedProvince.nameLo} ({selectedProvince.nameEn})
                    </h3>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    ຈຳນວນເມືອງທັງໝົດ: <strong className="text-stone-800">{districts.length} ເມືອງ</strong> •{' '}
                    ສະຖານທີ່ທ່ອງທ່ຽວ: <strong className="text-teal-700">{selectedProvince._count?.places || 0} ແຫ່ງ</strong>
                  </p>
                </div>

                <button
                  onClick={openCreateDistrict}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-colors self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ເພີ່ມເມືອງໃໝ່</span>
                </button>
              </div>

              {/* District Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase">
                    <tr>
                      <th className="py-3 px-3">ລະຫັດ (Code)</th>
                      <th className="py-3 px-3">ຊື່ເມືອງ (Lao)</th>
                      <th className="py-3 px-3">ຊື່ພາສາອັງກິດ (English)</th>
                      <th className="py-3 px-3">Slug</th>
                      <th className="py-3 px-3">ສະຖານທີ່</th>
                      <th className="py-3 px-3 text-right">ຈັດການ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {districts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-stone-400">
                          ຍັງບໍ່ມີຂໍ້ມູນເມືອງໃນແຂວງນີ້
                        </td>
                      </tr>
                    ) : (
                      districts.map((d) => (
                        <tr key={d.id} className="hover:bg-stone-50/60 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-stone-600">
                            {d.code || '-'}
                          </td>
                          <td className="py-3 px-3 font-bold text-stone-900 font-lao">
                            {d.nameLo}
                          </td>
                          <td className="py-3 px-3 text-stone-600">{d.nameEn}</td>
                          <td className="py-3 px-3 font-mono text-[11px] text-teal-600">
                            {d.slug}
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[10px] font-bold">
                              {d._count?.places || 0}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openEditDistrict(d)}
                                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                                title="Edit District"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteDistrict(d)}
                                className="p-1 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                                title="Delete District"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="py-16 text-center text-stone-400">
              ກະລຸນາເລືອກແຂວງເພື່ອເບິ່ງ ແລະ ຈັດການລາຍການເມືອງ
            </div>
          )}
        </div>
      </div>

      {/* Province Modal */}
      {isProvinceModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <h3 className="font-bold text-stone-900 text-sm">
                {editingProvince ? 'ແກ້ໄຂຂໍ້ມູນແຂວງ (Edit Province)' : 'ເພີ່ມແຂວງໃໝ່ (Create Province)'}
              </h3>
              <button
                onClick={() => setIsProvinceModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProvince} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    ລະຫັດແຂວງ (Code) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VTE, LPB..."
                    value={provinceForm.code}
                    onChange={(e) => setProvinceForm({ ...provinceForm, code: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-xs font-mono uppercase focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Slug (URL Key) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="vientiane-capital"
                    value={provinceForm.slug}
                    onChange={(e) => setProvinceForm({ ...provinceForm, slug: e.target.value })}
                    className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ຊື່ພາສາລາວ (Lao Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ນະຄອນຫຼວງວຽງຈັນ"
                  value={provinceForm.nameLo}
                  onChange={(e) => setProvinceForm({ ...provinceForm, nameLo: e.target.value })}
                  className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-xs font-lao focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ຊື່ພາສາອັງກິດ (English Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Vientiane Capital"
                  value={provinceForm.nameEn}
                  onChange={(e) => setProvinceForm({ ...provinceForm, nameEn: e.target.value })}
                  className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ຈຸດເດັ່ນການທ່ອງທ່ຽວ (Highlight)
                </label>
                <input
                  type="text"
                  placeholder="Pha That Luang, Patuxay..."
                  value={provinceForm.highlight}
                  onChange={(e) => setProvinceForm({ ...provinceForm, highlight: e.target.value })}
                  className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-lao"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsProvinceModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  ຍົກເລີກ
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-900/10"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingProvince ? 'ບັນທຶກ' : 'ສ້າງແຂວງ'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* District Modal */}
      {isDistrictModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <h3 className="font-bold text-stone-900 text-sm">
                {editingDistrict ? 'ແກ້ໄຂຂໍ້ມູນເມືອງ (Edit District)' : 'ເພີ່ມເມືອງໃໝ່ (Create District)'}
              </h3>
              <button
                onClick={() => setIsDistrictModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDistrict} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    ລະຫັດເມືອງ (Code)
                  </label>
                  <input
                    type="text"
                    placeholder="0101, 0601..."
                    value={districtForm.code}
                    onChange={(e) => setDistrictForm({ ...districtForm, code: e.target.value })}
                    className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="chanthabouly, vang-vieng..."
                    value={districtForm.slug}
                    onChange={(e) => setDistrictForm({ ...districtForm, slug: e.target.value })}
                    className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ຊື່ເມືອງພາສາລາວ (Lao Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ຈັນທະບູລີ, ວັງວຽງ..."
                  value={districtForm.nameLo}
                  onChange={(e) => setDistrictForm({ ...districtForm, nameLo: e.target.value })}
                  className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-xs font-lao focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ຊື່ເມືອງພາສາອັງກິດ (English Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Chanthabouly, Vang Vieng..."
                  value={districtForm.nameEn}
                  onChange={(e) => setDistrictForm({ ...districtForm, nameEn: e.target.value })}
                  className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsDistrictModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  ຍົກເລີກ
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-900/10"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingDistrict ? 'ບັນທຶກ' : 'ສ້າງເມືອງ'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
