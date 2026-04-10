"use client";

import { useSession } from "next-auth/react";
import { useLogbookData } from "@/hooks/useLogbookData";
import { useState, useEffect, useMemo } from "react";
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
  Plus,
  UserCircle,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { 
   Radar, 
   RadarChart, 
   PolarGrid, 
   PolarAngleAxis, 
   PolarRadiusAxis, 
   ResponsiveContainer 
} from 'recharts';
import { 
   calculateComparison, 
   getRadarData, 
   getMetricsInsights 
} from "@/lib/calculations";

export default function DashboardPage() {
  const [isMounted, setIsMounted] = useState(false);
  
  const { data: session } = useSession();
  const { data, isLoading, refetch } = useLogbookData();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (isLoading || !isMounted) return null; // Wait for mounting for stable layout
  if (!session) return null;

  const userRole = (session.user as any).role || "";
  const isCoach = userRole.toString().toLowerCase() === "coach";

  if (isCoach) {
    return (
      <div className="space-y-8 animate-in fade-in duration-700">
        {/* Coach Overview: Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard
            title="Total Atlet"
            value={data?.summary?.length || 0}
            icon={Users}
            variant="gold"
          />
          <StatCard
            title="Rata-rata Pencapaian Tim"
            value={`${data?.teamAvgAchievement || 0}%`}
            icon={Target}
            description="Target tes fisik tercapai"
          />
          <StatCard
             title="Indeks ACWR Tim"
             value={data?.summary?.length > 0 ? (data.summary.reduce((acc: any, cur: any) => acc + cur.metrics.acwr, 0) / data.summary.length).toFixed(2) : 0}
             icon={Activity}
             description="Indeks kesiapan skuad"
          />
          <StatCard
            title="Peringatan Risiko Tinggi"
            value={data?.alerts?.length || 0}
            icon={AlertTriangle}
            description="Perhatian kritis diperlukan"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
           <div className="lg:col-span-1">
              <StatusPieChart data={data?.teamBmiDistribution} />
           </div>

           <div className="lg:col-span-2 space-y-6">
               <div className="flex items-center justify-between mb-4 px-2">
                  <h3 className="text-lg md:text-xl font-bold text-white uppercase tracking-widest pl-2 border-l-4 border-rose-500">Monitor Kritis</h3>
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
                       <p className="text-[10px] uppercase font-black tracking-widest">Tidak ada peringatan kritis terdeteksi dalam tim</p>
                    </div>
                 )}
              </div>
           </div>
        </div>

      </div>
    );
  }

  // Client View
  // Extracting radar data and comparison logic
  const radarData = data?.masterTests ? getRadarData(data.masterTests, data.tes_fisik || []) : [];
  
  const comparisonStats = (() => {
    const logs = data?.logbook || [];
    if (logs.length < 2) return null;
    const sorted = [...logs].sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());
    const currentValue = (Number(sorted[0].Set) || 0) * (Number(sorted[0].Repetisi) || 0) * (Number(sorted[0].Load) || 0);
    const previousValue = (Number(sorted[1].Set) || 0) * (Number(sorted[1].Repetisi) || 0) * (Number(sorted[1].Load) || 0);
    return {
      load: calculateComparison(currentValue, previousValue)
    };
  })();

  const insights = data?.metrics ? getMetricsInsights(data.metrics) : { monotonyMsg: "", strainMsg: "" };

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1 w-full md:w-auto">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Pusat Komando Performa</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-widest uppercase leading-tight">
            Dashboard <span className="text-gold-600">Atlet</span>
          </h2>
        </div>
        <div className="w-full md:w-auto px-6 py-4 md:py-3 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none">Sistem Terverifikasi</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Stats Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#111] border border-white/5 rounded-[40px] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-600/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-gold-600/10 transition-all" />
            <div className="flex flex-col gap-1 mb-8">
              <p className="text-[10px] font-black text-gold-600 uppercase tracking-widest">Assessment Mandiri</p>
              <h4 className="text-2xl font-bold text-white uppercase tracking-tighter">Radar Performa</h4>
            </div>
            <div className="h-[300px] w-full mt-4 flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#ffffff10" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 10, fontWeight: 'bold' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Performance"
                    dataKey="A"
                    stroke="#D4AF37"
                    strokeWidth={3}
                    fill="#D4AF37"
                    fillOpacity={0.5}
                    dot={{ r: 4, fill: '#D4AF37', stroke: '#000', strokeWidth: 2 }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-indigo-950 rounded-[40px] p-8 text-white flex flex-col border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <ShieldCheck className="w-20 h-20" />
            </div>
            <div className="flex items-center gap-3 mb-8 relative z-10">
              <div className="p-2 bg-white/10 rounded-xl">
                <Zap className="w-5 h-5 text-gold-600 fill-gold-600" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tighter">Wawasan AI</h3>
            </div>
            <div className="space-y-6 relative z-10">
              <div className="space-y-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-gold-600">Kesehatan Latihan</p>
                <p className="text-[11px] font-bold text-white/70 italic border-l-2 border-gold-600/30 pl-3">{insights.monotonyMsg}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Main Column */}
        <div className="lg:col-span-3 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Beban Mingguan"
              value={data?.metrics?.weeklyLoad || 0}
              icon={Activity}
              variant="gold"
            />
            <StatCard
              title="Achievement"
              value={`${data?.avgAchievement || 0}%`}
              icon={Target}
            />
            <StatCard
              title="ACWR Ratio"
              value={data?.metrics?.acwr || 0}
              icon={ShieldCheck}
              variant={data?.metrics?.acwr < 0.8 || data?.metrics?.acwr > 1.3 ? "default" : "gold"}
            />
            <StatCard
              title="BMI Analyst"
              value={data?.bmi || 0}
              icon={UserCircle}
              description={data?.bmiStatus}
              variant={data?.bmiStatus?.includes('Normal') ? "gold" : "default"}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#111] border border-white/5 rounded-[40px] p-8 flex items-center justify-between group hover:border-gold-600/20 transition-all">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Review Beban Kerja</p>
                <div className="flex items-baseline gap-3">
                  <h4 className="text-4xl font-black text-white tracking-tighter">
                    {comparisonStats?.load.percent || 0}%
                  </h4>
                  <div className={`flex items-center gap-1 text-[10px] font-black uppercase ${comparisonStats?.load.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {comparisonStats?.load.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(comparisonStats?.load.diff || 0)} KG
                  </div>
                </div>
                <p className="text-[9px] font-bold text-zinc-800 uppercase tracking-[0.2em]">VS SESI SEBELUMNYA</p>
              </div>
              <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-gold-600 border border-white/5">
                <TrendingUp className="w-8 h-8" />
              </div>
            </div>

            <div className="bg-[#111] border border-white/5 rounded-[40px] p-8 flex items-center justify-between group hover:border-gold-600/20 transition-all">
               <div className="space-y-2">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Kesiapan Bertanding</p>
                  <div className="flex items-baseline gap-3">
                     <h4 className="text-4xl font-black text-white tracking-tighter">Ready</h4>
                     <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Stable</span>
                  </div>
                  <p className="text-[9px] font-bold text-zinc-800 uppercase tracking-[0.2em]">BERDASARKAN METRIK TERBARU</p>
               </div>
               <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/10">
                  <Zap className="w-8 h-8" />
               </div>
            </div>
          </div>

          <div className="bg-[#111] border border-white/5 rounded-[40px] p-8 shadow-2xl">
            <LoadChart 
              data={data?.metrics?.dailyLoads || []} 
              title="Dashboard Tren Performa (7 Hari)" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

