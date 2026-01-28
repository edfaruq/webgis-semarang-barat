"use client";

import { useState } from "react";
import { X, FileText, Map, Scale, TrendingUp } from "lucide-react";

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
  category: "hukum" | "ekonomi";
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

const DOKUMEN_HUKUM: DokumenItem[] = [
  { id: "dh1", title: "Peraturan Daerah tentang Penanggulangan Bencana", subtitle: "Kecamatan Semarang Barat", type: "dokumen", category: "hukum" },
  { id: "dh2", title: "Peraturan Kepala Daerah tentang Evakuasi", subtitle: "Kecamatan Semarang Barat", type: "dokumen", category: "hukum" },
  { id: "dh3", title: "SK Penetapan Zona Rawan Bencana", subtitle: "Kecamatan Semarang Barat", type: "dokumen", category: "hukum" },
  { id: "dh4", title: "Peraturan tentang Standar Operasional Prosedur", subtitle: "Kecamatan Semarang Barat", type: "dokumen", category: "hukum" },
  { id: "dh5", title: "Peraturan tentang Koordinasi Penanggulangan Bencana", subtitle: "Kecamatan Semarang Barat", type: "dokumen", category: "hukum" },
];

const DOKUMEN_EKONOMI: DokumenItem[] = [
  { id: "de1", title: "Dokumen Rencana Banjir", subtitle: "Kecamatan Semarang Barat", type: "dokumen", category: "ekonomi" },
  { id: "de2", title: "Dokumen Rencana Banjir", subtitle: "Kecamatan Semarang Barat", type: "dokumen", category: "ekonomi" },
  { id: "de3", title: "Dokumen Rencana Banjir", subtitle: "Kecamatan Semarang Barat", type: "dokumen", category: "ekonomi" },
  { id: "de4", title: "Dokumen Rencana Longsor", subtitle: "Kecamatan Semarang Barat", type: "dokumen", category: "ekonomi" },
  { id: "de5", title: "Dokumen Rencana Longsor", subtitle: "Kecamatan Semarang Barat", type: "dokumen", category: "ekonomi" },
  { id: "de6", title: "Dokumen Rencana Longsor", subtitle: "Kecamatan Semarang Barat", type: "dokumen", category: "ekonomi" },
];

const DOKUMEN_DATA: DokumenItem[] = [...DOKUMEN_HUKUM, ...DOKUMEN_EKONOMI];

export default function SearchDataModal({
  isOpen,
  onClose,
}: SearchDataModalProps) {
  const [activeTab, setActiveTab] = useState<"peta" | "dokumen">("peta");
  const [selectedDocCategory, setSelectedDocCategory] = useState<"hukum" | "ekonomi" | "all">("all");

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
            <div className="inline-flex items-center bg-[#F0F0FC] p-1.5 rounded-full">
              <button
                onClick={() => {
                  setActiveTab("peta");
                  setSelectedDocCategory("all");
                }}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${
                  activeTab === "peta"
                    ? "bg-[#6868E9] text-white shadow-md"
                    : "bg-transparent text-[#6868E9] hover:bg-white/50"
                }`}
              >
                <Map className="w-4 h-4" />
                PETA
              </button>

              <button
                onClick={() => {
                  setActiveTab("dokumen");
                  setSelectedDocCategory("all");
                }}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${
                  activeTab === "dokumen"
                    ? "bg-[#6868E9] text-white shadow-md"
                    : "bg-transparent text-[#6868E9] hover:bg-white/50"
                }`}
              >
                <FileText className="w-4 h-4" />
                DOKUMEN
              </button>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="px-6 pb-6 overflow-y-auto flex-1">
            {/* Segmentasi untuk Dokumen */}
            {activeTab === "dokumen" && (
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedDocCategory("all")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all border-2 ${
                      selectedDocCategory === "all"
                        ? "bg-[#6868E9] text-white border-[#6868E9] shadow-md"
                        : "bg-white text-slate-600 border-slate-200 hover:border-[#6868E9] hover:text-[#6868E9]"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Semua
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                      selectedDocCategory === "all"
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}>
                      {DOKUMEN_DATA.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setSelectedDocCategory("hukum")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all border-2 ${
                      selectedDocCategory === "hukum"
                        ? "bg-[#6868E9] text-white border-[#6868E9] shadow-md"
                        : "bg-white text-slate-600 border-slate-200 hover:border-[#6868E9] hover:text-[#6868E9]"
                    }`}
                  >
                    <Scale className="w-4 h-4" />
                    Dokumen Hukum
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                      selectedDocCategory === "hukum"
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}>
                      {DOKUMEN_HUKUM.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setSelectedDocCategory("ekonomi")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all border-2 ${
                      selectedDocCategory === "ekonomi"
                        ? "bg-[#6868E9] text-white border-[#6868E9] shadow-md"
                        : "bg-white text-slate-600 border-slate-200 hover:border-[#6868E9] hover:text-[#6868E9]"
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    Dokumen Ekonomi
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                      selectedDocCategory === "ekonomi"
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}>
                      {DOKUMEN_EKONOMI.length}
                    </span>
                  </button>
                </div>
              </div>
            )}

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
                : DOKUMEN_DATA.filter((item) => 
                    selectedDocCategory === "all" || item.category === selectedDocCategory
                  ).map((item) => (
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