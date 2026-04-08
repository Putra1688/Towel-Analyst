"use client";

import { useLogbookData } from "@/hooks/useLogbookData";
import { ClipboardCheck, Target, ShieldCheck, TrendingUp, Calendar, ArrowRight } from "lucide-react";

export default function MyAssessment() {
   const { data, isLoading } = useLogbookData();

   if (isLoading) return null;

   const assessments = data?.tes_fisik || [];

   return (
      <div className="space-y-8 animate-in fade-in duration-700">
         <div className="flex flex-col gap-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Penilaian Fisik</p>
            <h2 className="text-4xl font-extrabold text-white tracking-tighter uppercase leading-[.9]">
               Penilaian Saya
            </h2>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="stat-card border-gold-600/20 bg-gold-600/5">
               <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gold-600/10 border border-gold-600/20 text-gold-600 rounded-xl">
                     <Target className="w-5 h-5" />
                  </div>
               </div>
               <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-2">Total Pencapaian</p>
               <h3 className="text-3xl font-black text-white">{data?.avgAchievement}%</h3>
               <p className="mt-2 text-xs text-zinc-500 font-medium">Kemajuan target pelatih secara keseluruhan</p>
            </div>
         </div>

         <div className="space-y-6">
            <h3 className="text-xl font-bold text-white uppercase tracking-widest pl-2 border-l-4 border-gold-600">Riwayat Tes & Target</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {assessments.map((test: any, idx: number) => (
                  <div key={idx} className="stat-card group hover:border-gold-600/30 transition-all flex flex-col gap-6">
                     <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center border border-white/5 group-hover:border-gold-600/30 transition-all">
                              <ClipboardCheck className={`w-6 h-6 ${test.achievement >= 100 ? "text-emerald-500" : "text-gold-600"}`} />
                           </div>
                           <div className="space-y-1">
                              <h4 className="text-lg font-bold text-white uppercase tracking-tight">{test.Metric}</h4>
                              <div className="flex items-center gap-2">
                                 <Calendar className="w-3 h-3 text-zinc-600" />
                                 <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest leading-none">Terakhir Dicatat: {test.Date}</p>
                              </div>
                           </div>
                        </div>
                        <div className={`px-4 py-2 border rounded-full text-[10px] font-black uppercase tracking-widest ${test.achievement >= 100 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-gold-600/10 border-gold-600/20 text-gold-600"}`}>
                           {test.achievement}% Tercapai
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none">Hasil Aktual</p>
                           <p className="text-3xl font-black text-white">{test.Value}</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none">Target Pelatih</p>
                           <p className="text-3xl font-black text-zinc-800">{test.Target}</p>
                        </div>
                     </div>

                     <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ${test.achievement >= 100 ? "bg-emerald-500" : "bg-gold-600"}`} style={{ width: `${Math.min(test.achievement, 100)}%` }} />
                     </div>
                  </div>
               ))}
               {!assessments.length && (
                  <div className="col-span-2 p-20 bg-white/5 border border-white/5 rounded-[40px] flex flex-col items-center justify-center opacity-30">
                     <ShieldCheck className="w-16 h-16 mb-4 text-zinc-600" />
                     <p className="text-[10px] uppercase font-black tracking-widest">Tidak ada catatan penilaian ditemukan dari pelatih</p>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}
