import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, Compass, Check, RotateCcw } from 'lucide-react';

interface MapCoordinatePickerProps {
  latitude?: number | string | null;
  longitude?: number | string | null;
  onChange: (lat: number, lng: number) => void;
  className?: string;
}

// Popular Lao destinations for 1-click teleportation
const LAOS_HUBS = [
  { name: 'ວຽງຈັນ (Vientiane)', lat: 17.9757, lng: 102.6331 },
  { name: 'ວັງວຽງ (Vang Vieng)', lat: 18.9224, lng: 102.4486 },
  { name: 'ຫຼວງພະບາງ (Luang Prabang)', lat: 19.8893, lng: 102.1337 },
  { name: 'ປາກເຊ (Pakse)', lat: 15.1202, lng: 105.7989 },
  { name: 'ຄໍາມ່ວນ (Kong Lor)', lat: 17.8967, lng: 104.7297 },
  { name: 'ສີ່ພັນດອນ (4000 Islands)', lat: 13.9632, lng: 105.9189 },
];

export default function MapCoordinatePicker({
  latitude,
  longitude,
  onChange,
  className = '',
}: MapCoordinatePickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const parsedLat = typeof latitude === 'number' ? latitude : parseFloat(String(latitude || ''));
  const parsedLng = typeof longitude === 'number' ? longitude : parseFloat(String(longitude || ''));

  const hasCoords = !isNaN(parsedLat) && !isNaN(parsedLng);
  const currentLat = hasCoords ? parsedLat : 17.9757; // Default: Vientiane Capital
  const currentLng = hasCoords ? parsedLng : 102.6331;

  // Modern styled HTML DivIcon
  const createPinIcon = () =>
    L.divIcon({
      className: 'custom-pin-icon',
      html: `
        <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 100%; height: 100%; background: radial-gradient(circle, rgba(13,148,136,0.35) 0%, rgba(13,148,136,0) 70%); border-radius: 50%; animation: pulse 2s infinite;"></div>
          <div style="width: 28px; height: 28px; background: #0D9488; border: 3px solid #ffffff; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
            <div style="width: 8px; height: 8px; background: #FEF08A; border-radius: 50%;"></div>
          </div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -30],
    });

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // 1. Initialize Leaflet Map
      const map = L.map(mapContainerRef.current, {
        center: [currentLat, currentLng],
        zoom: hasCoords ? 14 : 7,
        scrollWheelZoom: true,
      });

      // 2. OpenStreetMap Standard Tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // 3. Add Draggable Marker if coordinates exist
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

      // 4. Click Map to drop/move pin
      map.on('click', (e: L.LeafletMouseEvent) => {
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

    return () => {
      // Cleanup map on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Update map when coordinates change externally
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (hasCoords) {
      if (markerRef.current) {
        markerRef.current.setLatLng([currentLat, currentLng]);
      } else {
        const marker = L.marker([currentLat, currentLng], {
          icon: createPinIcon(),
          draggable: true,
        }).addTo(mapInstanceRef.current);

        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          onChange(parseFloat(pos.lat.toFixed(6)), parseFloat(pos.lng.toFixed(6)));
        });

        markerRef.current = marker;
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
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = parseFloat(pos.coords.latitude.toFixed(6));
          const lng = parseFloat(pos.coords.longitude.toFixed(6));
          onChange(lat, lng);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([lat, lng], 16, { animate: true, duration: 1.2 });
          }
        },
        (err) => {
          alert('GPS Geolocation error: ' + err.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Quick Location Shortcuts & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-stone-500 font-lao flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-teal-600" />
            <span>ຈຸດຫຼັກ (Quick Hubs):</span>
          </span>
          {LAOS_HUBS.map((hub) => (
            <button
              key={hub.name}
              type="button"
              onClick={() => handleSelectPreset(hub.lat, hub.lng)}
              className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-medium transition-colors cursor-pointer"
            >
              {hub.name}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-[11px] font-bold transition-colors cursor-pointer"
        >
          <Navigation className="w-3 h-3 text-teal-600" />
          <span>ຈຸດປະຈຸບັນ (My GPS)</span>
        </button>
      </div>

      {/* Map Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-stone-200 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-72 z-0" />

        {/* Floating coordinates indicator badge */}
        <div className="absolute top-3 right-3 z-[400] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-200 shadow-md flex items-center gap-2 text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div className="font-mono text-stone-800 font-semibold text-[11px]">
            {hasCoords ? (
              <span>
                Lat: <b className="text-teal-700">{parsedLat.toFixed(5)}</b>, Lng:{' '}
                <b className="text-teal-700">{parsedLng.toFixed(5)}</b>
              </span>
            ) : (
              <span className="text-stone-400">ຄລິກເທິງແຜນທີ່ເພື່ອປັກໝຸດ (Click to pin)</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
