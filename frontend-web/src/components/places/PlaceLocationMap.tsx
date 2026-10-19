'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, ExternalLink, Copy, Check, Compass } from 'lucide-react';

interface PlaceLocationMapProps {
  latitude?: number | null;
  longitude?: number | null;
  placeTitle: string;
  province?: string;
  address?: string | null;
  lang?: 'lo' | 'en';
}

export default function PlaceLocationMap({
  latitude,
  longitude,
  placeTitle,
  province,
  address,
  lang = 'lo',
}: PlaceLocationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [copied, setCopied] = useState(false);

  // If coordinates are missing, fallback to central Vientiane
  const hasCoords =
    latitude !== null &&
    latitude !== undefined &&
    longitude !== null &&
    longitude !== undefined &&
    !isNaN(Number(latitude)) &&
    !isNaN(Number(longitude));

  const lat = hasCoords ? Number(latitude) : 17.9757;
  const lng = hasCoords ? Number(longitude) : 102.6331;

  const googleMapsUrl = hasCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${placeTitle} ${province || 'Laos'}`
      )}`;

  const appleMapsUrl = hasCoords
    ? `https://maps.apple.com/?daddr=${lat},${lng}`
    : `https://maps.apple.com/?q=${encodeURIComponent(`${placeTitle} ${province || 'Laos'}`)}`;

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;
      const L = (await import('leaflet')).default;

      if (!isMounted || mapInstanceRef.current) return;

      const pinIcon = L.divIcon({
        className: 'place-detail-pin',
        html: `
          <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 100%; height: 100%; background: radial-gradient(circle, rgba(13,148,136,0.45) 0%, rgba(13,148,136,0) 70%); border-radius: 50%;"></div>
            <div style="width: 30px; height: 30px; background: #0D9488; border: 3px solid #ffffff; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 4px 12px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center;">
              <div style="width: 9px; height: 9px; background: #FEF08A; border-radius: 50%;"></div>
            </div>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -34],
      });

      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: hasCoords ? 15 : 9,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
      marker.bindPopup(`<b>${placeTitle}</b><br/>${address || province || ''}`).openPopup();

      mapInstanceRef.current = map;
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, hasCoords, placeTitle, address, province]);

  const handleCopyCoords = () => {
    if (!hasCoords) return;
    navigator.clipboard.writeText(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
      {/* Title & Coordinates Badge */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-teal-600" />
          <span>{lang === 'lo' ? 'ແຜນທີ່ & ເສັ້ນທາງນຳທາງ' : 'Location & Directions'}</span>
        </h3>

        {hasCoords && (
          <button
            onClick={handleCopyCoords}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-mono font-medium transition-colors cursor-pointer"
            title="Copy coordinates"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-700 font-sans">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-stone-500" />
                <span>
                  {lat.toFixed(4)}, {lng.toFixed(4)}
                </span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Map Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-stone-200 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-56 z-0" />
      </div>

      {/* Address if available */}
      {address && (
        <p className="text-xs text-stone-600 leading-relaxed flex items-start gap-1.5">
          <span className="font-semibold text-stone-800">{lang === 'lo' ? 'ທີ່ຕັ້ງ:' : 'Location:'}</span>
          <span>{address}</span>
        </p>
      )}

      {/* Direct Google Maps & Apple Maps Navigation Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-sm shadow-teal-900/10 transition-all hover:scale-[1.02]"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>{lang === 'lo' ? 'ນຳທາງດ້ວຍ Google Maps' : 'Open in Google Maps'}</span>
          <ExternalLink className="w-3 h-3 opacity-80" />
        </a>

        <a
          href={appleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 text-stone-800 rounded-xl text-xs font-semibold border border-stone-200 transition-all hover:scale-[1.02]"
        >
          <Compass className="w-3.5 h-3.5 text-stone-600" />
          <span>{lang === 'lo' ? 'Apple Maps' : 'Apple Maps'}</span>
          <ExternalLink className="w-3 h-3 opacity-60" />
        </a>
      </div>
    </div>
  );
}
