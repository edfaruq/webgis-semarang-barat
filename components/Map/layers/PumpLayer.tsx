/**
 * PumpLayer Component
 * 
 * Layer untuk menampilkan titik pompa air
 * 👤 Owner: Shared (Utilities)
 * 📁 Data: public/data/utilities/pompa-air/pompa-air.geojson
 * 
 * Edit file ini untuk mengubah styling, popup, atau behavior layer pompa
 */

import { Marker } from "react-leaflet";
import L from "leaflet";
import { GeoJSONCollection } from "@/types/geojson";
import { PumpProperties } from "@/types/geojson";

interface PumpLayerProps {
  data: GeoJSONCollection | null | undefined;
  show: boolean;
  selectedKelurahan?: string | null;
  onPumpClick?: (feature: any) => void;
}

export default function PumpLayer({ 
  data, 
  show, 
  selectedKelurahan,
  onPumpClick
}: PumpLayerProps) {
  if (!show || !data) return null;

  // Filter pompa by kelurahan
  const filteredPumps = data.features.filter((f) => {
    if (f.geometry.type !== "Point") return false;
    
    const props = f.properties as PumpProperties;
    
    // Filter by kelurahan
    if (selectedKelurahan) {
      const kelurahanSlug = props.kelurahan?.toLowerCase().trim() || "";
      const kelurahanName = props.nama_kelurahan?.toLowerCase().trim() || "";
      const selectedKel = selectedKelurahan.toLowerCase().trim();
      const selectedKelName = selectedKel.replace(/-/g, " ");
      
      const matchesSlug = kelurahanSlug === selectedKel;
      const matchesName = kelurahanName === selectedKelName || kelurahanName === selectedKel;
      
      if (!matchesSlug && !matchesName) {
        return false;
      }
    }
    
    return true;
  });

  // Icon untuk pompa air
  const getPumpIcon = (): L.DivIcon => {
    const iconSize: [number, number] = [30, 30];
    const iconAnchor: [number, number] = [15, 15];
    
    return L.divIcon({
      className: "custom-pump-marker",
      html: `<div style="
        background-color: #3b82f6;
        width: ${iconSize[0]}px;
        height: ${iconSize[1]}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
      ">💧</div>`,
      iconSize,
      iconAnchor,
    });
  };

  const pumpIcon = getPumpIcon();

  return (
    <>
      {filteredPumps.map((feature, idx) => {
        if (feature.geometry.type !== "Point") return null;
        const props = feature.properties as PumpProperties;
        const [lng, lat] = feature.geometry.coordinates as number[];

        return (
          <Marker 
            key={`pump-${idx}`} 
            position={[lat, lng]} 
            icon={pumpIcon}
            eventHandlers={{
              click: () => {
                if (onPumpClick) {
                  onPumpClick(feature);
                }
              }
            }}
          />
        );
      })}
    </>
  );
}
