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
   UserCircle, 
   TrendingUp, 
   Weight, 
   Ruler, 
   Activity, 
   ShieldCheck 
} from "lucide-react";

export default function ProfilFisikPage() {
   const { data, isLoading } = useLogbookData();
   const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');

   const timelineData = useMemo(() => {
      const logs = data?.logbook || [];
      return aggregateByTimeline(logs, timeframe, 'Date');
   }, [data, timeframe]);

   if (isLoading) return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
         <div className="w-8 h-8 border-4 border-gold-600 border-t-transparent rounded-full animate-spin" />
         <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">Memuat Profil Fisik...</p>
      </div>
   );

   return (
      <div className="space-y-8 animate-in slide-in-from-right duration-700">
         {/* Header */}
         <div className="flex flex-col md:flex-row items-end justify-between gap-4">
            <div className="space-y-1 w-full md:w-auto">
               <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Dosir Kesehatan Pribadi</p>
               <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-widest uppercase leading-[.9]">
                  Profil <span className="text-gold-600">Fisik</span>
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

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 bg-[#111] border border-white/5 rounded-[40px] flex items-center justify-between group hover:border-gold-600/30 transition-all">
               <div className="space-y-2">
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Berat Badan</p>
                  <h3 className="text-4xl font-black text-white">{data?.weight || 0} <span className="text-sm font-bold text-zinc-700">KG</span></h3>
               </div>
               <div className="w-16 h-16 rounded-3xl bg-zinc-800 flex items-center justify-center text-gold-600 border border-white/5">
                  <Weight className="w-8 h-8" />
               </div>
            </div>

            <div className="p-8 bg-[#111] border border-white/5 rounded-[40px] flex items-center justify-between group hover:border-gold-600/30 transition-all">
               <div className="space-y-2">
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Tinggi Badan</p>
                  <h3 className="text-4xl font-black text-white">{data?.height || 0} <span className="text-sm font-bold text-zinc-700">CM</span></h3>
               </div>
               <div className="w-16 h-16 rounded-3xl bg-zinc-800 flex items-center justify-center text-gold-600 border border-white/5">
                  <Ruler className="w-8 h-8" />
               </div>
            </div>

            <div className="p-8 bg-[#111] border border-white/5 rounded-[40px] flex items-center justify-between group hover:border-gold-600/30 transition-all bg-gold-600/5">
               <div className="space-y-2">
                  <p className="text-[10px] font-black text-gold-600 uppercase tracking-widest">Analisis Tubuh</p>
                  <h3 className="text-4xl font-black text-white">{data?.bmi || 0} <span className="text-xs text-zinc-600 font-bold uppercase tracking-widest">BMI</span></h3>
                  <div className={`px-2 py-1 rounded-md inline-block ${
                     data?.bmiStatus?.includes('Normal') 
                        ? "bg-gold-600/10 text-gold-600 border border-gold-600/20" 
                        : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                  }`}>
                     <p className="text-[8px] font-black uppercase tracking-widest">
                        Analyst: {data?.bmiStatus || "N/A"}
                     </p>
                  </div>
               </div>
               <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-gold-600 border border-white/5">
                  <Activity className="w-8 h-8" />
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
               <div className="bg-[#111] border border-white/5 rounded-[40px] p-8 shadow-2xl">
                  <div className="flex items-center justify-between mb-8">
                     <h4 className="text-xl font-bold text-white uppercase tracking-tighter">Riwayat Komposisi</h4>
                     <TrendingUp className="w-5 h-5 text-gold-600" />
                  </div>
                  <div className="h-[400px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={timelineData}>
                           <defs>
                              <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                                 <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                              </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                           <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#444', fontSize: 10}} />
                           <YAxis domain={['auto', 'auto']} hide />
                           <Tooltip 
                              contentStyle={{backgroundColor: '#111', border: '1px solid #ffffff10', borderRadius: '16px'}}
                              itemStyle={{color: '#D4AF37', fontWeight: 'bold'}}
                           />
                           <Area type="monotone" dataKey="value" stroke="#D4AF37" fillOpacity={1} fill="url(#colorVal)" />
                        </AreaChart>
                     </ResponsiveContainer>
                  </div>
               </div>
            </div>

            <div className="space-y-6">
               <div className="p-10 bg-indigo-950 rounded-[40px] text-white flex flex-col border border-white/5 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                     <ShieldCheck className="w-20 h-20" />
                  </div>
                  <div className="flex items-center gap-3 mb-8 relative z-10">
                     <div className="p-2 bg-white/10 rounded-xl">
                        <UserCircle className="w-5 h-5 text-gold-600" />
                     </div>
                     <h3 className="text-lg font-black uppercase tracking-tighter">Informasi Akun</h3>
                  </div>
                  <div className="space-y-6 relative z-10">
                     <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gold-600">Nama Lengkap</p>
                        <p className="text-xl font-bold text-white uppercase">{data?.user?.Name || "N/A"}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gold-600">ID Atlet</p>
                        <p className="text-lg font-bold text-white/70">#{data?.user?.User_ID || "N/A"}</p>
                     </div>
                     <div className="pt-6 border-t border-white/10">
                        <p className="text-[10px] text-white/40 font-bold uppercase leading-relaxed">
                           Data fisik Anda dikelola langsung oleh pelatih dan disinkronkan dari database utama.
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
