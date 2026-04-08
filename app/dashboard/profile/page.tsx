"use client";

import { useLogbookData } from "@/hooks/useLogbookData";
import {
   UserCircle,
   Weight,
   Ruler,
   Activity,
   Target,
   ShieldCheck,
   TrendingUp,
   ClipboardCheck,
   ChevronRight
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";

export default function AthleteProfile() {
   const { data, isLoading } = useLogbookData();

   if (isLoading) return null;

   // Assuming data structure based on implementation
   const bmi = data?.bmi || "0";
   const bmiStatus = data?.bmiStatus || "N/A";
   const weight = data?.weight || "0";
   const height = data?.height || "0";
   const assessments = data?.tes_fisik || [];

   return (
      <div className="space-y-8 animate-in fade-in duration-700">
         {/* Page Header */}
         <div className="flex flex-col gap-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Personal Health Dossier</p>
            <h2 className="text-4xl font-extrabold text-white tracking-tighter uppercase leading-[.9]">
               Profile & Body Stats
            </h2>
         </div>

         {/* Primary Metrics (BB, TB, BMI) */}
         <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            <div className="stat-card p-4 md:p-8 flex items-center justify-between group hover:border-gold-600/30 transition-all bg-gold-600/5 border-gold-600/10">
               <div className="space-y-1 md:space-y-2">
                  <p className="text-[8px] md:text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none">Weight (BB)</p>
                  <h3 className="text-xl md:text-4xl font-black text-white leading-none whitespace-nowrap">{weight} <span className="text-[10px] md:text-sm text-zinc-600 uppercase">Kg</span></h3>
               </div>
               <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-zinc-800 border border-white/5 flex items-center justify-center text-gold-600">
                  <Weight className="w-5 h-5 md:w-7 md:h-7" />
               </div>
            </div>

            <div className="stat-card p-4 md:p-8 flex items-center justify-between group hover:border-gold-600/30 transition-all">
               <div className="space-y-1 md:space-y-2">
                  <p className="text-[8px] md:text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none">Height (TB)</p>
                  <h3 className="text-xl md:text-4xl font-black text-white leading-none whitespace-nowrap">{height} <span className="text-[10px] md:text-sm text-zinc-600 uppercase">Cm</span></h3>
               </div>
               <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-zinc-800 border border-white/5 flex items-center justify-center text-gold-600">
                  <Ruler className="w-5 h-5 md:w-7 md:h-7" />
               </div>
            </div>

            <div className="stat-card p-4 md:p-8 flex items-center justify-between group hover:border-gold-600/30 transition-all col-span-2 md:col-span-1">
               <div className="space-y-1 md:space-y-2">
                  <div className="flex items-center gap-2">
                     <p className="text-[8px] md:text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none">BMI Index</p>
                     <div className="px-1.5 py-0.5 bg-gold-600/10 rounded text-[7px] md:text-[8px] font-black text-gold-600 uppercase">{bmiStatus}</div>
                  </div>
                  <h3 className="text-xl md:text-4xl font-black text-white leading-none whitespace-nowrap">{bmi}</h3>
               </div>
               <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-zinc-800 border border-white/5 flex items-center justify-center text-gold-600">
                  <Activity className="w-5 h-5 md:w-7 md:h-7" />
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Detailed Body Stats Matrix */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
               <h3 className="text-sm md:text-xl font-bold text-white uppercase tracking-widest pl-2 border-l-4 border-gold-600">Performance Matrix</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {assessments.map((test: any, idx: number) => (
                     <div key={idx} className="p-4 md:p-6 bg-white/5 border border-white/5 rounded-[24px] md:rounded-3xl group hover:border-gold-600/30 transition-all flex flex-col gap-3 md:gap-4">
                        <div className="flex items-center justify-between">
                           <div className="space-y-0.5 md:space-y-1">
                              <p className="text-[8px] md:text-[9px] font-black text-zinc-600 uppercase tracking-widest leading-none">{test.Category || "Physical Test"}</p>
                              <h4 className="text-sm md:text-lg font-bold text-white uppercase tracking-tight">{test.Metric}</h4>
                           </div>
                           <div className={`p-1.5 md:p-2 rounded-lg md:rounded-xl ${test.achievement >= 100 ? "bg-emerald-500/10 text-emerald-500" : "bg-gold-600/10 text-gold-600"}`}>
                              <ClipboardCheck className="w-4 h-4 md:w-5 md:h-5" />
                           </div>
                        </div>

                        <div className="flex items-baseline gap-2">
                           <span className="text-xl md:text-2xl font-black text-white">{test.Value}</span>
                           <span className="text-[8px] md:text-[10px] font-black text-zinc-700 uppercase">Goal: {test.Target}</span>
                        </div>

                        <div className="space-y-1.5">
                           <div className="flex items-center justify-between text-[7px] md:text-[8px] font-black text-zinc-600 uppercase tracking-widest">
                              <span>Progress</span>
                              <span>{test.achievement}%</span>
                           </div>
                           <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                              <div
                                 className={`h-full transition-all duration-1000 ${test.achievement >= 100 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-gold-600"}`}
                                 style={{ width: `${Math.min(test.achievement, 100)}%` }}
                              />
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* Coach Insight Side Panel */}
            <div className="space-y-6">
               <div className="p-10 bg-dashboard-bg border border-gold-600/20 rounded-[40px] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gold-600/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-gold-600/10 transition-all"></div>
                  <div className="relative z-10 space-y-8">
                     <div className="flex items-center gap-3">
                        <ShieldCheck className="w-6 h-6 text-gold-600" />
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Data Verification</h3>
                     </div>
                     <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                        This dossier is synchronized with the coach's master logbook. All physical metrics and test results are verified and monitored to ensure accuracy in your performance tracking.
                     </p>
                     <div className="pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">System Readiness</span>
                           <span className="text-[10px] font-black text-gold-600 uppercase tracking-widest">100%</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                           <div className="w-full h-full bg-gold-600 rounded-full" />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
