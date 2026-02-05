import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;
    
    // Security: prevent directory traversal
    if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    // Use Railway Volume if available
    const volumePath = process.env.RAILWAY_VOLUME_MOUNT_PATH || "/data";
    const useVolume = process.env.RAILWAY_ENVIRONMENT === "production" && process.env.RAILWAY_VOLUME_MOUNT_PATH;
    
    const filePath = useVolume
      ? path.join(volumePath, "uploads", "reports", filename)
      : path.join(process.cwd(), "public", "uploads", "reports", filename);

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileBuffer = await readFile(filePath);
    const ext = path.extname(filename).toLowerCase();
    
    // Determine content type
    const contentTypeMap: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
    };
    
    const contentType = contentTypeMap[ext] || "image/jpeg";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    console.error("Error serving upload:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
