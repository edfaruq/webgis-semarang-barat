"use client";

import { useState } from "react";
import { X, FileText, Map } from "lucide-react";

interface SearchDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PetaItem {
  id: string;
  title: string;
  subtitle: string;
  type: "peta";
  image: string;
}

interface DokumenItem {
  id: string;
  title: string;
  subtitle: string;
  type: "dokumen";
}

const PETA_DATA: PetaItem[] = [
  { id: "1", title: "Peta Kerawanan Banjir", subtitle: "Kecamatan Semarang Barat", type: "peta", image: "/images/peta/kerawanan-banjir.png" },
  { id: "2", title: "Peta Kerawanan Longsor", subtitle: "Kecamatan Semarang Barat", type: "peta", image: "/images/peta/kerawanan-longsor.png" },
  { id: "3", title: "Peta Kerentanan Banjir", subtitle: "Kecamatan Semarang Barat", type: "peta", image: "/images/peta/kerentanan-banjir.png" },
  { id: "4", title: "Peta Kerentanan Longsor", subtitle: "Kecamatan Semarang Barat", type: "peta", image: "/images/peta/kerentanan-longsor.png" },
  { id: "5", title: "Peta Kapasitas Banjir", subtitle: "Kecamatan Semarang Barat", type: "peta", image: "/images/peta/kapasitas-banjir.png" },
  { id: "6", title: "Peta Kapasitas Longsor", subtitle: "Kecamatan Semarang Barat", type: "peta", image: "/images/peta/kapasitas-longsor.png" },
  { id: "7", title: "Peta Risiko Banjir", subtitle: "Kecamatan Semarang Barat", type: "peta", image: "/images/peta/risiko-banjir.png" },
  { id: "8", title: "Peta Risiko Longsor", subtitle: "Kecamatan Semarang Barat", type: "peta", image: "/images/peta/risiko-longsor.png" },
];

const DOKUMEN_DATA: DokumenItem[] = [
  { id: "d1", title: "Dokumen Rencana Banjir", subtitle: "Kecamatan Semarang Barat", type: "dokumen" },
  { id: "d2", title: "Dokumen Rencana Banjir", subtitle: "Kecamatan Semarang Barat", type: "dokumen" },
  { id: "d3", title: "Dokumen Rencana Banjir", subtitle: "Kecamatan Semarang Barat", type: "dokumen" },
  { id: "d4", title: "Dokumen Rencana Longsor", subtitle: "Kecamatan Semarang Barat", type: "dokumen" },
  { id: "d5", title: "Dokumen Rencana Longsor", subtitle: "Kecamatan Semarang Barat", type: "dokumen" },
  { id: "d6", title: "Dokumen Rencana Longsor", subtitle: "Kecamatan Semarang Barat", type: "dokumen" },
];

export default function SearchDataModal({
  isOpen,
  onClose,
}: SearchDataModalProps) {
  const [activeTab, setActiveTab] = useState<"peta" | "dokumen">("peta");

  if (!isOpen) return null;

  const handleDownload = (item: PetaItem | DokumenItem) => {
    console.log("Download:", item);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal - Ukuran Statis */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl w-[900px] h-[600px] shadow-xl relative flex flex-col">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>

          {/* Header with Tabs */}
          <div className="p-6 pb-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("peta")}
                className={`px-8 py-2.5 rounded-full font-semibold text-sm transition-all ${
                  activeTab === "peta"
                    ? "bg-[#6868E9] text-white"
                    : "bg-transparent text-[#6868E9]"
                }`}
              >
                PETA
              </button>

              <button
                onClick={() => setActiveTab("dokumen")}
                className={`px-8 py-2.5 rounded-full font-semibold text-sm transition-all ${
                  activeTab === "dokumen"
                    ? "bg-[#6868E9] text-white"
                    : "bg-transparent text-[#6868E9]"
                }`}
              >
                DOKUMEN
              </button>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="px-6 pb-6 overflow-y-auto flex-1">
            <div className="grid grid-cols-3 gap-5">
              {activeTab === "peta"
                ? PETA_DATA.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                      {/* Title */}
                      <div className="text-center mb-3">
                        <h3 className="text-[#6868E9] font-semibold text-sm">
                          {item.title}
                        </h3>
                        <p className="text-[#6868E9] font-semibold text-sm">
                          {item.subtitle}
                        </p>
                      </div>

                      {/* Icon Container */}
                      <div className="bg-[#E8E8FC] rounded-2xl p-8 flex items-center justify-center mb-4 aspect-[3/4]">
                        <Map
                          className="w-20 h-20 text-[#6868E9]"
                          strokeWidth={1}
                        />
                      </div>

                      {/* Download Button */}
                      <button
                        onClick={() => handleDownload(item)}
                        className="w-full bg-[#6868E9] hover:bg-[#5a5ad9] text-white font-semibold py-2.5 px-4 rounded-full transition-colors text-sm"
                      >
                        UNDUH DATA
                      </button>
                    </div>
                  ))
                : DOKUMEN_DATA.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                      {/* Title */}
                      <div className="text-center mb-3">
                        <h3 className="text-[#6868E9] font-semibold text-sm">
                          {item.title}
                        </h3>
                        <p className="text-[#6868E9] font-semibold text-sm">
                          {item.subtitle}
                        </p>
                      </div>

                      {/* Icon Container */}
                      <div className="bg-[#E8E8FC] rounded-2xl p-8 flex items-center justify-center mb-4 aspect-[3/4]">
                        <FileText
                          className="w-20 h-20 text-[#6868E9]"
                          strokeWidth={1}
                        />
                      </div>

                      {/* Download Button */}
                      <button
                        onClick={() => handleDownload(item)}
                        className="w-full bg-[#6868E9] hover:bg-[#5a5ad9] text-white font-semibold py-2.5 px-4 rounded-full transition-colors text-sm"
                      >
                        UNDUH DATA
                      </button>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}