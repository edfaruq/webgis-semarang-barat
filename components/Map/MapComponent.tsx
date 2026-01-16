"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { GeoJSONCollection, BoundaryProperties, FacilityProperties, RiskProperties, BasemapType } from "@/types/geojson";
import { getBoundsFromGeoJSON, getCenterFromBounds, SEMARANG_BARAT_CENTER, SEMARANG_BARAT_ZOOM } from "@/lib/map-utils";
import { LocateMeControl, BasemapSwitcherControl } from "./MapControls";
import UserLocationMarker from "./UserLocationMarker";

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
  showBoundary?: boolean;
  showFacilities?: boolean;
  showFloodRisk?: boolean;
  showLandslideRisk?: boolean;
  selectedCategory?: string | null;
  selectedKelurahan?: string | null;
  basemap?: BasemapType;
  onBasemapChange?: (basemap: BasemapType) => void;
  onFeatureClick?: (feature: any) => void;
  searchResult?: { lat: number; lng: number; zoom?: number } | null;
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

export default function MapComponent({
  boundaryData,
  facilitiesData,
  floodRiskData,
  landslideRiskData,
  showBoundary = true,
  showFacilities = true,
  showFloodRisk = false,
  showLandslideRisk = false,
  selectedCategory,
  selectedKelurahan,
  basemap = "osm",
  onBasemapChange,
  onFeatureClick,
  searchResult,
}: MapComponentProps) {
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [userAccuracy, setUserAccuracy] = useState<number | undefined>(undefined);
  const boundaryLayerRef = useRef<L.GeoJSON>(null);

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

  // Boundary styling - Red dotted line
  const boundaryStyle = (feature: any) => {
    const isHovered = hoveredFeature === feature.properties.id || hoveredFeature === feature.properties.nama_wilayah;
    return {
      fillColor: "#ffffff",
      fillOpacity: 0,
      color: isHovered ? "#dc2626" : "#ef4444",
      weight: isHovered ? 3 : 2.5,
      opacity: isHovered ? 1 : 0.9,
      dashArray: "10, 5", // Dotted line pattern
    };
  };

  // Flood risk styling
  const floodRiskStyle = (feature: any) => {
    const props = feature.properties as RiskProperties;
    const tingkat = props.tingkat_kerawanan || "sedang";
    
    const colors: Record<string, string> = {
      rendah: "#3b82f6",   // Blue
      sedang: "#f59e0b",    // Orange
      tinggi: "#ef4444",    // Red
    };

    return {
      fillColor: colors[tingkat] || colors.sedang,
      fillOpacity: tingkat === "tinggi" ? 0.4 : tingkat === "sedang" ? 0.3 : 0.2,
      color: colors[tingkat] || colors.sedang,
      weight: 2,
      opacity: 0.8,
    };
  };

  // Landslide risk styling
  const landslideRiskStyle = (feature: any) => {
    const props = feature.properties as RiskProperties;
    const tingkat = props.tingkat_kerawanan || "sedang";
    
    const colors: Record<string, string> = {
      rendah: "#84cc16",   // Green
      sedang: "#f97316",   // Orange
      tinggi: "#dc2626",   // Red
    };

    return {
      fillColor: colors[tingkat] || colors.sedang,
      fillOpacity: tingkat === "tinggi" ? 0.4 : tingkat === "sedang" ? 0.3 : 0.2,
      color: colors[tingkat] || colors.sedang,
      weight: 2,
      opacity: 0.8,
      dashArray: "8, 4",
    };
  };

  // Boundary event handlers
  const onBoundaryEachFeature = (feature: any, layer: L.Layer) => {
    const props: BoundaryProperties = feature.properties;
    
    layer.on({
      mouseover: () => {
        setHoveredFeature(props.id || props.nama_wilayah || "");
        if (layer instanceof L.Path) {
          layer.setStyle(boundaryStyle(feature));
        }
      },
      mouseout: () => {
        setHoveredFeature(null);
        if (boundaryLayerRef.current && layer instanceof L.Path) {
          boundaryLayerRef.current.resetStyle(layer);
        }
      },
      click: () => {
        if (onFeatureClick) {
          onFeatureClick(feature);
        }
        const popupContent = `
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold;">${props.nama_wilayah || props.nama_kelurahan || "Wilayah"}</h3>
            ${props.luas ? `<p style="margin: 4px 0;"><strong>Luas:</strong> ${props.luas.toLocaleString()} m²</p>` : ""}
            ${props.kode ? `<p style="margin: 4px 0;"><strong>Kode:</strong> ${props.kode}</p>` : ""}
          </div>
        `;
        layer.bindPopup(popupContent).openPopup();
      },
    });
  };

  // Facility icon getter
  const getFacilityIcon = (category: string): L.DivIcon => {
    const iconSize: [number, number] = [25, 25];
    const iconAnchor: [number, number] = [12, 12];
    
    const colors: Record<string, string> = {
      sekolah: "#3498db",
      puskesmas: "#e74c3c",
      posko: "#f39c12",
      pasar: "#9b59b6",
      masjid: "#16a085",
      gereja: "#2980b9",
      vihara: "#f39c12",
      pura: "#e67e22",
      lainnya: "#95a5a6",
    };

    const color = colors[category] || colors.lainnya;

    return L.divIcon({
      className: "custom-marker",
      html: `<div style="
        background-color: ${color};
        width: ${iconSize[0]}px;
        height: ${iconSize[1]}px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>`,
      iconSize,
      iconAnchor,
    });
  };

  // Filter facilities by category and kelurahan
  const filteredFacilities = facilitiesData
    ? facilitiesData.features.filter((f) => {
        if (!showFacilities) return false;
        
        // Filter by category
        if (selectedCategory) {
          const props = f.properties as FacilityProperties;
          if (props.kategori !== selectedCategory) return false;
        }
        
        // Filter by kelurahan
        if (selectedKelurahan) {
          const props = f.properties as FacilityProperties;
          const kelurahanSlug = props.kelurahan?.toLowerCase() || "";
          const kelurahanName = props.nama_kelurahan?.toLowerCase() || "";
          const selectedKel = selectedKelurahan.toLowerCase();
          // Check if kelurahan matches (support both slug and name)
          const matchesSlug = kelurahanSlug === selectedKel;
          const matchesName = kelurahanName.includes(selectedKel.replace("-", " ")) || 
                             kelurahanName === selectedKel.replace("-", " ");
          if (!matchesSlug && !matchesName) {
            return false;
          }
        }
        
        return true;
      })
    : [];

  // Filter boundary by kelurahan
  const filteredBoundary = boundaryData
    ? selectedKelurahan
      ? {
          ...boundaryData,
          features: boundaryData.features.filter((f) => {
            const props = f.properties as BoundaryProperties;
            const kelurahanName = props.nama_kelurahan?.toLowerCase() || "";
            const slug = props.slug?.toLowerCase() || "";
            const selectedKel = selectedKelurahan.toLowerCase();
            // Match by slug or name
            return (
              slug === selectedKel ||
              kelurahanName === selectedKel.replace("-", " ") ||
              kelurahanName.includes(selectedKel.replace("-", " "))
            );
          }),
        }
      : boundaryData
    : null;

  // Calculate bounds for fit bounds
  const allBounds = useRef<L.LatLngBounds | null>(null);
  
  useEffect(() => {
    const boundsArray: L.LatLngBounds[] = [];
    
    if (showBoundary && filteredBoundary && filteredBoundary.features.length > 0) {
      const bounds = getBoundsFromGeoJSON(filteredBoundary.features);
      if (bounds) boundsArray.push(bounds);
    }
    
    if (showFacilities && filteredFacilities.length > 0) {
      const bounds = getBoundsFromGeoJSON(filteredFacilities);
      if (bounds) boundsArray.push(bounds);
    }
    
    if (boundsArray.length > 0) {
      allBounds.current = boundsArray.reduce((acc, b) => acc.extend(b), boundsArray[0]);
    }
  }, [boundaryData, filteredFacilities, filteredBoundary, showBoundary, showFacilities]);

  return (
    <MapContainer
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

      {/* Flood Risk Layer */}
      {showFloodRisk && floodRiskData && (
        <GeoJSON
          data={floodRiskData as any}
          style={floodRiskStyle}
          onEachFeature={(feature, layer) => {
            const props = feature.properties as RiskProperties;
            const popupContent = `
              <div style="padding: 8px;">
                <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1e40af;">🌊 Area Rawan Banjir</h3>
                <p style="margin: 4px 0;"><strong>Tingkat:</strong> <span style="text-transform: uppercase; color: ${props.tingkat_kerawanan === "tinggi" ? "#ef4444" : props.tingkat_kerawanan === "sedang" ? "#f59e0b" : "#3b82f6"}">${props.tingkat_kerawanan || "sedang"}</span></p>
                ${props.deskripsi ? `<p style="margin: 4px 0;"><strong>Deskripsi:</strong> ${props.deskripsi}</p>` : ""}
              </div>
            `;
            layer.bindPopup(popupContent);
          }}
        />
      )}

      {/* Landslide Risk Layer */}
      {showLandslideRisk && landslideRiskData && (
        <GeoJSON
          data={landslideRiskData as any}
          style={landslideRiskStyle}
          onEachFeature={(feature, layer) => {
            const props = feature.properties as RiskProperties;
            const popupContent = `
              <div style="padding: 8px;">
                <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #dc2626;">⛰️ Area Rawan Longsor</h3>
                <p style="margin: 4px 0;"><strong>Tingkat:</strong> <span style="text-transform: uppercase; color: ${props.tingkat_kerawanan === "tinggi" ? "#dc2626" : props.tingkat_kerawanan === "sedang" ? "#f97316" : "#84cc16"}">${props.tingkat_kerawanan || "sedang"}</span></p>
                ${props.deskripsi ? `<p style="margin: 4px 0;"><strong>Deskripsi:</strong> ${props.deskripsi}</p>` : ""}
              </div>
            `;
            layer.bindPopup(popupContent);
          }}
        />
      )}

      {showBoundary && filteredBoundary && filteredBoundary.features.length > 0 && (
        <GeoJSON
          ref={boundaryLayerRef}
          data={filteredBoundary as any}
          style={boundaryStyle}
          onEachFeature={onBoundaryEachFeature}
        />
      )}

      {showFacilities &&
        filteredFacilities.map((feature, idx) => {
          if (feature.geometry.type !== "Point") return null;
          const props = feature.properties as FacilityProperties;
          const category = props.kategori || "lainnya";
          const [lng, lat] = feature.geometry.coordinates as number[];
          const icon = getFacilityIcon(category);

          return (
            <Marker key={`facility-${idx}`} position={[lat, lng]} icon={icon}>
              <Popup>
                <div style={{ padding: "8px" }}>
                  <h3 style={{ margin: "0 0 8px 0", fontWeight: "bold" }}>
                    {props.nama || "Fasilitas"}
                  </h3>
                  <p style={{ margin: "4px 0" }}>
                    <strong>Kategori:</strong> {category}
                  </p>
                  {props.alamat && (
                    <p style={{ margin: "4px 0" }}>
                      <strong>Alamat:</strong> {props.alamat}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

      {searchResult && (
        <MapUpdater center={[searchResult.lat, searchResult.lng]} zoom={searchResult.zoom || 16} />
      )}

      {/* FitBounds hanya aktif jika tidak ada user location */}
      {allBounds.current && !userLocation && <FitBounds bounds={allBounds.current} enabled={!userLocation} />}
      
      {/* User Location Marker */}
      <UserLocationMarker position={userLocation} accuracy={userAccuracy} />
      
      {/* Map Controls */}
      <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
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
        />
      </div>
    </MapContainer>
  );
}
