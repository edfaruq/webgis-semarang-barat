/**
 * BoundaryLayer Component
 * 
 * Layer untuk menampilkan batas wilayah
 * 👤 Owner: Shared (Infrastructure)
 * 📁 Data: public/data/infrastructure/boundary.geojson
 * 
 * Edit file ini untuk mengubah styling, popup, atau behavior layer boundary
 */

import { useEffect, useRef, useState } from "react";
import { GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import { GeoJSONCollection } from "@/types/geojson";
import { BoundaryProperties, BasemapType } from "@/types/geojson";

interface BoundaryLayerProps {
  data: GeoJSONCollection | null | undefined;
  show: boolean;
  selectedKelurahan?: string | null;
  onFeatureClick?: (feature: any) => void;
  onKelurahanChange?: (kelurahan: string | null) => void;
  basemap?: BasemapType;
}

export default function BoundaryLayer({ 
  data, 
  show, 
  selectedKelurahan,
  onFeatureClick,
  onKelurahanChange,
  basemap = "osm"
}: BoundaryLayerProps) {
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);
  const boundaryLayerRef = useRef<L.GeoJSON>(null);

  // Filter boundary by kelurahan
  const filteredBoundary = data && selectedKelurahan ? {
    ...data,
    features: data.features.filter((f) => {
      const props = f.properties as BoundaryProperties;
      const kelurahanName = (props.nama_kelurahan || "").toLowerCase().trim();
      const slug = (props.slug || "").toLowerCase().trim();
      const selectedKel = selectedKelurahan.toLowerCase().trim();
      const selectedKelName = selectedKel.replace(/-/g, " ");
      
      return slug === selectedKel || kelurahanName === selectedKelName;
    }),
  } : data;

  if (!show || !filteredBoundary || filteredBoundary.features.length === 0) return null;

  const boundaryStyle = (feature: any) => {
    const isHovered = hoveredFeature === feature.properties.id || hoveredFeature === feature.properties.nama_wilayah;
    
    // Warna berdasarkan basemap: OSM = abu-abu tua, Satellite (esri-imagery) = merah
    const baseColor = basemap === "esri-imagery" ? "#dc2626" : "#4b5563"; // Merah untuk satellite, abu-abu tua untuk OSM
    const hoverColor = basemap === "esri-imagery" ? "#dc2626" : "#374151"; // Warna hover sedikit lebih gelap untuk OSM
    
    return {
      fillColor: isHovered ? (basemap === "esri-imagery" ? "#fee2e2" : "#e5e7eb") : "transparent", 
      fillOpacity: isHovered ? 0.3 : 0,
      color: isHovered ? hoverColor : baseColor,
      weight: isHovered ? 4 : 3,
      opacity: 1,
      dashArray: "10, 5", 
    };
  };

  const onBoundaryEachFeature = (feature: any, layer: L.Layer) => {
    const props: BoundaryProperties = feature.properties;
    
    layer.on({
      mouseover: () => {
        setHoveredFeature(props.id || props.nama_wilayah || "");
        if (layer instanceof L.Path) {
          layer.setStyle(boundaryStyle(feature));
        }
      },
      mouseout: () => {
        setHoveredFeature(null);
        if (boundaryLayerRef.current && layer instanceof L.Path) {
          boundaryLayerRef.current.resetStyle(layer);
        }
      },
      click: () => {
        if (onFeatureClick) {
          onFeatureClick(feature);
        }
        
        const slug = props.slug || null;
        if (onKelurahanChange && slug) {
          onKelurahanChange(slug);
        }
        
        const popupContent = `
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold;">${props.nama_wilayah || props.nama_kelurahan || "Wilayah"}</h3>
            ${props.luas ? `<p style="margin: 4px 0;"><strong>Luas:</strong> ${props.luas.toLocaleString()} m²</p>` : ""}
            ${props.kode ? `<p style="margin: 4px 0;"><strong>Kode:</strong> ${props.kode}</p>` : ""}
          </div>
        `;
        layer.bindPopup(popupContent).openPopup();
      },
    });
  };

  return (
    <GeoJSON
      key={`boundary-${selectedKelurahan || 'all'}`}
      ref={boundaryLayerRef}
      data={filteredBoundary as any}
      style={boundaryStyle}
      onEachFeature={onBoundaryEachFeature}
    />
  );
}
