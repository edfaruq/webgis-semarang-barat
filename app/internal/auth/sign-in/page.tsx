import { signInAction } from "./actions";
import SignInForm from "./SignInForm";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-800 px-8 py-6 text-center">
            <h1 className="text-xl font-bold text-white">Admin Login</h1>
            <p className="text-slate-300 text-sm mt-1">WebGIS Semarang Barat</p>
          </div>
          <SignInForm signInAction={signInAction} />
        </div>
        <p className="text-center text-slate-500 text-xs mt-4">
          Jangan bagikan kredensial ini. Route internal tidak ditampilkan di navigasi publik.
        </p>
      </div>
    </div>
  );
}
