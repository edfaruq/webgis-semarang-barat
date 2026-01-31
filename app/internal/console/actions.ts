"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type UpdateStatusResult = { success: boolean; error?: string };

export async function approveReport(reportId: number): Promise<UpdateStatusResult> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "Unauthorized" };

  await prisma.report.update({
    where: { id: reportId },
    data: { status: "approved" },
  });
  revalidatePath("/internal/console");
  revalidatePath("/reports");
  return { success: true };
}

export async function rejectReport(reportId: number): Promise<UpdateStatusResult> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "Unauthorized" };

  await prisma.report.update({
    where: { id: reportId },
    data: { status: "rejected" },
  });
  revalidatePath("/internal/console");
  revalidatePath("/reports");
  return { success: true };
}
