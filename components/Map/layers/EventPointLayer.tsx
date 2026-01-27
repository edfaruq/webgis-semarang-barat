"use client";

import { GeoJSON } from "react-leaflet";
import L from "leaflet";
import { useMemo } from "react";
import { GeoJSONCollection } from "@/types/geojson";

interface EventPointLayerProps {
  data?: GeoJSONCollection | null;
  show?: boolean;
  selectedKelurahan?: string | null;
  onMarkerClick?: (feature: any) => void;
}

export default function EventPointLayer({ data, show = false, selectedKelurahan, onMarkerClick }: EventPointLayerProps) {
  // Get colors based on jenis titik and jenis bencana
  const getEventPointColors = (jenisBencana: string, jenisTitik: string) => {
    // Special colors for specific jenis titik
    if (jenisTitik === 'evakuasi') {
      return {
        color: '#22c55e', // Green for evakuasi
        iconColor: '#15803d' // Darker green for border
      };
    } else if (jenisTitik === 'permukiman') {
      return {
        color: '#6b7280', // Gray for permukiman
        iconColor: '#374151' // Darker gray for border
      };
    }
    
    // Default colors based on jenis bencana
    const isBanjir = jenisBencana?.toLowerCase() === 'banjir';
    const color = isBanjir ? '#3b82f6' : '#f97316'; // Blue for banjir, Orange for longsor
    const iconColor = isBanjir ? '#1e40af' : '#c2410c'; // Darker shade for border
    
    return { color, iconColor };
  };

  // Create icon for event point
  const createEventPointIcon = (jenisBencana: string, jenisTitik: string) => {
    const colors = getEventPointColors(jenisBencana, jenisTitik);
    
    return L.divIcon({
      className: "custom-event-point-marker",
      html: `
        <div style="
          width: 24px;
          height: 24px;
          background-color: ${colors.color};
          border: 2px solid ${colors.iconColor};
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 8px;
            height: 8px;
            background-color: white;
            border-radius: 50%;
            border: 1.5px solid ${colors.iconColor};
          "></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24],
    });
  };

  // Filter event points by kelurahan if selected
  const eventPoints = useMemo(() => {
    if (!data || !show) return null;
    
    let filtered = data.features;
    
    // Filter by kelurahan jika dipilih
    if (selectedKelurahan) {
      const selectedKel = selectedKelurahan.toLowerCase().trim();
      const selectedKelName = selectedKel.replace(/-/g, " ");
      // Normalize slug (remove hyphens for comparison)
      const selectedKelNormalized = selectedKel.replace(/-/g, "");
      
      filtered = filtered.filter((f) => {
        const props = f.properties as any;
        const kelurahanSlug = (props.slug_kelurahan || props.kelurahan || "").toLowerCase().trim();
        const kelurahanName = (props.nama_kelurahan || "").toLowerCase().trim();
        
        // Normalize slug for comparison (remove hyphens)
        const kelurahanSlugNormalized = kelurahanSlug.replace(/-/g, "");
        
        // Match by slug (exact or normalized), or by name
        const matchesSlug = kelurahanSlug === selectedKel || kelurahanSlugNormalized === selectedKelNormalized;
        const matchesName = kelurahanName === selectedKelName || kelurahanName === selectedKel;
        
        return matchesSlug || matchesName;
      });
    }
    
    return filtered.length > 0 ? {
      ...data,
      features: filtered,
    } : null;
  }, [data, show, selectedKelurahan]);

  if (!eventPoints || !show) return null;

  return (
    <GeoJSON
      key={`event-points-${selectedKelurahan || 'all'}`}
      data={eventPoints as GeoJSON.FeatureCollection}
      pointToLayer={(feature, latlng) => {
        const props = feature.properties as any;
        const jenisBencana = props.jenis_bencana || 'unknown';
        const jenisTitik = props.jenis_titik || 'kejadian';
        const icon = createEventPointIcon(jenisBencana, jenisTitik);
        return L.marker(latlng, { icon });
      }}
      onEachFeature={(feature, layer) => {
        const props = feature.properties as any;
        const jenisBencana = props.jenis_bencana || 'unknown';
        const jenisTitik = props.jenis_titik || 'kejadian';
        const colors = getEventPointColors(jenisBencana, jenisTitik);
        
        // Determine icon and title based on jenis titik
        let iconEmoji = '';
        let title = props.label || props.nama || "Titik";
        
        if (jenisTitik === 'evakuasi') {
          iconEmoji = '🚨';
          title = props.label || props.nama || "Titik Evakuasi";
        } else if (jenisTitik === 'permukiman') {
          iconEmoji = '🏘️';
          title = props.label || props.nama || "Titik Permukiman";
        } else {
          // kejadian
          const isBanjir = jenisBencana.toLowerCase() === 'banjir';
          iconEmoji = isBanjir ? '🌊' : '⛰️';
          // Use label if available (e.g., "Titik Banjir"), otherwise use default
          title = props.label || props.nama || (isBanjir ? "Titik Banjir" : "Titik Kejadian Bencana");
        }
        
        const popupContent = `
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold; color: ${colors.iconColor};">
              ${iconEmoji} ${title}
            </h3>
            ${props.deskripsi ? `<p style="margin: 4px 0;">${props.deskripsi}</p>` : ""}
            ${props.nama_kelurahan ? `<p style="margin: 4px 0;"><strong>Kelurahan:</strong> ${props.nama_kelurahan}</p>` : ""}
            ${jenisTitik === 'kejadian' ? `<p style="margin: 4px 0;"><strong>Jenis:</strong> ${jenisBencana.charAt(0).toUpperCase() + jenisBencana.slice(1)}</p>` : ""}
          </div>
        `;
        layer.bindPopup(popupContent);
        
        // Add click handler for routing
        layer.on('click', (e) => {
          if (e.originalEvent) {
            e.originalEvent.stopPropagation();
          }
          if (onMarkerClick) {
            onMarkerClick(feature);
          }
        });
      }}
    />
  );
}
