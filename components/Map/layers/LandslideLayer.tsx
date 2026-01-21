/**
 * LandslideLayer Component
 * 
 * Layer untuk menampilkan data longsor
 * 👤 Owner: Faruq
 * 📁 Data: public/data/disasters/longsor/
 * 
 * Edit file ini untuk mengubah styling, popup, atau behavior layer longsor
 */

import { GeoJSON } from "react-leaflet";
import { GeoJSONCollection } from "@/types/geojson";
import { RiskProperties } from "@/types/geojson";

interface LandslideLayerProps {
  data: GeoJSONCollection | null | undefined;
  show: boolean;
}

export default function LandslideLayer({ data, show }: LandslideLayerProps) {
  if (!show || !data) return null;

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

  return (
    <GeoJSON
      data={data as any}
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
  );
}
