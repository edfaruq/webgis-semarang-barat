import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DisasterPieChart from "@/components/DisasterPieChart";
import AdminReportTable from "@/components/AdminReportTable";
import { LogOut, LayoutDashboard, FileText } from "lucide-react";
import { logoutAction } from "../actions";

export default async function ConsolePage() {
  const session = await requireAdmin();
  if (!session) redirect("/403");

  const [reports, stats, pendingCount, totalCount] = await Promise.all([
    prisma.report.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.report.groupBy({
      by: ["disasterType"],
      _count: true,
      where: {
        status: "approved",
      },
    }),
    prisma.report.count({ where: { status: "pending" } }),
    prisma.report.count(),
  ]);

  return (
    <div className="h-screen min-h-0 bg-slate-100 flex flex-col overflow-y-auto">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-[inset_0_1px_0_0_#f1f5f9] shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="text-slate-600" size={22} />
            <span className="font-semibold text-slate-800">Admin Console</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/internal/reports"
              className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              <FileText size={16} />
              Peta Laporan
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-red-600"
              >
                <LogOut size={16} />
                Keluar
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-slate-500 text-sm font-medium">Total Laporan</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-slate-500 text-sm font-medium">Menunggu</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</p>
          </div>
        </div>

        {/* Pie chart */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Laporan per Tipe Bencana</h2>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <DisasterPieChart data={stats} />
          </div>
        </section>

        {/* Reports table */}
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Daftar Laporan</h2>
          <AdminReportTable reports={reports} />
        </section>
      </main>

      {/* Footer full lebar, seamless di bawah konten saat scroll */}
      <footer className="w-full bg-white border-t border-slate-200 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center pt-2 pb-4 min-h-[56px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo-footer-sidebar.png"
              alt="Universitas Diponegoro - KATANA"
              width={240}
              height={64}
              className="object-contain w-full max-w-[240px] h-auto block"
            />
          </div>
          <div className="text-center space-y-2 pb-2">
            <p className="text-slate-400 text-sm">
              ©2026 - KKN-T TIM 35 WebGIS Developer
            </p>
            <p className="text-slate-300 text-xs">
              Universitas Diponegoro
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
