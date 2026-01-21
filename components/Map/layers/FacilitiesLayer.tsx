/**
 * FacilitiesLayer Component
 * 
 * Layer untuk menampilkan fasilitas
 * 👤 Owner: Shared (Infrastructure)
 * 📁 Data: public/data/infrastructure/facilities.geojson
 * 
 * Edit file ini untuk mengubah styling, popup, atau behavior layer facilities
 */

import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { GeoJSONCollection } from "@/types/geojson";
import { FacilityProperties } from "@/types/geojson";

interface FacilitiesLayerProps {
  data: GeoJSONCollection | null | undefined;
  show: boolean;
  selectedCategory?: string | null;
  selectedKelurahan?: string | null;
}

export default function FacilitiesLayer({ 
  data, 
  show, 
  selectedCategory,
  selectedKelurahan 
}: FacilitiesLayerProps) {
  if (!show || !data) return null;

  // Filter facilities by category and kelurahan
  const filteredFacilities = data.features.filter((f) => {
    if (f.geometry.type !== "Point") return false;
    
    const props = f.properties as FacilityProperties;
    
    // Filter by category
    if (selectedCategory && props.kategori !== selectedCategory) {
      return false;
    }
    
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

  return (
    <>
      {filteredFacilities.map((feature, idx) => {
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
    </>
  );
}
