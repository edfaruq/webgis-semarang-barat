"use client";

import { useState } from "react";
import {
  MapPin,
  Building2,
  ChevronDown,
  AlertTriangle,
  Menu,
} from "lucide-react";
import Image from "next/image";

interface HeaderProps {
  selectedKelurahan: string | null;
  onKelurahanChange: (kelurahan: string | null) => void;
  onReportClick: () => void;
  onMenuClick?: () => void;
}

const KELURAHAN_LIST = [
  { slug: "krobokan", name: "Krobokan" },
  { slug: "ngemplak-simongan", name: "Ngemplak Simongan" },
  { slug: "kalibanteng-kidul", name: "Kalibanteng Kidul" },
  { slug: "gisik-drono", name: "Gisikdrono" },
  { slug: "bongsari", name: "Bongsari" },
  { slug: "karangayu", name: "Karangayu" },
  { slug: "kalibanteng-kulon", name: "Kalibanteng Kulon" },
  { slug: "manyaran", name: "Manyaran" },
  { slug: "tawangmas", name: "Tawangmas" },
  { slug: "kembangarum", name: "Kembangarum" },
  { slug: "bojongsalaman", name: "Bojongsalaman" },
  { slug: "cabean", name: "Cabean" },
  { slug: "krapyak", name: "Krapyak" },
  { slug: "salamanmloyo", name: "Salamanmloyo" },
  { slug: "tawangsari", name: "Tawangsari" },
  { slug: "tambakharjo", name: "Tambakharjo" },
];

export default function Header({
  selectedKelurahan,
  onKelurahanChange,
  onReportClick,
  onMenuClick,
}: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const currentKelurahanName = selectedKelurahan
    ? KELURAHAN_LIST.find((k) => k.slug === selectedKelurahan)?.name ||
      "Seluruh Wilayah"
    : "Seluruh Wilayah";

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 min-h-[calc(4rem+env(safe-area-inset-top,0px))] pt-[env(safe-area-inset-top,0px)] flex items-center px-4 lg:px-6 justify-between relative z-50">
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Hamburger menu untuk mobile */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-0 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <Menu size={24} className="text-slate-700" />
        </button>

        <div
          className="flex items-center gap-2 lg:gap-3 cursor-pointer"
          onClick={() => onKelurahanChange(null)}
        >
          <div className="relative w-8 h-8 md:w-10 md:h-10 drop-shadow-[0_0_20px_rgba(0,0,0,0.2)]">
            <Image
              src="/images/katana-logo.png"
              alt="KATANA Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-slate-800 leading-none text-sm lg:text-base">
              WebGIS Katana Semarang Barat
            </h1>
            <p className="text-[9px] lg:text-[10px] text-slate-500 uppercase tracking-widest mt-0.5 lg:mt-1 hidden md:block">
              Decision Support System - Mitigasi Bencana
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        {/* Mobile: Kelurahan selector */}
        <div className="lg:hidden relative">
          <button
            className="flex items-center gap-1 bg-slate-100 px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <Building2 size={14} />
            <span className="max-w-[80px] truncate">
              {currentKelurahanName}
            </span>
            <ChevronDown size={12} />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[100] p-2 grid grid-cols-1 gap-1 max-h-[60vh] overflow-y-auto seamless-scrollbar">
              <button
                onClick={() => {
                  onKelurahanChange(null);
                  setIsDropdownOpen(false);
                }}
                className="text-left px-3 py-2 rounded-lg text-xs hover:bg-indigo-50 hover:text-indigo-600 transition font-bold"
              >
                Seluruh Wilayah
              </button>
              <div className="h-[1px] bg-slate-100 my-1 mx-2"></div>
              {KELURAHAN_LIST.map((kel) => (
                <button
                  key={kel.slug}
                  onClick={() => {
                    onKelurahanChange(kel.slug);
                    setIsDropdownOpen(false);
                  }}
                  className="text-left px-3 py-2 rounded-lg text-xs hover:bg-indigo-50 hover:text-indigo-600 transition"
                >
                  {kel.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop: Kelurahan selector */}
        <div className="hidden lg:block relative group">
          <button
            className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-200 transition"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <Building2 size={16} />
            <span>{currentKelurahanName}</span>
            <ChevronDown size={14} />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[100] p-2 grid grid-cols-1 gap-1">
              <button
                onClick={() => {
                  onKelurahanChange(null);
                  setIsDropdownOpen(false);
                }}
                className="text-left px-4 py-2 rounded-lg text-sm hover:bg-indigo-50 hover:text-indigo-600 transition font-bold"
              >
                Seluruh Wilayah
              </button>
              <div className="h-[1px] bg-slate-100 my-1 mx-2"></div>
              {KELURAHAN_LIST.map((kel) => (
                <button
                  key={kel.slug}
                  onClick={() => {
                    onKelurahanChange(kel.slug);
                    setIsDropdownOpen(false);
                  }}
                  className="text-left px-4 py-2 rounded-lg text-sm hover:bg-indigo-50 hover:text-indigo-600 transition"
                >
                  {kel.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="hidden lg:block h-6 w-[1px] bg-slate-200 mx-2"></div>
        <button
          onClick={onReportClick}
          className="flex items-center gap-1 lg:gap-2 bg-red-600 text-white px-3 lg:px-5 py-2 lg:py-2.5 rounded-full text-xs lg:text-sm font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition"
        >
          <AlertTriangle size={16} className="lg:w-[18px] lg:h-[18px]" />
          <span className="hidden sm:inline">Lapor Bencana</span>
          <span className="sm:hidden">Lapor</span>
        </button>
      </div>
    </header>
  );
}
