"use client";

import { useLogbookData } from "@/hooks/useLogbookData";
import { User, ChevronRight, Weight, Ruler, Target, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import AddAthleteModal from "@/components/modals/AddAthleteModal";

export default function AthleteManagement() {
  const { data, isLoading } = useLogbookData();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isLoading) return null;

  const athletes = data?.summary || [];

  return (
    <div className="flex flex-col gap-6">
      <AddAthleteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 leading-none">Konsol Manajemen</p>
          <h2 className="text-3xl font-extrabold text-white tracking-tighter uppercase">Daftar Skuad</h2>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gold-600 hover:bg-gold-500 text-zinc-950 text-xs font-black rounded-2xl transition-all active:scale-95 shadow-lg shadow-gold-600/20"
        >
          <Plus className="w-4 h-4" />
          TAMBAH ATLET BARU
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {athletes.map((athlete: any, idx: number) => (
          <Link
            key={idx}
            href={`/dashboard/athlete/${athlete.user.User_ID}`}
            className="group flex flex-col md:flex-row items-center justify-between p-5 md:p-6 bg-[#111] border border-white/5 rounded-[32px] hover:border-gold-600/30 hover:bg-gold-600/5 transition-all duration-500 gap-4"
          >
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-[22px] md:rounded-[24px] bg-zinc-800 border-2 border-gold-600/10 flex items-center justify-center text-2xl md:text-3xl font-black text-gold-600/20 group-hover:text-gold-600 group-hover:bg-gold-600/10 group-hover:border-gold-600/30 transition-all shrink-0">
                {athlete.user.Name.charAt(0)}
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                <h3 className="text-lg md:text-xl font-bold text-white uppercase tracking-tighter leading-tight truncate">{athlete.user.Name}</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest truncate">ID: {athlete.user.User_ID}</p>
                  <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-zinc-800 shrink-0" />
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Aktif</p>
                  </div>
                </div>
              </div>
              <div className="md:hidden group-hover:translate-x-1 transition-transform shrink-0">
                <ChevronRight className="w-6 h-6 text-zinc-700" />
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-3 md:gap-4 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
              <div className="px-4 py-2.5 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center min-w-[70px] md:min-w-[80px]">
                <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-1.5">Berat</p>
                <span className="text-xs font-black text-white uppercase">{athlete.user.Weight}kg</span>
              </div>
              <div className="px-4 py-2.5 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center min-w-[70px] md:min-w-[80px]">
                <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-1.5">Capaian</p>
                <span className="text-xs font-black text-gold-600 uppercase">{athlete.avgAchievement}%</span>
              </div>
              <div className={`px-4 py-2.5 rounded-2xl border flex flex-col items-center min-w-[70px] md:min-w-[80px] ${athlete.metrics.acwr > 1.5 ? "bg-rose-500/10 border-rose-500/20 text-rose-500" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"}`}>
                <p className="text-[8px] font-black opacity-50 uppercase tracking-widest leading-none mb-1.5">ACWR</p>
                <span className="text-xs font-black uppercase">{athlete.metrics.acwr}</span>
              </div>
              <div className="hidden md:flex w-14 h-14 rounded-2xl bg-white/5 border border-white/5 items-center justify-center group-hover:bg-gold-600 group-hover:text-zinc-950 group-hover:rotate-90 transition-all shadow-xl group-hover:shadow-gold-600/20">
                <ChevronRight className="w-7 h-7" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Activity(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}
