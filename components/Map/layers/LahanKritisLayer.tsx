/**
 * LahanKritisLayer Component
 * 
 * Layer untuk menampilkan data lahan kritis
 * 👤 Owner: Shaqi
 * 📁 Data: public/data/disasters/lahan-kritis/
 * 
 * Edit file ini untuk mengubah styling, popup, atau behavior layer lahan kritis
 */

import { GeoJSON } from "react-leaflet";
import { GeoJSONCollection } from "@/types/geojson";

interface LahanKritisLayerProps {
  data: GeoJSONCollection | null | undefined;
  show: boolean;
}

export default function LahanKritisLayer({ data, show }: LahanKritisLayerProps) {
  if (!show || !data) return null;

  const getLahanKritisStyle = (feature: any) => {
    const keterangan = feature.properties?.Keterangan;
    
    // Palet warna gradasi untuk Lahan Kritis
    const colors: { [key: string]: string } = {
      "PT": "#8bc34a", // Sangat Potensial (Hijau Tua)
      "P":  "#fff176", // Potensial (Hijau Muda)
      "AK": "#ffc107", // Agak Kritis (Oranye)
      "K":  "#fb8c00", // Kritis (Merah)
      "SK": "#e64b19", // Sangat Kritis (Marun)
    };

    return {
      fillColor: colors[keterangan] || "#8bc34a",
      weight: 0, // Agar menyatu tanpa garis tepi
      fillOpacity: 0.8,
      color: "transparent",
    };
  };

  return (
    <GeoJSON
      data={data}
      style={getLahanKritisStyle}
      onEachFeature={(feature, layer) => {
        const ket = feature.properties?.Keterangan;
        const skor = feature.properties?.NT;
        
        const labels: { [key: string]: string } = {
          "PT": "Potensial",
          "P":  "Potensial",
          "AK": "Agak Kritis",
          "K":  "Kritis",
          "SK": "Sangat Kritis"
        };

        layer.bindPopup(`
          <div style="font-family: sans-serif; padding: 5px;">
            <strong style="color: #634a00; display: block; margin-bottom: 4px;">📍 Analisis Lahan Kritis</strong>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 12px; height: 12px; background: ${getLahanKritisStyle(feature).fillColor}; border-radius: 2px;"></div>
                <span>Status: <b>${labels[ket] || ket || "Data Kosong"}</b></span>
              </div>
              <span style="font-size: 11px; color: #666;">Total Skor (NT): ${skor || "-"}</span>
            </div>
          </div>
        `);

        layer.on({
          mouseover: (e) => {
            const l = e.target;
            l.setStyle({ fillOpacity: 1, weight: 0, color: "#ffffff" });
            l.bringToFront();
          },
          mouseout: (e) => {
            const l = e.target;
            l.setStyle(getLahanKritisStyle(feature));
          },
        });
      }}
    />
  );
}
