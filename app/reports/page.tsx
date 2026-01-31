import { prisma } from "@/lib/prisma";
import ReportsMap from "./ReportsMap";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const reports = await prisma.report.findMany({
    where: { status: "approved" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-800">Peta Laporan Bencana (Disetujui)</h1>
        <a
          href="/"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Kembali ke WebGIS
        </a>
      </header>
      <main className="flex-1 relative">
        <ReportsMap reports={reports} />
      </main>
    </div>
  );
}
