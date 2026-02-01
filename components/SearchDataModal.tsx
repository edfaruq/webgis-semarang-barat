"use client";

import { useState, useRef, useEffect } from "react";
import { X, FileText, Map, Scale, TrendingUp, Loader2, BarChart3 } from "lucide-react";

interface SearchDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PetaItem {
  id: string;
  title: string;
  subtitle: string;
  type: "peta";
  image: string; // Thumbnail untuk preview (50KB compressed)
  originalImage: string; // File asli untuk download (ukuran penuh)
}

interface DokumenItem {
  id: string;
  title: string;
  subtitle: string;
  type: "dokumen";
  category: "hukum" | "ekonomi" | "infografis";
  fileUrl?: string; // Path relatif dari public folder, contoh: "/documents/hukum/perda.pdf"
}

// Helper function untuk generate thumbnail (50KB) dan original path
function getPetaPaths(filename: string) {
  const basePath = "/images/peta";
  // Convert PNG/JPEG to JPG for thumbnails (smaller file size)
  const thumbnailFilename = filename.replace(/\.png$/i, '.jpg').replace(/\.jpeg$/i, '.jpg');
  const thumbnailPath = `${basePath}/thumbnails/${thumbnailFilename}`;
  const originalPath = `${basePath}/${filename}`;
  return { image: thumbnailPath, originalImage: originalPath };
}

const PETA_DATA: PetaItem[] = [
  // Peta Analisis Banjir
  { id: "1", title: "Peta Kerawanan Banjir", subtitle: "Kecamatan Semarang Barat", type: "peta", ...getPetaPaths("Peta Kerawanan Banjir Kec. Semarang Barat KKN-T TIM 35 Universitas Diponegoro.png") },
  { id: "2", title: "Peta Kerentanan Banjir", subtitle: "Kecamatan Semarang Barat", type: "peta", ...getPetaPaths("Peta Kerentanan Banjir Kec. Semarang Barat KKN-T TIM 35 Universitas Diponegoro.jpeg") },
  { id: "3", title: "Peta Risiko Banjir", subtitle: "Kecamatan Semarang Barat", type: "peta", ...getPetaPaths("Peta Risiko Banjir Kec. Semarang Barat KKN-T TIM 35 Universitas Diponegoro.png") },
  
  // Peta Analisis Longsor
  { id: "4", title: "Peta Kerawanan Longsor", subtitle: "Kecamatan Semarang Barat", type: "peta", ...getPetaPaths("Peta Kerawanan Longsor Kec. Semarang Barat KKN-T TIM 35 Universitas Diponegoro.png") },
  { id: "5", title: "Peta Kapasitas Longsor", subtitle: "Kecamatan Semarang Barat", type: "peta", ...getPetaPaths("Peta Kapasitas Longsor Kec. Semarang Barat KKN-T TIM 35 Universitas Diponegoro.png") },
  { id: "6", title: "Peta Risiko Longsor", subtitle: "Kecamatan Semarang Barat", type: "peta", ...getPetaPaths("Peta Risiko Longsor Kec. Semarang Barat KKN-T TIM 35 Universitas Diponegoro.png") },
  
  // Peta Faktor Lingkungan
  { id: "7", title: "Peta Curah Hujan", subtitle: "Kecamatan Semarang Barat", type: "peta", ...getPetaPaths("Peta Curah Hujan Kec. Semarang Barat KKN-T TIM 35 Universitas Diponegoro.png") },
  { id: "8", title: "Peta Jarak Sungai", subtitle: "Kecamatan Semarang Barat", type: "peta", ...getPetaPaths("Peta Jarak Sungai Kec. Semarang Barat KKN-T TIM 35 Universitas Diponegoro.png") },
  { id: "9", title: "Peta Jenis Tanah", subtitle: "Kecamatan Semarang Barat", type: "peta", ...getPetaPaths("Peta Jenis Tanah Kec. Semarang Barat KKN-T TIM 35 Universitas Diponegoro.png") },
  { id: "10", title: "Peta Kemiringan Lereng", subtitle: "Kecamatan Semarang Barat", type: "peta", ...getPetaPaths("Peta Kemiringan Lereng Kec. Semarang Barat KKN-T TIM 35 Universitas Diponegoro.png") },
  { id: "11", title: "Peta Tutupan Lahan", subtitle: "Kecamatan Semarang Barat", type: "peta", ...getPetaPaths("Peta Tutupan Lahan Kec. Semarang Barat KKN-T TIM 35 Universitas Diponegoro.png") },
  
  // Peta Lahan Kritis
  { id: "12", title: "Peta Lahan Kritis", subtitle: "Kecamatan Semarang Barat", type: "peta", ...getPetaPaths("Peta Lahan Kritis Kec. Semarang Barat KKN-T TIM 35 Universitas Diponegoro.png") },
  
  // Peta Rute Evakuasi Banjir
  { id: "13", title: "Peta Rute Evakuasi dan Shelter Banjir", subtitle: "Kelurahan Kalibanteng Kidul", type: "peta", ...getPetaPaths("Peta Rute Evakuasi dan Shelter Banjir Kelurahan Kalibanteng Kidul KKN-T TIM 35 Universitas Diponegoro.png") },
  { id: "14", title: "Peta Rute Evakuasi dan Shelter Banjir", subtitle: "Kelurahan Kalibanteng Kulon", type: "peta", ...getPetaPaths("Peta Rute Evakuasi dan Shelter Banjir Kelurahan Kalibanteng Kulon KKN-T TIM 35 Universitas Diponegoro.png") },
  { id: "15", title: "Peta Rute Evakuasi dan Shelter Banjir", subtitle: "Kelurahan Krobokan", type: "peta", ...getPetaPaths("Peta Rute Evakuasi dan Shelter Banjir Kelurahan Krobokan KKN-T TIM 35 Universitas Diponegoro.png") },
  { id: "16", title: "Peta Rute Evakuasi dan Shelter Banjir", subtitle: "Kelurahan Tawangmas", type: "peta", ...getPetaPaths("Peta Rute Evakuasi dan Shelter Banjir Kelurahan Tawangmas KKN-T TIM 35 Universitas Diponegoro.png") },
  
  // Peta Rute Evakuasi Longsor
  { id: "17", title: "Peta Rute Evakuasi dan Shelter Longsor", subtitle: "Kelurahan Kalibanteng Kidul", type: "peta", ...getPetaPaths("Peta Rute Evakuasi dan Shelter Longsor Kelurahan Kalibanteng Kidul KKN-T TIM 35 Universitas Diponegoro.png") },
];

const DOKUMEN_HUKUM: DokumenItem[] = [
  { 
    id: "dh1", 
    title: "Kajian Akademik Kencana", 
    subtitle: "Kecamatan Semarang Barat", 
    type: "dokumen", 
    category: "hukum",
    fileUrl: "/documents/hukum/KAJIAN AKADEMIK KENCANA.pdf"
  },
];

const DOKUMEN_EKONOMI: DokumenItem[] = [
  { 
    id: "de1", 
    title: "Contoh Proposal CSR", 
    subtitle: "Kecamatan Semarang Barat", 
    type: "dokumen", 
    category: "ekonomi",
    fileUrl: "/documents/ekonomi/Contoh Proposal CSR.docx"
  },
  { 
    id: "de2", 
    title: "Template Proposal CSR", 
    subtitle: "Kecamatan Semarang Barat", 
    type: "dokumen", 
    category: "ekonomi",
    fileUrl: "/documents/ekonomi/Template Proposal CSR.docx"
  },
  { 
    id: "de3", 
    title: "Template Pencatatan Dana Bantuan untuk Kelurahan", 
    subtitle: "Kecamatan Semarang Barat", 
    type: "dokumen", 
    category: "ekonomi",
    fileUrl: "/documents/ekonomi/Template Pencatatan Dana Bantuan untuk Kelurahan.xlsx"
  },
];

const DOKUMEN_INFOGRAFIS: DokumenItem[] = [
  // Data infografis akan ditambahkan di sini
];

const DOKUMEN_DATA: DokumenItem[] = [...DOKUMEN_HUKUM, ...DOKUMEN_EKONOMI, ...DOKUMEN_INFOGRAFIS];

// Cache untuk menyimpan gambar yang sudah dimuat (persist across modal opens)
const loadedImagesCache = new Set<string>();

// Component untuk image dengan lazy loading dan cache yang lebih efisien
function ImageCard({ 
  imageSrc, 
  imageAlt, 
  itemId,
  originalImageSrc,
  loadingImages,
  setLoadingImages 
}: { 
  imageSrc: string; 
  imageAlt: string;
  itemId: string;
  originalImageSrc?: string; // Fallback ke original jika thumbnail tidak ada
  loadingImages: Set<string>;
  setLoadingImages: React.Dispatch<React.SetStateAction<Set<string>>>;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(imageSrc);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const isCached = loadedImagesCache.has(itemId);

  useEffect(() => {
    // Langsung load semua gambar tanpa menunggu intersection observer
    // Karena user ingin preview langsung muncul
    setShouldLoad(true);
    
    // Jika sudah cached, langsung set tidak loading
    if (isCached) {
      setIsLoading(false);
    }
  }, [isCached]);

  const handleLoad = () => {
    loadedImagesCache.add(itemId);
    setIsLoading(false);
    setLoadingImages((prev) => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
  };

  const handleError = (e: any) => {
    // Jika thumbnail error dan ada original image, coba load original
    if (originalImageSrc && currentSrc === imageSrc) {
      console.log(`Thumbnail failed (${imageSrc}), loading original for ${itemId}`);
      setCurrentSrc(originalImageSrc);
      setIsLoading(true);
      setImageError(false);
      // Retry dengan original image
      setTimeout(() => {
        if (imgRef.current) {
          imgRef.current.src = originalImageSrc;
        }
      }, 100);
      return;
    }
    
    console.error(`Failed to load image for ${itemId}:`, currentSrc);
    setIsLoading(false);
    setImageError(true);
    setLoadingImages((prev) => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
  };

  return (
    <div 
      ref={containerRef}
      className="bg-[#E8E8FC] rounded-2xl overflow-hidden mb-4 flex-1 min-h-[200px] relative"
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#E8E8FC] z-10">
          <Loader2 className="w-8 h-8 text-[#6868E9] animate-spin" />
        </div>
      )}
      {imageError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-[#E8E8FC]">
          <Map className="w-12 h-12 text-[#6868E9] opacity-50" />
        </div>
      ) : shouldLoad ? (
        <img
          ref={imgRef}
          src={currentSrc}
          alt={imageAlt}
          className="w-full h-full object-cover"
          loading="eager"
          decoding="async"
          onLoad={handleLoad}
          onError={(e) => handleError(e)}
          crossOrigin="anonymous"
        />
      ) : null}
    </div>
  );
}

export default function SearchDataModal({
  isOpen,
  onClose,
}: SearchDataModalProps) {
  const [activeTab, setActiveTab] = useState<"peta" | "dokumen">("peta");
  const [selectedDocCategory, setSelectedDocCategory] = useState<"hukum" | "ekonomi" | "infografis" | "all">("all");
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const handleDownload = (item: PetaItem | DokumenItem) => {
    if (item.type === "dokumen" && item.fileUrl) {
      // Download dokumen: buat link dengan atribut download agar langsung unduh
      const filename = item.fileUrl.split("/").pop() || "dokumen";
      const a = document.createElement("a");
      a.href = item.fileUrl;
      a.download = decodeURIComponent(filename);
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (item.type === "peta") {
      // Unduh peta langsung (ukuran penuh), tidak dibuka di tab baru
      const filename = item.originalImage.split("/").pop() || "peta";
      const a = document.createElement("a");
      a.href = item.originalImage;
      a.download = decodeURIComponent(filename);
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      console.log("Download:", item);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal - Responsive */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:w-[900px] h-[90vh] sm:h-[600px] shadow-xl relative flex flex-col">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>

          {/* Mobile Drag Handle */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden flex-shrink-0">
            <div className="w-10 h-1 bg-slate-300 rounded-full" />
          </div>

          {/* Header with Tabs */}
          <div className="p-4 sm:p-6 pb-3 sm:pb-4 flex-shrink-0">
            <div className="flex justify-center">
              <div className="inline-flex items-center bg-[#F0F0FC] p-1.5 rounded-full">
                <button
                  onClick={() => {
                    setActiveTab("peta");
                    setSelectedDocCategory("all");
                  }}
                  className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-semibold text-xs sm:text-sm transition-all ${
                    activeTab === "peta"
                      ? "bg-[#6868E9] text-white shadow-md"
                      : "bg-transparent text-[#6868E9] hover:bg-white/50"
                  }`}
                >
                  <Map className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  PETA
                </button>

                <button
                  onClick={() => {
                    setActiveTab("dokumen");
                    setSelectedDocCategory("all");
                  }}
                  className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-semibold text-xs sm:text-sm transition-all ${
                    activeTab === "dokumen"
                      ? "bg-[#6868E9] text-white shadow-md"
                      : "bg-transparent text-[#6868E9] hover:bg-white/50"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  DOKUMEN
                </button>
              </div>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="px-4 sm:px-6 pb-4 sm:pb-6 overflow-y-auto flex-1">
            {/* Segmentasi untuk Dokumen */}
            {activeTab === "dokumen" && (
              <div className="mb-4 sm:mb-6">
                {/* Mobile: horizontal scroll | Desktop: flex wrap */}
                <div className="flex gap-2 sm:gap-3 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 scrollbar-hide">
                  <button
                    onClick={() => setSelectedDocCategory("all")}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all border-2 whitespace-nowrap flex-shrink-0 ${
                      selectedDocCategory === "all"
                        ? "bg-[#6868E9] text-white border-[#6868E9] shadow-md"
                        : "bg-white text-slate-600 border-slate-200 hover:border-[#6868E9] hover:text-[#6868E9]"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Semua
                    <span className={`ml-0.5 sm:ml-1 px-1.5 sm:px-2 py-0.5 rounded-full text-xs ${
                      selectedDocCategory === "all"
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}>
                      {DOKUMEN_DATA.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setSelectedDocCategory("hukum")}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all border-2 whitespace-nowrap flex-shrink-0 ${
                      selectedDocCategory === "hukum"
                        ? "bg-[#6868E9] text-white border-[#6868E9] shadow-md"
                        : "bg-white text-slate-600 border-slate-200 hover:border-[#6868E9] hover:text-[#6868E9]"
                    }`}
                  >
                    <Scale className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Dokumen Hukum
                    <span className={`ml-0.5 sm:ml-1 px-1.5 sm:px-2 py-0.5 rounded-full text-xs ${
                      selectedDocCategory === "hukum"
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}>
                      {DOKUMEN_HUKUM.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setSelectedDocCategory("ekonomi")}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all border-2 whitespace-nowrap flex-shrink-0 ${
                      selectedDocCategory === "ekonomi"
                        ? "bg-[#6868E9] text-white border-[#6868E9] shadow-md"
                        : "bg-white text-slate-600 border-slate-200 hover:border-[#6868E9] hover:text-[#6868E9]"
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Dokumen Ekonomi
                    <span className={`ml-0.5 sm:ml-1 px-1.5 sm:px-2 py-0.5 rounded-full text-xs ${
                      selectedDocCategory === "ekonomi"
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}>
                      {DOKUMEN_EKONOMI.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setSelectedDocCategory("infografis")}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all border-2 whitespace-nowrap flex-shrink-0 ${
                      selectedDocCategory === "infografis"
                        ? "bg-[#6868E9] text-white border-[#6868E9] shadow-md"
                        : "bg-white text-slate-600 border-slate-200 hover:border-[#6868E9] hover:text-[#6868E9]"
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Infografis
                    <span className={`ml-0.5 sm:ml-1 px-1.5 sm:px-2 py-0.5 rounded-full text-xs ${
                      selectedDocCategory === "infografis"
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}>
                      {DOKUMEN_INFOGRAFIS.length}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Grid: 1 col mobile, 2 col tablet, 3 col desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
              {activeTab === "peta"
                ? PETA_DATA.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
                    >
                      {/* Title */}
                      <div className="text-center mb-2 sm:mb-3 flex-shrink-0">
                        <h3 className="text-[#6868E9] font-semibold text-xs sm:text-sm">
                          {item.title}
                        </h3>
                        <p className="text-[#6868E9] font-semibold text-xs sm:text-sm">
                          {item.subtitle}
                        </p>
                      </div>

                      {/* Image Preview Container */}
                      <ImageCard
                        imageSrc={item.image}
                        imageAlt={item.title}
                        itemId={item.id}
                        originalImageSrc={item.originalImage}
                        loadingImages={loadingImages}
                        setLoadingImages={setLoadingImages}
                      />

                      {/* Download Button */}
                      <button
                        onClick={() => handleDownload(item)}
                        className="w-full bg-[#6868E9] hover:bg-[#5a5ad9] text-white font-semibold py-2 sm:py-2.5 px-4 rounded-full transition-colors text-xs sm:text-sm flex-shrink-0"
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
                      className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
                    >
                      {/* Title */}
                      <div className="text-center mb-2 sm:mb-3 flex-shrink-0">
                        <h3 className="text-[#6868E9] font-semibold text-xs sm:text-sm">
                          {item.title}
                        </h3>
                        <p className="text-[#6868E9] font-semibold text-xs sm:text-sm">
                          {item.subtitle}
                        </p>
                      </div>

                      {/* Icon Container */}
                      <div className="bg-[#E8E8FC] rounded-2xl p-6 sm:p-8 flex items-center justify-center mb-3 sm:mb-4 flex-1 min-h-[140px] sm:min-h-[200px]">
                        <FileText
                          className="w-14 h-14 sm:w-20 sm:h-20 text-[#6868E9]"
                          strokeWidth={1}
                        />
                      </div>

                      {/* Download Button */}
                      <button
                        onClick={() => handleDownload(item)}
                        className="w-full bg-[#6868E9] hover:bg-[#5a5ad9] text-white font-semibold py-2 sm:py-2.5 px-4 rounded-full transition-colors text-xs sm:text-sm flex-shrink-0"
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