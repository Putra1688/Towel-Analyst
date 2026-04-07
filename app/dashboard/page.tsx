"use client";

import { useSession } from "next-auth/react";
import { useLogbookData } from "@/hooks/useLogbookData";
import { useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import LoadChart from "@/components/dashboard/LoadChart";
import StatusPieChart from "@/components/dashboard/StatusPieChart";
import AlertCard from "@/components/dashboard/AlertCard";
import LogbookModal from "@/components/modals/LogbookModal";
import { 
  Activity, 
  Zap, 
  TrendingUp, 
  ShieldCheck, 
  Users,
  Target,
  AlertTriangle,
  Plus
} from "lucide-react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data, isLoading, refetch } = useLogbookData();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isLoading) return null; // Handled by layout loader
  if (!session) return null;

  const userRole = (session.user as any).role;
  const isCoach = userRole === "coach";

  if (isCoach) {
    return (
      <div className="space-y-8 animate-in fade-in duration-700">
        {/* Coach Overview: Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard
            title="Total Athletes"
            value={data?.summary?.length || 0}
            icon={Users}
            variant="gold"
          />
          <StatCard
            title="Avg Team Achievement"
            value={`${data?.teamAvgAchievement || 0}%`}
            icon={Target}
            description="Physical test target reached"
          />
          <StatCard
             title="Team ACWR Index"
             value={data?.summary?.length > 0 ? (data.summary.reduce((acc: any, cur: any) => acc + cur.metrics.acwr, 0) / data.summary.length).toFixed(2) : 0}
             icon={Activity}
             description="Squad readiness index"
          />
          <StatCard
            title="High Risk Alerts"
            value={data?.alerts?.length || 0}
            icon={AlertTriangle}
            description="Critical attention needed"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
           <div className="lg:col-span-1">
              <StatusPieChart data={data?.teamBmiDistribution} />
           </div>

           <div className="lg:col-span-2 space-y-6">
               <div className="flex items-center justify-between mb-4 px-2">
                  <h3 className="text-lg md:text-xl font-bold text-white uppercase tracking-widest pl-2 border-l-4 border-rose-500">Critical Monitor</h3>
               </div>
              <div className="flex flex-col gap-4">
                 {data?.alerts
                   ?.sort((a: any, b: any) => b.metrics.acwr - a.metrics.acwr)
                   ?.slice(0, 3)
                   ?.map((athlete: any, idx: number) => (
                    <AlertCard key={idx} athlete={athlete} />
                 ))}
                 {(!data?.alerts || data.alerts.length === 0) && (
                    <div className="p-12 bg-white/5 border border-white/5 rounded-3xl flex flex-col items-center justify-center opacity-30">
                       <ShieldCheck className="w-12 h-12 mb-4 text-emerald-500" />
                       <p className="text-[10px] uppercase font-black tracking-widest">No critical alerts detected in team</p>
                    </div>
                 )}
              </div>
           </div>
        </div>

      </div>
    );
  }

  // Client View
  return (
    <div className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom duration-700 pb-8">
      <div className="flex flex-col md:flex-row items-end justify-between gap-4">
        <div className="space-y-1 w-full md:w-auto">
          <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[.4em] text-zinc-600">Performance Status Monitoring</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tighter uppercase leading-[.9]">
            My Command Center
          </h2>
        </div>
        <div className="hidden md:flex px-6 py-3 bg-white/5 border border-white/5 rounded-2xl items-center gap-3">
           <ShieldCheck className="w-4 h-4 text-emerald-500" />
           <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Coach Monitored</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="My Weekly Load"
          value={data?.metrics?.weeklyLoad || 0}
          icon={Activity}
          variant="gold"
        />
        <StatCard
          title="My Achievement"
          value={`${data?.avgAchievement || 0}%`}
          icon={Target}
          description="Personal goal progress"
        />
        <StatCard
          title="Monotony"
          value={data?.metrics?.monotony || 0}
          icon={Zap}
        />
        <StatCard
          title="ACWR Ratio"
          value={data?.metrics?.acwr || 0}
          icon={ShieldCheck}
          variant={data?.metrics?.acwr < 0.8 || data?.metrics?.acwr > 1.3 ? "default" : "gold"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <LoadChart data={data?.metrics?.dailyLoads || []} title="My Performance Trend" />
        </div>
        
        <div className="stat-card space-y-8">
           <div className="flex flex-col gap-1">
              <p className="text-[10px] font-black uppercase tracking-[.3em] text-gold-600">Body Stats</p>
              <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Diagnostic Summary</h3>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-center space-y-1 group hover:border-gold-600/30 transition-all">
                <p className="text-[9px] uppercase tracking-widest text-zinc-600 font-bold">BMI Index</p>
                <p className="text-2xl font-black text-white leading-none">{data?.bmi}</p>
              </div>
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-center space-y-1 group hover:border-gold-600/30 transition-all">
                <p className="text-[9px] uppercase tracking-widest text-zinc-600 font-bold">Status</p>
                <p className="text-xs font-black text-gold-600 leading-none uppercase">{data?.bmiStatus}</p>
              </div>
           </div>

           <div className="space-y-4">
              {data?.tes_fisik?.slice(0, 3).map((test: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl group hover:border-gold-600/30 transition-all">
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">{test.Metric}</p>
                      <p className="text-lg font-black text-white">{test.Value}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-bold text-gold-600 uppercase tracking-widest leading-none mb-1">{test.achievement}%</p>
                      <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                         <div className="h-full bg-gold-600" style={{ width: `${test.achievement}%` }} />
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
