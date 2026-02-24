"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as unknown as { _getUrl?: string })._getUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
}

type Point = {
  id: number;
  lat: number;
  lng: number;
  status: string;
  disasterType: string;
  chronology: string;
  createdAt: Date;
};

function MapFitBounds({ points }: { points: Point[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 14);
      return;
    }
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [map, points]);
  return null;
}

export default function ReportsMapLeaflet({
  center,
  points,
}: {
  center: [number, number];
  points: Point[];
}) {
  return (
    <MapContainer
      center={center}
      zoom={13}
      className="h-full w-full"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapFitBounds points={points} />
      {points.map((p) => {
        const statusLabel =
          p.status === "approved" ? "Disetujui" : p.status === "pending" ? "Pending" : "Ditolak";
        const statusClasses =
          p.status === "approved"
            ? "bg-green-100 text-green-800"
            : p.status === "pending"
            ? "bg-amber-100 text-amber-800"
            : "bg-red-100 text-red-800";

        return (
          <Marker key={p.id} position={[p.lat, p.lng]}>
            <Popup>
              <div className="min-w-[220px] space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-800 capitalize">{p.disasterType}</p>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${statusClasses}`}>
                    {statusLabel}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {new Date(p.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-sm text-slate-600 mt-1 line-clamp-4">{p.chronology}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
