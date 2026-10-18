import React, { useState, useEffect } from 'react';
import { CategoryItem } from '../types';
import { adminApi } from '../services/api';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Coffee,
  Mountain,
  Waves,
  Trees,
  Landmark,
  Utensils,
  Camera,
  Tent,
  Compass,
  X,
  Check,
  Search,
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  coffee: Coffee,
  mountain: Mountain,
  waves: Waves,
  tree: Trees,
  landmark: Landmark,
  utensils: Utensils,
  camera: Camera,
  tent: Tent,
};

export default function CategoryManagement() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: 'coffee',
    description: '',
    sortOrder: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await adminApi.getCategories();
      setCategories(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'ບໍ່ສາມາດໂຫຼດລາຍການໝວດໝູ່ໄດ້');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      icon: 'coffee',
      description: '',
      sortOrder: (categories.length || 0) + 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon || 'coffee',
      description: cat.description || '',
      sortOrder: cat.sortOrder,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      setErrorMsg('ກະລຸນາປ້ອນຊື່ ແລະ slug ຂອງໝວດໝູ່');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (editingCategory) {
        await adminApi.updateCategory(editingCategory.id, formData);
        setSuccessMsg(`ແກ້ໄຂໝວດໝູ່ "${formData.name}" ສໍາເລັດແລ້ວ`);
      } else {
        await adminApi.createCategory(formData);
        setSuccessMsg(`ສ້າງໝວດໝູ່ "${formData.name}" ສໍາເລັດແລ້ວ`);
      }
      setIsModalOpen(false);
      await fetchCategories();
    } catch (err: any) {
      setErrorMsg(err.message || 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (cat: CategoryItem) => {
    if (!window.confirm(`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບ (Soft Delete) ໝວດໝູ່ "${cat.name}"?`)) {
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await adminApi.softDeleteCategory(cat.id);
      setSuccessMsg(`ລຶບໝວດໝູ່ "${cat.name}" ສໍາເລັດແລ້ວ`);
      await fetchCategories();
    } catch (err: any) {
      setErrorMsg(err.message || 'ເກີດຂໍ້ຜິດພາດໃນການລຶບ');
    } finally {
      setIsLoading(false);
    }
  };

  const renderIcon = (iconName: string | null) => {
    const IconComp = iconName && ICON_MAP[iconName] ? ICON_MAP[iconName] : Compass;
    return <IconComp className="w-5 h-5 text-teal-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Tag className="w-6 h-6 text-teal-600" />
            <span>ຈັດການໝວດໝູ່ສະຖານທີ່ (Category Management)</span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            ເພີ່ມ, ແກ້ໄຂ ແລະ ຈັດລຳດັບໝວດໝູ່ສະຖານທີ່ທ່ອງທ່ຽວ (ຮ້ານກາເຟ, ນ້ຳຕົກຕາດ, ວັດວາອາຮາມ, ຈຸດຊົມວິວ)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchCategories}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold shadow-sm transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-600' : ''}`} />
            <span>ໂຫຼດໃໝ່</span>
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-900/10 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>ເພີ່ມໝວດໝູ່ໃໝ່ (Add Category)</span>
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

      {/* Category Search & Counter */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ຄົ້ນຫາຊື່ໝວດໝູ່, slug, ລາຍລະອຽດ..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none transition-all placeholder:text-stone-400 font-sans"
          />
        </div>
        <div className="text-xs text-stone-500 font-medium self-end sm:self-auto">
          ລວມທັງໝົດ:{' '}
          <span className="font-bold text-stone-800">
            {
              categories.filter(
                (c) =>
                  c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  c.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
              ).length
            }
          </span>{' '}
          ໝວດໝູ່
        </div>
      </div>

      {/* Category Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-16 text-center">ລຳດັບ</th>
                <th className="py-3 px-4">ໝວດໝູ່ (Category)</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4 text-center">ສະຖານທີ່ເຊື່ອມໂຍງ</th>
                <th className="py-3 px-4">ລາຍລະອຽດ (Description)</th>
                <th className="py-3 px-4 text-right">ຈັດການ (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {categories
                .filter(
                  (c) =>
                    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    c.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .map((cat) => (
                  <tr key={cat.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-mono font-bold text-[11px]">
                        #{cat.sortOrder}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center flex-shrink-0">
                          {renderIcon(cat.icon)}
                        </div>
                        <span className="font-bold text-stone-900 text-xs">
                          {cat.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-teal-700 font-medium text-xs">
                      {cat.slug}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200/60">
                        {cat._count?.places || 0} ສະຖານທີ່
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-600 max-w-xs">
                      <p className="truncate text-xs text-stone-500" title={cat.description || ''}>
                        {cat.description
                          ? cat.description.length > 70
                            ? cat.description.substring(0, 70) + '...'
                            : cat.description
                          : '-'}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-stone-500" />
                          <span>ແກ້ໄຂ</span>
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          className="p-1 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Soft delete category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <h3 className="font-bold text-stone-900 text-sm">
                {editingCategory ? 'ແກ້ໄຂໝວດໝູ່ (Edit Category)' : 'ເພີ່ມໝວດໝູ່ໃໝ່ (Create Category)'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ຊື່ໝວດໝູ່ (Category Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ເຊັ່ນ: ຮ້ານກາເຟ & ເບເກີຣີ່ (Cafes & Bakery)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all font-lao"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Slug (URL Key) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="cafes, waterfalls..."
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    ລຳດັບສະແດງ (Sort Order)
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ເລືອກໄອຄອນ (Icon Keyword)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.keys(ICON_MAP).map((iconKey) => {
                    const Comp = ICON_MAP[iconKey];
                    const isSelected = formData.icon === iconKey;
                    return (
                      <button
                        type="button"
                        key={iconKey}
                        onClick={() => setFormData({ ...formData, icon: iconKey })}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-teal-50 border-teal-600 text-teal-800'
                            : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                        }`}
                      >
                        <Comp className="w-4 h-4" />
                        <span className="capitalize">{iconKey}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ຄຳອະທິບາຍ (Description)
                </label>
                <textarea
                  rows={3}
                  placeholder="ອະທິບາຍສັ້ນໆກ່ຽວກັບໝວດໝູ່ນີ້..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all font-lao"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  ຍົກເລີກ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-900/10 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingCategory ? 'ບັນທຶກການແກ້ໄຂ' : 'ສ້າງໝວດໝູ່'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
