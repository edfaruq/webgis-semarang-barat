"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportModal({ isOpen, onClose }: ReportModalProps) {
  const [coords, setCoords] = useState<string>("Mendeteksi lokasi...");

  useEffect(() => {
    if (isOpen && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`);
        },
        () => {
          setCoords("GPS tidak aktif");
        }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-4">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-red-600 p-6 text-white text-center relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:text-red-200 transition"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold">Lapor Kejadian Bencana</h3>
            <p className="text-red-100 text-xs mt-1">Laporan akan diteruskan ke BPBD Kota Semarang.</p>
          </div>
          <form
            id="emergencyForm"
            className="p-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              alert("Laporan berhasil dikirim! Tim BPBD akan segera menindaklanjuti.");
              onClose();
            }}
          >
            <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 text-center">
              <span className="text-[10px] text-indigo-400 font-bold block mb-1 uppercase tracking-wider">
                Lokasi GPS Terdeteksi
              </span>
              <span className="text-xs font-mono text-indigo-600 font-bold italic">{coords}</span>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Jenis Bencana</label>
              <select className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500">
                <option>Banjir</option>
                <option>Longsor</option>
                <option>Kebakaran</option>
                <option>Gempa</option>
                <option>Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Deskripsi</label>
              <textarea
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={3}
                placeholder="Jelaskan kondisi bencana yang terjadi..."
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-red-600 text-white py-4 rounded-xl text-sm font-bold shadow-lg hover:bg-red-700 transition"
            >
              KIRIM LAPORAN DARURAT
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
