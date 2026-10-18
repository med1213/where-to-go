'use client';

import React from 'react';
import { Category, Province, District } from '../../types/api';
import { Language, translations } from '../../lib/i18n';
import {
  Search,
  MapPin,
  Filter,
  RotateCcw,
  Waves,
  Coffee,
  TreePine,
  Landmark,
  Mountain,
  Utensils,
  Compass,
  Check,
} from 'lucide-react';

interface FilterPanelProps {
  lang: Language;
  categories: Category[];
  provinces: Province[];
  districts: District[];
  selectedCategory: number | null;
  selectedProvinceId: number | null;
  selectedDistrictId: number | null;
  searchQuery: string;
  selectedSort: string;
  onSearchChange: (q: string) => void;
  onSortChange: (sort: string) => void;
  onProvinceSelect: (provIdStr: string) => void;
  onDistrictSelect: (distIdStr: string) => void;
  onCategorySelect: (catId: number | null) => void;
  onResetFilters: () => void;
  totalResults?: number;
}

export default function FilterPanel({
  lang,
  categories,
  provinces,
  districts,
  selectedCategory,
  selectedProvinceId,
  selectedDistrictId,
  searchQuery,
  selectedSort,
  onSearchChange,
  onSortChange,
  onProvinceSelect,
  onDistrictSelect,
  onCategorySelect,
  onResetFilters,
  totalResults,
}: FilterPanelProps) {
  const t = translations[lang];

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'waterfalls':
        return <Waves className="w-4 h-4 text-cyan-600" />;
      case 'cafes':
        return <Coffee className="w-4 h-4 text-amber-700" />;
      case 'forest-nature':
        return <TreePine className="w-4 h-4 text-emerald-600" />;
      case 'culture-temples':
        return <Landmark className="w-4 h-4 text-orange-600" />;
      case 'viewpoints':
        return <Mountain className="w-4 h-4 text-indigo-600" />;
      case 'local-markets':
        return <Utensils className="w-4 h-4 text-rose-600" />;
      default:
        return <Compass className="w-4 h-4 text-teal-600" />;
    }
  };

  const hasActiveFilters =
    selectedCategory !== null ||
    selectedProvinceId !== null ||
    selectedDistrictId !== null ||
    searchQuery.trim() !== '' ||
    selectedSort !== 'popular';

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-5 space-y-6 text-stone-900">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-teal-50 text-teal-700">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-stone-900">
              {lang === 'lo' ? 'ຕົວກັ່ນຕອງຄົ້ນຫາ' : 'Filter Places'}
            </h3>
            {totalResults !== undefined && (
              <span className="text-[11px] text-stone-500">
                {lang === 'lo' ? `ພົບ ${totalResults} ສະຖານທີ່` : `${totalResults} places found`}
              </span>
            )}
          </div>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{lang === 'lo' ? 'ລ້າງ' : 'Reset'}</span>
          </button>
        )}
      </div>

      {/* 1. Keyword Search */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-stone-400" />
          <span>{lang === 'lo' ? 'ຊອກຫາຊື່ ຫຼື ຄຳສັບ (&search=)' : 'Search Keyword (&search=)'}</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={lang === 'lo' ? 'ພິມຊື່ສະຖານທີ່, ເມືອງ, LPB...' : 'Search by name, tags, LPB...'}
            className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none transition-all placeholder:text-stone-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 2. Recency & Timeframe Filter (&sort=recent,1,3,6,9) */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-stone-700 block">
          {lang === 'lo'
            ? 'ຊ່ວງເວລາ & ລຳດັບ (&sort=recent, 1, 3, 6, 9)'
            : 'Recency & Timeframe (&sort=recent, 1, 3, 6, 9)'}
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: 'popular', labelLo: 'ຍອດນິຍົມ', labelEn: 'Popular' },
            { id: 'recent', labelLo: 'ລ່າສຸດ', labelEn: 'Recent' },
            { id: '1', labelLo: 'ເດືອນນີ້ (1M)', labelEn: 'This Month' },
            { id: '3', labelLo: '3 ເດືອນ', labelEn: '3 Months' },
            { id: '6', labelLo: '6 ເດືອນ', labelEn: '6 Months' },
            { id: '9', labelLo: '9 ເດືອນ', labelEn: '9 Months' },
          ].map((item) => {
            const isSelected = selectedSort === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSortChange(item.id)}
                className={`text-[11px] py-1.5 px-2 rounded-xl border text-center transition-all cursor-pointer font-medium ${
                  isSelected
                    ? 'bg-teal-600 text-white border-teal-600 shadow-xs font-bold'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                {lang === 'lo' ? item.labelLo : item.labelEn}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Province Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-teal-600" />
          <span>{lang === 'lo' ? 'ແຂວງ (ທົ່ວ 18 ແຂວງ)' : 'Province (All 18 Provinces)'}</span>
        </label>
        <select
          value={selectedProvinceId ? String(selectedProvinceId) : 'ALL'}
          onChange={(e) => onProvinceSelect(e.target.value)}
          className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none transition-all font-medium text-stone-800 cursor-pointer"
        >
          <option value="ALL">{t.allProvinces}</option>
          {provinces.map((prov) => (
            <option key={prov.id} value={prov.id}>
              {lang === 'lo'
                ? `${prov.nameLo} (${prov.nameEn})`
                : `${prov.nameEn} (${prov.nameLo})`}
            </option>
          ))}
        </select>
      </div>

      {/* 3. District Selector (Cascading) */}
      {selectedProvinceId && districts.length > 0 && (
        <div className="space-y-1.5 animate-fadeIn">
          <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <span>{lang === 'lo' ? 'ເມືອງໃນແຂວງນີ້' : 'District in Province'}</span>
          </label>
          <select
            value={selectedDistrictId ? String(selectedDistrictId) : 'ALL'}
            onChange={(e) => onDistrictSelect(e.target.value)}
            className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none transition-all font-medium text-stone-800 cursor-pointer"
          >
            <option value="ALL">{t.allDistricts}</option>
            {districts.map((dist) => (
              <option key={dist.id} value={dist.id}>
                {lang === 'lo' ? dist.nameLo : dist.nameEn}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 4. Categories Vertical List with Counts */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-stone-700 block">
          {lang === 'lo' ? 'ໝວດໝູ່ສະຖານທີ່ (Categories)' : 'Categories'}
        </label>
        <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
          {/* All Categories Button */}
          <button
            type="button"
            onClick={() => onCategorySelect(null)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              selectedCategory === null
                ? 'bg-teal-600 text-white shadow-xs font-semibold'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <Compass className="w-3.5 h-3.5" />
              <span>{t.allCategories}</span>
            </div>
            {selectedCategory === null && <Check className="w-3.5 h-3.5" />}
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategorySelect(cat.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-teal-600 text-white shadow-xs font-semibold'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className={isSelected ? 'text-white' : ''}>
                    {getCategoryIcon(cat.slug)}
                  </span>
                  <span className="truncate">{cat.name}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {cat._count?.places !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      {cat._count.places}
                    </span>
                  )}
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
