"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { approveReport, rejectReport } from "@/app/internal/console/actions";
import type { Report } from "@prisma/client";

type ReportRow = Report;

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };
  const s = styles[status] ?? "bg-slate-100 text-slate-700";
  const label = status === "pending" ? "Pending" : status === "approved" ? "Disetujui" : "Ditolak";
  return <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${s}`}>{label}</span>;
}

export default function AdminReportTable({ reports }: { reports: ReportRow[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [photoModalUrl, setPhotoModalUrl] = useState<string | null>(null);
  const [photoZoom, setPhotoZoom] = useState(1);
  const [photoDrag, setPhotoDrag] = useState({ x: 0, y: 0 });
  const [isPhotoDragging, setIsPhotoDragging] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const dragStartRef = useRef<{ clientX: number; clientY: number; dragX: number; dragY: number } | null>(null);

  const filteredReports = selectedStatus === "all" ? reports : reports.filter(r => r.status === selectedStatus);

  const openPhotoModal = (url: string) => {
    setPhotoModalUrl(url);
    setPhotoZoom(1);
    setPhotoDrag({ x: 0, y: 0 });
  };
  const closePhotoModal = () => {
    setPhotoModalUrl(null);
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
    if (!photoModalUrl) return;
    window.addEventListener("mousemove", onPhotoMouseMove);
    window.addEventListener("mouseup", onPhotoMouseUp);
    return () => {
      window.removeEventListener("mousemove", onPhotoMouseMove);
      window.removeEventListener("mouseup", onPhotoMouseUp);
    };
  }, [photoModalUrl]);

  const showToast = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleApprove = async (id: number) => {
    setLoadingId(id);
    const result = await approveReport(id);
    setLoadingId(null);
    if (result.success) {
      showToast("success", "Laporan disetujui.");
      router.refresh();
    } else showToast("error", result.error ?? "Gagal menyetujui.");
  };

  const handleReject = async (id: number) => {
    setLoadingId(id);
    const result = await rejectReport(id);
    setLoadingId(null);
    if (result.success) {
      showToast("error", "Laporan ditolak.");
      router.refresh();
    } else showToast("error", result.error ?? "Gagal menolak.");
  };

  if (reports.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 py-12 text-center text-slate-500 text-sm">
        Belum ada laporan
      </div>
    );
  }

  if (filteredReports.length === 0) {
    return (
      <div className="space-y-4">
        {/* Filter */}
        <div className="flex items-center gap-4">
          <label htmlFor="status-filter" className="text-sm font-medium text-slate-700">
            Filter Status:
          </label>
          <select
            id="status-filter"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Semua</option>
            <option value="pending">Pending</option>
            <option value="approved">Disetujui</option>
            <option value="rejected">Ditolak</option>
          </select>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 py-12 text-center text-slate-500 text-sm">
          Tidak ada laporan dengan status ini
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`rounded-lg px-4 py-2 text-sm ${
            message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}
      {/* Filter */}
      <div className="flex items-center gap-4">
        <label htmlFor="status-filter" className="text-sm font-medium text-slate-700">
          Filter Status:
        </label>
        <select
          id="status-filter"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">Semua</option>
          <option value="pending">Pending</option>
          <option value="approved">Disetujui</option>
          <option value="rejected">Ditolak</option>
        </select>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Judul / Pelapor</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Tipe Bencana</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Dibuat</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {filteredReports.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <span className="font-medium text-slate-900">{r.name}</span>
                  <span className="text-slate-500 text-sm block">{r.email}</span>
                </td>
                <td className="px-4 py-3 text-slate-700 capitalize">{r.disasterType}</td>
                <td className="px-4 py-3">{statusBadge(r.status)}</td>
                <td className="px-4 py-3 text-slate-600 text-sm">{formatDate(r.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2 flex-wrap">
                    {r.photoUrl && (
                      <button
                        type="button"
                        onClick={() => openPhotoModal(r.photoUrl!)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200"
                      >
                        Lihat Foto
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={loadingId === r.id}
                      onClick={() => handleApprove(r.id)}
                      className="px-3 py-1.5 rounded-lg bg-green-100 text-green-800 text-sm font-medium hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingId === r.id ? "..." : "Setujui"}
                    </button>
                    <button
                      type="button"
                      disabled={loadingId === r.id}
                      onClick={() => handleReject(r.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-100 text-red-800 text-sm font-medium hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Tolak
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Lihat Foto — di-render ke body agar backdrop sampai atas */}
      {photoModalUrl &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70"
            style={{ top: 0, left: 0, right: 0, bottom: 0 }}
            onClick={closePhotoModal}
          >
            <div
              className="relative w-[480px] h-[360px] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
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
              <div
                className="flex-1 min-h-0 overflow-hidden flex items-center justify-center select-none"
                style={{ cursor: isPhotoDragging ? "grabbing" : "grab" }}
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
                    src={photoModalUrl}
                    alt="Bukti foto laporan"
                    className="max-w-full max-h-full object-contain pointer-events-none"
                    draggable={false}
                  />
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
