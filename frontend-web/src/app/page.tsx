'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/layout/Navbar';
import PlaceCard from '../components/places/PlaceCard';
import PlaceCardSkeleton from '../components/places/PlaceCardSkeleton';
import SubmitPlaceModal from '../components/places/SubmitPlaceModal';
import PlaceDetailModal from '../components/places/PlaceDetailModal';
import MyPostsModal from '../components/places/MyPostsModal';
import { api } from '../lib/api';
import { Category, Place, Province, District } from '../types/api';
import { Language, translations } from '../lib/i18n';
import { useRouter } from 'next/navigation';
import HeroBannerSlider from '../components/home/HeroBannerSlider';
import {
  Search,
  MapPin,
  Waves,
  Coffee,
  TreePine,
  Landmark,
  Mountain,
  Utensils,
  Compass,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  RotateCcw,
  Clock,
} from 'lucide-react';
import FilterPanel from '../components/home/FilterPanel';

const PAGE_SIZE = 20;

export default function HomePage() {
  const router = useRouter();

  // Language state
  const [lang, setLang] = useState<Language>('lo');
  const t = translations[lang];

  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [totalPlaces, setTotalPlaces] = useState(0);

  // Filter & Pagination states
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState<string>('popular');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isMyPostsModalOpen, setIsMyPostsModalOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [activePlaceDetail, setActivePlaceDetail] = useState<Place | null>(null);
  const [currentYear, setCurrentYear] = useState('2026');

  // Initialize from URL query parameters & Language & Year on client mount
  useEffect(() => {
    setCurrentYear(String(new Date().getFullYear()));
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('wtg_lang') as Language | null;
      if (savedLang && (savedLang === 'lo' || savedLang === 'en')) {
        setLang(savedLang);
      }

      // Read URL search params: &search= &sort=recent,1,3,6,9 &province= &category=
      const params = new URLSearchParams(window.location.search);
      const qParam = params.get('search') || params.get('q');
      const sortParam = params.get('sort');
      const provParam = params.get('province') || params.get('provinceId');
      const catParam = params.get('category') || params.get('categoryId');

      if (qParam) setSearchQuery(qParam);
      if (sortParam) setSelectedSort(sortParam);
      if (provParam && !isNaN(Number(provParam))) setSelectedProvinceId(Number(provParam));
      if (catParam && !isNaN(Number(catParam))) setSelectedCategory(Number(catParam));
    }
  }, []);

  // Synchronize filter state changes into URL query params
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (selectedSort && selectedSort !== 'popular') params.set('sort', selectedSort);
    if (selectedProvinceId) params.set('province', String(selectedProvinceId));
    if (selectedCategory) params.set('category', String(selectedCategory));

    const qs = params.toString();
    const newUrl = qs ? `/?${qs}` : '/';
    if (window.location.search !== (qs ? `?${qs}` : '')) {
      window.history.replaceState(null, '', newUrl);
    }
  }, [searchQuery, selectedSort, selectedProvinceId, selectedCategory]);

  const handleLangChange = (newLang: Language) => {
    setLang(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('wtg_lang', newLang);
    }
  };

  // Load Provinces & Categories on mount
  useEffect(() => {
    api.categories
      .list()
      .then(setCategories)
      .catch((err) => console.error('Failed to load categories', err));

    api.provinces
      .list()
      .then(setProvinces)
      .catch((err) => console.error('Failed to load provinces', err));
  }, []);

  // Fetch places
  const loadPlaces = useCallback(
    (
      catId: number | null,
      provId: number | null,
      distId: number | null,
      q: string,
      sortVal: string,
      targetPage: number,
    ) => {
      setIsLoading(true);
      const offset = (targetPage - 1) * PAGE_SIZE;

      api.places
        .list({
          categoryId: catId || undefined,
          provinceId: provId || undefined,
          districtId: distId || undefined,
          q: q.trim() || undefined,
          sort: sortVal || undefined,
          limit: PAGE_SIZE,
          offset,
        })
        .then((res) => {
          setPlaces(res.items);
          setTotalPlaces(res.meta?.total ?? res.items.length);
        })
        .catch((err) => console.error('Failed to load places', err))
        .finally(() => setIsLoading(false));
    },
    [],
  );

  // Trigger search on filter changes
  useEffect(() => {
    loadPlaces(selectedCategory, selectedProvinceId, selectedDistrictId, searchQuery, selectedSort, page);
  }, [selectedCategory, selectedProvinceId, selectedDistrictId, searchQuery, selectedSort, page, loadPlaces]);

  // Handle Province selection & load Districts
  const handleProvinceSelect = (provIdStr: string) => {
    const provId = provIdStr === 'ALL' ? null : parseInt(provIdStr, 10);
    setSelectedProvinceId(provId);
    setSelectedDistrictId(null);
    setPage(1);

    if (provId) {
      api.provinces
        .districts(provId)
        .then(setDistricts)
        .catch((err) => {
          console.error('Failed to load districts', err);
          setDistricts([]);
        });
    } else {
      setDistricts([]);
    }
  };

  const handleDistrictSelect = (distIdStr: string) => {
    const distId = distIdStr === 'ALL' ? null : parseInt(distIdStr, 10);
    setSelectedDistrictId(distId);
    setPage(1);
  };

  const handleCategorySelect = (catId: number | null) => {
    setSelectedCategory(catId);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSelectedCategory(null);
    setSelectedProvinceId(null);
    setSelectedDistrictId(null);
    setSearchQuery('');
    setSelectedSort('popular');
    setDistricts([]);
    setPage(1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadPlaces(selectedCategory, selectedProvinceId, selectedDistrictId, searchQuery, selectedSort, 1);
  };

  const activeFilterCount =
    (selectedCategory !== null ? 1 : 0) +
    (selectedProvinceId !== null ? 1 : 0) +
    (selectedDistrictId !== null ? 1 : 0) +
    (searchQuery.trim() !== '' ? 1 : 0) +
    (selectedSort !== 'popular' ? 1 : 0);

  const totalPages = Math.max(1, Math.ceil(totalPlaces / PAGE_SIZE));

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'waterfalls':
        return <Waves className="w-4 h-4" />;
      case 'cafes':
        return <Coffee className="w-4 h-4" />;
      case 'forest-nature':
        return <TreePine className="w-4 h-4" />;
      case 'culture-temples':
        return <Landmark className="w-4 h-4" />;
      case 'viewpoints':
        return <Mountain className="w-4 h-4" />;
      case 'local-markets':
        return <Utensils className="w-4 h-4" />;
      default:
        return <Compass className="w-4 h-4" />;
    }
  };

  const selectedProvinceName = selectedProvinceId
    ? provinces.find((p) => p.id === selectedProvinceId)?.[lang === 'lo' ? 'nameLo' : 'nameEn'] ||
      provinces.find((p) => p.id === selectedProvinceId)?.nameEn
    : t.allProvinces;

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex flex-col text-stone-900 font-sans">
      <Navbar
        onOpenSubmit={() => setIsSubmitModalOpen(true)}
        onOpenMyPosts={() => setIsMyPostsModalOpen(true)}
        lang={lang}
        onLangChange={handleLangChange}
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-teal-900 via-teal-800 to-teal-900 text-white py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-700/60 border border-teal-500/30 text-amber-300 text-xs font-semibold mb-4 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.brandSub}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            {t.heroTitle} <br className="hidden sm:inline" />
            <span className="text-amber-400">
              {lang === 'lo' ? 'ທົ່ວ 18 ແຂວງທົ່ວປະເທດ' : 'Across all 18 Provinces'}
            </span>
          </h1>

          <p className="mt-3 text-sm md:text-base text-teal-100 max-w-2xl mx-auto leading-relaxed">
            {t.heroSubtitle}
          </p>

          {/* Search & Province Filter Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 max-w-3xl mx-auto bg-white p-2 rounded-2xl shadow-xl shadow-teal-950/20 flex flex-col sm:flex-row items-center gap-2 border border-stone-200"
          >
            {/* Search Input */}
            <div className="flex-1 flex items-center gap-2.5 px-3 py-2 w-full text-stone-900">
              <Search className="w-4 h-4 text-stone-400 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full text-xs md:text-sm bg-transparent border-none outline-none placeholder:text-stone-400 font-sans"
              />
            </div>

            {/* Province Selector (18 Provinces) */}
            <div className="flex items-center gap-2 px-3 py-1.5 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-stone-100">
              <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0" />
              <select
                value={selectedProvinceId ? String(selectedProvinceId) : 'ALL'}
                onChange={(e) => handleProvinceSelect(e.target.value)}
                className="bg-transparent text-xs font-semibold text-stone-700 outline-none cursor-pointer w-full max-w-[170px]"
              >
                <option value="ALL">{t.allProvinces}</option>
                {provinces.map((prov) => (
                  <option key={prov.id} value={prov.id}>
                    {lang === 'lo' ? `${prov.nameLo} (${prov.nameEn})` : `${prov.nameEn} (${prov.nameLo})`}
                  </option>
                ))}
              </select>
            </div>

            {/* District Selector (If Province selected) */}
            {districts.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-stone-100 animate-fadeIn">
                <Filter className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                <select
                  value={selectedDistrictId ? String(selectedDistrictId) : 'ALL'}
                  onChange={(e) => handleDistrictSelect(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-stone-700 outline-none cursor-pointer w-full max-w-[150px]"
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

            {/* Search Button */}
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-teal-700/20"
            >
              <Search className="w-4 h-4" />
              <span>{lang === 'lo' ? 'ຄົ້ນຫາ' : 'Search'}</span>
            </button>
          </form>

          {/* Featured Destinations Banner Slideshow */}
          {places.length > 0 && (
            <HeroBannerSlider places={places} lang={lang} />
          )}
        </div>
      </section>

      {/* Categories Bar */}
      <section className="bg-white border-b border-stone-200 py-3 px-4 sm:px-6 lg:px-8 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => handleCategorySelect(null)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === null
                ? 'bg-teal-600 text-white shadow-sm shadow-teal-700/20'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            {t.allCategories}
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-700/20'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
              }`}
            >
              {getCategoryIcon(cat.slug)}
              <span>{cat.name}</span>
              {cat._count?.places !== undefined && (
                <span className="text-[10px] opacity-75">({cat._count.places})</span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Main Grid Section with Desktop Left Filter & Mobile Modal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Desktop Left Sidebar Filter */}
          <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-24">
            <FilterPanel
              lang={lang}
              categories={categories}
              provinces={provinces}
              districts={districts}
              selectedCategory={selectedCategory}
              selectedProvinceId={selectedProvinceId}
              selectedDistrictId={selectedDistrictId}
              searchQuery={searchQuery}
              selectedSort={selectedSort}
              onSearchChange={(q) => {
                setSearchQuery(q);
                setPage(1);
              }}
              onSortChange={(s) => {
                setSelectedSort(s);
                setPage(1);
              }}
              onProvinceSelect={handleProvinceSelect}
              onDistrictSelect={handleDistrictSelect}
              onCategorySelect={handleCategorySelect}
              onResetFilters={handleResetFilters}
              totalResults={totalPlaces}
            />
          </aside>

          {/* Right Column: Places Grid & Filter Results */}
          <div className="flex-1 w-full min-w-0">
            {/* Header Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-stone-900">
                  {selectedCategory
                    ? categories.find((c) => c.id === selectedCategory)?.name
                    : lang === 'lo'
                      ? 'ສະຖານທີ່ທ່ອງທ່ຽວທີ່ໄດ້ຮັບການອະນຸມັດ'
                      : 'Approved Places in Laos'}
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  {lang === 'lo'
                    ? `ພົບ ${totalPlaces} ສະຖານທີ່ ໃນ ${selectedProvinceName} (ສະແດງ 20 ລາຍການຕໍ່ໜ້າ)`
                    : `Found ${totalPlaces} verified places in ${selectedProvinceName} (showing 20 per page)`}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                {/* Mobile Filter Button (opens bottom sheet modal) */}
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-stone-800 text-xs font-bold shadow-xs hover:bg-stone-50 active:scale-95 transition-all cursor-pointer"
                >
                  <Filter className="w-4 h-4 text-teal-600" />
                  <span>{lang === 'lo' ? 'ຕົວກັ່ນຕອງ' : 'Filter Places'}</span>
                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* Quick Pagination info */}
                {totalPlaces > 0 && (
                  <div className="text-xs text-stone-500 bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200 hidden sm:block font-medium">
                    {t.page} <span className="font-bold text-stone-800">{page}</span> {t.of}{' '}
                    <span className="font-bold text-stone-800">{totalPages}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Recency & Timeframe Toolbar (&sort=recent, 1, 3, 6, 9) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none text-xs">
              <span className="text-stone-400 text-[11px] font-semibold flex items-center gap-1 flex-shrink-0 mr-1">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>{lang === 'lo' ? 'ລຳດັບ/ຊ່ວງເວລາ:' : 'Sort/Time:'}</span>
              </span>
              {[
                { id: 'popular', labelLo: '🔥 ຍອດນິຍົມ', labelEn: '🔥 Popular' },
                { id: 'recent', labelLo: '✨ ລ່າສຸດ', labelEn: '✨ Recent' },
                { id: '1', labelLo: '📅 ເດືອນນີ້ (1M)', labelEn: '📅 This Month' },
                { id: '3', labelLo: '⏳ 3 ເດືອນ', labelEn: '⏳ 3 Months' },
                { id: '6', labelLo: '🗓️ 6 ເດືອນ', labelEn: '🗓️ 6 Months' },
                { id: '9', labelLo: '🗓️ 9 ເດືອນ', labelEn: '🗓️ 9 Months' },
              ].map((tab) => {
                const active = selectedSort === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setSelectedSort(tab.id);
                      setPage(1);
                    }}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      active
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200'
                    }`}
                  >
                    {lang === 'lo' ? tab.labelLo : tab.labelEn}
                  </button>
                );
              })}
            </div>

            {/* Active Filter Tags */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-6 p-2.5 bg-stone-100/80 rounded-2xl border border-stone-200/80 text-xs animate-fadeIn">
                <span className="text-stone-500 text-[11px] font-semibold pl-1">
                  {lang === 'lo' ? 'ກັ່ນຕອງຢູ່:' : 'Active filters:'}
                </span>

                {searchQuery.trim() && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-stone-200 text-stone-800 text-xs shadow-xs">
                    <span>"{searchQuery}"</span>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setPage(1);
                      }}
                      className="text-stone-400 hover:text-stone-700 ml-1"
                    >
                      ×
                    </button>
                  </span>
                )}

                {selectedProvinceId && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-medium">
                    <span>{selectedProvinceName}</span>
                    <button
                      onClick={() => handleProvinceSelect('ALL')}
                      className="text-teal-600 hover:text-teal-800 ml-1"
                    >
                      ×
                    </button>
                  </span>
                )}

                {selectedDistrictId && districts.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-medium">
                    <span>{districts.find((d) => d.id === selectedDistrictId)?.[lang === 'lo' ? 'nameLo' : 'nameEn']}</span>
                    <button
                      onClick={() => handleDistrictSelect('ALL')}
                      className="text-teal-600 hover:text-teal-800 ml-1"
                    >
                      ×
                    </button>
                  </span>
                )}

                {selectedCategory !== null && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-medium">
                    <span>{categories.find((c) => c.id === selectedCategory)?.name}</span>
                    <button
                      onClick={() => handleCategorySelect(null)}
                      className="text-teal-600 hover:text-teal-800 ml-1"
                    >
                      ×
                    </button>
                  </span>
                )}

                {selectedSort !== 'popular' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
                    <span>
                      {selectedSort === 'recent'
                        ? (lang === 'lo' ? '✨ ລ່າສຸດ' : '✨ Recent')
                        : selectedSort === '1'
                        ? (lang === 'lo' ? '📅 ເດືອນນີ້ (1M)' : '📅 This Month')
                        : selectedSort === '3'
                        ? (lang === 'lo' ? '⏳ 3 ເດືອນ' : '⏳ 3 Months')
                        : selectedSort === '6'
                        ? (lang === 'lo' ? '🗓️ 6 ເດືອນ' : '🗓️ 6 Months')
                        : (lang === 'lo' ? '🗓️ 9 ເດືອນ' : '🗓️ 9 Months')}
                    </span>
                    <button
                      onClick={() => setSelectedSort('popular')}
                      className="text-amber-600 hover:text-amber-800 ml-1"
                    >
                      ×
                    </button>
                  </span>
                )}

                <button
                  onClick={handleResetFilters}
                  className="text-rose-600 hover:text-rose-800 text-xs font-semibold ml-auto pr-1 transition-colors cursor-pointer"
                >
                  {lang === 'lo' ? 'ລ້າງທັງໝົດ' : 'Clear All'}
                </button>
              </div>
            )}

            {/* Places Grid with Skeleton Loading */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <PlaceCardSkeleton key={idx} />
                ))}
              </div>
            ) : places.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-3xl border border-stone-200/80 p-8 max-w-md mx-auto shadow-xs">
                <Compass className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-stone-800">{t.emptyTitle}</h3>
                <p className="text-xs text-stone-500 mt-1 mb-4">{t.emptySubtitle}</p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl"
                  >
                    {lang === 'lo' ? 'ລ້າງການກັ່ນຕອງ' : 'Reset Filters'}
                  </button>
                  <button
                    onClick={() => setIsSubmitModalOpen(true)}
                    className="px-4 py-2 bg-teal-600 text-white text-xs font-semibold rounded-xl hover:bg-teal-700 shadow-sm"
                  >
                    {t.navSharePlace}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {places.map((place) => (
                    <PlaceCard
                      key={place.id}
                      place={place}
                      onOpenDetail={(p) => router.push(`/post/${p.slug || p.id}`)}
                      onRequireAuth={() => router.push('/login')}
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-3">
                    <button
                      disabled={page <= 1}
                      onClick={() => {
                        const prev = Math.max(1, page - 1);
                        setPage(prev);
                        window.scrollTo({ top: 320, behavior: 'smooth' });
                      }}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        page <= 1
                          ? 'bg-stone-50 text-stone-300 border-stone-200 cursor-not-allowed'
                          : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50 active:bg-stone-100 shadow-xs'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      {t.prev}
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }).map((_, idx) => {
                        const pageNum = idx + 1;
                        if (
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          (pageNum >= page - 2 && pageNum <= page + 2)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => {
                                setPage(pageNum);
                                window.scrollTo({ top: 320, behavior: 'smooth' });
                              }}
                              className={`w-8 h-8 rounded-xl text-xs font-semibold transition-all ${
                                pageNum === page
                                  ? 'bg-teal-600 text-white shadow-xs'
                                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                        if (pageNum === page - 3 || pageNum === page + 3) {
                          return (
                            <span key={pageNum} className="px-1 text-xs text-stone-400">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>

                    <button
                      disabled={page >= totalPages}
                      onClick={() => {
                        const next = Math.min(totalPages, page + 1);
                        setPage(next);
                        window.scrollTo({ top: 320, behavior: 'smooth' });
                      }}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        page >= totalPages
                          ? 'bg-stone-50 text-stone-300 border-stone-200 cursor-not-allowed'
                          : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50 active:bg-stone-100 shadow-xs'
                      }`}
                    >
                      {t.next}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filter Modal / Bottom Sheet */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden z-10 animate-in slide-in-from-bottom duration-250">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-teal-600" />
                <h3 className="font-bold text-sm text-stone-900">
                  {lang === 'lo' ? 'ຕົວກັ່ນຕອງສະຖານທີ່' : 'Filter Places'}
                </h3>
              </div>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              <FilterPanel
                lang={lang}
                categories={categories}
                provinces={provinces}
                districts={districts}
                selectedCategory={selectedCategory}
                selectedProvinceId={selectedProvinceId}
                selectedDistrictId={selectedDistrictId}
                searchQuery={searchQuery}
                selectedSort={selectedSort}
                onSearchChange={(q) => {
                  setSearchQuery(q);
                  setPage(1);
                }}
                onSortChange={(s) => {
                  setSelectedSort(s);
                  setPage(1);
                }}
                onProvinceSelect={handleProvinceSelect}
                onDistrictSelect={handleDistrictSelect}
                onCategorySelect={handleCategorySelect}
                onResetFilters={handleResetFilters}
                totalResults={totalPlaces}
              />
            </div>

            <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center gap-3">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-700 text-xs font-semibold hover:bg-stone-100 active:bg-stone-200"
              >
                {lang === 'lo' ? 'ລ້າງທັງໝົດ' : 'Reset All'}
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-[2] py-2.5 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 active:bg-teal-800 shadow-sm"
              >
                {lang === 'lo' ? `ສະແດງ (${totalPlaces}) ລາຍການ` : `Apply (${totalPlaces} Results)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Place Modal */}
      <SubmitPlaceModal
        isOpen={isSubmitModalOpen}
        categories={categories}
        onClose={() => setIsSubmitModalOpen(false)}
        onSuccess={() =>
          loadPlaces(selectedCategory, selectedProvinceId, selectedDistrictId, searchQuery, selectedSort, 1)
        }
        onRequireLogin={() => router.push('/login')}
        lang={lang}
      />

      {/* User's My Posts Modal */}
      <MyPostsModal
        isOpen={isMyPostsModalOpen}
        onClose={() => setIsMyPostsModalOpen(false)}
        lang={lang}
        onPlaceUpdated={() =>
          loadPlaces(selectedCategory, selectedProvinceId, selectedDistrictId, searchQuery, selectedSort, page)
        }
      />

      {/* Place Detail Modal */}
      <PlaceDetailModal
        place={activePlaceDetail}
        onClose={() => setActivePlaceDetail(null)}
        onRequireAuth={() => router.push('/login')}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-8 px-4 text-center text-xs text-stone-500">
        <div className="max-w-4xl mx-auto space-y-2">
          <div className="flex items-center justify-center gap-2.5 mb-2">
            <div className="relative">
              <img src="/logo-v2.png" alt="WhereToGo Laos Main Logo" className="w-8 h-8 rounded-xl object-contain bg-white p-0.5 border border-stone-200 shadow-xs" />
              <img src="/logo.png" alt="Sub Logo" className="w-3.5 h-3.5 rounded-full object-contain absolute -bottom-1 -right-1 border border-white shadow-xs bg-white" />
            </div>
            <span className="font-extrabold text-sm text-stone-900 tracking-tight">Where to Go in Laos (ໄປໃສດີ)</span>
          </div>
          <p className="font-semibold text-stone-800 text-xs">
            Copyright © {currentYear} Make by Med newbie DEV. All rights reserved.
          </p>
          <p className="text-stone-600 max-w-xl mx-auto leading-relaxed text-xs">
            {lang === 'lo'
              ? 'ສ້າງຂຶ້ນເພື່ອໂຄສະນາປະເທດລາວສູ່ສາຍຕາຊາວໂລກ ສຳລັບທຸກຄົນທີ່ຢາກມາທ່ຽວລາວ ແລະ ຊ່ວຍສົ່ງເສີມທຸລະກິດລາວໃຫ້ເຕີບໃຫຍ່ :)'
              : 'Use for advertise Laos country to the world who wanna visit Laos and grow Laos business :)'}
          </p>
          <p className="text-[11px] text-stone-400 pt-3 border-t border-stone-100">
            {lang === 'lo'
              ? 'ຮອງຮັບ 18 ແຂວງ ແລະ 148 ເມືອງທົ່ວລາວ • ລະບົບ WebP Image Optimizer & Noto Sans Lao'
              : 'Covering 18 Provinces & 148 Lao Districts • WebP Image Optimizer & Noto Sans Lao'}
          </p>
        </div>
      </footer>
    </div>
  );
}
