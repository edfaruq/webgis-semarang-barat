/**
 * ShelterLayer Component
 * 
 * Layer untuk menampilkan titik kumpul evakuasi (shelter points)
 * 📁 Data: public/data/evacuation/shelter/titik-kumpul.geojson
 * 
 * Edit file ini untuk mengubah styling, popup, atau behavior layer shelter
 */

import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useMemo } from "react";
import { GeoJSONCollection } from "@/types/geojson";

interface ShelterProperties {
  id?: string;
  nama?: string;
  kelurahan?: string;
  slug_kelurahan?: string;
  nama_kelurahan?: string;
  [key: string]: any;
}

interface ShelterLayerProps {
  data: GeoJSONCollection | null | undefined;
  show: boolean;
  selectedKelurahan?: string | null;
  onMarkerClick?: (feature: any) => void;
}

export default function ShelterLayer({ 
  data, 
  show,
  selectedKelurahan,
  onMarkerClick
}: ShelterLayerProps) {
  // Filter shelter points by kelurahan if selected
  const shelterPoints = useMemo(() => {
    if (!show || !data) return [];
    
    let filtered = data.features.filter((f) => f.geometry.type === "Point");
    
    // Filter by kelurahan jika dipilih
    if (selectedKelurahan) {
      const selectedKel = selectedKelurahan.toLowerCase().trim();
      // Normalize slug by removing hyphens for comparison
      const selectedKelNormalized = selectedKel.replace(/-/g, "");
      
      filtered = filtered.filter((f) => {
        const props = f.properties as ShelterProperties;
        const kelurahanSlug = (props.slug_kelurahan || props.kelurahan || "").toLowerCase().trim();
        const kelurahanSlugNormalized = kelurahanSlug.replace(/-/g, "");
        const namaKelurahan = (props.nama_kelurahan || "").toLowerCase().trim();
        
        // Match by normalized slug or by nama_kelurahan
        return kelurahanSlugNormalized === selectedKelNormalized || 
               namaKelurahan === selectedKel.replace(/-/g, " ");
      });
    }
    
    return filtered;
  }, [data, show, selectedKelurahan]);

  if (!show || !data || shelterPoints.length === 0) return null;

  // Create shelter icon (dark green circle with white people figures)
  const createShelterIcon = () => {
    return L.divIcon({
      className: "custom-shelter-marker",
      html: `
        <div style="
          width: 28px;
          height: 28px;
          background-color: #166534;
          border: 2px solid #22c55e;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <!-- Lingkaran kecil putih di atas (figur ketiga) -->
          <div style="
            position: absolute;
            width: 4px;
            height: 4px;
            background-color: white;
            border-radius: 50%;
            top: 5px;
            left: 50%;
            transform: translateX(-50%);
          "></div>
          
          <!-- Figur orang 1 (kiri) - Segitiga dipisah dari kepala -->
          <div style="
            position: absolute;
            width: 0;
            height: 0;
            border-left: 3px solid transparent;
            border-right: 3px solid transparent;
            border-bottom: 6px solid white;
            bottom: 8px;
            left: 8px;
          "></div>
          <div style="
            position: absolute;
            width: 3px;
            height: 3px;
            background-color: white;
            border-radius: 50%;
            bottom: 15px;
            left: 7px;
          "></div>
          
          <!-- Figur orang 2 (kanan) - Segitiga dipisah dari kepala -->
          <div style="
            position: absolute;
            width: 0;
            height: 0;
            border-left: 3px solid transparent;
            border-right: 3px solid transparent;
            border-bottom: 6px solid white;
            bottom: 8px;
            right: 8px;
          "></div>
          <div style="
            position: absolute;
            width: 3px;
            height: 3px;
            background-color: white;
            border-radius: 50%;
            bottom: 15px;
            right: 7px;
          "></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      popupAnchor: [0, -28],
    });
  };

  const shelterIcon = createShelterIcon();

  return (
    <>
      {shelterPoints.map((feature, idx) => {
        if (feature.geometry.type !== "Point") return null;
        const props = feature.properties as ShelterProperties;
        const [lng, lat] = feature.geometry.coordinates as number[];

        return (
          <Marker 
            key={`shelter-${selectedKelurahan || 'all'}-${props.id || idx}`} 
            position={[lat, lng]} 
            icon={shelterIcon}
            eventHandlers={{
              click: (e) => {
                e.originalEvent.stopPropagation();
                if (onMarkerClick) {
                  onMarkerClick(feature);
                }
              }
            }}
          >
            <Popup>
              <div style={{ padding: "8px", minWidth: "200px" }}>
                <h3 style={{ margin: "0 0 8px 0", fontWeight: "bold", color: "#22c55e" }}>
                  👥 {props.nama || "Titik Kumpul"}
                </h3>
                {props.nama_kelurahan && (
                  <p style={{ margin: "4px 0" }}>
                    <strong>Kelurahan:</strong> {props.nama_kelurahan}
                  </p>
                )}
                {props.deskripsi && (
                  <p style={{ margin: "4px 0" }}>
                    {props.deskripsi}
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
