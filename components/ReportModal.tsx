"use client";

import { useEffect, useState, useRef } from "react";
import { X, MapPin, Crosshair, Shield } from "lucide-react";
import dynamic from "next/dynamic";
import type { Map as LeafletMap } from "leaflet";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Dynamic import untuk map component
const MapWithLocationPicker = dynamic(
  () => import("./MapLocationPicker"),
  { ssr: false }
);

export default function ReportModal({ isOpen, onClose }: ReportModalProps) {
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [shouldZoomToGPS, setShouldZoomToGPS] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Default center (Semarang Barat)
  const defaultCenter: [number, number] = [-6.9932, 110.4036];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    } else {
      setFileName("");
    }
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
          // Reset zoom trigger after a delay
          setTimeout(() => setShouldZoomToGPS(false), 2000);
        },
        (error) => {
          alert("Tidak dapat mengakses lokasi GPS. Mohon izinkan akses lokasi atau tandai manual di peta.");
          setIsLoadingLocation(false);
        }
      );
    } else {
      alert("GPS tidak tersedia di perangkat ini.");
    }
  };

  const coordsDisplay = markerPosition
    ? `${markerPosition[0].toFixed(6)}, ${markerPosition[1].toFixed(6)}`
    : "Belum ditandai - Klik peta atau gunakan GPS";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl p-4 max-h-[95vh] overflow-y-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-red-600 p-6 text-white text-center relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:text-red-200 transition"
            >
              <X size={20} />
            </button>
            <h3 className="text-2xl font-bold">Lapor Kejadian Bencana</h3>
            <p className="text-red-100 text-sm mt-1">
              Laporan akan diteruskan ke BPBD Kota Semarang.
            </p>
          </div>
          <form
            id="emergencyForm"
            className="p-8 space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (!markerPosition) {
                alert("Mohon tandai lokasi kejadian di peta terlebih dahulu!");
                return;
              }
              if (!isVerified) {
                alert("Mohon verifikasi bahwa Anda bukan robot!");
                return;
              }
              alert(
                "Laporan berhasil dikirim! Tim BPBD akan segera menindaklanjuti.",
              );
              onClose();
            }}
          >
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
                  {isLoadingLocation ? "Mencari..." : "Use Your Location"}
                </button>
              </div>
              <div className="relative rounded-xl overflow-hidden border-2 border-slate-300 shadow-sm" style={{ height: "300px" }}>
                <MapWithLocationPicker
                  position={markerPosition}
                  setPosition={setMarkerPosition}
                  defaultCenter={defaultCenter}
                  shouldZoomToPosition={shouldZoomToGPS}
                />
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
                💡 Klik pada peta untuk menandai lokasi kejadian, atau gunakan tombol "Use Your Location"
              </p>
            </div>
            
            {/* Grid 2 kolom untuk desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nama Anda
                </label>
                <input
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
                  type="text"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Masukkan Instansi Anda"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Kronologi
              </label>
              <textarea
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={4}
                placeholder="Tuliskan Kronologi Yang Akan Anda Sampaikan"
                required
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Kirimkan Bukti Berupa Foto
              </label>
              <div className="relative">
                <input
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
        </div>
      </div>
    </div>
  );
}
