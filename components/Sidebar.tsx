"use client";

import { useState, useEffect, useMemo } from "react";
import {
  GeoJSONCollection,
  FacilityProperties,
  BoundaryProperties,
  BasemapType,
} from "@/types/geojson";
import {
  Droplets,
  Mountain,
  Redo2,
  Activity,
  ShieldCheck,
  ChevronRight,
  X,
  Square,
  Building2,
  Sprout,
  LandPlot,
} from "lucide-react";

interface SidebarProps {
  boundaryData?: GeoJSONCollection | null;
  facilitiesData?: GeoJSONCollection | null;
  showBoundary: boolean;
  showFacilities: boolean;
  showFloodRisk: boolean;
  showLandslideRisk: boolean;
  showLahanKritis: boolean;
  showEvacuationRoute: boolean;
  onToggleBoundary: () => void;
  onToggleFacilities: () => void;
  onToggleFloodRisk: () => void;
  onToggleLandslideRisk: () => void;
  onToggleLahanKritis: () => void;
  onToggleEvacuationRoute: () => void;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  selectedKelurahan: string | null;
  onKelurahanChange: (kelurahan: string | null) => void;
  onSearch: (query: string) => void;
  onBasemapChange: (basemap: BasemapType) => void;
  currentBasemap: BasemapType;
  searchResult: { lat: number; lng: number; zoom?: number } | null;
  isOpen?: boolean;
  onClose?: () => void;
}

const KELURAHAN_LIST = [
  { slug: "krobokan", name: "Krobokan" },
  { slug: "ngemplak-simongan", name: "Ngemplak Simongan" },
  { slug: "kalibanteng-kidul", name: "Kalibanteng Kidul" },
  { slug: "gisik-drono", name: "Gisikdrono" },
  { slug: "bongsari", name: "Bongsari" },
  { slug: "karangayu", name: "Karangayu" },
  { slug: "kalibanteng-kulon", name: "Kalibanteng Kulon" },
  { slug: "manyaran", name: "Manyaran" },
  { slug: "tawangmas", name: "Tawangmas" },
  { slug: "kembangarum", name: "Kembangarum" },
  { slug: "bojongsalaman", name: "Bojongsalaman" },
  { slug: "cabean", name: "Cabean" },
  { slug: "krapyak", name: "Krapyak" },
  { slug: "salamanmloyo", name: "Salamanmloyo" },
  { slug: "tawangsari", name: "Tawangsari" },
  { slug: "tambakharjo", name: "Tambakharjo" },
];

// All possible categories (for reference)
const ALL_FACILITY_CATEGORIES = [
  { value: "sekolah", label: "Sekolah", color: "#3498db", icon: "🏫" },
  { value: "puskesmas", label: "Puskesmas", color: "#e74c3c", icon: "🏥" },
  { value: "posko", label: "Posko", color: "#f39c12", icon: "🆘" },
  { value: "pasar", label: "Pasar", color: "#9b59b6", icon: "🏪" },
  { value: "masjid", label: "Masjid", color: "#16a085", icon: "🕌" },
  { value: "gereja", label: "Gereja", color: "#2980b9", icon: "⛪" },
  { value: "vihara", label: "Vihara", color: "#f39c12", icon: "🕉️" },
  { value: "pura", label: "Pura", color: "#e67e22", icon: "🕉️" },
  { value: "lainnya", label: "Lainnya", color: "#95a5a6", icon: "📍" },
];

export default function Sidebar({
  boundaryData,
  facilitiesData,
  showBoundary,
  showFacilities,
  showLahanKritis,
  showFloodRisk,
  showLandslideRisk,
  showEvacuationRoute,
  onToggleBoundary,
  onToggleFacilities,
  onToggleFloodRisk,
  onToggleLandslideRisk,
  onToggleLahanKritis,
  onToggleEvacuationRoute,
  selectedCategory,
  onCategoryChange,
  selectedKelurahan,
  onKelurahanChange,
  onSearch,
  onBasemapChange,
  currentBasemap,
  searchResult,
  isOpen = true,
  onClose,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Get current kelurahan name
  const currentKelurahanName = selectedKelurahan
    ? KELURAHAN_LIST.find((k) => k.slug === selectedKelurahan)?.name ||
      "Seluruh Wilayah"
    : "Seluruh Wilayah";

  // Calculate stats and available categories
  const stats = useMemo(() => {
    const facilityStats: Record<string, number> = {};
    let totalArea = 0;

    if (facilitiesData) {
      facilitiesData.features.forEach((feature) => {
        const category =
          (feature.properties as FacilityProperties).kategori || "lainnya";
        facilityStats[category] = (facilityStats[category] || 0) + 1;
      });
    }

    if (boundaryData) {
      boundaryData.features.forEach((feature) => {
        const luas = (feature.properties as BoundaryProperties).luas;
        if (luas) totalArea += luas;
      });
    }

    return {
      totalFacilities: Object.values(facilityStats).reduce((a, b) => a + b, 0),
      facilityStats,
      totalArea,
    };
  }, [facilitiesData, boundaryData]);

  // Get available categories (only those with data)
  const availableCategories = useMemo(() => {
    if (!stats.facilityStats) return [];

    return ALL_FACILITY_CATEGORIES.filter(
      (cat: (typeof ALL_FACILITY_CATEGORIES)[0]) => {
        const count = stats.facilityStats[cat.value] || 0;
        return count > 0;
      },
    );
  }, [stats.facilityStats]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      return;
    }

    const results: any[] = [];
    const lowerQuery = query.toLowerCase();

    // Search in facilities
    if (facilitiesData) {
      facilitiesData.features.forEach((feature) => {
        const props = feature.properties as FacilityProperties;
        const nama = props.nama?.toLowerCase() || "";
        const alamat = props.alamat?.toLowerCase() || "";

        if (nama.includes(lowerQuery) || alamat.includes(lowerQuery)) {
          if (feature.geometry.type === "Point") {
            const [lng, lat] = feature.geometry.coordinates as number[];
            results.push({
              type: "facility",
              name: props.nama,
              lat,
              lng,
              feature,
            });
          }
        }
      });
    }

    // Search in boundaries
    if (boundaryData) {
      boundaryData.features.forEach((feature) => {
        const props = feature.properties as BoundaryProperties;
        const nama =
          props.nama_wilayah?.toLowerCase() ||
          props.nama_kelurahan?.toLowerCase() ||
          "";

        if (nama.includes(lowerQuery)) {
          results.push({
            type: "boundary",
            name: props.nama_wilayah || props.nama_kelurahan,
            feature,
          });
        }
      });
    }

    if (results.length > 0 && onSearch) {
      const firstResult = results[0];
      if (firstResult.lat && firstResult.lng) {
        onSearch(
          JSON.stringify({
            lat: firstResult.lat,
            lng: firstResult.lng,
            zoom: 16,
          }),
        );
      }
    }
  };

  return (
    <>
      {/* Overlay untuk mobile */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 bg-black/50 z-[9998] lg:hidden transition-opacity"
          onClick={onClose}
          style={{ top: "64px" }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static
          top-0 left-0
          w-80 max-w-[85vw]
          bg-white border-r border-slate-200
          h-full lg:h-[calc(100vh-64px)]
          z-[9999] lg:z-20
          overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Close button untuk mobile */}
        <div className="lg:hidden sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-slate-800">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Breadcrumbs & Title */}
          <div>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-bold mb-2">
              <span>Semarang Barat</span>
              <ChevronRight size={10} />
              <span className="text-indigo-600">{currentKelurahanName}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              {selectedKelurahan
                ? ` ${currentKelurahanName}`
                : "Ringkasan Spasial"}
            </h2>
          </div>

          {/* Layer Controller */}
          <section>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
              Analisis & Rute
            </h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 cursor-pointer transition-all hover:border-blue-200">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={showBoundary}
                    onChange={onToggleBoundary}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm font-semibold text-slate-700">
                    Batas Wilayah
                  </span>
                </div>
                <Square size={16} className="text-blue-500" />
              </label>
              <label className="flex items-center justify-between p-3 rounded-xl border border-blue-200 bg-blue-50 cursor-pointer transition-all hover:bg-blue-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={showFloodRisk}
                    onChange={onToggleFloodRisk}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm font-bold text-blue-800">
                    Area Rawan Banjir
                  </span>
                </div>
                <Droplets size={16} className="text-blue-600" />
              </label>
              <label className="flex items-center justify-between p-3 rounded-xl border border-orange-200 bg-orange-50 cursor-pointer transition-all hover:bg-orange-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={showLandslideRisk}
                    onChange={onToggleLandslideRisk}
                    className="w-4 h-4 text-orange-600 rounded"
                  />
                  <span className="text-sm font-bold text-orange-800">
                    Kerentanan Longsor
                  </span>
                </div>
                <Mountain size={16} className="text-orange-600" />
              </label>
              <label className="flex items-center justify-between p-3 rounded-xl border border-red-100 bg-red-50 cursor-pointer transition-all hover:border-red-200">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={showLahanKritis}
                    onChange={onToggleLahanKritis}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <span className="text-sm font-semibold text-red-700">
                    Lahan Kritis
                  </span>
                </div>
                <LandPlot size={16} className="text-orange-500" />
              </label>
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 cursor-pointer transition-all hover:border-orange-200">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={showFacilities}
                    onChange={onToggleFacilities}
                    className="w-4 h-4 text-orange-600 rounded"
                  />
                  <span className="text-sm font-semibold text-slate-700">
                    Fasilitas
                  </span>
                </div>
                <Building2 size={16} className="text-orange-500" />
              </label>
              <label className="flex items-center justify-between p-3 rounded-xl border border-emerald-200 bg-emerald-50 cursor-pointer transition-all hover:bg-emerald-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={showEvacuationRoute}
                    onChange={onToggleEvacuationRoute}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="text-sm font-bold text-emerald-800">
                    Jalur Evakuasi
                  </span>
                </div>
                <Redo2 size={16} className="text-emerald-600 animate-pulse" />
              </label>
            </div>
          </section>

          {/* Info Card Wilayah */}
          <section className="bg-indigo-900 rounded-2xl p-5 text-white shadow-xl">
            <div className="flex items-center gap-2 mb-4 text-indigo-300 uppercase font-bold text-[10px]">
              <Activity size={14} />
              Profil Risiko
            </div>
            <div className="space-y-4">
              <div className="bg-white/10 p-3 rounded-xl border border-white/5">
                <p className="text-[9px] text-indigo-200 mb-1 uppercase font-bold">
                  Status Kerawanan
                </p>
                <p className="text-lg font-bold text-orange-400 font-mono">
                  SEDANG - TINGGI
                </p>
              </div>
              <div className="bg-emerald-500/20 p-3 rounded-xl border border-emerald-500/30 flex items-center gap-3">
                <div className="bg-emerald-500 p-2 rounded-lg shadow-lg shadow-emerald-500/20">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <p className="text-[9px] text-emerald-200 font-bold uppercase tracking-tight">
                    Titik Kumpul Utama
                  </p>
                  <p className="text-xs font-bold leading-none">
                    Lapangan Manyaran & PRPP
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Filter Kategori Fasilitas */}
          {showFacilities && (
            <section>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                Filter Fasilitas
              </h3>
              <button
                onClick={() => onCategoryChange(null)}
                className={`w-full text-left px-3 py-2.5 text-sm rounded-xl mb-2 font-medium transition-all shadow-sm ${
                  selectedCategory === null
                    ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:shadow-md"
                }`}
              >
                📋 Semua Kategori
              </button>
              <div className="space-y-1.5">
                {availableCategories.map((cat) => {
                  const count = stats.facilityStats[cat.value] || 0;
                  return (
                    <button
                      key={cat.value}
                      onClick={() => onCategoryChange(cat.value)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-xl flex items-center justify-between transition-all shadow-sm ${
                        selectedCategory === cat.value
                          ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: cat.color }}
                        ></span>
                        <span className="text-base">{cat.icon}</span>
                        <span className="font-medium">{cat.label}</span>
                      </div>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          selectedCategory === cat.value
                            ? "bg-white/20 text-white"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Search */}
          <section>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
              Pencarian
            </h3>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Cari fasilitas atau wilayah..."
              className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </section>

          <div className="pt-4 border-t border-slate-100 italic">
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Peta menampilkan simulasi jalur evakuasi mengikuti jaringan jalan
              utama. Garis hijau tebal menunjukkan prioritas akses bagi
              kendaraan darurat dan warga.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
