"use client";

import { useState, useCallback, useRef } from "react";
import { X } from "lucide-react";
import { PumpProperties } from "@/types/geojson";

const MODAL_CLOSE_DURATION_MS = 200;

interface PumpDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  pumpData: any | null;
}

export default function PumpDetailModal({
  isOpen,
  onClose,
  pumpData,
}: PumpDetailModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const lastPumpDataRef = useRef<typeof pumpData>(null);

  if (pumpData) lastPumpDataRef.current = pumpData;

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

  if ((!isOpen || !pumpData) && !isClosing) return null;

  const dataToShow = pumpData ?? lastPumpDataRef.current;
  const props = (dataToShow?.properties ?? {}) as PumpProperties;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-[10000] modal-backdrop ${isClosing ? "modal-closing" : ""}`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
        <div className={`bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto seamless-scrollbar modal-content-scale-only ${isClosing ? "modal-closing" : ""}`}>
          {/* Header - z-10 agar tidak tertutup konten saat scroll */}
          <div className="sticky top-0 z-10 bg-white border-b border-slate-200 p-6 flex items-center justify-between shrink-0">
            <h2 className="text-2xl font-bold text-slate-800">
              {props.nama || "Titik Pompa"}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Tutup"
            >
              <X size={24} className="text-slate-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Foto */}
            <div>
              <h3 className="text-sm font-semibold text-slate-600 mb-3 uppercase tracking-wide">
                Foto Kondisi
              </h3>
              <div className="relative w-full h-64 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                {props.foto ? (
                  <img
                    src={props.foto}
                    alt={`Foto kondisi pompa ${props.nama || ""}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback jika gambar tidak ditemukan
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="flex items-center justify-center h-full text-slate-400">
                            <div class="text-center">
                              <div class="text-4xl mb-2">📷</div>
                              <p class="text-sm">Foto belum tersedia</p>
                            </div>
                          </div>
                        `;
                      }
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📷</div>
                      <p className="text-sm">Foto belum tersedia</p>
                      <p className="text-xs mt-1 text-slate-400">
                        Tambahkan foto di folder public/data/utilities/pompa-air/images/
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Deskripsi */}
            <div>
              <h3 className="text-sm font-semibold text-slate-600 mb-4 uppercase tracking-wide">
                Informasi Pompa
              </h3>
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">
                    Kapasitas
                  </p>
                  <p className="text-base font-medium text-slate-800">
                    {props.kapasitas || "-"}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">
                    Kondisi
                  </p>
                  <p className="text-base font-medium text-slate-800">
                    {props.kondisi || "-"}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">
                    Pengelola
                  </p>
                  <p className="text-base font-medium text-slate-800">
                    {props.pengelola || "-"}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">
                    Operator
                  </p>
                  <p className="text-base font-medium text-slate-800">
                    {props.operator || "-"}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">
                    No Telp
                  </p>
                  <p className="text-base font-medium text-slate-800">
                    {props.no_telp ? (
                      <a
                        href={`tel:${props.no_telp}`}
                        className="text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        {props.no_telp}
                      </a>
                    ) : (
                      "-"
                    )}
                  </p>
                </div>

                {props.alamat && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">
                      Alamat
                    </p>
                    <p className="text-base font-medium text-slate-800">
                      {props.alamat}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
