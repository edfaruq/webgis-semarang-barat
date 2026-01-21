/**
 * FloodLayer Component
 * 
 * Layer untuk menampilkan data banjir
 * 👤 Owner: Farhan
 * 📁 Data: public/data/disasters/banjir/
 * 
 * Edit file ini untuk mengubah styling, popup, atau behavior layer banjir
 */

import { GeoJSON } from "react-leaflet";
import { GeoJSONCollection } from "@/types/geojson";

interface FloodLayerProps {
  data: GeoJSONCollection | null | undefined;
  show: boolean;
}

export default function FloodLayer({ data, show }: FloodLayerProps) {
  if (!show || !data) return null;

  const getFloodStyle = (feature: any) => {
    const dn = feature?.properties?.DN_2 || feature?.properties?.DN;
    
    // Palet Biru Profesional (High to Low)
    const colors = {
      4: "#08306b", // Biru Sangat Tua (Sangat Bahaya)
      3: "#2171b5", // Biru Tua (Bahaya)
      2: "#6baed6", // Biru Muda (Cukup Bahaya)
      1: "#deebf7", // Biru Sangat Terang (Rendah)
    };

    return {
      // @ts-ignore
      fillColor: colors[dn] || "#f7fbff",
      // Menghilangkan border agar poligon terlihat menyatu satu sama lain
      weight: 0, 
      opacity: 0.5,
      color: "#ffffff", // Garis tepi putih tipis untuk sedikit dimensi
      fillOpacity: 0.8, // Sedikit transparan agar peta dasar masih terlihat
    };
  };

  return (
    <GeoJSON
      data={data}
      style={getFloodStyle}
      onEachFeature={(feature, layer) => {
        const dn = feature.properties?.DN_2 || feature.properties?.DN;
        const labels: { [key: number]: string } = {
          4: "Sangat Tinggi",
          3: "Tinggi",
          2: "Sedang",
          1: "Rendah"
        };

        layer.bindPopup(`
          <div style="font-family: sans-serif; padding: 5px;">
            <strong style="color: #08306b; display: block; margin-bottom: 4px;">Zona Risiko Banjir</strong>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 12px; height: 12px; background: ${getFloodStyle(feature).fillColor}; border-radius: 2px;"></div>
              <span>Tingkat: <b>${labels[dn] || "Tidak Diketahui"}</b></span>
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
  );
}
