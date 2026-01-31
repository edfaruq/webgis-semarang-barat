import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** GET: Daftar laporan yang status = approved (untuk ditampilkan di peta publik) */
export async function GET() {
  try {
    const reports = await prisma.report.findMany({
      where: { status: "approved" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        disasterType: true,
        chronology: true,
        createdAt: true,
        lat: true,
        lng: true,
        photoUrl: true,
      },
    });
    return NextResponse.json(reports);
  } catch (e) {
    console.error("API reports/approved:", e);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
