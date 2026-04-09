"use client";

import { useLogbookData } from "@/hooks/useLogbookData";
import { useMemo, useState } from "react";
import { 
   AreaChart, 
   Area, 
   XAxis, 
   YAxis, 
   CartesianGrid, 
   Tooltip, 
   ResponsiveContainer 
} from 'recharts';
import { 
   aggregateByTimeline 
} from "@/lib/calculations";
import { 
   Trophy, 
   Target, 
   TrendingUp, 
   ShieldCheck, 
   Zap,
   Calendar
} from "lucide-react";

export default function TesFisikPage() {
   const { data, isLoading } = useLogbookData();
   const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');

   const timelineData = useMemo(() => {
      const tests = data?.tes_fisik || [];
      return aggregateByTimeline(tests, timeframe, 'Date');
   }, [data, timeframe]);

   const athleteTests = data?.tes_fisik || [];

   if (isLoading) return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
         <div className="w-8 h-8 border-4 border-gold-600 border-t-transparent rounded-full animate-spin" />
         <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">Memuat Hasil Tes Fisik...</p>
      </div>
   );

   return (
      <div className="space-y-8 animate-in slide-in-from-right duration-700">
         {/* Header */}
         <div className="flex flex-col md:flex-row items-end justify-between gap-4">
            <div className="space-y-1 w-full md:w-auto">
               <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Pencapaian Target Fisik</p>
               <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-widest uppercase leading-[.9]">
                  Hasil <span className="text-gold-600">Tes Fisik</span>
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

         {/* Chart & Summary */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
               <div className="bg-[#111] border border-white/5 rounded-[40px] p-8 shadow-2xl">
                  <div className="flex items-center justify-between mb-8">
                     <h4 className="text-xl font-bold text-white uppercase tracking-tighter">Tren Pencapaian (%)</h4>
                     <TrendingUp className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="h-[300px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={timelineData}>
                           <defs>
                              <linearGradient id="colorTest" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                 <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                           <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#444', fontSize: 10}} />
                           <YAxis domain={[0, 100]} hide />
                           <Tooltip 
                              contentStyle={{backgroundColor: '#111', border: '1px solid #ffffff10', borderRadius: '16px'}}
                              itemStyle={{color: '#10b981', fontWeight: 'bold'}}
                           />
                           <Area type="step" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorTest)" />
                        </AreaChart>
                     </ResponsiveContainer>
                  </div>
               </div>
            </div>

            <div className="space-y-6">
               <div className="p-8 bg-gold-600/5 border border-gold-600/20 rounded-[40px] flex flex-col items-center justify-center text-center gap-6 shadow-2xl">
                  <div className="w-20 h-20 rounded-3xl bg-gold-600/10 flex items-center justify-center text-gold-600 border border-gold-600/20">
                     <Trophy className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                     <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none">Rata-rata Target</p>
                     <h3 className="text-5xl font-black text-white">{data?.avgAchievement || 0}%</h3>
                     <p className="text-[10px] font-black text-gold-600 uppercase tracking-widest">Sangat Baik</p>
                  </div>
               </div>

               <div className="p-8 bg-[#111] border border-white/5 rounded-[40px] space-y-4 shadow-2xl">
                  <div className="flex items-center gap-3">
                     <ShieldCheck className="w-5 h-5 text-emerald-500" />
                     <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Verifikasi Pelatih</p>
                  </div>
                  <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                     Semua hasil tes fisik di halaman ini telah diverifikasi oleh tim pelatih Towell Analyst.
                  </p>
               </div>
            </div>
         </div>

         {/* Detailed Results List */}
         <div className="space-y-6">
            <h3 className="text-xl font-bold text-white uppercase tracking-widest pl-2 border-l-4 border-gold-600 px-4">Dosir Hasil Tes Fisik</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {athleteTests.map((test: any, idx: number) => (
                  <div key={idx} className="bg-[#111] border border-white/5 rounded-[32px] p-6 hover:border-gold-600/30 transition-all flex flex-col gap-6 shadow-2xl relative group overflow-hidden">
                     <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-10 transition-opacity">
                        <Zap className="w-24 h-24" />
                     </div>
                     <div className="flex items-start justify-between relative z-10">
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-gold-600 uppercase tracking-widest leading-none">{test.Category || "Umum"}</p>
                           <h4 className="text-xl font-bold text-white uppercase tracking-tight">{test.Metric}</h4>
                        </div>
                        <div className={`p-3 rounded-2xl ${test.achievement >= 100 ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-gold-600/10 text-gold-600 border border-gold-600/20"}`}>
                           <Target className="w-6 h-6" />
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-8 relative z-10">
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none">Aktual</p>
                           <p className="text-3xl font-black text-white">{test.Value}</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none">Sasaran</p>
                           <p className="text-3xl font-black text-zinc-800">{test.Target}</p>
                        </div>
                     </div>

                     <div className="space-y-3 relative z-10">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3 text-zinc-600" />
                              <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest">{test.Date}</span>
                           </div>
                           <span className={`text-[9px] font-black uppercase tracking-widest ${test.achievement >= 100 ? "text-emerald-500" : "text-gold-600"}`}>
                              {test.achievement}% Done
                           </span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                           <div
                              className={`h-full transition-all duration-1000 ${test.achievement >= 100 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-gold-600"}`}
                              style={{ width: `${Math.min(test.achievement, 100)}%` }}
                           />
                        </div>
                     </div>
                  </div>
               ))}
               {athleteTests.length === 0 && (
                  <div className="col-span-full p-20 bg-white/5 border border-white/5 rounded-[40px] flex flex-col items-center justify-center opacity-30">
                     <Trophy className="w-16 h-16 mb-4 text-zinc-600" />
                     <p className="text-[10px] uppercase font-black tracking-widest text-center">Belum ada hasil tes fisik yang diverifikasi oleh coach</p>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}
