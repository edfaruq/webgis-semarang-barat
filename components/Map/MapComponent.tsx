"use client";

import { useEffect, useRef, useState, useMemo, Fragment } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap, Marker, Popup, useMapEvents } from "react-leaflet";
import { X } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { GeoJSONCollection, BoundaryProperties, FacilityProperties, RiskProperties, BasemapType } from "@/types/geojson";
import { getBoundsFromGeoJSON, getCenterFromBounds, SEMARANG_BARAT_CENTER, SEMARANG_BARAT_ZOOM } from "@/lib/map-utils";
import { LocateMeControl, BasemapSwitcherControl, ClearRouteControl, ShowRouteControl } from "./MapControls";
import UserLocationMarker from "./UserLocationMarker";
// Import layer components (setiap anggota tim punya file sendiri)
import FloodLayer from "./layers/FloodLayer";
import LandslideLayer from "./layers/LandslideLayer";
import LahanKritisLayer from "./layers/LahanKritisLayer";
import BoundaryLayer from "./layers/BoundaryLayer";
import FacilitiesLayer from "./layers/FacilitiesLayer";
import PumpLayer from "./layers/PumpLayer";
import ShelterLayer from "./layers/ShelterLayer";
import EventPointLayer from "./layers/EventPointLayer";
import RouteLayer from "./layers/RouteLayer";
import ApprovedReportsLayer from "./layers/ApprovedReportsLayer";
import type { ApprovedReport } from "./layers/ApprovedReportsLayer";

// Fix for default marker icons
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
}

interface MapComponentProps {
  boundaryData?: GeoJSONCollection | null;
  facilitiesData?: GeoJSONCollection | null;
  floodRiskData?: GeoJSONCollection | null;
  landslideRiskData?: GeoJSONCollection | null;
  evacuationRouteData?: GeoJSONCollection | null;
  LahanKritisData?: GeoJSONCollection | null;
  pumpData?: GeoJSONCollection | null;
  shelterData?: GeoJSONCollection | null;
  eventPointData?: GeoJSONCollection | null;
  showBoundary?: boolean;
  showFacilities?: boolean;
  showFloodRisk?: boolean;
  showFloodCapacity?: boolean;
  showKerentananBanjir?: boolean;
  showRisikoBanjir?: boolean;
  showLandslideHazard?: boolean;
  showLandslideCapacity?: boolean;
  showKerentananLongsor?: boolean;
  showRisikoLongsor?: boolean;
  showLahanKritis?: boolean;
  showEvacuationRoute?: boolean;
  showEvacuationRouteBanjir?: boolean;
  showEvacuationRouteLongsor?: boolean;
  showPump?: boolean;
  showShelter?: boolean;
  showEventPoint?: boolean;
  approvedReports?: ApprovedReport[];
  selectedCategory?: string | null;
  selectedKelurahan?: string | null;
  basemap?: BasemapType;
  onBasemapChange?: (basemap: BasemapType) => void;
  onFeatureClick?: (feature: any) => void;
  onKelurahanChange?: (kelurahan: string | null) => void;
  onPumpClick?: (feature: any) => void;
  searchResult?: { lat: number; lng: number; zoom?: number } | null;
}

// Global flag to prevent multiple map initializations (works with React Strict Mode)
let mapInitialized = false;

// Wrapper component to prevent re-initialization in Next.js 16
function MapWrapper({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (!mapInitialized) {
      setIsMounted(true);
      mapInitialized = true;
    }
    
    return () => {
      // Don't reset on unmount in Strict Mode
    };
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat peta...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Component to handle map updates
function MapUpdater({ center, zoom }: { center: [number, number]; zoom?: number }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);

  return null;
}

// Component to fit bounds
function FitBounds({ bounds, enabled = true }: { bounds: L.LatLngBounds | null; enabled?: boolean }) {
  const map = useMap();
  
  useEffect(() => {
    if (bounds && enabled) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, enabled, map]);

  return null;
}

// Component to handle map clicks (to clear selected destination)
function MapClickHandler({ 
  onMapClick, 
  markerClickRef 
}: { 
  onMapClick: () => void;
  markerClickRef: React.MutableRefObject<boolean>;
}) {
  useMapEvents({
    click: (e) => {
      // Check if click target is a marker or popup
      const target = e.originalEvent.target as HTMLElement;
      const isMarker = target.closest('.leaflet-marker-icon') || 
                      target.closest('.leaflet-marker-pane') ||
                      target.closest('.leaflet-popup') ||
                      target.closest('.leaflet-popup-content') ||
                      target.closest('.leaflet-popup-pane') ||
                      markerClickRef.current;
      
      // Reset flag
      markerClickRef.current = false;
      
      // Only clear if clicking on map background, not on markers or popups
      if (!isMarker) {
        onMapClick();
      }
    },
  });

  return null;
}

// Component to zoom to kelurahan when selected
function ZoomToKelurahan({ 
  kelurahan, 
  bounds 
}: { 
  kelurahan: string | null | undefined; 
  bounds: L.LatLngBounds | null;
}) {
  const map = useMap();
  const previousKelurahan = useRef<string | null | undefined>(null);
  const previousBoundsKey = useRef<string | null>(null);
  
  useEffect(() => {
    // Only zoom when kelurahan changes and bounds are available and valid
    if (kelurahan && bounds && bounds.isValid()) {
      // Create a unique key for this bounds to detect changes
      const boundsKey = `${bounds.getNorth()}-${bounds.getSouth()}-${bounds.getEast()}-${bounds.getWest()}`;
      
      // Only zoom if kelurahan changed OR bounds changed
      if (previousKelurahan.current !== kelurahan || previousBoundsKey.current !== boundsKey) {
        previousKelurahan.current = kelurahan;
        previousBoundsKey.current = boundsKey;
        
        // Use a small timeout to ensure the map is ready
        const timeoutId = setTimeout(() => {
          try {
            if (bounds && bounds.isValid()) {
              map.fitBounds(bounds, { 
                padding: [50, 50], 
                maxZoom: 16,
                duration: 0.5
              });
            }
          } catch (error) {
            console.error('Error zooming to kelurahan:', error);
          }
        }, 100);
        
        return () => clearTimeout(timeoutId);
      }
    } else if (!kelurahan) {
      // Reset when kelurahan is cleared
      previousKelurahan.current = null;
      previousBoundsKey.current = null;
    }
  }, [kelurahan, bounds, map]);

  return null;
}

export default function MapComponent({
  boundaryData,
  facilitiesData,
  floodRiskData,
  LahanKritisData,
  landslideRiskData,
  evacuationRouteData,
  pumpData,
  shelterData,
  eventPointData,
  showBoundary = true,
  showFacilities = true,
  showFloodRisk = false,
  showFloodCapacity = false,
  showKerentananBanjir = false,
  showRisikoBanjir = false,
  showLahanKritis = false,
  showLandslideHazard = false,
  showLandslideCapacity = false,
  showKerentananLongsor = false,
  showRisikoLongsor = false,
  showEvacuationRoute = false,
  showEvacuationRouteBanjir = false,
  showEvacuationRouteLongsor = false,
  showPump = false,
  showShelter = false,
  showEventPoint = false,
  approvedReports = [],
  selectedCategory,
  selectedKelurahan,
  basemap = "osm",
  onBasemapChange,
  onFeatureClick,
  onKelurahanChange,
  onPumpClick,
  searchResult,
}: MapComponentProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [userAccuracy, setUserAccuracy] = useState<number | undefined>(undefined);
  const [selectedDestination, setSelectedDestination] = useState<[number, number] | null>(null); // Destination yang dipilih dari marker
  const [routeDestination, setRouteDestination] = useState<[number, number] | null>(null); // Destination untuk route yang aktif
  const [routeError, setRouteError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'error' | 'warning' | 'info' } | null>(null);
  const [isNotificationExiting, setIsNotificationExiting] = useState(false);
  const markerClickRef = useRef<boolean>(false); // Flag to track if marker was clicked

  // Get basemap URL
  const getBasemapUrl = (type: BasemapType): string => {
    switch (type) {
      case "esri-imagery":
        return "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      case "osm":
      default:
        return "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    }
  };

  // Styling functions untuk evacuation route tetap di sini

  // Evacuation route styling - Green style
  const evacuationRouteStyle = (feature: any) => {
    return {
      color: "#22c55e", // Green color
      weight: 4,
      opacity: 0.9,
      lineCap: "round" as const,
      lineJoin: "round" as const,
    };
  };

  // Create green marker icon for evacuation points
  const createEvacuationIcon = useMemo(() => {
    return L.divIcon({
      className: "custom-evacuation-marker",
      html: `
        <div style="
          width: 32px;
          height: 32px;
          background-color: #22c55e;
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          position: relative;
        ">
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(45deg);
            width: 12px;
            height: 12px;
            background-color: white;
            border-radius: 50%;
          "></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });
  }, []);

  // Boundary dan Facilities logic sudah dipindah ke layer components terpisah

  // Filter evacuation routes by kelurahan dan jenis bencana
  const filteredEvacuationRouteBanjir = useMemo(() => {
    if (!evacuationRouteData || !showEvacuationRouteBanjir) {
      return null;
    }
    
    let filtered = evacuationRouteData.features.filter((f) => {
      const props = f.properties as any;
      const jenisBencana = (props.jenis_bencana || "").toLowerCase().trim();
      return jenisBencana === 'banjir';
    });
    
    // Filter by kelurahan jika dipilih
    if (selectedKelurahan) {
      const selectedKel = selectedKelurahan.toLowerCase().trim();
      // Normalize slug by removing hyphens for comparison
      const selectedKelNormalized = selectedKel.replace(/-/g, "");
      
      filtered = filtered.filter((f) => {
        const props = f.properties as any;
        const kelurahanSlug = (props.slug_kelurahan || props.kelurahan || "").toLowerCase().trim();
        const kelurahanSlugNormalized = kelurahanSlug.replace(/-/g, "");
        const namaKelurahan = (props.nama_kelurahan || "").toLowerCase().trim();
        
        // Match by normalized slug or by nama_kelurahan
        return kelurahanSlugNormalized === selectedKelNormalized || 
               namaKelurahan === selectedKel.replace(/-/g, " ");
      });
    }
    
    return filtered.length > 0 ? {
      ...evacuationRouteData,
      features: filtered,
    } : null;
  }, [evacuationRouteData, selectedKelurahan, showEvacuationRouteBanjir]);

  const filteredEvacuationRouteLongsor = useMemo(() => {
    if (!evacuationRouteData || !showEvacuationRouteLongsor) {
      return null;
    }
    
    let filtered = evacuationRouteData.features.filter((f) => {
      const props = f.properties as any;
      const jenisBencana = (props.jenis_bencana || "").toLowerCase().trim();
      return jenisBencana === 'longsor';
    });
    
    // Filter by kelurahan jika dipilih
    if (selectedKelurahan) {
      const selectedKel = selectedKelurahan.toLowerCase().trim();
      // Normalize slug by removing hyphens for comparison
      const selectedKelNormalized = selectedKel.replace(/-/g, "");
      
      filtered = filtered.filter((f) => {
        const props = f.properties as any;
        const kelurahanSlug = (props.slug_kelurahan || props.kelurahan || "").toLowerCase().trim();
        const kelurahanSlugNormalized = kelurahanSlug.replace(/-/g, "");
        const namaKelurahan = (props.nama_kelurahan || "").toLowerCase().trim();
        
        // Match by normalized slug or by nama_kelurahan
        return kelurahanSlugNormalized === selectedKelNormalized || 
               namaKelurahan === selectedKel.replace(/-/g, " ");
      });
    }
    
    return filtered.length > 0 ? {
      ...evacuationRouteData,
      features: filtered,
    } : null;
  }, [evacuationRouteData, selectedKelurahan, showEvacuationRouteLongsor]);

  // Calculate bounds for fit bounds (only when no kelurahan is selected)
  const allBounds = useRef<L.LatLngBounds | null>(null);
  const [kelurahanBounds, setKelurahanBounds] = useState<L.LatLngBounds | null>(null);
  
  useEffect(() => {
    // Only calculate allBounds when no kelurahan is selected
    if (selectedKelurahan) {
      allBounds.current = null;
      return;
    }
    
    const boundsArray: L.LatLngBounds[] = [];
    
    if (showBoundary && boundaryData && boundaryData.features.length > 0) {
      const bounds = getBoundsFromGeoJSON(boundaryData.features);
      if (bounds) boundsArray.push(bounds);
    }
    
    if (showFacilities && facilitiesData && facilitiesData.features.length > 0) {
      const bounds = getBoundsFromGeoJSON(facilitiesData.features);
      if (bounds) boundsArray.push(bounds);
    }
    
    if (boundsArray.length > 0) {
      allBounds.current = boundsArray.reduce((acc, b) => acc.extend(b), boundsArray[0]);
    } else {
      allBounds.current = null;
    }
  }, [boundaryData, facilitiesData, showBoundary, showFacilities, selectedKelurahan]);

  // Calculate bounds specifically for selected kelurahan
  useEffect(() => {
    if (selectedKelurahan && boundaryData) {
      const selectedKel = selectedKelurahan.toLowerCase().trim();
      const selectedKelName = selectedKel.replace(/-/g, " ");
      
      const filtered = boundaryData.features.filter((f) => {
        const props = f.properties as BoundaryProperties;
        const kelurahanName = (props.nama_kelurahan || "").toLowerCase().trim();
        const slug = (props.slug || "").toLowerCase().trim();
        return slug === selectedKel || kelurahanName === selectedKelName;
      });
      
      if (filtered.length > 0) {
        const bounds = getBoundsFromGeoJSON(filtered);
        if (bounds && bounds.isValid()) {
          setKelurahanBounds(bounds);
        } else {
          setKelurahanBounds(null);
        }
      } else {
        setKelurahanBounds(null);
      }
    } else if (!selectedKelurahan) {
      setKelurahanBounds(null);
    }
  }, [selectedKelurahan, boundaryData]);

  return (
    <MapWrapper>
      <MapContainer
        key="main-map-container"
        center={SEMARANG_BARAT_CENTER}
        zoom={SEMARANG_BARAT_ZOOM}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        scrollWheelZoom={true}
      >
      <TileLayer
        attribution={
          basemap === "osm"
            ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            : '&copy; <a href="https://www.esri.com/">Esri</a>'
        }
        url={getBasemapUrl(basemap)}
      />

      {/* Map click handler to clear selected destination */}
      <MapClickHandler 
        markerClickRef={markerClickRef}
        onMapClick={() => {
          // Only clear if there's no active route
          if (!routeDestination) {
            setSelectedDestination(null);
          }
        }} 
      />

      {/* Disaster Layers - Setiap layer punya file sendiri untuk menghindari konflik */}
      {/* 👤 Farhan - Flood Layer */}
      <FloodLayer data={floodRiskData} show={showFloodRisk} showKerentananBanjir={showKerentananBanjir} showCapacity={showFloodCapacity} showRisikoBanjir={showRisikoBanjir} />

      {/* 👤 Faruq - Landslide Layer */}
      <LandslideLayer 
        data={landslideRiskData} 
        showHazard={showLandslideHazard}
        showCapacity={showLandslideCapacity}
        showKerentanan={showKerentananLongsor}
        showRisiko={showRisikoLongsor}
      />

      {/* 👤 Shaqi - Lahan Kritis Layer */}
      <LahanKritisLayer data={LahanKritisData} show={showLahanKritis} />
      {/* Evacuation Route Layer - Banjir (Green main, Blue outline) */}
      {filteredEvacuationRouteBanjir && filteredEvacuationRouteBanjir.features.length > 0 && (
        <>
          {/* Blue outline layer */}
          <GeoJSON
            key={`evac-banjir-outline-${selectedKelurahan || 'all'}`}
            data={filteredEvacuationRouteBanjir as any}
            style={(feature: any) => ({
              color: "#3b82f6", // Blue color for outline
              weight: 8,
              opacity: 1.0,
              lineCap: "round",
              lineJoin: "round",
            })}
          />
          {/* Main route layer - Green for banjir */}
          <GeoJSON
            key={`evac-banjir-route-${selectedKelurahan || 'all'}`}
            data={filteredEvacuationRouteBanjir as any}
            style={(feature: any) => ({
              color: "#22c55e", // Green color for banjir
              weight: 4,
              opacity: 1.0,
              lineCap: "round" as const,
              lineJoin: "round" as const,
            })}
            onEachFeature={(feature, layer) => {
              const props = feature.properties as any;
              const popupContent = `
                <div style="padding: 8px;">
                  <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #22c55e;">🌊 ${props.nama || "Jalur Evakuasi Banjir"}</h3>
                  ${props.deskripsi ? `<p style="margin: 4px 0;">${props.deskripsi}</p>` : ""}
                  ${props.prioritas ? `<p style="margin: 4px 0;"><strong>Prioritas:</strong> <span style="text-transform: uppercase;">${props.prioritas}</span></p>` : ""}
                  <p style="margin: 4px 0;"><strong>Jenis:</strong> Banjir</p>
                </div>
              `;
              layer.bindPopup(popupContent);
            }}
          />
        </>
      )}

      {/* Evacuation Route Layer - Longsor (Green main, Orange outline) */}
      {filteredEvacuationRouteLongsor && filteredEvacuationRouteLongsor.features.length > 0 && (
        <>
          {/* Orange outline layer */}
          <GeoJSON
            key={`evac-longsor-outline-${selectedKelurahan || 'all'}`}
            data={filteredEvacuationRouteLongsor as any}
            style={(feature: any) => ({
              color: "#f97316", // Orange color for outline
              weight: 8,
              opacity: 1.0,
              lineCap: "round",
              lineJoin: "round",
            })}
          />
          {/* Main route layer - Green for longsor */}
          <GeoJSON
            key={`evac-longsor-route-${selectedKelurahan || 'all'}`}
            data={filteredEvacuationRouteLongsor as any}
            style={(feature: any) => ({
              color: "#22c55e", // Green color for longsor
              weight: 4,
              opacity: 1.0,
              lineCap: "round" as const,
              lineJoin: "round" as const,
            })}
            onEachFeature={(feature, layer) => {
              const props = feature.properties as any;
              const popupContent = `
                <div style="padding: 8px;">
                  <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #22c55e;">⛰️ ${props.nama || "Jalur Evakuasi Longsor"}</h3>
                  ${props.deskripsi ? `<p style="margin: 4px 0;">${props.deskripsi}</p>` : ""}
                  ${props.prioritas ? `<p style="margin: 4px 0;"><strong>Prioritas:</strong> <span style="text-transform: uppercase;">${props.prioritas}</span></p>` : ""}
                  <p style="margin: 4px 0;"><strong>Jenis:</strong> Longsor</p>
                </div>
              `;
              layer.bindPopup(popupContent);
            }}
          />
        </>
      )}

      {/* Infrastructure Layers - Shared components */}
      <BoundaryLayer 
        data={boundaryData} 
        show={showBoundary}
        selectedKelurahan={selectedKelurahan}
        basemap={basemap}
        onFeatureClick={(feature) => {
          // Clear selected destination when clicking on boundary/kelurahan
          if (!routeDestination) {
            setSelectedDestination(null);
          }
          if (onFeatureClick) {
            onFeatureClick(feature);
          }
        }}
        onKelurahanChange={onKelurahanChange}
      />
      
      <FacilitiesLayer 
        data={facilitiesData} 
        show={showFacilities}
        selectedCategory={selectedCategory}
        selectedKelurahan={selectedKelurahan}
        onMarkerClick={(feature) => {
          markerClickRef.current = true;
          if (feature.geometry.type === "Point") {
            const [lng, lat] = feature.geometry.coordinates as number[];
            const newDestination: [number, number] = [lat, lng];
            setSelectedDestination(newDestination);
            setRouteError(null);
            setRouteDestination(newDestination);
          }
        }}
      />

      <PumpLayer 
        data={pumpData} 
        show={showPump}
        selectedKelurahan={selectedKelurahan}
        onPumpClick={(feature) => {
          markerClickRef.current = true;
          if (onPumpClick) {
            onPumpClick(feature);
          }
          if (feature.geometry.type === "Point") {
            const [lng, lat] = feature.geometry.coordinates as number[];
            const newDestination: [number, number] = [lat, lng];
            setSelectedDestination(newDestination);
            setRouteError(null);
            setRouteDestination(newDestination);
          }
        }}
      />

      <ShelterLayer 
        data={shelterData} 
        show={showShelter}
        selectedKelurahan={selectedKelurahan}
        onMarkerClick={(feature) => {
          markerClickRef.current = true;
          if (feature.geometry.type === "Point") {
            const [lng, lat] = feature.geometry.coordinates as number[];
            const newDestination: [number, number] = [lat, lng];
            setSelectedDestination(newDestination);
            setRouteError(null);
            setRouteDestination(newDestination);
          }
        }}
      />

      {/* Event Point Layer */}
      <EventPointLayer 
        data={eventPointData} 
        show={showEventPoint}
        selectedKelurahan={selectedKelurahan}
        onMarkerClick={(feature) => {
          markerClickRef.current = true;
          if (feature.geometry.type === "Point") {
            const [lng, lat] = feature.geometry.coordinates as number[];
            const newDestination: [number, number] = [lat, lng];
            setSelectedDestination(newDestination);
            setRouteError(null);
            setRouteDestination(newDestination);
          }
        }}
      />

      {/* Laporan disetujui digabung dengan Titik Kejadian Bencana (satu toggle) — bisa tampilkan rute */}
      <ApprovedReportsLayer
        reports={approvedReports}
        show={showEventPoint}
        onMarkerClick={(report) => {
          markerClickRef.current = true;
          const newDestination: [number, number] = [report.lat, report.lng];
          setSelectedDestination(newDestination);
          setRouteError(null);
          setRouteDestination(newDestination);
        }}
      />

      {searchResult && (
        <MapUpdater center={[searchResult.lat, searchResult.lng]} zoom={searchResult.zoom || 16} />
      )}

      {/* Zoom to kelurahan when selected */}
      <ZoomToKelurahan kelurahan={selectedKelurahan} bounds={kelurahanBounds} />

      {/* FitBounds untuk semua bounds jika tidak ada kelurahan yang dipilih dan tidak ada user location */}
      {allBounds.current && !userLocation && !selectedKelurahan && (
        <FitBounds bounds={allBounds.current} enabled={!userLocation} />
      )}
      
      {/* User Location Marker */}
      <UserLocationMarker position={userLocation} accuracy={userAccuracy} />
      
      {/* Route Layer - Shows route from user location to clicked marker */}
      {/* Always render RouteLayer when userLocation exists to ensure proper cleanup */}
      {userLocation && (
        <RouteLayer
          start={userLocation}
          end={routeDestination}
          onRouteError={(error) => {
            setRouteError(error);
            setIsNotificationExiting(false);
            setNotification({ message: error, type: 'error' });
            // Auto hide notification after 5 seconds
            setTimeout(() => {
              setIsNotificationExiting(true);
              setTimeout(() => {
                setNotification(null);
                setIsNotificationExiting(false);
              }, 400);
            }, 5000);
          }}
        />
      )}
      
      {/* Notification Toast */}
      {notification && (
        <div className={`absolute top-4 right-4 z-[1000] ${isNotificationExiting ? 'animate-slide-to-right' : 'animate-slide-from-right'}`}>
          <div className="rounded-xl px-6 py-4 shadow-lg border-2 flex items-center gap-3 min-w-[300px] max-w-[500px] bg-red-600 border-red-700 text-white">
            <div className="flex-1">
              <p className="text-sm font-semibold">{notification.message}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Route Error Display (legacy, will be replaced by notification) */}
      {routeError && !notification && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-red-500 text-white px-4 py-2 rounded shadow-lg">
          {routeError}
        </div>
      )}
      
      {/* Map Controls – safe area agar tidak tertutup iOS Safari nav bar (TOP/BOTTOM/COMPACT) */}
      <div className="absolute z-[1000] flex flex-col gap-2 map-controls-bottom-right">
        {onBasemapChange && (
          <BasemapSwitcherControl
            currentBasemap={basemap}
            onBasemapChange={onBasemapChange}
          />
        )}
        <LocateMeControl
          onLocationFound={(position, accuracy) => {
            setUserLocation(position);
            setUserAccuracy(accuracy);
          }}
          onError={(message, type = 'error') => {
            setIsNotificationExiting(false);
            setNotification({ message, type });
            // Auto hide notification after 5 seconds
            setTimeout(() => {
              setIsNotificationExiting(true);
              setTimeout(() => {
                setNotification(null);
                setIsNotificationExiting(false);
              }, 400);
            }, 5000);
          }}
        />
        <ShowRouteControl
          hasDestination={!!selectedDestination}
          hasRoute={!!routeDestination}
          onShowRoute={() => {
            if (!userLocation) {
              setIsNotificationExiting(false);
              setNotification({ 
                message: "Silakan aktifkan lokasi Anda terlebih dahulu dengan menekan tombol 'Lokasi Saya'", 
                type: 'warning' 
              });
              // Auto hide notification after 5 seconds
              setTimeout(() => {
                setIsNotificationExiting(true);
                setTimeout(() => {
                  setNotification(null);
                  setIsNotificationExiting(false);
                }, 400);
              }, 5000);
              return;
            }
            if (selectedDestination) {
              setRouteDestination(selectedDestination);
              setRouteError(null);
              setNotification(null);
            }
          }}
        />
        <ClearRouteControl
          hasRoute={!!routeDestination}
          onClearRoute={() => {
            console.log("ClearRouteControl clicked, clearing route...");
            setRouteDestination(null);
            setSelectedDestination(null);
            setRouteError(null);
            console.log("Route destination cleared");
          }}
        />
      </div>
    </MapContainer>
    </MapWrapper>
  );
}
