/**
 * LandslideLayer Component
 * 
 * Layer untuk menampilkan data longsor dengan dua dataset:
 * 1. Bahaya Longsor (hazard) - Area rawan longsor
 * 2. Kapasitas Longsor (capacity) - Kapasitas penanganan longsor
 * 
 * 👤 Owner: Faruq
 * 📁 Data: public/data/disasters/longsor/
 * 
 * Edit file ini untuk mengubah styling, popup, atau behavior layer longsor
 */

import { GeoJSON } from "react-leaflet";
import { useEffect, useState } from "react";
import { GeoJSONCollection } from "@/types/geojson";
import proj4 from "proj4";

interface LandslideLayerProps {
  data: GeoJSONCollection | null | undefined;
  showHazard: boolean;
  showCapacity: boolean;
}

interface LandslideProperties {
  DN: number;
  fid: number;
}

export default function LandslideLayer({ data, showHazard, showCapacity }: LandslideLayerProps) {
  const [bahayaData, setBahayaData] = useState<GeoJSONCollection | null>(null);
  const [kapasitasData, setKapasitasData] = useState<GeoJSONCollection | null>(null);

  // Define UTM Zone 49S (EPSG:32749) projection
  const utmProjection = "+proj=utm +zone=49 +south +datum=WGS84 +units=m +no_defs";
  const wgs84Projection = "+proj=longlat +datum=WGS84 +no_defs";

  // Function to transform coordinates from UTM to WGS84
  const transformCoordinates = (coords: any): any => {
    if (!Array.isArray(coords)) return coords;
    
    // Check if it's a coordinate pair [x, y]
    if (coords.length === 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
      const [x, y] = coords;
      const [lng, lat] = proj4(utmProjection, wgs84Projection, [x, y]);
      return [lng, lat];
    }
    
    // Recursively transform nested arrays
    return coords.map(transformCoordinates);
  };

  // Function to transform GeoJSON data
  const transformGeoJSON = (geojson: GeoJSONCollection): GeoJSONCollection => {
    return {
      ...geojson,
      features: geojson.features.map((feature: any) => ({
        ...feature,
        geometry: {
          ...feature.geometry,
          coordinates: transformCoordinates(feature.geometry.coordinates),
        },
      })),
    };
  };

  useEffect(() => {
    // Load Bahaya Longsor data
    fetch("/data/disasters/longsor/bahaya-longsor.geojson")
      .then((res) => res.json())
      .then((data) => {
        const transformed = transformGeoJSON(data);
        setBahayaData(transformed);
      })
      .catch((err) => console.error("Error loading bahaya longsor:", err));

    // Load Kapasitas Longsor data
    fetch("/data/disasters/longsor/kapasitas-longsor.geojson")
      .then((res) => res.json())
      .then((data) => {
        const transformed = transformGeoJSON(data);
        setKapasitasData(transformed);
      })
      .catch((err) => console.error("Error loading kapasitas longsor:", err));
  }, []);

  if (!showHazard && !showCapacity) return null;

  // Style untuk Bahaya Longsor (Area Rawan)
  const bahayaStyle = (feature: any) => {
    const props = feature.properties as LandslideProperties;
    const dn = props.DN || 1;
    
    // Palet warna untuk Bahaya Longsor (High to Low)
    const colors: Record<number, string> = {
      3: "#dc2626", // Merah Tua (Tinggi)
      2: "#f97316", // Orange (Sedang)
      1: "#fed7aa", // Orange Muda (Rendah)
    };

    return {
      fillColor: colors[dn] || "#fed7aa",
      weight: 0, 
      opacity: 0.5,
      color: "#ffffff",
      fillOpacity: 0.8,
    };
  };

  // Style untuk Kapasitas Longsor
  const kapasitasStyle = (feature: any) => {
    const props = feature.properties as LandslideProperties;
    const dn = props.DN || 1;
    
    // Palet warna untuk Kapasitas (High to Low)
    const colors: Record<number, string> = {
      2: "#dc2626", // Merah Tua (Tinggi)
      1: "#f97316", // Orange (Sedang)
    };

    return {
      fillColor: colors[dn] || "#f97316",
      weight: 0,
      opacity: 0.5,
      color: "#ffffff",
      fillOpacity: 0.8,
    };
  };

  const getLevelText = (dn: number): string => {
    const levels: Record<number, string> = {
      1: "Rendah",
      2: "Sedang",
      3: "Tinggi",
    };
    return levels[dn] || "Tidak Diketahui";
  };

  const getKapasitasLevelText = (dn: number): string => {
    const levels: Record<number, string> = {
      1: "Sedang",
      2: "Tinggi",
    };
    return levels[dn] || "Tidak Diketahui";
  };

  const getBahayaColor = (dn: number): string => {
    const colors: Record<number, string> = {
      3: "#dc2626", // Merah Tua
      2: "#f97316", // Orange
      1: "#fed7aa", // Orange Muda
    };
    return colors[dn] || "#fed7aa";
  };

  const getKapasitasColor = (dn: number): string => {
    const colors: Record<number, string> = {
      2: "#dc2626", // Merah Tua
      1: "#f97316", // Orange
    };
    return colors[dn] || "#f97316";
  };

  return (
    <>
      {/* Layer Bahaya Longsor (Area Rawan) */}
      {showHazard && bahayaData && (
        <GeoJSON
          key="bahaya-longsor"
          data={bahayaData as any}
          style={bahayaStyle}
          onEachFeature={(feature, layer) => {
            const props = feature.properties as LandslideProperties;
            const level = getLevelText(props.DN);
            const color = getBahayaColor(props.DN);
            
            layer.bindPopup(`
              <div style="font-family: sans-serif; padding: 5px;">
                <strong style="color: #dc2626; display: block; margin-bottom: 4px;">⛰️ Zona Bahaya Longsor</strong>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="width: 12px; height: 12px; background: ${color}; border-radius: 2px;"></div>
                  <span>Tingkat: <b>${level}</b></span>
                </div>
              </div>
            `);

            // Efek hover agar lebih interaktif
            layer.on({
              mouseover: (e) => {
                const l = e.target;
                l.setStyle({ fillOpacity: 0.9, weight: 1 });
              },
              mouseout: (e) => {
                const l = e.target;
                l.setStyle({ fillOpacity: 0.8, weight: 0 });
              },
            });
          }}
        />
      )}

      {/* Layer Kapasitas Longsor */}
      {showCapacity && kapasitasData && (
        <GeoJSON
          key="kapasitas-longsor"
          data={kapasitasData as any}
          style={kapasitasStyle}
          onEachFeature={(feature, layer) => {
            const props = feature.properties as LandslideProperties;
            const level = getKapasitasLevelText(props.DN);
            const color = getKapasitasColor(props.DN);
            
            layer.bindPopup(`
              <div style="font-family: sans-serif; padding: 5px;">
                <strong style="color: #dc2626; display: block; margin-bottom: 4px;">🛡️ Zona Kapasitas Longsor</strong>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="width: 12px; height: 12px; background: ${color}; border-radius: 2px;"></div>
                  <span>Tingkat: <b>${level}</b></span>
                </div>
              </div>
            `);

            // Efek hover agar lebih interaktif
            layer.on({
              mouseover: (e) => {
                const l = e.target;
                l.setStyle({ fillOpacity: 0.9, weight: 1 });
              },
              mouseout: (e) => {
                const l = e.target;
                l.setStyle({ fillOpacity: 0.8, weight: 0 });
              },
            });
          }}
        />
      )}
    </>
  );
}
