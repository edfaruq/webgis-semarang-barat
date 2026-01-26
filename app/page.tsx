"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import ReportModal from "@/components/ReportModal";
import PumpDetailModal from "@/components/PumpDetailModal";
import LoadingPage from "@/components/LoadingPage";
import { loadGeoJSON } from "@/lib/geojson";
import { GeoJSONCollection, BasemapType } from "@/types/geojson";

// Dynamic import untuk Map component (SSR: false)
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

export default function HomePage() {
  const [boundaryData, setBoundaryData] = useState<GeoJSONCollection | null>(null);
  const [facilitiesData, setFacilitiesData] = useState<GeoJSONCollection | null>(null);
  const [floodRiskData, setFloodRiskData] = useState<GeoJSONCollection | null>(null);
  const [landslideRiskData, setLandslideRiskData] = useState<GeoJSONCollection | null>(null);
  const [evacuationRouteData, setEvacuationRouteData] = useState<GeoJSONCollection | null>(null);
  const [lahanKritisData, setLahanKritisData] = useState<GeoJSONCollection | null>(null);
  const [pumpData, setPumpData] = useState<GeoJSONCollection | null>(null);
  const [showBoundary, setShowBoundary] = useState(true);
  const [showFacilities, setShowFacilities] = useState(false);
  const [showFloodRisk, setShowFloodRisk] = useState(false);
  const [showFloodCapacity, setShowFloodCapacity] = useState(false);
  const [showKerentananBanjir, setShowKerentananBanjir] = useState(false);
  const [showRisikoBanjir, setShowRisikoBanjir] = useState(false);
  const [showLahanKritis, setShowLahanKritis] = useState(false);
  const [showLandslideHazard, setShowLandslideHazard] = useState(false);
  const [showLandslideCapacity, setShowLandslideCapacity] = useState(false);
  const [showKerentananLongsor, setShowKerentananLongsor] = useState(false);
  const [showRisikoLongsor, setShowRisikoLongsor] = useState(false);
  const [showEvacuationRoute, setShowEvacuationRoute] = useState(false);
  const [showPump, setShowPump] = useState(false);
  const [selectedPump, setSelectedPump] = useState<any | null>(null);
  const [isPumpModalOpen, setIsPumpModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedKelurahan, setSelectedKelurahan] = useState<string | null>(null);
  const [basemap, setBasemap] = useState<BasemapType>("osm");
  const [searchResult, setSearchResult] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Load GeoJSON data
  useEffect(() => {
    const loadData = async () => {
      const startTime = Date.now();
      const minLoadingTime = 1000; // 1 detik
      
      try {
        setLoading(true);
        const [boundary, facilities, floodRisk, landslideRisk, evacuationRoute, lahanKritis, pump] = await Promise.all([
          loadGeoJSON("/data/infrastructure/boundary.geojson"),
          loadGeoJSON("/data/infrastructure/facilities.geojson"),
          loadGeoJSON("/data/disasters/banjir/Bahaya-Banjir-KKNT.geojson").catch(() => null),
          loadGeoJSON("/data/disasters/longsor/landslide-risk.geojson").catch(() => null),
          loadGeoJSON("/data/routes/evacuation-route.geojson").catch(() => null),
          loadGeoJSON("/data/disasters/lahan-kritis/LahanKritis.geojson").catch(() => null),
          loadGeoJSON("/data/utilities/pompa-air/pompa-air.geojson").catch(() => null),
        ]);
        setBoundaryData(boundary);
        setFacilitiesData(facilities);
        setFloodRiskData(floodRisk);
        setLahanKritisData(lahanKritis);
        setLandslideRiskData(landslideRisk);
        setEvacuationRouteData(evacuationRoute);
        setPumpData(pump);
        setError(null);
        
        // Pastikan loading page ditampilkan minimal 1 detik
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
        
        if (remainingTime > 0) {
          await new Promise(resolve => setTimeout(resolve, remainingTime));
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Gagal memuat data GeoJSON. Pastikan file data tersedia.");
        
        // Pastikan loading page ditampilkan minimal 1 detik meskipun ada error
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
        
        if (remainingTime > 0) {
          await new Promise(resolve => setTimeout(resolve, remainingTime));
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSearch = (query: string) => {
    try {
      const result = JSON.parse(query);
      setSearchResult(result);
      // Clear search result after 2 seconds
      setTimeout(() => setSearchResult(null), 2000);
    } catch {
      // Invalid JSON, ignore
    }
  };

  if (loading) {
    return <LoadingPage />;
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
          showFloodCapacity={showFloodCapacity}
          showKerentananBanjir={showKerentananBanjir}
          showRisikoBanjir={showRisikoBanjir}
          showLahanKritis={showLahanKritis}
          showLandslideHazard={showLandslideHazard}
          showLandslideCapacity={showLandslideCapacity}
          showKerentananLongsor={showKerentananLongsor}
          showRisikoLongsor={showRisikoLongsor}
          showEvacuationRoute={showEvacuationRoute}
          showPump={showPump}
          onToggleBoundary={() => setShowBoundary(!showBoundary)}
          onToggleFacilities={() => setShowFacilities(!showFacilities)}
          onToggleFloodRisk={() => setShowFloodRisk(!showFloodRisk)}
          onToggleFloodCapacity={() => setShowFloodCapacity(!showFloodCapacity)}
          onToggleKerentananBanjir={() => setShowKerentananBanjir(!showKerentananBanjir)}
          onToggleRisikoBanjir={() => setShowRisikoBanjir(!showRisikoBanjir)}
          onToggleLahanKritis={() => setShowLahanKritis(!showLahanKritis)}
          onToggleLandslideHazard={() => setShowLandslideHazard(!showLandslideHazard)}
          onToggleLandslideCapacity={() => setShowLandslideCapacity(!showLandslideCapacity)}
          onToggleKerentananLongsor={() => setShowKerentananLongsor(!showKerentananLongsor)}
          onToggleRisikoLongsor={() => setShowRisikoLongsor(!showRisikoLongsor)}
          onToggleEvacuationRoute={() => setShowEvacuationRoute(!showEvacuationRoute)}
          onTogglePump={() => setShowPump(!showPump)}
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
            evacuationRouteData={evacuationRouteData}
            LahanKritisData={lahanKritisData}
            pumpData={pumpData}
            showBoundary={showBoundary}
            showFacilities={showFacilities}
            showFloodRisk={showFloodRisk}
            showFloodCapacity={showFloodCapacity}
            showKerentananBanjir={showKerentananBanjir}
            showRisikoBanjir={showRisikoBanjir}
            showLahanKritis={showLahanKritis}
            showLandslideHazard={showLandslideHazard}
            showLandslideCapacity={showLandslideCapacity}
            showKerentananLongsor={showKerentananLongsor}
            showRisikoLongsor={showRisikoLongsor}
            showEvacuationRoute={showEvacuationRoute}
            showPump={showPump}
            selectedCategory={selectedCategory}
            selectedKelurahan={selectedKelurahan}
            basemap={basemap}
            onBasemapChange={setBasemap}
            onKelurahanChange={setSelectedKelurahan}
            searchResult={searchResult}
            onPumpClick={(feature) => {
              setSelectedPump(feature);
              setIsPumpModalOpen(true);
            }}
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
      <PumpDetailModal 
        isOpen={isPumpModalOpen} 
        onClose={() => {
          setIsPumpModalOpen(false);
          setSelectedPump(null);
        }} 
        pumpData={selectedPump}
      />
    </div>
  );
}
