'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Place } from '../../types/api';
import { Language } from '../../lib/i18n';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Sparkles,
  Trophy,
  ArrowRight,
  Heart,
} from 'lucide-react';

export interface HeroBanner {
  id: string;
  titleLo: string;
  titleEn?: string | null;
  subtitleLo?: string | null;
  subtitleEn?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  placeId?: string | null;
  sortOrder?: number;
}

interface HeroBannerSliderProps {
  places: Place[];
  lang: Language;
}

export default function HeroBannerSlider({ places, lang }: HeroBannerSliderProps) {
  const [customBanners, setCustomBanners] = useState<HeroBanner[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch custom marketing banners if available
  useEffect(() => {
    fetch('http://localhost:4000/api/v1/banners/public')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCustomBanners(data);
        }
      })
      .catch((err) => console.log('No custom banners, fallback to places:', err));
  }, []);

  // Use custom banners if present, otherwise fallback to top 5 places
  const hasCustom = customBanners.length > 0;

  const slides = hasCustom
    ? customBanners.map((b) => ({
        id: b.id,
        title: lang === 'en' && b.titleEn ? b.titleEn : b.titleLo,
        description: lang === 'en' && b.subtitleEn ? b.subtitleEn : b.subtitleLo || '',
        imageUrl: b.imageUrl,
        link: b.linkUrl || (b.placeId ? `/post/${b.placeId}` : '#'),
        isCustom: true,
        category: null as any,
        province: 'Laos (ທ່ຽວທົ່ວລາວ)',
        district: null as string | null,
        priceLao: null as string | null,
        priceForeigner: null as string | null,
        user: null as any,
      }))
    : places.slice(0, 5).map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        imageUrl:
          p.media && p.media.length > 0
            ? p.media.find((m) => m.isCover)?.url || p.media[0].url
            : 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1600&q=80',
        link: `/post/${p.slug || p.id}`,
        isCustom: false,
        category: p.category,
        province: p.province,
        district: p.district,
        priceLao: p.priceLao,
        priceForeigner: p.priceForeigner,
        user: p.user,
      }));

  const totalSlides = slides.length;

  useEffect(() => {
    if (totalSlides <= 1 || isHovered) return;

    timerRef.current = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % totalSlides);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [totalSlides, isHovered]);

  if (totalSlides === 0) return null;

  const currentSlide = slides[currentIdx % totalSlides];

  const nextSlide = () => {
    setCurrentIdx((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentIdx((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-white/10 group mb-10 mt-6 aspect-[16/9] sm:aspect-[21/9] max-h-[460px] bg-stone-900"
    >
      {/* Background Image Slides */}
      {slides.map((slide, idx) => {
        const isActive = idx === (currentIdx % totalSlides);

        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            } transform transition-transform duration-7000`}
          >
            <img
              src={slide.imageUrl}
              alt={slide.title}
              className="w-full h-full object-cover object-center"
            />
          </div>
        );
      })}

      {/* Modern Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-teal-950/80 via-transparent to-transparent hidden md:block" />

      {/* Slide Content */}
      <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end text-white z-10">
        <div className="max-w-2xl space-y-3">
          {/* Top Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/90 text-white text-[11px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>
                {currentSlide.isCustom
                  ? lang === 'lo'
                    ? 'ໂປຣໂມດພິເສດ'
                    : 'Special Showcase'
                  : lang === 'lo'
                  ? 'ສະຖານທີ່ແນະນຳ'
                  : 'Featured Spot'}
              </span>
            </span>

            {currentSlide.category && (
              <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-bold backdrop-blur-md border border-white/20">
                {currentSlide.category.name}
              </span>
            )}

            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-teal-950/60 text-teal-200 text-[11px] font-semibold backdrop-blur-md border border-teal-500/30">
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>
                {currentSlide.province} {currentSlide.district ? `• ${currentSlide.district}` : ''}
              </span>
            </div>
          </div>

          {/* Place Title */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight drop-shadow-lg text-white font-lao line-clamp-1">
            {currentSlide.title}
          </h2>

          {/* Description snippet */}
          {currentSlide.description && (
            <p className="text-xs sm:text-sm text-stone-200 line-clamp-2 max-w-xl drop-shadow leading-relaxed font-lao">
              {currentSlide.description}
            </p>
          )}

          {/* Creator & CTA Row */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              href={currentSlide.link}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs sm:text-sm font-black shadow-lg shadow-amber-950/30 transition-all transform hover:scale-105 font-lao"
            >
              <span>{lang === 'lo' ? 'ໄປທ່ອງທ່ຽວບ່ອນນີ້ (Explore)' : 'Explore Attraction'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Pricing Tag */}
            {(currentSlide.priceLao || currentSlide.priceForeigner) && (
              <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-black/50 backdrop-blur-md border border-white/20">
                {currentSlide.priceLao && (
                  <span className="text-teal-300">🇱🇦 {currentSlide.priceLao}</span>
                )}
                {currentSlide.priceForeigner && (
                  <span className="text-amber-300 border-l border-white/20 pl-2">
                    🌐 {currentSlide.priceForeigner}
                  </span>
                )}
              </div>
            )}

            {/* Creator Badge */}
            {currentSlide.user && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-stone-300 font-medium">
                <span>{lang === 'lo' ? 'ໂພສໂດຍ:' : 'Posted by:'}</span>
                <span className="font-bold text-white font-lao">{currentSlide.user.displayName}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prev / Next Arrows */}
      {totalSlides > 1 && (
        <>
          <button
            onClick={prevSlide}
            title="Previous Slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-20 border border-white/20"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            title="Next Slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-20 border border-white/20"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Indicator Dots */}
          <div className="absolute bottom-4 right-6 flex items-center gap-2 z-20">
            {slides.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => setCurrentIdx(dotIdx)}
                className={`transition-all rounded-full ${
                  dotIdx === (currentIdx % totalSlides)
                    ? 'w-7 h-2 bg-amber-400'
                    : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                }`}
                title={`Go to slide ${dotIdx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

