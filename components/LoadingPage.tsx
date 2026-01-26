"use client";

import Image from "next/image";

export default function LoadingPage() {
  return (
    <div className="relative flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 overflow-hidden">
      {/* Logo KATANA dengan animasi getar di tengah */}
      <div className="relative w-32 h-32 z-10 animate-shake drop-shadow-[0_0_30px_rgba(0,0,0,0.3)]">
        <Image
          src="/images/katana-logo.png"
          alt="KATANA Logo"
          width={128}
          height={128}
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}
