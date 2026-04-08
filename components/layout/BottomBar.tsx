"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  ClipboardCheck, 
  History,
  Trophy
} from "lucide-react";

interface BottomBarProps {
  role: "coach" | "client";
}

export default function BottomBar({ role }: BottomBarProps) {
  const pathname = usePathname();

  const coachLinks = [
    { name: "Beranda", href: "/dashboard", icon: LayoutDashboard },
    { name: "Atlet", href: "/dashboard/athlete", icon: Users },
    { name: "Tes", href: "/dashboard/tests", icon: Settings },
  ];

  const clientLinks = [
    { name: "Beranda", href: "/dashboard", icon: LayoutDashboard },
    { name: "Nilai", href: "/dashboard/assessment", icon: ClipboardCheck },
    { name: "Profil", href: "/dashboard/profile", icon: History },
  ];

  const links = role === "coach" ? coachLinks : clientLinks;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden px-4 pb-4">
      <nav className="bg-zinc-950/80 backdrop-blur-2xl border border-white/5 rounded-3xl flex items-center justify-around py-3 px-2 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)]">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
          const Icon = link.icon;

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all duration-300 relative ${
                isActive ? "text-gold-600 scale-110" : "text-zinc-500 hover:text-white"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]" : ""}`} />
              <span className="text-[10px] font-black uppercase tracking-widest">{link.name}</span>
              
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-gold-600 shadow-[0_0_10px_rgba(212,175,55,1)]" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
