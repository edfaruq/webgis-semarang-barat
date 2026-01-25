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

      {/* Foto-foto tim dengan posisi dan animasi getar */}
      {/* Shaqi - Kiri atas, miring */}
      <div 
        className="absolute w-[600px] h-[600px] animate-shake drop-shadow-[0_0_20px_rgba(0,0,0,0.25)]"
        style={{ 
          top: "10%", 
          left: "5%",
          transform: "rotate(-15deg)",
          animationDelay: "0.3s"
        }}
      >
        <Image
          src="/images/shaqi.png"
          alt="Shaqi"
          width={600}
          height={600}
          className="object-contain w-full h-full"
          priority
        />
      </div>

      {/* Faruq - Kanan atas */}
      <div 
        className="absolute w-[800px] h-[800px] animate-shake drop-shadow-[0_0_20px_rgba(0,0,0,0.25)]"
        style={{ 
          top: "-20%", 
          right: "5%",
          transform: "rotate(-15deg)",
          animationDelay: "0.1s"
        }}
      >
        <Image
          src="/images/faruq.png"
          alt="Faruq"
          width={800}
          height={800}
          className="object-contain w-full h-full"
          priority
        />
      </div>

      {/* Paang - Kanan bawah, miring */}
      <div 
        className="absolute w-[600px] h-[600px] animate-shake drop-shadow-[0_0_20px_rgba(0,0,0,0.25)]"
        style={{ 
          bottom: "-20%", 
          right: "5%",
          transform: "rotate(15deg)",
          animationDelay: "0.2s"
        }}
      >
        <Image
          src="/images/paang.png"
          alt="Paang"
          width={600}
          height={600}
          className="object-contain w-full h-full"
          priority
        />
      </div>
    </div>
  );
}
