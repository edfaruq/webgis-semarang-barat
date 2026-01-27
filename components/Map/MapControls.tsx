"use client";

import { useState } from "react";
import { useMap } from "react-leaflet";
import { LocateFixed, Map, Satellite, X, Navigation } from "lucide-react";
import { BasemapType } from "@/types/geojson";

interface LocateMeControlProps {
  onLocationFound?: (position: [number, number], accuracy: number) => void;
  onError?: (message: string, type?: 'error' | 'warning' | 'info') => void;
}

interface BasemapSwitcherControlProps {
  currentBasemap: BasemapType;
  onBasemapChange: (basemap: BasemapType) => void;
}

export function BasemapSwitcherControl({ currentBasemap, onBasemapChange }: BasemapSwitcherControlProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      <button
        onClick={() => onBasemapChange("osm")}
        className={`w-full px-3 py-2.5 flex items-center justify-center gap-2 transition-all ${
          currentBasemap === "osm"
            ? "bg-indigo-600 text-white"
            : "bg-white text-slate-700 hover:bg-gray-50"
        }`}
        title="OpenStreetMap"
      >
        <Map size={16} />
        <span className="text-xs font-semibold">OSM</span>
      </button>
      <div className="h-[1px] bg-gray-200"></div>
      <button
        onClick={() => onBasemapChange("esri-imagery")}
        className={`w-full px-3 py-2.5 flex items-center justify-center gap-2 transition-all ${
          currentBasemap === "esri-imagery"
            ? "bg-indigo-600 text-white"
            : "bg-white text-slate-700 hover:bg-gray-50"
        }`}
        title="Satellite"
      >
        <Satellite size={16} />
        <span className="text-xs font-semibold">Satellite</span>
      </button>
    </div>
  );
}

export function LocateMeControl({ onLocationFound, onError }: LocateMeControlProps) {
  const map = useMap();
  const [isLocating, setIsLocating] = useState(false);

  const handleLocate = () => {
    if (!navigator.geolocation) {
      if (onError) {
        onError("Geolocation tidak didukung oleh browser Anda", 'error');
      } else {
        alert("Geolocation tidak didukung oleh browser Anda");
      }
      return;
    }

    setIsLocating(true);
    console.log("Requesting geolocation...");

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude, accuracy } = position.coords;
        const location: [number, number] = [latitude, longitude];
        
        console.log("✅ Location found:", location, "Accuracy:", accuracy);
        console.log("Current map center:", map.getCenter());
        console.log("Current map zoom:", map.getZoom());
        
        // Pastikan map sudah ready
        if (!map) {
          console.error("❌ Map not ready");
          if (onError) {
            onError("Peta belum siap. Silakan coba lagi.", 'warning');
          } else {
            alert("Peta belum siap. Silakan coba lagi.");
          }
          return;
        }
        
        // Set view dengan zoom level 16
        console.log("📍 Setting map view to:", location, "Zoom: 16");
        
        // Gunakan setView langsung - ini yang paling reliable
        map.setView(location, 16);
        
        // Verifikasi setelah setView
        setTimeout(() => {
          const newCenter = map.getCenter();
          const newZoom = map.getZoom();
          console.log("✅ Map center after setView:", newCenter);
          console.log("✅ Map zoom after setView:", newZoom);
          
          // Jika masih belum tepat, coba lagi
          const distance = map.distance(newCenter, location);
          if (distance > 100 || newZoom < 15) {
            console.log("⚠️ Map not at correct location, retrying...");
            map.setView(location, 16);
          }
        }, 300);
        
        if (onLocationFound) {
          onLocationFound(location, accuracy || 50);
        }
      },
      (err) => {
        setIsLocating(false);
        let errorMessage = "Akses lokasi ditolak. Pastikan izin geolocation diaktifkan.";
        
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = "Akses lokasi ditolak. Silakan aktifkan izin geolocation di pengaturan browser.";
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = "Informasi lokasi tidak tersedia.";
            break;
          case err.TIMEOUT:
            errorMessage = "Waktu permintaan lokasi habis. Coba lagi.";
            break;
        }
        
        if (onError) {
          onError(errorMessage, 'error');
        } else {
          alert(errorMessage);
        }
        console.error("Geolocation error:", err);
      },
      options
    );
  };

  return (
    <button
      onClick={handleLocate}
      disabled={isLocating}
      className={`px-4 py-3 rounded-xl shadow-lg text-indigo-600 hover:scale-105 transition active:scale-95 bg-white hover:bg-gray-50 border border-gray-200 flex items-center gap-2 ${
        isLocating ? "opacity-50 cursor-not-allowed" : ""
      }`}
      title={isLocating ? "Mencari lokasi..." : "Lokasi Saya"}
    >
      <LocateFixed size={18} className={isLocating ? "animate-pulse" : ""} />
      <span className="text-sm font-semibold whitespace-nowrap">Lokasi Saya</span>
    </button>
  );
}

interface ShowRouteControlProps {
  onShowRoute: () => void;
  hasDestination: boolean;
  hasRoute: boolean;
}

export function ShowRouteControl({ onShowRoute, hasDestination, hasRoute }: ShowRouteControlProps) {
  // Hanya tampilkan jika ada destination yang dipilih tapi belum ada rute yang ditampilkan
  if (!hasDestination || hasRoute) return null;

  return (
    <button
      onClick={onShowRoute}
      className="px-4 py-3 rounded-xl shadow-lg text-green-600 hover:scale-105 transition active:scale-95 bg-white hover:bg-gray-50 border border-gray-200 flex items-center gap-2"
      title="Tampilkan Rute"
    >
      <Navigation size={18} />
      <span className="text-sm font-semibold whitespace-nowrap">Tampilkan Rute</span>
    </button>
  );
}

interface ClearRouteControlProps {
  onClearRoute: () => void;
  hasRoute: boolean;
}

export function ClearRouteControl({ onClearRoute, hasRoute }: ClearRouteControlProps) {
  if (!hasRoute) return null;

  return (
    <button
      onClick={onClearRoute}
      className="px-4 py-3 rounded-xl shadow-lg text-red-600 hover:scale-105 transition active:scale-95 bg-white hover:bg-gray-50 border border-gray-200 flex items-center gap-2"
      title="Hapus Rute"
    >
      <X size={18} />
      <span className="text-sm font-semibold whitespace-nowrap">Hapus Rute</span>
    </button>
  );
}
