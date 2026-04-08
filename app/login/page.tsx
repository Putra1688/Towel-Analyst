"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Mail, Lock, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email atau kata sandi salah");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-dashboard-bg px-4 relative overflow-hidden">
      {/* Decorative Background Radiants */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-gold-600/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-gold-600/5 rounded-full blur-[100px]" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Logo Section */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gold-600/10 border border-gold-600/20 mb-2 md:mb-4 transition-all">
            <Trophy className="w-6 h-6 md:w-8 md:h-8 text-gold-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-sm transition-all">
            Towell <span className="text-gold-600">Analyst</span>
          </h1>
          <p className="text-zinc-400 text-[10px] md:text-sm uppercase tracking-widest md:tracking-normal">Pemantauan Beban Profesional</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#141414] border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] px-4 py-2 rounded-xl text-center">
                {error}
              </div>
            )}

            <div className="space-y-1.5 md:space-y-2">
              <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider ml-1">Alamat Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-zinc-500 group-focus-within:text-gold-600 transition-colors" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rangga_c@towell.com"
                  required
                  className="w-full bg-dashboard-bg border border-white/5 focus:border-gold-600/50 rounded-xl md:rounded-2xl py-3 md:py-4 pl-12 pr-4 text-sm text-white outline-none ring-0 transition-all placeholder:text-zinc-700"
                />
              </div>
            </div>

            <div className="space-y-1.5 md:space-y-2">
              <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider ml-1">Kata Sandi</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-zinc-500 group-focus-within:text-gold-600 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-dashboard-bg border border-white/5 focus:border-gold-600/50 rounded-xl md:rounded-2xl py-3 md:py-4 pl-12 pr-4 text-sm text-white outline-none ring-0 transition-all placeholder:text-zinc-700"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative overflow-hidden group bg-gold-600 hover:bg-gold-500 text-zinc-950 font-black py-3 md:py-4 rounded-xl md:rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span className="text-xs md:text-sm">MASUK KE DASHBOARD</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
            <p className="text-[10px] text-zinc-600 text-center uppercase tracking-[0.2em] font-bold">Akses Akun</p>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
               <p className="text-[10px] text-zinc-400 text-center leading-relaxed">
                  Log in menggunakan format email (mengandung @). Sistem akan mencocokkan ID Anda di spreadsheet secara otomatis.
               </p>
               <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Basis Data Aktif</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
