"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Marker, Popup } from "react-leaflet";
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import L from "leaflet";

export type ApprovedReport = {
  id: number;
  name: string;
  disasterType: string;
  chronology: string;
  createdAt: string;
  lat: number;
  lng: number;
  photoUrl: string | null;
};

// Warna selaras dengan EventPointLayer: banjir = biru, longsor = oranye
const getReportColors = (disasterType: string) => {
  const t = disasterType?.toLowerCase();
  const isBanjir = t === "flood" || t === "banjir";
  return isBanjir
    ? { color: "#3b82f6", iconColor: "#1e40af" }
    : { color: "#f97316", iconColor: "#c2410c" };
};

const createReportIcon = (disasterType: string) => {
  const colors = getReportColors(disasterType);
  return L.divIcon({
    className: "custom-approved-report-marker",
    html: `
      <div style="
        width: 26px;
        height: 26px;
        background-color: ${colors.color};
        border: 2px solid ${colors.iconColor};
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 10px;
          height: 10px;
          background-color: white;
          border-radius: 50%;
          border: 1.5px solid ${colors.iconColor};
        "></div>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -26],
  });
};

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const getDisasterLabel = (disasterType: string) => {
  const t = disasterType?.toLowerCase();
  if (t === "flood" || t === "banjir") return "Banjir";
  if (t === "landslide" || t === "longsor") return "Longsor";
  if (t === "earthquake" || t === "gempa") return "Gempa";
  if (t === "fire" || t === "kebakaran") return "Kebakaran";
  return disasterType?.charAt(0).toUpperCase() + (disasterType?.slice(1) ?? "");
};

const getDisasterEmoji = (disasterType: string) => {
  const t = disasterType?.toLowerCase();
  if (t === "flood" || t === "banjir") return "🌊";
  if (t === "landslide" || t === "longsor") return "⛰️";
  if (t === "earthquake" || t === "gempa") return "🏔️";
  if (t === "fire" || t === "kebakaran") return "🔥";
  return "📍";
};

interface ApprovedReportsLayerProps {
  reports: ApprovedReport[];
  show?: boolean;
  onMarkerClick?: (report: ApprovedReport) => void;
}

export default function ApprovedReportsLayer({ reports, show = false, onMarkerClick }: ApprovedReportsLayerProps) {
  const [photoModalData, setPhotoModalData] = useState<ApprovedReport | null>(null);
  const [photoZoom, setPhotoZoom] = useState(1);
  const [photoDrag, setPhotoDrag] = useState({ x: 0, y: 0 });
  const [isPhotoDragging, setIsPhotoDragging] = useState(false);
  const dragStartRef = useRef<{ clientX: number; clientY: number; dragX: number; dragY: number } | null>(null);

  const closePhotoModal = () => {
    setPhotoModalData(null);
    setPhotoZoom(1);
    setPhotoDrag({ x: 0, y: 0 });
  };

  const onPhotoMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsPhotoDragging(true);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      dragX: photoDrag.x,
      dragY: photoDrag.y,
    };
  };
  const onPhotoMouseMove = (e: MouseEvent) => {
    if (!dragStartRef.current) return;
    setPhotoDrag({
      x: dragStartRef.current.dragX + e.clientX - dragStartRef.current.clientX,
      y: dragStartRef.current.dragY + e.clientY - dragStartRef.current.clientY,
    });
  };
  const onPhotoMouseUp = () => {
    dragStartRef.current = null;
    setIsPhotoDragging(false);
  };

  useEffect(() => {
    if (!photoModalData) return;
    window.addEventListener("mousemove", onPhotoMouseMove);
    window.addEventListener("mouseup", onPhotoMouseUp);
    return () => {
      window.removeEventListener("mousemove", onPhotoMouseMove);
      window.removeEventListener("mouseup", onPhotoMouseUp);
    };
  }, [photoModalData]);

  if (!show || !reports?.length) return null;

  return (
    <>
      {reports.map((r) => (
        <Marker
          key={r.id}
          position={[r.lat, r.lng]}
          icon={createReportIcon(r.disasterType)}
          eventHandlers={{
            click: () => onMarkerClick?.(r),
          }}
        >
          <Popup>
            <div className="min-w-[240px]" style={{ padding: "8px" }}>
              {/* Judul — padding 8px, margin bawah 8px (sama EventPointLayer) */}
              <p
                className="font-semibold text-sm"
                style={{
                  margin: "0 0 8px 0",
                  color:
                    r.disasterType?.toLowerCase() === "flood" ||
                    r.disasterType?.toLowerCase() === "banjir"
                      ? "#1e40af"
                      : "#c2410c",
                }}
              >
                {getDisasterEmoji(r.disasterType)} {getDisasterLabel(r.disasterType)} — Laporan
                Disetujui
              </p>
              {/* Deskripsi — margin 4px 0 seperti popup referensi */}
              <p
                className="text-sm text-slate-700 leading-relaxed line-clamp-4"
                style={{ margin: "4px 0" }}
              >
                {r.chronology}
              </p>
              {/* Atribut: label bold — margin 4px 0 tiap baris */}
              <div className="text-sm text-slate-700">
                <p style={{ margin: "4px 0" }}>
                  <span className="font-semibold">Pelapor:</span> {r.name}
                </p>
                <p style={{ margin: "4px 0" }}>
                  <span className="font-semibold">Dibuat:</span> {formatDate(r.createdAt)}
                </p>
              </div>
              {r.photoUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setPhotoModalData(r);
                    setPhotoZoom(1);
                    setPhotoDrag({ x: 0, y: 0 });
                  }}
                  className="text-xs text-blue-600 hover:underline inline-block text-left font-medium"
                  style={{ marginTop: "8px" }}
                >
                  Lihat foto bukti
                </button>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Modal foto bukti — deskripsi gaya popup (judul + atribut bold + foto) */}
      {photoModalData &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70"
            style={{ top: 0, left: 0, right: 0, bottom: 0 }}
            onClick={closePhotoModal}
          >
            <div
              className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col border border-slate-200"
              style={{ maxHeight: "90vh" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                <button
                  type="button"
                  onClick={() => setPhotoZoom((z) => Math.min(3, z + 0.25))}
                  className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                  aria-label="Zoom in"
                >
                  <ZoomIn size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoZoom((z) => Math.max(0.5, z - 0.25))}
                  className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                  aria-label="Zoom out"
                >
                  <ZoomOut size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPhotoZoom(1);
                    setPhotoDrag({ x: 0, y: 0 });
                  }}
                  className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                  aria-label="Reset zoom"
                >
                  <RotateCcw size={20} />
                </button>
                <button
                  type="button"
                  onClick={closePhotoModal}
                  className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                  aria-label="Tutup"
                >
                  <X size={20} />
                </button>
              </div>
              {/* Foto bukti — zoom & drag seperti modal admin */}
              {photoModalData.photoUrl && (
                <div
                  className="flex-1 min-h-0 overflow-hidden flex items-center justify-center select-none border-t border-slate-200"
                  style={{
                    height: "420px",
                    cursor: isPhotoDragging ? "grabbing" : "grab",
                  }}
                  onMouseDown={onPhotoMouseDown}
                >
                  <div
                    className="flex items-center justify-center w-full h-full"
                    style={{
                      transform: `translate(${photoDrag.x}px, ${photoDrag.y}px) scale(${photoZoom})`,
                      transformOrigin: "50% 50%",
                    }}
                  >
                    <img
                      src={photoModalData.photoUrl}
                      alt="Bukti foto laporan"
                      className="max-w-full max-h-full object-contain pointer-events-none"
                      draggable={false}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
