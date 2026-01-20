"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import ReportModal from "@/components/ReportModal";
import { loadGeoJSON } from "@/lib/geojson";
import { GeoJSONCollection, BasemapType } from "@/types/geojson";

const MapComponent = dynamic(() => import("@/components/Map/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Memuat peta...</p>
      </div>
    </div>
  ),
});

const KELURAHAN_NAMES: Record<string, string> = {
  "krobokan": "Krobokan",
  "ngemplak-simongan": "Ngemplak Simongan",
  "kalibanteng-kidul": "Kalibanteng Kidul",
  "gisik-drono": "Gisik Drono",
  "bongsari": "Bongsari",
  "karangayu": "Karangayu",
  "kalibanteng-kulon": "Kalibanteng Kulon",
  "manyaran": "Manyaran",
  "tawangmas": "Tawangmas",
};

export default function KelurahanPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const kelurahanName = KELURAHAN_NAMES[slug] || slug;

  const [boundaryData, setBoundaryData] = useState<GeoJSONCollection | null>(null);
  const [facilitiesData, setFacilitiesData] = useState<GeoJSONCollection | null>(null);
  const [floodRiskData, setFloodRiskData] = useState<GeoJSONCollection | null>(null);
  const [landslideRiskData, setLandslideRiskData] = useState<GeoJSONCollection | null>(null);
  const [showBoundary, setShowBoundary] = useState(true);
  const [showFacilities, setShowFacilities] = useState(true);
  const [showFloodRisk, setShowFloodRisk] = useState(false);
  const [showLandslideRisk, setShowLandslideRisk] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedKelurahan, setSelectedKelurahan] = useState<string | null>(slug || null);
  const [basemap, setBasemap] = useState<BasemapType>("osm");
  const [searchResult, setSearchResult] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Load GeoJSON data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load general data, can be filtered by kelurahan later
        const [boundary, facilities, floodRisk, landslideRisk] = await Promise.all([
          loadGeoJSON("/data/boundary.geojson"),
          loadGeoJSON("/data/facilities.geojson"),
          loadGeoJSON("/data/Bahaya-Banjir-KKNT.json").catch(() => null),
          loadGeoJSON("/data/landslide-risk.geojson").catch(() => null),
        ]);
        
        // Filter by kelurahan if needed (when data is available)
        // For now, just load all data
        setBoundaryData(boundary);
        setFacilitiesData(facilities);
        setFloodRiskData(floodRisk);
        setLandslideRiskData(landslideRisk);
        setError(null);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Gagal memuat data GeoJSON. Pastikan file data tersedia.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // Set kelurahan filter based on slug
    if (slug) {
      setSelectedKelurahan(slug);
    }
  }, [slug]);

  const handleSearch = (query: string) => {
    try {
      const result = JSON.parse(query);
      setSearchResult(result);
      setTimeout(() => setSearchResult(null), 2000);
    } catch {
      // Invalid JSON, ignore
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 overflow-hidden text-slate-900 h-screen flex flex-col">
      <Header
        selectedKelurahan={selectedKelurahan}
        onKelurahanChange={setSelectedKelurahan}
        onReportClick={() => setIsReportModalOpen(true)}
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>
        <Sidebar
          boundaryData={boundaryData}
          facilitiesData={facilitiesData}
          showBoundary={showBoundary}
          showFacilities={showFacilities}
          showFloodRisk={showFloodRisk}
          showLandslideRisk={showLandslideRisk}
          onToggleBoundary={() => setShowBoundary(!showBoundary)}
          onToggleFacilities={() => setShowFacilities(!showFacilities)}
          onToggleFloodRisk={() => setShowFloodRisk(!showFloodRisk)}
          onToggleLandslideRisk={() => setShowLandslideRisk(!showLandslideRisk)}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedKelurahan={selectedKelurahan}
          onKelurahanChange={setSelectedKelurahan}
          onSearch={handleSearch}
          onBasemapChange={setBasemap}
          currentBasemap={basemap}
          searchResult={searchResult}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="flex-1 relative">
          <MapComponent
            boundaryData={boundaryData}
            facilitiesData={facilitiesData}
            floodRiskData={floodRiskData}
            landslideRiskData={landslideRiskData}
            showBoundary={showBoundary}
            showFacilities={showFacilities}
            showFloodRisk={showFloodRisk}
            showLandslideRisk={showLandslideRisk}
            selectedCategory={selectedCategory}
            selectedKelurahan={selectedKelurahan}
            basemap={basemap}
            onBasemapChange={setBasemap}
            searchResult={searchResult}
          />
          {error && (
            <div className="absolute bottom-4 left-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-[1000] max-w-md">
              <p className="font-semibold">Error:</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
        </main>
      </div>
      <ReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} />
    </div>
  );
}
