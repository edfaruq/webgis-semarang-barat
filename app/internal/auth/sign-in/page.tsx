"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { signInAction } from "./actions";
import LoadingPage from "@/components/LoadingPage";

const REDIRECT_DELAY_MS = 1000; // sama dengan peta publik (1 detik)

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [hasValue, setHasValue] = useState({
    email: false,
    password: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await signInAction(null, formData);
      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      } else if (result?.success) {
        setIsRedirecting(true);
      } else {
        setIsLoading(false);
      }
    } catch {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isRedirecting) return;
    const t = setTimeout(() => {
      router.push("/internal/console");
    }, REDIRECT_DELAY_MS);
    return () => clearTimeout(t);
  }, [isRedirecting, router]);

  if (isRedirecting) {
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#0f172a] via-[#1a1a2e] to-[#1e293b]">
      {/* Left Side - Image with Overlay */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <Image
          src="/images/semarang-barat-photo.png"
          alt="Kantor Kecamatan Semarang Barat"
          fill
          className="object-cover"
          priority
        />
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a5f]/80 via-[#0ea5e9]/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] via-transparent to-transparent" />
        
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#0ea5e9]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-[#1e3a5f]/20 rounded-full blur-3xl animate-pulse delay-700" />
        
        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-12 text-white">
          <h2 className="text-4xl font-bold mb-4 drop-shadow-lg">
            Sistem Informasi Geografis
          </h2>
          <p className="text-lg text-slate-200 max-w-md drop-shadow-md">
            Platform WebGIS Kecamatan Semarang Barat
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-start justify-center pt-6 sm:pt-10 pb-6 px-6 sm:px-8 bg-white relative overflow-hidden overflow-y-auto">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#0ea5e9]/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#1e3a5f]/5 to-transparent rounded-full blur-3xl" />
        
        <div className="w-full max-w-md relative z-10">

          {/* Logo Banner Section */}
          <div className="flex justify-center mt-[-50px] mb-[-50px]">
            <div className="relative w-full max-w-[220px] sm:max-w-[260px]">
              <div className="absolute inset-0 bg-gradient-to-r from-[#0ea5e9]/10 via-transparent to-[#0ea5e9]/10 rounded-lg blur-md" />
              <Image
                src="/images/logo-banner.png"
                alt="Universitas Diponegoro - Kota Semarang - KATANA"
                width={260}
                height={44}
                className="object-contain relative z-10 drop-shadow-sm w-full h-auto"
                priority
              />
            </div>
          </div>

          {/* Welcome Text */}
          <div className="text-center mb-6">
            <p className="text-[#0ea5e9] text-base sm:text-lg font-semibold mb-1.5 tracking-wide">
              Selamat Datang di Admin Panel
            </p>
            <h1 className="text-[#1e3a5f] text-4xl sm:text-5xl font-bold tracking-tight mb-2 bg-gradient-to-r from-[#1e3a5f] to-[#0ea5e9] bg-clip-text text-transparent">
              WebGIS KATANA
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-[#0ea5e9] to-[#1e3a5f] mx-auto rounded-full" />
          </div>

          {/* Login Form */}
          <form action={handleSubmit} className="space-y-6">
            {/* Alert jika email/password salah */}
            {error && (
              <div className="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-3">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="font-medium">{error}</p>
              </div>
            )}
            {/* Email Field */}
            <div className="relative pt-2">
              <label
                htmlFor="email"
                className={`absolute left-4 transition-all duration-200 pointer-events-none z-10 ${
                  focusedField === "email" || hasValue.email
                    ? "-top-2 text-xs font-medium text-[#0ea5e9] bg-white px-2 rounded"
                    : "top-1/2 -translate-y-1/2 text-base text-slate-400"
                }`}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                required
                disabled={isLoading}
                onFocus={() => { setFocusedField("email"); setError(null); }}
                onBlur={(e) => {
                  setFocusedField(null);
                  setHasValue({ ...hasValue, email: e.target.value !== "" });
                }}
                onChange={(e) =>
                  setHasValue({ ...hasValue, email: e.target.value !== "" })
                }
                className="w-full px-4 py-3.5 pt-4 border-2 border-slate-200 rounded-xl text-slate-700 bg-white/50 backdrop-blur-sm focus:outline-none focus:border-[#0ea5e9] focus:bg-white transition-all duration-300 disabled:bg-slate-100 disabled:cursor-not-allowed hover:border-slate-300"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <svg
                  className={`w-5 h-5 transition-colors duration-300 ${
                    focusedField === "email" ? "text-[#0ea5e9]" : "text-slate-300"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>

            {/* Password Field */}
            <div className="relative pt-2">
              <label
                htmlFor="password"
                className={`absolute left-4 transition-all duration-200 pointer-events-none z-10 ${
                  focusedField === "password" || hasValue.password
                    ? "-top-2 text-xs font-medium text-[#0ea5e9] bg-white px-2 rounded"
                    : "top-1/2 -translate-y-1/2 text-base text-slate-400"
                }`}
              >
                Password
              </label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                required
                disabled={isLoading}
                onFocus={() => { setFocusedField("password"); setError(null); }}
                onBlur={(e) => {
                  setFocusedField(null);
                  setHasValue({ ...hasValue, password: e.target.value !== "" });
                }}
                onChange={(e) =>
                  setHasValue({ ...hasValue, password: e.target.value !== "" })
                }
                className="w-full px-4 py-3.5 pt-4 pr-12 border-2 border-slate-200 rounded-xl text-slate-700 bg-white/50 backdrop-blur-sm focus:outline-none focus:border-[#0ea5e9] focus:bg-white transition-all duration-300 disabled:bg-slate-100 disabled:cursor-not-allowed hover:border-slate-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? (
                  <EyeOff className={`w-5 h-5 ${focusedField === "password" ? "text-[#0ea5e9]" : "text-slate-300"}`} />
                ) : (
                  <Eye className={`w-5 h-5 ${focusedField === "password" ? "text-[#0ea5e9]" : "text-slate-300"}`} />
                )}
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#1e3a5f] to-[#0ea5e9] hover:from-[#152a45] hover:to-[#0284c7] text-white font-semibold py-4 px-4 rounded-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-[#1e3a5f]/30 hover:shadow-xl hover:shadow-[#0ea5e9]/40 active:scale-[0.98] relative overflow-hidden group"
            >
              {/* Button Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              
              {isLoading ? (
                <span className="flex items-center justify-center gap-2 relative z-10">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Memproses...
                </span>
              ) : (
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Masuk
                  <svg
                    className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
              )}
            </button>
          </form>

          {/* Home Button */}
          <div className="mt-5">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-white border-2 border-slate-200 hover:border-[#f97316] text-slate-700 hover:text-[#f97316] text-sm font-medium px-5 py-2.5 rounded-xl transition-all duration-200 group shadow-sm hover:shadow-md"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Kembali ke WebGIS
            </Link>
          </div>

          {/* Divider */}
          <div className="relative my-20">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
          </div>

          {/* Footer */}
          <div className="text-center space-y-2 pt-3">
            <p className="text-slate-400 text-sm">
              ©2026 - KKN-T TIM 35 WebGIS Developer
            </p>
            <p className="text-slate-300 text-xs">
              Universitas Diponegoro
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}