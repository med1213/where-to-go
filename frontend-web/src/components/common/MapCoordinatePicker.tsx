'use client';

import React, { useEffect, useRef } from 'react';
import { Compass, Navigation } from 'lucide-react';

interface MapCoordinatePickerProps {
  latitude?: number | string | null;
  longitude?: number | string | null;
  onChange: (lat: number, lng: number) => void;
  className?: string;
  lang?: 'lo' | 'en';
}

const LAOS_HUBS = [
  { nameLo: 'ວຽງຈັນ', nameEn: 'Vientiane', lat: 17.9757, lng: 102.6331 },
  { nameLo: 'ວັງວຽງ', nameEn: 'Vang Vieng', lat: 18.9224, lng: 102.4486 },
  { nameLo: 'ຫຼວງພະບາງ', nameEn: 'Luang Prabang', lat: 19.8893, lng: 102.1337 },
  { nameLo: 'ປາກເຊ', nameEn: 'Pakse', lat: 15.1202, lng: 105.7989 },
  { nameLo: 'ຄໍາມ່ວນ', nameEn: 'Kong Lor', lat: 17.8967, lng: 104.7297 },
  { nameLo: 'ສີ່ພັນດອນ', nameEn: '4000 Islands', lat: 13.9632, lng: 105.9189 },
];

export default function MapCoordinatePicker({
  latitude,
  longitude,
  onChange,
  className = '',
  lang = 'lo',
}: MapCoordinatePickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const parsedLat = typeof latitude === 'number' ? latitude : parseFloat(String(latitude || ''));
  const parsedLng = typeof longitude === 'number' ? longitude : parseFloat(String(longitude || ''));

  const hasCoords = !isNaN(parsedLat) && !isNaN(parsedLng);
  const currentLat = hasCoords ? parsedLat : 17.9757;
  const currentLng = hasCoords ? parsedLng : 102.6331;

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;
      const L = (await import('leaflet')).default;

      if (!isMounted || mapInstanceRef.current) return;

      const createPinIcon = () =>
        L.divIcon({
          className: 'custom-web-pin',
          html: `
            <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; width: 100%; height: 100%; background: radial-gradient(circle, rgba(13,148,136,0.4) 0%, rgba(13,148,136,0) 70%); border-radius: 50%;"></div>
              <div style="width: 26px; height: 26px; background: #0D9488; border: 2.5px solid #ffffff; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
                <div style="width: 7px; height: 7px; background: #FEF08A; border-radius: 50%;"></div>
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -28],
        });

      const map = L.map(mapContainerRef.current, {
        center: [currentLat, currentLng],
        zoom: hasCoords ? 14 : 7,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      if (hasCoords) {
        const marker = L.marker([currentLat, currentLng], {
          icon: createPinIcon(),
          draggable: true,
        }).addTo(map);

        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          onChange(parseFloat(pos.lat.toFixed(6)), parseFloat(pos.lng.toFixed(6)));
        });

        markerRef.current = marker;
      }

      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        const cleanLat = parseFloat(lat.toFixed(6));
        const cleanLng = parseFloat(lng.toFixed(6));

        if (markerRef.current) {
          markerRef.current.setLatLng([cleanLat, cleanLng]);
        } else {
          const marker = L.marker([cleanLat, cleanLng], {
            icon: createPinIcon(),
            draggable: true,
          }).addTo(map);

          marker.on('dragend', () => {
            const pos = marker.getLatLng();
            onChange(parseFloat(pos.lat.toFixed(6)), parseFloat(pos.lng.toFixed(6)));
          });

          markerRef.current = marker;
        }

        onChange(cleanLat, cleanLng);
      });

      mapInstanceRef.current = map;
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (hasCoords) {
      if (markerRef.current) {
        markerRef.current.setLatLng([currentLat, currentLng]);
      }
    } else if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  }, [currentLat, currentLng, hasCoords]);

  const handleSelectPreset = (lat: number, lng: number) => {
    onChange(lat, lng);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 13);
    }
  };

  const handleGetCurrentLocation = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = parseFloat(pos.coords.latitude.toFixed(6));
          const lng = parseFloat(pos.coords.longitude.toFixed(6));
          onChange(lat, lng);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([lat, lng], 14);
          }
        },
        (err) => {
          alert('GPS error: ' + err.message);
        }
      );
    }
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Quick Location Shortcuts & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[11px] font-bold text-stone-500 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-teal-600" />
            <span>{lang === 'lo' ? 'ຈຸດຫຼັກ:' : 'Hubs:'}</span>
          </span>
          {LAOS_HUBS.map((hub) => (
            <button
              key={hub.nameEn}
              type="button"
              onClick={() => handleSelectPreset(hub.lat, hub.lng)}
              className="px-2 py-0.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-medium transition-colors cursor-pointer"
            >
              {lang === 'lo' ? hub.nameLo : hub.nameEn}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-[10px] font-bold transition-colors cursor-pointer"
        >
          <Navigation className="w-3 h-3 text-teal-600" />
          <span>{lang === 'lo' ? 'GPS ປະຈຸບັນ' : 'My GPS'}</span>
        </button>
      </div>

      {/* Map Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-stone-200 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-56 z-0" />

        {/* Floating coordinates badge */}
        <div className="absolute top-2.5 right-2.5 z-[400] bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-stone-200 shadow-md flex items-center gap-1.5 text-[11px]">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <div className="font-mono text-stone-800 font-semibold">
            {hasCoords ? (
              <span>
                Lat: <b className="text-teal-700">{parsedLat.toFixed(4)}</b>, Lng:{' '}
                <b className="text-teal-700">{parsedLng.toFixed(4)}</b>
              </span>
            ) : (
              <span className="text-stone-400">
                {lang === 'lo' ? 'ຄລິກແຜນທີ່ເພື່ອປັກໝຸດ' : 'Click map to pin'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
