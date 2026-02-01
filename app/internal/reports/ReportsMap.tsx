"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import type { Report } from "@prisma/client";

const MapWithMarkers = dynamic(() => import("./ReportsMapLeaflet"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
        <p className="mt-4 text-slate-600">Memuat peta...</p>
      </div>
    </div>
  ),
});

const DEFAULT_CENTER: [number, number] = [-6.9932, 110.4036];

export default function ReportsMap({ reports }: { reports: Report[] }) {
  const points = useMemo(
    () =>
      reports.map((r) => ({
        id: r.id,
        lat: r.lat,
        lng: r.lng,
        disasterType: r.disasterType,
        chronology: r.chronology,
        createdAt: r.createdAt,
      })),
    [reports]
  );

  return (
    <div className="absolute inset-0">
      <MapWithMarkers center={DEFAULT_CENTER} points={points} />
    </div>
  );
}
