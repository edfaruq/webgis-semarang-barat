"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
}

// Marker kecil untuk map lokasi (modal Lapor Bencana) — default 25x41 terlalu besar
const smallMarkerIcon = typeof window !== "undefined"
  ? new L.Icon({
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      iconSize: [18, 30],
      iconAnchor: [9, 30],
      popupAnchor: [1, -28],
      shadowSize: [30, 30],
    })
  : undefined;

interface MapLocationPickerProps {
  position: [number, number] | null;
  setPosition: (pos: [number, number]) => void;
  defaultCenter: [number, number];
  shouldZoomToPosition?: boolean;
}

// Component untuk handle auto zoom ke position
function AutoZoom({ 
  position, 
  shouldZoom 
}: { 
  position: [number, number] | null;
  shouldZoom?: boolean;
}) {
  const map = useMap();
  
  useEffect(() => {
    if (position && shouldZoom) {
      map.flyTo(position, 16, {
        duration: 1.5
      });
    }
  }, [position, shouldZoom, map]);
  
  return null;
}

// Component untuk handle map click
function LocationMarker({
  position,
  setPosition,
}: {
  position: [number, number] | null;
  setPosition: (pos: [number, number]) => void;
}) {
  const map = useMapEvents({
    click(e) {
      const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
    },
  });

  return position === null ? null : <Marker position={position} icon={smallMarkerIcon} />;
}

export default function MapLocationPicker({
  position,
  setPosition,
  defaultCenter,
  shouldZoomToPosition = false,
}: MapLocationPickerProps) {
  return (
    <MapContainer
      center={defaultCenter}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker position={position} setPosition={setPosition} />
      <AutoZoom position={position} shouldZoom={shouldZoomToPosition} />
    </MapContainer>
  );
}
