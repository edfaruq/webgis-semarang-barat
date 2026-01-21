"use client";

import { useEffect, useRef, useState, useMemo, Fragment } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { GeoJSONCollection, BoundaryProperties, FacilityProperties, RiskProperties, BasemapType } from "@/types/geojson";
import { getBoundsFromGeoJSON, getCenterFromBounds, SEMARANG_BARAT_CENTER, SEMARANG_BARAT_ZOOM } from "@/lib/map-utils";
import { getRouteWithWaypoints } from "@/lib/routing";
import { LocateMeControl, BasemapSwitcherControl } from "./MapControls";
import UserLocationMarker from "./UserLocationMarker";
// Import layer components (setiap anggota tim punya file sendiri)
import FloodLayer from "./layers/FloodLayer";
import LandslideLayer from "./layers/LandslideLayer";
import LahanKritisLayer from "./layers/LahanKritisLayer";
import BoundaryLayer from "./layers/BoundaryLayer";
import FacilitiesLayer from "./layers/FacilitiesLayer";

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
  showBoundary?: boolean;
  showFacilities?: boolean;
  showFloodRisk?: boolean;
  showLandslideRisk?: boolean;
  showLahanKritis?: boolean;
  showEvacuationRoute?: boolean;
  selectedCategory?: string | null;
  selectedKelurahan?: string | null;
  basemap?: BasemapType;
  onBasemapChange?: (basemap: BasemapType) => void;
  onFeatureClick?: (feature: any) => void;
  onKelurahanChange?: (kelurahan: string | null) => void;
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
  showBoundary = true,
  showFacilities = true,
  showFloodRisk = false,
  showLahanKritis = false,
  showLandslideRisk = false,
  showEvacuationRoute = true,
  selectedCategory,
  selectedKelurahan,
  basemap = "osm",
  onBasemapChange,
  onFeatureClick,
  onKelurahanChange,
  searchResult,
}: MapComponentProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [userAccuracy, setUserAccuracy] = useState<number | undefined>(undefined);
  const [routedEvacuationData, setRoutedEvacuationData] = useState<GeoJSONCollection | null>(null);
  const routeCacheRef = useRef<Map<string, number[][]>>(new Map()); // Cache for routed coordinates

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
      weight: 6,
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

  // Filter evacuation routes by kelurahan - strict matching only
  const filteredEvacuationRoute = useMemo(() => {
    if (!evacuationRouteData) return null;
    
    // If no kelurahan selected, return all routes
    if (!selectedKelurahan) {
      return evacuationRouteData;
    }
    
    const selectedKel = selectedKelurahan.toLowerCase().trim();
    
    const filtered = evacuationRouteData.features.filter((f) => {
      const props = f.properties as any;
      const kelurahanSlug = (props.slug_kelurahan || props.kelurahan || "").toLowerCase().trim();
      
      // Only match by exact slug - no fallback matching
      const matches = kelurahanSlug === selectedKel;
      
      // Debug individual route matching
      if (process.env.NODE_ENV === 'development' && !matches) {
        console.log('Route filtered out:', props.nama, 'Expected:', selectedKel, 'Got:', kelurahanSlug);
      }
      
      return matches;
    });
    
    // Debug: log filtered results
    if (process.env.NODE_ENV === 'development') {
      console.log('Filter evacuation route kelurahan:', selectedKel, 'Total routes:', evacuationRouteData.features.length, 'Filtered:', filtered.length);
      if (filtered.length > 0) {
        console.log('Matched routes:', filtered.map(f => {
          const props = f.properties as any;
          return `${props.nama || props.id} (${props.slug_kelurahan || props.kelurahan})`;
        }));
      } else {
        console.warn('No routes found for kelurahan:', selectedKel);
        console.log('Available kelurahan in routes:', evacuationRouteData.features.map(f => {
          const props = f.properties as any;
          return props.slug_kelurahan || props.kelurahan || 'unknown';
        }));
      }
    }
    
    return {
      ...evacuationRouteData,
      features: filtered,
    };
  }, [evacuationRouteData, selectedKelurahan]);

  // Fetch routes from OSRM to follow roads
  useEffect(() => {
    // Reset routed data immediately when filter changes
    setRoutedEvacuationData(null);
    
    if (!filteredEvacuationRoute || filteredEvacuationRoute.features.length === 0) {
      return;
    }

    // Create a unique key for this filtered data to prevent stale updates
    const filterKey = selectedKelurahan || 'all';
    const selectedKel = selectedKelurahan ? selectedKelurahan.toLowerCase().trim() : null;
    
    // Use filteredEvacuationRoute directly - it's already filtered correctly
    // No need to filter again here as it's already done in filteredEvacuationRoute useMemo
    const validatedData = filteredEvacuationRoute;
    const validatedFeatures = filteredEvacuationRoute.features;
    
    if (validatedFeatures.length === 0) {
      setRoutedEvacuationData(null);
      return;
    }
    
    // Show validated routes immediately (no loading delay) - instant display
    setRoutedEvacuationData(validatedData);
    
    // Debug: log what routes are being processed
    if (process.env.NODE_ENV === 'development') {
      console.log('Routing evacuation routes for kelurahan:', filterKey, 'Routes:', validatedFeatures.length);
      validatedFeatures.forEach((f: any) => {
        const props = f.properties as any;
        console.log('  - Route:', props.nama, 'Kelurahan:', props.slug_kelurahan || props.kelurahan);
      });
    }

    const fetchRoutes = async () => {
      // Process routes in parallel batches for faster loading
      const routedFeatures: any[] = [];
      const batchSize = 5; // Process 5 routes in parallel (increased for speed)
      
      const totalFeatures = validatedFeatures.length;
      
      for (let i = 0; i < totalFeatures; i += batchSize) {
        // Check if filter has changed
        const currentFilterCheck = selectedKelurahan || 'all';
        if (filterKey !== currentFilterCheck) {
          // Filter changed, abort
          if (process.env.NODE_ENV === 'development') {
            console.log('Routing aborted - filter changed from', filterKey, 'to', currentFilterCheck);
          }
          return;
        }
        
        const batch = validatedFeatures.slice(i, i + batchSize);
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(totalFeatures/batchSize)}: ${batch.length} routes (${i+1}-${Math.min(i+batchSize, totalFeatures)} of ${totalFeatures})`);
        }
        
        const batchResults = await Promise.all(
          batch.map(async (feature) => {
            if (feature.geometry.type !== "LineString") {
              return feature;
            }
            
            const coords = feature.geometry.coordinates;
            if (!Array.isArray(coords) || coords.length < 2) {
              return feature;
            }
            
            const coordinates = coords as number[][];
            const startCoord = coordinates[0];
            const endCoord = coordinates[coordinates.length - 1];
            
            if (!Array.isArray(startCoord) || !Array.isArray(endCoord) || startCoord.length < 2 || endCoord.length < 2) {
              return feature;
            }
            
            // Use all waypoints from original data for more accurate routing
            // Convert all coordinates to waypoints [lng, lat]
            const waypoints: [number, number][] = coordinates.map((coord: number[]) => [coord[0], coord[1]]);
            
            // Create cache key from all waypoints
            const cacheKey = waypoints.map(wp => `${wp[0]},${wp[1]}`).join(';');
            
            // Check cache first
            let routedCoords: number[][] | undefined = routeCacheRef.current.get(cacheKey);
            
            if (!routedCoords) {
              // Get route from OSRM using all waypoints for accurate road following
              const fetchedCoords = await getRouteWithWaypoints(waypoints);
              
              // Cache the result if valid
              if (fetchedCoords && fetchedCoords.length > 0) {
                routedCoords = fetchedCoords;
                routeCacheRef.current.set(cacheKey, routedCoords);
              }
            }
            
            if (routedCoords && routedCoords.length >= 2) {
              // Return feature with routed coordinates, preserving all properties
              return {
                ...feature,
                properties: {
                  ...feature.properties,
                },
                geometry: {
                  ...feature.geometry,
                  coordinates: routedCoords,
                },
              };
            }
            
            // If routing fails or returns invalid data, use original coordinates
            // This ensures we always have a valid route to display
            return feature;
          })
        );
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`Batch ${Math.floor(i/batchSize) + 1} completed: ${batchResults.length} routes processed`);
        }
        
        routedFeatures.push(...batchResults);
        
        // Update UI incrementally as batches complete (for better UX)
        const currentFilterCheck2 = selectedKelurahan || 'all';
        if (filterKey === currentFilterCheck2) {
          // Merge completed routes with remaining original routes
          const remainingFeatures = validatedFeatures.slice(i + batchSize);
          setRoutedEvacuationData({
            ...validatedData,
            features: [...routedFeatures, ...remainingFeatures],
          });
        }
      }
      
      // Final update with all routed features - ensure all are included
      const finalFilterCheck = selectedKelurahan || 'all';
      if (filterKey === finalFilterCheck && routedFeatures.length > 0) {
        // Ensure we have all features (should match validatedFeatures length)
        if (process.env.NODE_ENV === 'development') {
          console.log('Routed evacuation data - Total processed:', routedFeatures.length, 'Expected:', validatedFeatures.length);
          if (routedFeatures.length !== validatedFeatures.length) {
            console.warn('Mismatch! Processed', routedFeatures.length, 'but expected', validatedFeatures.length);
            console.log('Processed routes:', routedFeatures.map((f: any) => f.properties?.nama || f.properties?.id));
            console.log('Expected routes:', validatedFeatures.map((f: any) => f.properties?.nama || f.properties?.id));
          }
        }
        
        // Use all routed features - no need to filter again as filteredEvacuationRoute is already correct
        setRoutedEvacuationData({
          ...validatedData,
          features: routedFeatures,
        });
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Routed evacuation data updated for kelurahan:', filterKey, 'Final features:', routedFeatures.length);
        }
      } else if (filterKey === finalFilterCheck && routedFeatures.length === 0 && validatedFeatures.length > 0) {
        // If no routes were routed but we have original features, use original
        if (process.env.NODE_ENV === 'development') {
          console.warn('No routes were routed, using original features');
        }
        setRoutedEvacuationData(validatedData);
      }
    };

    // Start routing in background (non-blocking)
    fetchRoutes();
  }, [filteredEvacuationRoute, selectedKelurahan]);

  // Final filtered evacuation data for rendering (double-check filter)
  const finalRoutedEvacuationData = useMemo(() => {
    if (!routedEvacuationData || routedEvacuationData.features.length === 0) {
      return null;
    }
    
    const selectedKel = selectedKelurahan ? selectedKelurahan.toLowerCase().trim() : null;
    
    if (!selectedKel) {
      // No filter, return all
      return routedEvacuationData;
    }
    
    // Filter again to ensure only matching kelurahan routes are shown
    const finalFilteredFeatures = routedEvacuationData.features.filter((f: any) => {
      const props = f.properties as any;
      const kelurahanSlug = (props.slug_kelurahan || props.kelurahan || "").toLowerCase().trim();
      return kelurahanSlug === selectedKel;
    });
    
    if (finalFilteredFeatures.length === 0) {
      return null;
    }
    
    return {
      ...routedEvacuationData,
      features: finalFilteredFeatures,
    };
  }, [routedEvacuationData, selectedKelurahan]);

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

      {/* Disaster Layers - Setiap layer punya file sendiri untuk menghindari konflik */}
      {/* 👤 Farhan - Flood Layer */}
      <FloodLayer data={floodRiskData} show={showFloodRisk} />

      {/* 👤 Faruq - Landslide Layer */}
      <LandslideLayer data={landslideRiskData} show={showLandslideRisk} />

      {/* 👤 Shaqi - Lahan Kritis Layer */}
      <LahanKritisLayer data={LahanKritisData} show={showLahanKritis} />
      {/* Evacuation Route Layer - Green style with shadow and markers */}
      {showEvacuationRoute && finalRoutedEvacuationData && finalRoutedEvacuationData.features.length > 0 && (
        <>
          {/* Shadow layer for depth effect */}
          <GeoJSON
            key={`evac-shadow-${selectedKelurahan || 'all'}`}
            data={finalRoutedEvacuationData as any}
            style={(feature: any) => ({
              color: "#1a1a1a",
              weight: 8,
              opacity: 0.3,
              lineCap: "round",
              lineJoin: "round",
            })}
          />
          {/* Main route layer */}
          <GeoJSON
            key={`evac-route-${selectedKelurahan || 'all'}`}
            data={finalRoutedEvacuationData as any}
            style={evacuationRouteStyle}
            onEachFeature={(feature, layer) => {
              const props = feature.properties as any;
              const popupContent = `
                <div style="padding: 8px;">
                  <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #22c55e;">🛣️ ${props.nama || "Jalur Evakuasi"}</h3>
                  ${props.deskripsi ? `<p style="margin: 4px 0;">${props.deskripsi}</p>` : ""}
                  ${props.prioritas ? `<p style="margin: 4px 0;"><strong>Prioritas:</strong> <span style="text-transform: uppercase;">${props.prioritas}</span></p>` : ""}
                </div>
              `;
              layer.bindPopup(popupContent);
            }}
          />
          {/* Markers for start and end points of each route */}
          {finalRoutedEvacuationData.features.map((feature: any, idx: number) => {
            if (feature.geometry.type !== "LineString") return null;
            const coordinates = feature.geometry.coordinates;
            if (coordinates.length < 2) return null;
            
            const startPoint = coordinates[0];
            const endPoint = coordinates[coordinates.length - 1];
            const props = feature.properties as any;
            
            return (
              <Fragment key={`evac-markers-${idx}`}>
                {/* Start point marker */}
                <Marker
                  position={[startPoint[1], startPoint[0]]}
                  icon={createEvacuationIcon}
                >
                  <Popup>
                    <div>
                      <h3>📍 Titik Awal</h3>
                      <p><strong>Jalur:</strong> {props.nama || "Jalur Evakuasi"}</p>
                    </div>
                  </Popup>
                </Marker>
                {/* End point marker */}
                <Marker
                  position={[endPoint[1], endPoint[0]]}
                  icon={createEvacuationIcon}
                >
                  <Popup>
                    <div>
                      <h3>📍 Titik Kumpul</h3>
                      <p><strong>Jalur:</strong> {props.nama || "Jalur Evakuasi"}</p>
                      <p>✓ Tujuan Evakuasi</p>
                    </div>
                  </Popup>
                </Marker>
              </Fragment>
            );
          })}
        </>
      )}

      {/* Infrastructure Layers - Shared components */}
      <BoundaryLayer 
        data={boundaryData} 
        show={showBoundary}
        selectedKelurahan={selectedKelurahan}
        onFeatureClick={onFeatureClick}
        onKelurahanChange={onKelurahanChange}
      />
      
      <FacilitiesLayer 
        data={facilitiesData} 
        show={showFacilities}
        selectedCategory={selectedCategory}
        selectedKelurahan={selectedKelurahan}
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
