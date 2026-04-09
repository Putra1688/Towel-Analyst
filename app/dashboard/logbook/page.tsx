"use client";

import { useLogbookData } from "@/hooks/useLogbookData";
import { useMemo, useState } from "react";
import LoadChart from "@/components/dashboard/LoadChart";
import { 
   aggregateByTimeline 
} from "@/lib/calculations";
import { 
   History, 
   Activity, 
   Calendar, 
   ChevronRight, 
   Zap 
} from "lucide-react";

export default function LogbookPage() {
   const { data, isLoading } = useLogbookData();
   const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');

   const timelineData = useMemo(() => {
      const logs = data?.logbook || [];
      return aggregateByTimeline(logs, timeframe, 'Date');
   }, [data, timeframe]);

   const historicalSessions = useMemo(() => {
      const logs = data?.logbook || [];
      // Group by date and session name
      const groups: Record<string, any> = {};
      logs.forEach((log: any) => {
         const key = `${log.Date}_${log.Sesi || "Umum"}`;
         if (!groups[key]) {
            groups[key] = {
               date: log.Date,
               name: log.Sesi || "Sesi Latihan",
               exercises: [],
               totalLoad: 0
            };
         }
         groups[key].exercises.push(log);
         groups[key].totalLoad += (Number(log.Set) || 0) * (Number(log.Repetisi) || 0) * (Number(log.Load) || 0);
      });
      return Object.values(groups).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
   }, [data]);

   if (isLoading) return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
         <div className="w-8 h-8 border-4 border-gold-600 border-t-transparent rounded-full animate-spin" />
         <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">Memuat Logbook Harian...</p>
      </div>
   );

   return (
      <div className="space-y-8 animate-in slide-in-from-right duration-700">
         {/* Header */}
         <div className="flex flex-col md:flex-row items-end justify-between gap-4">
            <div className="space-y-1 w-full md:w-auto">
               <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Riwayat Latihan Mandiri</p>
               <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-widest uppercase leading-[.9]">
                  Logbook <span className="text-gold-600">Harian</span>
               </h2>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/5 p-2 rounded-2xl">
               {['daily', 'weekly', 'monthly'].map((t) => (
                  <button
                     key={t}
                     onClick={() => setTimeframe(t as any)}
                     className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                        timeframe === t ? "bg-white/10 text-white shadow-xl" : "text-zinc-500 hover:text-white"
                     }`}
                  >
                     {t === 'daily' ? 'Harian' : t === 'weekly' ? 'Mingguan' : 'Bulanan'}
                  </button>
               ))}
            </div>
         </div>

         {/* Load Chart Row */}
         <div className="bg-[#111] border border-white/5 rounded-[40px] p-8 shadow-2xl">
            <LoadChart data={timelineData} title={`Statistik Beban (${timeframe.toUpperCase()})`} />
         </div>

         {/* Session List */}
         <div className="space-y-6">
            <div className="flex items-center justify-between px-4">
               <h3 className="text-xl font-bold text-white uppercase tracking-widest pl-2 border-l-4 border-gold-600">Daftar Sesi Latihan</h3>
               <div className="flex items-center gap-2 text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                  <Activity className="w-4 h-4" />
                  {historicalSessions.length} Sesi Tercatat
               </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
               {historicalSessions.map((session: any, idx: number) => (
                  <div key={idx} className="bg-[#111] border border-white/5 rounded-[32px] overflow-hidden group hover:border-gold-600/20 transition-all">
                     <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                           <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-white/5 flex items-center justify-center text-gold-600 group-hover:scale-110 transition-all duration-500">
                              <Calendar className="w-7 h-7" />
                           </div>
                           <div className="space-y-1">
                              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{session.date}</p>
                              <h4 className="text-xl font-bold text-white uppercase tracking-tight">{session.name}</h4>
                           </div>
                        </div>

                        <div className="flex items-center gap-8 px-6 py-3 bg-white/5 rounded-2xl border border-white/5">
                           <div className="text-center">
                              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Total Beban</p>
                              <p className="text-lg font-black text-gold-600">{session.totalLoad} <span className="text-[10px] uppercase text-zinc-700">KG</span></p>
                           </div>
                           <div className="text-center">
                              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Item Latihan</p>
                              <p className="text-lg font-black text-white">{session.exercises.length}</p>
                           </div>
                        </div>
                     </div>

                     <div className="bg-white/[0.02] border-t border-white/5 p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {session.exercises.map((ex: any, eIdx: number) => (
                           <div key={eIdx} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-lg bg-gold-600/10 flex items-center justify-center text-[10px] font-black text-gold-600">
                                    {ex.Activity.charAt(0)}
                                 </div>
                                 <div className="space-y-0.5">
                                    <p className="text-xs font-bold text-white uppercase truncate max-w-[120px]">{ex.Activity}</p>
                                    <p className="text-[9px] font-bold text-zinc-600 uppercase">{ex.Set}×{ex.Repetisi} @ {ex.Load}KG</p>
                                 </div>
                              </div>
                              <Zap className="w-4 h-4 text-gold-600/20" />
                           </div>
                        ))}
                     </div>
                  </div>
               ))}

               {historicalSessions.length === 0 && (
                  <div className="p-20 bg-white/5 border border-white/5 rounded-[40px] flex flex-col items-center justify-center opacity-30">
                     <History className="w-16 h-16 mb-4 text-zinc-600" />
                     <p className="text-[10px] uppercase font-black tracking-widest text-center">Belum ada riwayat sesi latihan yang tercatat</p>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}
