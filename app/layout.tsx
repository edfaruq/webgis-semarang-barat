import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GeoSafe Semarang Barat | WebGIS Tata Ruang",
  description: "Decision Support System - Mitigasi Bencana Semarang Barat",
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
      <body className="antialiased">{children}</body>
    </html>
  );
}
