import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WebGIS Katana Semarang Barat | WebGIS Tata Ruang",
  description: "Decision Support System - Mitigasi Bencana Semarang Barat",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased ios-safe-area-root">{children}</body>
    </html>
  );
}
