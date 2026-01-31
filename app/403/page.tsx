import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-300">403</h1>
        <p className="mt-2 text-lg text-slate-600">Akses ditolak.</p>
        <p className="mt-1 text-sm text-slate-500">
          Anda tidak memiliki izin untuk mengakses halaman ini.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
