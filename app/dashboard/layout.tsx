"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import BottomBar from "@/components/layout/BottomBar";
import { Trophy, LogOut, Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-dashboard-bg gap-4">
        <Loader2 className="w-12 h-12 text-gold-600 animate-spin" />
        <p className="text-sm font-bold uppercase tracking-[.3em] text-zinc-600">Loading Workspace</p>
      </div>
    );
  }

  if (!session) return null;

  const userRole = (session.user as any).role as "coach" | "client";

  return (
    <div className="flex min-h-screen bg-dashboard-bg pb-24 lg:pb-0">
      <Sidebar role={userRole} />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <nav className="sticky top-0 z-40 bg-dashboard-bg/80 backdrop-blur-xl border-b border-white/5 py-4 px-6 md:px-8 flex items-center justify-between shadow-2xl">
          <div>
             <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 leading-none mb-1">Authenticated Session</p>
             <h2 className="text-sm font-bold text-white uppercase tracking-widest">{session.user?.name}</h2>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <div className="hidden sm:block px-4 py-2 bg-gold-600/10 border border-gold-600/20 text-gold-600 text-[10px] font-black rounded-full uppercase tracking-widest">
              {userRole} Mode
            </div>
            <button
              onClick={() => signOut()}
              className="p-3 bg-white/5 hover:bg-rose-500/20 text-zinc-500 hover:text-rose-500 border border-white/5 rounded-xl transition-all active:scale-95 group"
            >
              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Navigation */}
      <BottomBar role={userRole} />
    </div>
  );
}
