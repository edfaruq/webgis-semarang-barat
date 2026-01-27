/**
 * LandslideLayer Component
 * 
 * Layer untuk menampilkan data longsor dengan empat dataset:
 * 1. Kerawanan Longsor (hazard) - Area rawan longsor
 * 2. Kapasitas Longsor (capacity) - Kapasitas penanganan longsor
 * 3. Kerentanan Longsor (vulnerability) - Tingkat kerentanan longsor
 * 4. Risiko Longsor (risk) - Tingkat risiko longsor
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
  showKerentanan: boolean;
  showRisiko: boolean;
}

interface LandslideProperties {
  DN: number;
  fid: number;
}

interface KerentananProperties {
  fid: number;
  wadmkd?: string;
  namaobj?: string;
  Luas?: number;
  Skor_Renta?: number;
  Klas_Renta?: string;
}

export default function LandslideLayer({ data, showHazard, showCapacity, showKerentanan, showRisiko }: LandslideLayerProps) {
  const [bahayaData, setBahayaData] = useState<GeoJSONCollection | null>(null);
  const [kapasitasData, setKapasitasData] = useState<GeoJSONCollection | null>(null);
  const [kerentananData, setKerentananData] = useState<GeoJSONCollection | null>(null);
  const [risikoData, setRisikoData] = useState<GeoJSONCollection | null>(null);

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
    // Load Kerawanan Longsor data
    fetch("/data/disasters/longsor/kerawanan-longsor.geojson")
      .then((res) => res.json())
      .then((data) => {
        const transformed = transformGeoJSON(data);
        setBahayaData(transformed);
      })
      .catch((err) => console.error("Error loading kerawanan longsor:", err));

    // Load Kapasitas Longsor data
    fetch("/data/disasters/longsor/kapasitas-longsor.geojson")
      .then((res) => res.json())
      .then((data) => {
        const transformed = transformGeoJSON(data);
        setKapasitasData(transformed);
      })
      .catch((err) => console.error("Error loading kapasitas longsor:", err));

    // Load Kerentanan Longsor data
    fetch("/data/disasters/longsor/kerentanan-longsor.geojson")
      .then((res) => res.json())
      .then((data) => {
        const transformed = transformGeoJSON(data);
        setKerentananData(transformed);
      })
      .catch((err) => console.error("Error loading kerentanan longsor:", err));

    // Load Risiko Longsor data
    fetch("/data/disasters/longsor/risiko-longsor.geojson")
      .then((res) => res.json())
      .then((data) => {
        const transformed = transformGeoJSON(data);
        setRisikoData(transformed);
      })
      .catch((err) => console.error("Error loading risiko longsor:", err));
  }, []);

  if (!showHazard && !showCapacity && !showKerentanan && !showRisiko) return null;

  // Style untuk Kerawanan Longsor (Area Rawan)
  const bahayaStyle = (feature: any) => {
    const props = feature.properties as LandslideProperties;
    const dn = props.DN || 1;
    
    // Palet warna untuk Kerawanan Longsor (High to Low)
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

  // Style untuk Kerentanan Longsor
  const kerentananStyle = (feature: any) => {
    const props = feature.properties as KerentananProperties;
    const klas = props.Klas_Renta || "Rendah";
    
    // Palet warna untuk Kerentanan Longsor berdasarkan klasifikasi
    const colors: Record<string, string> = {
      "Tinggi": "#dc2626", // Merah Tua
      "Sedang": "#f97316", // Orange
      "Rendah": "#fed7aa", // Orange Muda
    };

    return {
      fillColor: colors[klas] || "#fed7aa",
      weight: 0,
      opacity: 0.5,
      color: "#ffffff",
      fillOpacity: 0.8,
    };
  };

  const getKerentananColor = (klas: string): string => {
    const colors: Record<string, string> = {
      "Tinggi": "#dc2626", // Merah Tua
      "Sedang": "#f97316", // Orange
      "Rendah": "#fed7aa", // Orange Muda
    };
    return colors[klas] || "#fed7aa";
  };

  // Style untuk Risiko Longsor
  const risikoStyle = (feature: any) => {
    const props = feature.properties as LandslideProperties;
    const dn = props.DN || 1;
    
    // Palet warna untuk Risiko Longsor
    const colors: Record<number, string> = {
      1: "#dc2626", // Merah (Tinggi)
      2: "#f97316", // Oren (Sedang)
      3: "#fed7aa", // Orange Muda
    };

    return {
      fillColor: colors[dn] || "#d4a574",
      weight: 0,
      opacity: 0.5,
      color: "#ffffff",
      fillOpacity: 0.8,
    };
  };

  const getRisikoColor = (dn: number): string => {
    const colors: Record<number, string> = {
      1: "#dc2626", // Merah
      2: "#f97316", // Oren
      3: "#fed7aa", // Orange Muda
    };
    return colors[dn] || "#d4a574";
  };

  const getRisikoLevelText = (dn: number): string => {
    const levels: Record<number, string> = {
      1: "Tinggi",
      2: "Sedang",
      3: "Rendah",
    };
    return levels[dn] || "Tidak Diketahui";
  };

  return (
    <>
      {/* Layer Kerawanan Longsor (Area Rawan) */}
      {showHazard && bahayaData && (
        <GeoJSON
          key="kerawanan-longsor"
          data={bahayaData as any}
          style={bahayaStyle}
          onEachFeature={(feature, layer) => {
            const props = feature.properties as LandslideProperties;
            const level = getLevelText(props.DN);
            const color = getBahayaColor(props.DN);
            
            layer.bindPopup(`
              <div style="font-family: sans-serif; padding: 5px;">
                <strong style="color: #dc2626; display: block; margin-bottom: 4px;">⛰️ Zona Kerawanan Longsor</strong>
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

      {/* Layer Kerentanan Longsor */}
      {showKerentanan && kerentananData && (
        <GeoJSON
          key="kerentanan-longsor"
          data={kerentananData as any}
          style={kerentananStyle}
          onEachFeature={(feature, layer) => {
            const props = feature.properties as KerentananProperties;
            const klas = props.Klas_Renta || "Rendah";
            const skor = props.Skor_Renta || 0;
            const luas = props.Luas || 0;
            const kelurahan = props.wadmkd || "Tidak Diketahui";
            const rw = props.namaobj || "Tidak Diketahui";
            const color = getKerentananColor(klas);
            
            layer.bindPopup(`
              <div style="font-family: sans-serif; padding: 8px; min-width: 200px;">
                <strong style="color: #dc2626; display: block; margin-bottom: 6px;">⚠️ Zona Kerentanan Longsor</strong>
                <div style="margin-bottom: 4px;">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                    <div style="width: 12px; height: 12px; background: ${color}; border-radius: 2px;"></div>
                    <span>Tingkat: <b>${klas}</b></span>
                  </div>
                  <div style="font-size: 11px; color: #666; margin-top: 4px;">
                    <div>Skor: <b>${skor.toFixed(1)}</b></div>
                    <div>Luas: <b>${luas.toFixed(2)}</b> ha</div>
                    <div>Lokasi: <b>${kelurahan} - ${rw}</b></div>
                  </div>
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

      {/* Layer Risiko Longsor */}
      {showRisiko && risikoData && (
        <GeoJSON
          key="risiko-longsor"
          data={risikoData as any}
          style={risikoStyle}
          onEachFeature={(feature, layer) => {
            const props = feature.properties as LandslideProperties;
            const level = getRisikoLevelText(props.DN);
            const color = getRisikoColor(props.DN);
            
            layer.bindPopup(`
              <div style="font-family: sans-serif; padding: 5px;">
                <strong style="color: #dc2626; display: block; margin-bottom: 4px;">⚠️ Zona Risiko Longsor</strong>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="width: 12px; height: 12px; background: ${color}; border-radius: 2px;"></div>
                  <span>Tingkat Risiko: <b>${level}</b></span>
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
