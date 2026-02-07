"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useActionState } from "react";
import { X, MapPin, Crosshair, Shield, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";
import dynamic from "next/dynamic";
import { submitReportAction } from "@/app/actions/report";

const MODAL_CLOSE_DURATION_MS = 200;

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AlertState {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  show: boolean;
}

// Dynamic import untuk map component
const MapWithLocationPicker = dynamic(
  () => import("./MapLocationPicker"),
  { ssr: false }
);

export default function ReportModal({ isOpen, onClose }: ReportModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [shouldZoomToGPS, setShouldZoomToGPS] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [disasterCategory, setDisasterCategory] = useState<string>("");
  const [alert, setAlert] = useState<AlertState>({
    type: "info",
    message: "",
    show: false,
  });
  const [isAlertExiting, setIsAlertExiting] = useState(false);
  const [state, formAction] = useActionState(submitReportAction, null);
  const prevStateRef = useRef<{ success?: boolean; error?: string } | null>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    setIsClosing((prev) => {
      if (prev) return prev;
      setTimeout(() => {
        onClose();
        setIsClosing(false);
      }, MODAL_CLOSE_DURATION_MS);
      return true;
    });
  }, [onClose]);

  useEffect(() => {
    if (!state || state === prevStateRef.current) return;
    prevStateRef.current = state;
    if (state.success) {
      showAlert("success", "Laporan berhasil dikirim! Tim BPBD akan segera menindaklanjuti.");
      setTimeout(() => {
        setIsAlertExiting(true);
        setTimeout(() => {
          handleClose();
          setMarkerPosition(null);
          setIsVerified(false);
          setDisasterCategory("");
          setFileName("");
          setAlert({ type: "info", message: "", show: false });
          setIsAlertExiting(false);
        }, 400);
      }, 2000);
    } else if (state.error) {
      showAlert("error", state.error);
    }
  }, [state, onClose, handleClose]);

  // Auto scroll ke alert ketika alert muncul
  useEffect(() => {
    if (alert.show && alertRef.current) {
      alertRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [alert.show]);

  // Default center (Semarang Barat)
  const defaultCenter: [number, number] = [-6.9932, 110.4036];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024; // 5 MB in bytes
      if (file.size > maxSize) {
        showAlert('error', 'Ukuran file melebihi batas maksimal 5 MB. Mohon pilih file yang lebih kecil.');
        e.target.value = ''; // Clear the input
        setFileName("");
      } else {
        setFileName(file.name);
      }
    } else {
      setFileName("");
    }
  };

  const showAlert = (type: AlertState['type'], message: string) => {
    setIsAlertExiting(false);
    setAlert({ type, message, show: true });
    // Auto hide after 5 seconds
    setTimeout(() => {
      setIsAlertExiting(true);
      setTimeout(() => {
        setAlert(prev => ({ ...prev, show: false }));
        setIsAlertExiting(false);
      }, 400);
    }, 5000);
  };

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      setIsLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setMarkerPosition(newPos);
          setShouldZoomToGPS(true);
          setIsLoadingLocation(false);
          showAlert('success', 'Lokasi GPS berhasil ditemukan!');
          // Reset zoom trigger after a delay
          setTimeout(() => setShouldZoomToGPS(false), 2000);
        },
        (error) => {
          showAlert('error', 'Tidak dapat mengakses lokasi GPS. Mohon izinkan akses lokasi atau tandai manual di peta.');
          setIsLoadingLocation(false);
        }
      );
    } else {
      showAlert('error', 'GPS tidak tersedia di perangkat ini.');
    }
  };

  const coordsDisplay = markerPosition
    ? `${markerPosition[0].toFixed(6)}, ${markerPosition[1].toFixed(6)}`
    : "Belum ditandai - Klik peta atau gunakan GPS";

  if (!isOpen && !isClosing) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      <div
        className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm modal-backdrop ${isClosing ? "modal-closing" : ""}`}
        onClick={handleClose}
      />
      {/* Wrapper – safe area padding agar tidak tertutup iOS Safari nav bar (TOP/BOTTOM) */}
      <div
        className={`absolute top-1/2 left-1/2 w-full max-w-4xl flex flex-col modal-content-scale ${isClosing ? "modal-closing" : ""}`}
        style={{
          paddingTop: "calc(1rem + env(safe-area-inset-top, 0px))",
          paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))",
          paddingLeft: "calc(1rem + env(safe-area-inset-left, 0px))",
          paddingRight: "calc(1rem + env(safe-area-inset-right, 0px))",
          height: "calc(95vh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))",
          maxHeight: "calc(95dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div
          className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col flex-1 min-h-0"
          style={{
            maxHeight: "calc(95dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))",
          }}
        >
          {/* Header tetap di atas saat scroll - sama seperti modal Titik Pompa */}
          <div className="bg-red-600 p-6 text-white text-center relative shrink-0 z-10">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-white hover:text-red-200 transition"
            >
              <X size={20} />
            </button>
            <h3 className="text-2xl font-bold">Lapor Kejadian Bencana</h3>
            <p className="text-red-100 text-sm mt-1">
              Laporan akan diteruskan ke BPBD Kota Semarang.
            </p>
          </div>
          {/* Hanya area ini yang scroll */}
          <div className="flex-1 min-h-0 overflow-y-auto seamless-scrollbar">
          <form
            id="emergencyForm"
            className="p-8 space-y-5"
            action={formAction}
            onSubmit={(e) => {
              if (!markerPosition) {
                e.preventDefault();
                showAlert("warning", "Mohon tandai lokasi kejadian di peta terlebih dahulu!");
                return;
              }
              if (!isVerified) {
                e.preventDefault();
                showAlert("warning", "Mohon verifikasi bahwa Anda bukan robot!");
                return;
              }
              if (!disasterCategory) {
                e.preventDefault();
                showAlert("warning", "Mohon pilih kategori bencana!");
                return;
              }
            }}
          >
            {markerPosition && (
              <>
                <input type="hidden" name="lat" value={markerPosition[0]} />
                <input type="hidden" name="lng" value={markerPosition[1]} />
              </>
            )}
            {/* Peta Interaktif */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-700">
                  <MapPin className="inline mr-1" size={16} />
                  Tentukan Lokasi Bencana
                </label>
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  disabled={isLoadingLocation}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition disabled:opacity-50"
                >
                  <Crosshair size={14} />
                  {isLoadingLocation ? "Mencari..." : "Lokasi Saya"}
                </button>
              </div>
              <div className="relative rounded-xl overflow-hidden border-2 border-slate-300 shadow-sm" style={{ height: "300px" }}>
                <MapWithLocationPicker
                  position={markerPosition}
                  setPosition={setMarkerPosition}
                  defaultCenter={defaultCenter}
                  shouldZoomToPosition={shouldZoomToGPS}
                />
                {/* Notifikasi GPS berhasil ditemukan — tampil di atas peta */}
                {alert.show && alert.type === "success" && alert.message === "Lokasi GPS berhasil ditemukan!" && (
                  <div className={`absolute top-3 left-1/2 -translate-x-1/2 z-10 rounded-xl px-4 py-2.5 shadow-lg border-2 border-green-700 bg-green-600 text-white flex items-center gap-2 ${isAlertExiting ? "animate-slide-to-right" : "animate-slide-from-right"}`}>
                    <CheckCircle size={20} className="flex-shrink-0 text-white" />
                    <span className="text-sm font-semibold whitespace-nowrap">{alert.message}</span>
                  </div>
                )}
              </div>
              <div className="mt-2 bg-indigo-50 p-3 rounded-xl border border-indigo-100 text-center">
                <span className="text-[10px] text-indigo-400 font-bold block mb-1 uppercase tracking-wider">
                  Koordinat Lokasi Kejadian
                </span>
                <span className="text-xs font-mono text-indigo-600 font-bold">
                  {coordsDisplay}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500 italic text-center">
                💡 Klik pada peta untuk menandai lokasi kejadian, atau gunakan tombol "Lokasi Saya"
              </p>
            </div>
            
            {/* Grid 2 kolom untuk desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nama Anda
                </label>
                <input
                  name="name"
                  type="text"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Masukkan Nama Anda"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nomor Telepon
                </label>
                <input
                  name="phone"
                  type="tel"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="08xxxxxxxxxx"
                  pattern="[0-9]{10,13}"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Masukkan Email Anda"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Instansi
                </label>
                <input
                  name="institution"
                  type="text"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Masukkan Instansi Anda"
                />
              </div>
            </div>

            {/* Kategori Bencana */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Kategori Bencana
              </label>
              <select
                name="disasterType"
                value={disasterCategory}
                onChange={(e) => setDisasterCategory(e.target.value)}
                className={`w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white ${
                  !disasterCategory ? "text-slate-400" : "text-slate-700"
                }`}
                style={{
                  color: !disasterCategory ? "#94a3b8" : "#334155",
                }}
                required
              >
                <option value="" style={{ color: "#94a3b8" }}>Pilih Kategori Bencana</option>
                <option value="banjir" style={{ color: "#334155" }}>Banjir</option>
                <option value="longsor" style={{ color: "#334155" }}>Longsor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Kronologi
              </label>
              <textarea
                name="chronology"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={4}
                placeholder="Tuliskan Kronologi Yang Akan Anda Sampaikan"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Kirimkan Bukti Berupa Foto
              </label>
              <div className="relative">
                <input
                  name="photo"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer"
                />
                {fileName && (
                  <p className="mt-2 text-xs text-slate-600">
                    File terpilih: {fileName}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-500">
                  Ukuran file maksimal: 5 MB
                </p>
              </div>
            </div>

            {/* Verification Checkbox */}
            <div>
              <div 
                className={`relative border-2 rounded-xl p-4 transition-all cursor-pointer ${
                  isVerified 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-slate-300 bg-white hover:border-slate-400'
                }`}
                onClick={() => setIsVerified(!isVerified)}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                        isVerified 
                          ? 'bg-green-500 border-green-500' 
                          : 'bg-white border-slate-400'
                      }`}
                    >
                      {isVerified && (
                        <svg 
                          className="w-4 h-4 text-white" 
                          fill="none" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="3" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7"></path>
                        </svg>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className={isVerified ? 'text-green-600' : 'text-slate-600'} size={20} />
                      <span className={`text-sm font-semibold ${isVerified ? 'text-green-700' : 'text-slate-700'}`}>
                        Saya bukan robot
                      </span>
                    </div>
                  </div>
                  {isVerified && (
                    <div className="text-xs text-green-600 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verifikasi berhasil
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 text-white py-4 rounded-xl text-base font-bold shadow-lg hover:bg-red-700 transition"
            >
              KIRIM LAPORAN DARURAT
            </button>
          </form>

          {/* Custom Alert Component (kecuali notifikasi GPS yang tampil di map) */}
          {alert.show && !(alert.type === "success" && alert.message === "Lokasi GPS berhasil ditemukan!") && (
            <div ref={alertRef} className="px-8 pb-6">
              <div className={`rounded-xl p-4 shadow-lg border-2 flex items-start gap-3 ${isAlertExiting ? 'animate-slide-to-right' : 'animate-slide-from-right'} ${
                alert.type === 'success'
                  ? 'bg-green-600 border-green-700 text-white'
                  : alert.type === 'error'
                  ? 'bg-red-600 border-red-700 text-white'
                  : alert.type === 'warning'
                  ? 'bg-yellow-600 border-yellow-700 text-white'
                  : 'bg-blue-600 border-blue-700 text-white'
              }`}>
                <div className="flex-shrink-0 mt-0.5">
                  {alert.type === 'success' && <CheckCircle size={20} className="text-white" />}
                  {alert.type === 'error' && <AlertCircle size={20} className="text-white" />}
                  {alert.type === 'warning' && <AlertTriangle size={20} className="text-white" />}
                  {alert.type === 'info' && <Info size={20} className="text-white" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold leading-relaxed">{alert.message}</p>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
        {/* Bottom safe area agar konten tidak tertutup nav bar */}
        <div style={{ minHeight: "env(safe-area-inset-bottom, 0px)", flexShrink: 0 }} />
      </div>
    </div>
  );
}
