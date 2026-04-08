"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Settings,
  ClipboardCheck,
  History,
  UserCircle,
  Trophy,
  ChevronRight
} from "lucide-react";

interface SidebarProps {
  role: "coach" | "client";
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const coachLinks = [
    { name: "Ringkasan", href: "/dashboard", icon: LayoutDashboard },
    { name: "Manajemen Atlet", href: "/dashboard/athlete", icon: Users },
    { name: "Master Tes", href: "/dashboard/tests", icon: Settings },
  ];

  const clientLinks = [
    { name: "Dashboard Saya", href: "/dashboard", icon: LayoutDashboard },
    { name: "Penilaian Saya", href: "/dashboard/assessment", icon: ClipboardCheck },
    { name: "Profil & Riwayat", href: "/dashboard/profile", icon: History },
  ];

  const links = role === "coach" ? coachLinks : clientLinks;

  return (
    <aside className="hidden lg:flex w-72 bg-dashboard-bg border-r border-white/5 flex-col h-screen sticky top-0">
      <div className="p-8 pb-4">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gold-600 flex items-center justify-center shadow-[0_0_15px_-2px_rgba(212,175,55,0.4)]">
            <Trophy className="w-6 h-6 text-zinc-950 fill-zinc-950" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white leading-tight uppercase">
            Towell <span className="text-gold-600 block text-xs tracking-widest">Analyst</span>
          </h1>
        </div>

        <nav className="space-y-2">
          <p className="text-[15px] font-black uppercase tracking-widest text-zinc-600 mb-4 px-4">Menu Utama</p>
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center justify-between group px-4 py-4 rounded-2xl transition-all duration-300 ${isActive
                    ? "bg-gold-600/10 border border-gold-600/20 text-gold-600"
                    : "text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 transition-transform duration-500 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                  <span className="text-sm font-bold tracking-wide">{link.name}</span>
                </div>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-gold-600 shadow-[0_0_10px_rgba(212,175,55,1)]" />}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-8 border-t border-white/5">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-gold-600/20 flex items-center justify-center">
            <UserCircle className="w-6 h-6 text-zinc-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-gold-600 uppercase tracking-widest leading-none mb-1">Mode Sistem</p>
            <p className="text-xs font-bold text-white uppercase truncate">{role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
