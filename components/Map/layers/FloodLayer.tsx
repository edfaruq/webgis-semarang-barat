/**
 * FloodLayer Component
 *
 * Layer untuk menampilkan data banjir:
 * 1. Kerawanan Banjir - data dari Bahaya-Banjir-KKNT.geojson
 * 2. Kerentanan Banjir - data dari Kerentanan-Bencana-Banjir.json
 * 3. Kapasitas Banjir - data dari Kapasitas-Banjir-Smg-Bar.json
 * 4. Risiko Bencana Banjir - data dari Risiko-Bencana-Banjir.json
 *
 * 👤 Owner: Farhan
 * 📁 Data: public/data/disasters/banjir/
 *
 * Edit file ini untuk mengubah styling, popup, atau behavior layer banjir
 */

import { GeoJSON } from "react-leaflet";
import { useEffect, useState } from "react";
import { GeoJSONCollection } from "@/types/geojson";

interface FloodLayerProps {
  data: GeoJSONCollection | null | undefined;
  show: boolean;
  showKerentananBanjir: boolean;
  showCapacity: boolean;
  showRisikoBanjir: boolean;
}

interface FloodCapacityProperties {
  wadmkd?: string;
  namaobj?: string;
  C?: number;
}

interface KerentananBanjirProperties {
  VALUE?: number;
}

interface RisikoBanjirProperties {
  KECAMATAN?: string;
  DESA?: string;
  Kelas_RSK?: string;
  Index_RSK?: number;
  Index_KRW?: number;
  Index_KPS?: number;
  Index_KRT?: number;
  LUAS?: number;
}

export default function FloodLayer({ data, show, showKerentananBanjir, showCapacity, showRisikoBanjir }: FloodLayerProps) {
  const [kerentananBanjirData, setKerentananBanjirData] = useState<GeoJSONCollection | null>(null);
  const [kapasitasBanjirData, setKapasitasBanjirData] = useState<GeoJSONCollection | null>(null);
  const [risikoBanjirData, setRisikoBanjirData] = useState<GeoJSONCollection | null>(null);

  useEffect(() => {
    if (!showKerentananBanjir) return;
    fetch("/data/disasters/banjir/Kerentanan-Bencana-Banjir.json")
      .then((res) => res.json())
      .then((d) => setKerentananBanjirData(d))
      .catch((err) => console.error("Error loading kerentanan banjir:", err));
  }, [showKerentananBanjir]);

  useEffect(() => {
    if (!showCapacity) return;
    fetch("/data/disasters/banjir/Kapasitas-Banjir-Smg-Bar.json")
      .then((res) => res.json())
      .then((d) => setKapasitasBanjirData(d))
      .catch((err) => console.error("Error loading kapasitas banjir:", err));
  }, [showCapacity]);

  useEffect(() => {
    if (!showRisikoBanjir) return;
    fetch("/data/disasters/banjir/Risiko-Bencana-Banjir.json")
      .then((res) => res.json())
      .then((d) => setRisikoBanjirData(d))
      .catch((err) => console.error("Error loading risiko bencana banjir:", err));
  }, [showRisikoBanjir]);

  // ---- Kerawanan Banjir ----
  const getKerawananBanjirStyle = (feature: any) => {
    const dn = feature?.properties?.DN_2 || feature?.properties?.DN;

    const colors: Record<number, string> = {
      4: "#08306b", // Biru Sangat Tua (Sangat Bahaya)
      3: "#2171b5", // Biru Tua (Bahaya)
      2: "#6baed6", // Biru Muda (Cukup Bahaya)
      1: "#deebf7", // Biru Sangat Terang (Rendah)
    };

    return {
      fillColor: colors[dn] || "#f7fbff",
      weight: 0,
      opacity: 0.5,
      color: "#ffffff",
      fillOpacity: 0.8,
    };
  };

  // ---- Kerentanan Banjir: VALUE (0–1) -> kelas (palet biru sama seperti layer lain) ----
  const getKerentananBanjirColor = (v: number): string => {
    if (v >= 0.75) return "#08306b";
    if (v >= 0.5) return "#2171b5";
    if (v >= 0.25) return "#6baed6";
    return "#deebf7";
  };

  const getKerentananBanjirLabel = (v: number): string => {
    if (v >= 0.75) return "Sangat Tinggi";
    if (v >= 0.5) return "Tinggi";
    if (v >= 0.25) return "Sedang";
    return "Rendah";
  };

  const getKerentananBanjirStyle = (feature: any) => {
    const v = (feature?.properties as KerentananBanjirProperties)?.VALUE ?? 0;
    return {
      fillColor: getKerentananBanjirColor(v),
      weight: 0,
      opacity: 0.5,
      color: "#ffffff",
      fillOpacity: 0.8,
    };
  };

  // ---- Kapasitas Banjir: nilai C (0–1) -> kelas (palet biru sama seperti Kerawanan) ----
  const getKapasitasBanjirColor = (c: number): string => {
    if (c >= 0.85) return "#08306b"; // Sangat Tinggi - biru sangat tua
    if (c >= 0.7) return "#2171b5";  // Tinggi - biru tua
    if (c >= 0.5) return "#6baed6";  // Sedang - biru muda
    return "#deebf7";                 // Rendah - biru sangat terang
  };

  const getKapasitasBanjirLabel = (c: number): string => {
    if (c >= 0.85) return "Sangat Tinggi";
    if (c >= 0.7) return "Tinggi";
    if (c >= 0.5) return "Sedang";
    return "Rendah";
  };

  const getKapasitasBanjirStyle = (feature: any) => {
    const c = (feature?.properties as FloodCapacityProperties)?.C ?? 0;
    return {
      fillColor: getKapasitasBanjirColor(c),
      weight: 0,
      opacity: 0.5,
      color: "#ffffff",
      fillOpacity: 0.8,
    };
  };

  // ---- Risiko Bencana Banjir: Kelas_RSK (palet biru sama seperti Kerawanan & Kapasitas) ----
  const getRisikoBanjirColor = (kelas: string): string => {
    const k = (kelas || "").toLowerCase();
    if (k === "sangat tinggi") return "#08306b"; // biru sangat tua
    if (k === "tinggi") return "#2171b5";        // biru tua
    if (k === "sedang") return "#6baed6";       // biru muda
    if (k === "rendah") return "#deebf7";        // biru sangat terang
    return "#f7fbff";                             // default
  };

  const getRisikoBanjirStyle = (feature: any) => {
    const kelas = (feature?.properties as RisikoBanjirProperties)?.Kelas_RSK ?? "";
    return {
      fillColor: getRisikoBanjirColor(kelas),
      weight: 0,
      opacity: 0.5,
      color: "#ffffff",
      fillOpacity: 0.8,
    };
  };

  return (
    <>
      {/* Layer Kerawanan Banjir */}
      {show && data && (
        <GeoJSON
          key="kerawanan-banjir"
          data={data}
          style={getKerawananBanjirStyle}
          onEachFeature={(feature, layer) => {
            const dn = feature.properties?.DN_2 || feature.properties?.DN;
            const labels: Record<number, string> = {
              4: "Sangat Tinggi",
              3: "Tinggi",
              2: "Sedang",
              1: "Rendah",
            };

            layer.bindPopup(`
              <div style="font-family: sans-serif; padding: 5px;">
                <strong style="color: #08306b; display: block; margin-bottom: 4px;">Zona Risiko Banjir</strong>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="width: 12px; height: 12px; background: ${getKerawananBanjirStyle(feature).fillColor}; border-radius: 2px;"></div>
                  <span>Tingkat: <b>${labels[dn] || "Tidak Diketahui"}</b></span>
                </div>
              </div>
            `);

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

      {/* Layer Kerentanan Banjir */}
      {showKerentananBanjir && kerentananBanjirData && (
        <GeoJSON
          key="kerentanan-banjir"
          data={kerentananBanjirData as any}
          style={getKerentananBanjirStyle}
          onEachFeature={(feature, layer) => {
            const props = feature.properties as KerentananBanjirProperties;
            const v = props?.VALUE ?? 0;
            const color = getKerentananBanjirColor(v);
            const label = getKerentananBanjirLabel(v);

            layer.bindPopup(`
              <div style="font-family: sans-serif; padding: 5px;">
                <strong style="color: #08306b; display: block; margin-bottom: 4px;">Kerentanan Banjir</strong>
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                  <div style="width: 12px; height: 12px; background: ${color}; border-radius: 2px;"></div>
                  <span>Tingkat: <b>${label}</b></span>
                </div>
                <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">Nilai: ${(v * 100).toFixed(1)}%</div>
              </div>
            `);

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

      {/* Layer Kapasitas Banjir */}
      {showCapacity && kapasitasBanjirData && (
        <GeoJSON
          key="kapasitas-banjir"
          data={kapasitasBanjirData as any}
          style={getKapasitasBanjirStyle}
          onEachFeature={(feature, layer) => {
            const props = feature.properties as FloodCapacityProperties;
            const c = props?.C ?? 0;
            const color = getKapasitasBanjirColor(c);
            const label = getKapasitasBanjirLabel(c);

            layer.bindPopup(`
              <div style="font-family: sans-serif; padding: 5px;">
                <strong style="color: #08306b; display: block; margin-bottom: 4px;">Kapasitas Banjir</strong>
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                  <div style="width: 12px; height: 12px; background: ${color}; border-radius: 2px;"></div>
                  <span>Tingkat: <b>${label}</b></span>
                </div>
                ${props?.wadmkd ? `<div style="font-size: 11px; color: #64748b;">Kel: ${props.wadmkd}</div>` : ""}
                ${props?.namaobj ? `<div style="font-size: 11px; color: #64748b;">${props.namaobj}</div>` : ""}
                <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">Nilai C: ${(c * 100).toFixed(0)}%</div>
              </div>
            `);

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

      {/* Layer Risiko Bencana Banjir */}
      {showRisikoBanjir && risikoBanjirData && (
        <GeoJSON
          key="risiko-bencana-banjir"
          data={risikoBanjirData as any}
          style={getRisikoBanjirStyle}
          onEachFeature={(feature, layer) => {
            const props = feature.properties as RisikoBanjirProperties;
            const kelas = props?.Kelas_RSK ?? "—";
            const color = getRisikoBanjirColor(kelas);

            layer.bindPopup(`
              <div style="font-family: sans-serif; padding: 5px;">
                <strong style="color: #08306b; display: block; margin-bottom: 4px;">Risiko Bencana Banjir</strong>
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                  <div style="width: 12px; height: 12px; background: ${color}; border-radius: 2px;"></div>
                  <span>Kelas: <b>${kelas}</b></span>
                </div>
                ${props?.DESA ? `<div style="font-size: 11px; color: #64748b;">Desa/Kel: ${props.DESA}</div>` : ""}
                ${props?.Index_RSK != null ? `<div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">Index RSK: ${(props.Index_RSK * 100).toFixed(1)}%</div>` : ""}
                ${props?.LUAS != null && props.LUAS > 0 ? `<div style="font-size: 10px; color: #94a3b8;">Luas: ${props.LUAS.toFixed(2)} ha</div>` : ""}
              </div>
            `);

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
