"use server";

import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export type SubmitReportState = { success?: boolean; error?: string };

// Map form values to DB disasterType (flood, earthquake, fire, landslide)
const DISASTER_MAP: Record<string, string> = {
  banjir: "flood",
  flood: "flood",
  longsor: "landslide",
  landslide: "landslide",
  earthquake: "earthquake",
  gempa: "earthquake",
  fire: "fire",
  kebakaran: "fire",
};

export async function submitReportAction(
  _prev: SubmitReportState | null,
  formData: FormData
): Promise<SubmitReportState> {
  const name = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const institution = (formData.get("institution") as string)?.trim() || "";
  const rawDisaster = (formData.get("disasterType") as string)?.trim();
  const chronology = (formData.get("chronology") as string)?.trim();
  const latStr = formData.get("lat") as string;
  const lngStr = formData.get("lng") as string;
  const photo = formData.get("photo") as File | null;

  if (!name || !phone || !email || !rawDisaster || !chronology || latStr == null || lngStr === "") {
    return { error: "Semua field wajib diisi dan lokasi harus ditandai di peta." };
  }

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return { error: "Koordinat lokasi tidak valid." };
  }

  const disasterType = DISASTER_MAP[rawDisaster] ?? rawDisaster;

  try {
    let photoUrl: string | null = null;
    if (photo && photo.size > 0) {
      try {
        const bytes = await photo.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const ext = path.extname(photo.name) || ".jpg";
        const baseDir = path.join(process.cwd(), "public", "uploads", "reports");
        await mkdir(baseDir, { recursive: true });
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
        const filePath = path.join(baseDir, filename);
        await writeFile(filePath, buffer);
        photoUrl = `/uploads/reports/${filename}`;
      } catch (fileError) {
        console.error("Error saving photo:", fileError);
        // Continue without photo if file save fails
      }
    }

    try {
      await prisma.report.create({
        data: {
          name,
          phone,
          email,
          institution,
          disasterType,
          chronology,
          photoUrl,
          status: "pending",
          lat,
          lng,
        },
      });
    } catch (dbError: any) {
      console.error("Database error:", dbError);
      // Check if it's a connection error
      if (dbError.code === "P1001" || dbError.message?.includes("connect")) {
        return { 
          error: "Tidak dapat terhubung ke database. Pastikan DATABASE_URL sudah dikonfigurasi dengan benar di file .env" 
        };
      }
      // Check if it's a schema/table error
      if (dbError.code === "P2001" || dbError.message?.includes("does not exist")) {
        return { 
          error: "Tabel database belum dibuat. Jalankan: npx prisma migrate dev atau npx prisma db push" 
        };
      }
      return { 
        error: `Terjadi kesalahan saat menyimpan laporan: ${dbError.message || "Unknown error"}` 
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Unexpected error in submitReportAction:", error);
    return { 
      error: `Terjadi kesalahan tidak terduga: ${error.message || "Unknown error"}` 
    };
  }
}
