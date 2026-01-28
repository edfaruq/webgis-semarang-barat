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
  ChevronDown,
  X,
  Building2,
  Sprout,
  LandPlot,
  Gauge,
  Waves,
  MapPin,
  AlertTriangle,
  Home,
  Map,
  FileText,
} from "lucide-react";
import SearchDataModal from "./SearchDataModal";

interface SidebarProps {
  boundaryData?: GeoJSONCollection | null;
  facilitiesData?: GeoJSONCollection | null;
  showBoundary: boolean;
  showFacilities: boolean;
  showFloodRisk: boolean;
  showFloodCapacity: boolean;
  showKerentananBanjir: boolean;
  showRisikoBanjir: boolean;
  showLandslideHazard: boolean;
  showLandslideCapacity: boolean;
  showKerentananLongsor: boolean;
  showRisikoLongsor: boolean;
  showLahanKritis: boolean;
  showEvacuationRoute: boolean;
  showEvacuationRouteBanjir: boolean;
  showEvacuationRouteLongsor: boolean;
  showPump: boolean;
  showShelter: boolean;
  showEventPoint: boolean;
  onToggleShelter: () => void;
  onToggleEventPoint: () => void;
  onToggleBoundary: () => void;
  onToggleFacilities: () => void;
  onToggleFloodRisk: () => void;
  onToggleFloodCapacity: () => void;
  onToggleKerentananBanjir: () => void;
  onToggleRisikoBanjir: () => void;
  onToggleLandslideHazard: () => void;
  onToggleLandslideCapacity: () => void;
  onToggleKerentananLongsor: () => void;
  onToggleRisikoLongsor: () => void;
  onToggleLahanKritis: () => void;
  onToggleEvacuationRoute: () => void;
  onToggleEvacuationRouteBanjir: () => void;
  onToggleEvacuationRouteLongsor: () => void;
  onTogglePump: () => void;
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
  {
    value: "Fasilitas Pendidikan",
    label: "Fasilitas Pendidikan",
    color: "#3498db",
    icon: "🏫",
  },
  {
    value: "Fasilitas Kesehatan",
    label: "Fasilitas Kesehatan",
    color: "#e74c3c",
    icon: "🏥",
  },
  {
    value: "Fasilitas Kritis",
    label: "Fasilitas Kritis",
    color: "#c0392b",
    icon: "🚨",
  },
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
  showFloodCapacity,
  showKerentananBanjir,
  showRisikoBanjir,
  showLandslideHazard,
  showLandslideCapacity,
  showKerentananLongsor,
  showRisikoLongsor,
  showEvacuationRoute,
  showEvacuationRouteBanjir,
  showEvacuationRouteLongsor,
  showPump,
  showShelter,
  showEventPoint,
  onToggleShelter,
  onToggleEventPoint,
  onToggleBoundary,
  onToggleFacilities,
  onToggleFloodRisk,
  onToggleFloodCapacity,
  onToggleKerentananBanjir,
  onToggleRisikoBanjir,
  onToggleLandslideHazard,
  onToggleLandslideCapacity,
  onToggleKerentananLongsor,
  onToggleRisikoLongsor,
  onToggleLahanKritis,
  onToggleEvacuationRoute,
  onToggleEvacuationRouteBanjir,
  onToggleEvacuationRouteLongsor,
  onTogglePump,
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
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [isSearchDataModalOpen, setIsSearchDataModalOpen] = useState(false);

  // State untuk sub-kategori fasilitas yang aktif
  const [activeFacilitySubcategory, setActiveFacilitySubcategory] = useState<
    "all" | "pendidikan" | "kesehatan" | "umum"
  >("all");

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

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

  // Filter kategori berdasarkan sub-kategori fasilitas yang aktif
  const filteredCategoriesBySubcategory = useMemo(() => {
    if (activeFacilitySubcategory === "all") {
      return availableCategories;
    }

    if (activeFacilitySubcategory === "pendidikan") {
      // Hanya sekolah
      return availableCategories.filter((cat) => cat.value === "sekolah");
    }

    if (activeFacilitySubcategory === "kesehatan") {
      // Hanya puskesmas
      return availableCategories.filter((cat) => cat.value === "puskesmas");
    }

    if (activeFacilitySubcategory === "umum") {
      // Masjid dan gereja
      return availableCategories.filter(
        (cat) => cat.value === "masjid" || cat.value === "gereja",
      );
    }

    return availableCategories;
  }, [availableCategories, activeFacilitySubcategory]);

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
          flex flex-col
          seamless-scrollbar
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

        <div className="p-6 space-y-8 flex-1">
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

          {/* Layer Controller dengan Kategori */}
          <section>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
              Layer Peta
            </h3>
            <div className="space-y-2">
              {/* Batas Wilayah - di paling atas */}
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white cursor-pointer transition-all hover:border-slate-300 shadow-sm">
                <div className="flex items-center gap-3">
                  <Map size={16} className="text-slate-500" />
                  <span className="text-sm font-semibold text-slate-700">
                    BATAS WILAYAH
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={showBoundary}
                  onChange={onToggleBoundary}
                  className="w-4 h-4 text-slate-600 rounded"
                />
              </label>

              {/* ANALISIS BANJIR */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/30 overflow-hidden">
                <button
                  onClick={() => toggleCategory("flood")}
                  className="w-full flex items-center justify-between p-3 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Droplets size={18} className="text-blue-600" />
                    <span className="text-sm font-bold text-blue-900">
                      ANALISIS BANJIR
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-blue-600 transition-transform ${expandedCategories.includes("flood") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedCategories.includes("flood") && (
                  <div className="px-3 pb-3 space-y-1.5">
                    <label className="flex items-center gap-2 p-2 pl-8 rounded-lg hover:bg-blue-100 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={showFloodRisk}
                        onChange={onToggleFloodRisk}
                        className="w-3.5 h-3.5 text-blue-600 rounded"
                      />
                      <span className="text-xs font-semibold text-blue-800">
                        Kerawanan Banjir
                      </span>
                    </label>
                    <label className="flex items-center gap-2 p-2 pl-8 rounded-lg hover:bg-blue-100 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={showKerentananBanjir}
                        onChange={onToggleKerentananBanjir}
                        className="w-3.5 h-3.5 text-blue-600 rounded"
                      />
                      <span className="text-xs font-semibold text-blue-800">
                        Kerentanan Banjir
                      </span>
                    </label>
                    <label className="flex items-center gap-2 p-2 pl-8 rounded-lg hover:bg-blue-100 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={showFloodCapacity}
                        onChange={onToggleFloodCapacity}
                        className="w-3.5 h-3.5 text-blue-600 rounded"
                      />
                      <span className="text-xs font-semibold text-blue-800">
                        Kapasitas Banjir
                      </span>
                    </label>
                    <label className="flex items-center gap-2 p-2 pl-8 rounded-lg hover:bg-blue-100 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={showRisikoBanjir}
                        onChange={onToggleRisikoBanjir}
                        className="w-3.5 h-3.5 text-blue-600 rounded"
                      />
                      <span className="text-xs font-semibold text-blue-800">
                        Risiko Banjir
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* ANALISIS LONGSOR */}
              <div className="rounded-xl border border-orange-200 bg-orange-50/30 overflow-hidden">
                <button
                  onClick={() => toggleCategory("landslide")}
                  className="w-full flex items-center justify-between p-3 hover:bg-orange-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Mountain size={18} className="text-orange-600" />
                    <span className="text-sm font-bold text-orange-900">
                      ANALISIS LONGSOR
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-orange-600 transition-transform ${expandedCategories.includes("landslide") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedCategories.includes("landslide") && (
                  <div className="px-3 pb-3 space-y-1.5">
                    <label className="flex items-center gap-2 p-2 pl-8 rounded-lg hover:bg-orange-100 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={showLandslideHazard}
                        onChange={onToggleLandslideHazard}
                        className="w-3.5 h-3.5 text-orange-600 rounded"
                      />
                      <span className="text-xs font-semibold text-orange-800">
                        Kerawanan Longsor
                      </span>
                    </label>
                    <label className="flex items-center gap-2 p-2 pl-8 rounded-lg hover:bg-orange-100 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={showKerentananLongsor}
                        onChange={onToggleKerentananLongsor}
                        className="w-3.5 h-3.5 text-orange-600 rounded"
                      />
                      <span className="text-xs font-semibold text-orange-800">
                        Kerentanan Longsor
                      </span>
                    </label>
                    <label className="flex items-center gap-2 p-2 pl-8 rounded-lg hover:bg-orange-100 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={showLandslideCapacity}
                        onChange={onToggleLandslideCapacity}
                        className="w-3.5 h-3.5 text-orange-600 rounded"
                      />
                      <span className="text-xs font-semibold text-orange-800">
                        Kapasitas Longsor
                      </span>
                    </label>
                    <label className="flex items-center gap-2 p-2 pl-8 rounded-lg hover:bg-orange-100 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={showRisikoLongsor}
                        onChange={onToggleRisikoLongsor}
                        className="w-3.5 h-3.5 text-orange-600 rounded"
                      />
                      <span className="text-xs font-semibold text-orange-800">
                        Risiko Longsor
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* EVAKUASI & MITIGASI */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 overflow-hidden">
                <button
                  onClick={() => toggleCategory("evacuation")}
                  className="w-full flex items-center justify-between p-3 hover:bg-emerald-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={18} className="text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-900">
                      EVAKUASI & MITIGASI
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-emerald-600 transition-transform ${expandedCategories.includes("evacuation") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedCategories.includes("evacuation") && (
                  <div className="px-3 pb-3 space-y-1.5">
                    <label className="flex items-center gap-2 p-2 pl-8 rounded-lg hover:bg-emerald-100 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={showShelter}
                        onChange={onToggleShelter}
                        className="w-3.5 h-3.5 text-emerald-600 rounded"
                      />
                      <span className="text-xs font-semibold text-emerald-800">
                        Titik Kumpul
                      </span>
                    </label>
                    <label className="flex items-center gap-2 p-2 pl-8 rounded-lg hover:bg-emerald-100 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={showEvacuationRouteBanjir}
                        onChange={onToggleEvacuationRouteBanjir}
                        className="w-3.5 h-3.5 text-blue-600 rounded"
                      />
                      <span className="text-xs font-semibold text-blue-800">
                        Jalur Evakuasi Banjir
                      </span>
                    </label>
                    <label className="flex items-center gap-2 p-2 pl-8 rounded-lg hover:bg-emerald-100 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={showEvacuationRouteLongsor}
                        onChange={onToggleEvacuationRouteLongsor}
                        className="w-3.5 h-3.5 text-orange-600 rounded"
                      />
                      <span className="text-xs font-semibold text-orange-800">
                        Jalur Evakuasi Longsor
                      </span>
                    </label>
                    <label className="flex items-center gap-2 p-2 pl-8 rounded-lg hover:bg-emerald-100 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={showEventPoint}
                        onChange={onToggleEventPoint}
                        className="w-3.5 h-3.5 text-red-600 rounded"
                      />
                      <span className="text-xs font-semibold text-red-800">
                        Titik Kejadian Bencana
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* INFRASTRUKTUR */}
              <div className="rounded-xl border border-slate-300 bg-slate-50/30 overflow-hidden">
                <button
                  onClick={() => toggleCategory("infrastructure")}
                  className="w-full flex items-center justify-between p-3 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Gauge size={18} className="text-slate-600" />
                    <span className="text-sm font-bold text-slate-900">
                      INFRASTRUKTUR
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-slate-600 transition-transform ${expandedCategories.includes("infrastructure") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedCategories.includes("infrastructure") && (
                  <div className="px-3 pb-3 space-y-1.5">
                    <label className="flex items-center gap-2 p-2 pl-8 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={showPump}
                        onChange={onTogglePump}
                        className="w-3.5 h-3.5 text-blue-600 rounded"
                      />
                      <span className="text-xs font-semibold text-slate-800">
                        Titik Pompa
                      </span>
                    </label>
                    <label className="flex items-center gap-2 p-2 pl-8 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={showLahanKritis}
                        onChange={onToggleLahanKritis}
                        className="w-3.5 h-3.5 text-slate-600 rounded"
                      />
                      <span className="text-xs font-semibold text-slate-800">
                        Ketersediaan Pengembangan Lahan
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* FASILITAS */}
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/30 overflow-hidden">
                <button
                  onClick={() => toggleCategory("facilities")}
                  className="w-full flex items-center justify-between p-3 hover:bg-indigo-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Building2 size={18} className="text-indigo-600" />
                    <span className="text-sm font-bold text-indigo-900">
                      FASILITAS
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-indigo-600 transition-transform ${expandedCategories.includes("facilities") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedCategories.includes("facilities") && (
                  <div className="px-3 pb-3 space-y-1.5">
                    {/* Semua Fasilitas */}
                    <label className="flex items-center gap-2 p-2 pl-8 rounded-lg hover:bg-indigo-100 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={
                          showFacilities && activeFacilitySubcategory === "all"
                        }
                        onChange={() => {
                          if (
                            activeFacilitySubcategory === "all" &&
                            showFacilities
                          ) {
                            // Uncheck Semua Fasilitas
                            onToggleFacilities();
                          } else {
                            // Check Semua Fasilitas
                            setActiveFacilitySubcategory("all");
                            if (!showFacilities) onToggleFacilities();
                            onCategoryChange(null); // Tampilkan semua kategori
                          }
                        }}
                        className="w-3.5 h-3.5 text-indigo-600 rounded"
                      />
                      <span className="text-xs font-semibold text-indigo-800">
                        Semua Fasilitas
                      </span>
                    </label>

                    {/* Fasilitas Pendidikan (Sekolah) */}
                    <label className="flex items-center gap-2 p-2 pl-8 rounded-lg hover:bg-indigo-100 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={
                          showFacilities &&
                          activeFacilitySubcategory === "pendidikan"
                        }
                        onChange={() => {
                          if (
                            activeFacilitySubcategory === "pendidikan" &&
                            showFacilities
                          ) {
                            // Uncheck Pendidikan
                            setActiveFacilitySubcategory("all");
                            onToggleFacilities();
                          } else {
                            // Check Pendidikan
                            setActiveFacilitySubcategory("pendidikan");
                            if (!showFacilities) onToggleFacilities();
                            onCategoryChange("Fasilitas Pendidikan"); // Filter sekolah
                          }
                        }}
                        className="w-3.5 h-3.5 text-indigo-600 rounded"
                      />
                      <span className="text-xs text-indigo-800 font-medium">
                        Fasilitas Pendidikan
                      </span>
                    </label>

                    {/* Fasilitas Kesehatan (Puskesmas) */}
                    <label className="flex items-center gap-2 p-2 pl-8 rounded-lg hover:bg-indigo-100 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={
                          showFacilities &&
                          activeFacilitySubcategory === "kesehatan"
                        }
                        onChange={() => {
                          if (
                            activeFacilitySubcategory === "kesehatan" &&
                            showFacilities
                          ) {
                            // Uncheck Kesehatan
                            setActiveFacilitySubcategory("all");
                            onToggleFacilities();
                          } else {
                            // Check Kesehatan
                            setActiveFacilitySubcategory("kesehatan");
                            if (!showFacilities) onToggleFacilities();
                            onCategoryChange("Fasilitas Kesehatan"); // Filter puskesmas
                          }
                        }}
                        className="w-3.5 h-3.5 text-indigo-600 rounded"
                      />
                      <span className="text-xs text-indigo-800 font-medium">
                        Fasilitas Kesehatan
                      </span>
                    </label>

                    {/* Fasilitas Umum (Masjid & Gereja) */}
                    <label className="flex items-center gap-2 p-2 pl-8 rounded-lg hover:bg-indigo-100 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={
                          showFacilities && activeFacilitySubcategory === "umum"
                        }
                        onChange={() => {
                          if (
                            activeFacilitySubcategory === "umum" &&
                            showFacilities
                          ) {
                            // Uncheck Umum
                            setActiveFacilitySubcategory("all");
                            onToggleFacilities();
                          } else {
                            // Check Umum
                            setActiveFacilitySubcategory("umum");
                            if (!showFacilities) onToggleFacilities();
                            onCategoryChange("umum"); // Filter masjid & gereja
                          }
                        }}
                        className="w-3.5 h-3.5 text-indigo-600 rounded"
                      />
                      <span className="text-xs text-indigo-800 font-medium">
                        Fasilitas Umum
                      </span>
                    </label>

                    {/* Fasilitas Kritis */}
                    <label className="flex items-center gap-2 p-2 pl-8 rounded-lg hover:bg-indigo-100 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={
                          showFacilities &&
                          activeFacilitySubcategory === "kritis"
                        }
                        onChange={() => {
                          if (
                            activeFacilitySubcategory === "kritis" &&
                            showFacilities
                          ) {
                            // Uncheck Kritis
                            setActiveFacilitySubcategory("all");
                            onToggleFacilities();
                          } else {
                            // Check Kritis
                            setActiveFacilitySubcategory("kritis");
                            if (!showFacilities) onToggleFacilities();
                            onCategoryChange("Fasilitas Kritis"); // Filter fasilitas kritis
                          }
                        }}
                        className="w-3.5 h-3.5 text-indigo-600 rounded"
                      />
                      <span className="text-xs text-indigo-800 font-medium">
                        Fasilitas Kritis
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Tombol Cari Data - Dipisahkan dengan space yang cukup, di paling bawah */}
        <div className="px-6 pb-6 mt-auto">
          <div className="mt-24 pt-12 pb-4">
            <button
              onClick={() => setIsSearchDataModalOpen(true)}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-purple-200 transition-colors shadow-sm"
              style={{
                backgroundColor: "#D7D7FF",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#C7C7FF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#D7D7FF";
              }}
            >
              <div className="flex items-center gap-2">
                <FileText size={18} style={{ color: "#6868E9" }} />
                <span
                  className="text-sm font-bold"
                  style={{ color: "#6868E9" }}
                >
                  CARI DATA
                </span>
              </div>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 italic">
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Peta menampilkan simulasi jalur evakuasi mengikuti jaringan jalan
              utama. Garis hijau tebal menunjukkan prioritas akses bagi
              kendaraan darurat dan warga.
            </p>
          </div>
        </div>
      </aside>

      {/* Modal Cari Data */}
      <SearchDataModal
        isOpen={isSearchDataModalOpen}
        onClose={() => setIsSearchDataModalOpen(false)}
      />
    </>
  );
}
