"use client";

import { useLogbookData } from "@/hooks/useLogbookData";
import { useParams, useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import LoadChart from "@/components/dashboard/LoadChart";
import StatCard from "@/components/dashboard/StatCard";
import { calculateAge, getMetricsInsights } from "@/lib/calculations";
import {
   ArrowLeft,
   Activity,
   Trophy,
   Target,
   TrendingUp,
   Plus,
   Trash2,
   Save,
   Zap,
   ShieldCheck,
   ChevronDown,
   X,
   Loader2,
   LayoutDashboard,
   UserCircle,
   History,
   BarChart3,
   ArrowUpRight,
   ArrowDownRight
} from "lucide-react";
import { 
   Radar, 
   RadarChart, 
   PolarGrid, 
   PolarAngleAxis, 
   PolarRadiusAxis, 
   ResponsiveContainer,
   AreaChart,
   Area,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip
} from 'recharts';
import { 
   calculateComparison, 
   getRadarData, 
   aggregateByTimeline 
} from "@/lib/calculations";


export default function AthleteDetail() {
   const { id } = useParams();
   const router = useRouter();
   const { data, isLoading } = useLogbookData();

   // -- STATES --
   const [localProfile, setLocalProfile] = useState<any>(null);
   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
   const [activeTab, setActiveTab] = useState<'overview' | 'profiling' | 'logbook' | 'fisik'>('overview');
   const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');

   const [profileForm, setProfileForm] = useState({
      Name: "",
      Weight: 0,
      Height: 0,
      Birth_Date: ""
   });


   const [sessions, setSessions] = useState<any[]>([]);
   const [sessionName, setSessionName] = useState("");
   const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
   const [pendingExercises, setPendingExercises] = useState<any[]>([]);
   const [selectedComponent, setSelectedComponent] = useState("");
   const [currentExercise, setCurrentExercise] = useState({
      activity: "",
      set: 0,
      reps: 0,
      load: 0,
      note: ""
   });


   const [testResults, setTestResults] = useState<any[]>([]);
   const [isTestModalOpen, setIsTestModalOpen] = useState(false);
   const [selectedTestComponent, setSelectedTestComponent] = useState("");
   const [newTestResult, setNewTestResult] = useState({
      metric: "",
      target: "",
      value: "",
      date: new Date().toISOString().split('T')[0]
   });


   // -- LOADING STATES --
   const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
   const [isAddingSession, setIsAddingSession] = useState(false);
   const [isAddingTestResult, setIsAddingTestResult] = useState(false);

   // -- DATA PROCESSING (HOOKS AT TOP) --
   const athleteSummary = useMemo(() => 
      data?.summary?.find((s: any) => s.user.User_ID === id),
      [data, id]
   );

   const athleteLogs = useMemo(() => 
      data?.logbook?.filter((l: any) => l.User_ID === id) || [], 
      [data, id]
   );

   const athleteTests = useMemo(() => 
      data?.tes_fisik?.filter((t: any) => t.User_ID === id) || [], 
      [data, id]
   );

   const radarData = useMemo(() => 
      getRadarData(data?.masterTests || [], athleteTests), 
      [data, athleteTests]
   );

   const comparisonStats = useMemo(() => {
      if (!athleteLogs || athleteLogs.length < 2) return null;
      const sorted = [...athleteLogs].sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());
      const currentValue = (Number(sorted[0].Set) || 0) * (Number(sorted[0].Repetisi) || 0) * (Number(sorted[0].Load) || 0);
      const previousValue = (Number(sorted[1].Set) || 0) * (Number(sorted[1].Repetisi) || 0) * (Number(sorted[1].Load) || 0);
      
      return {
         load: calculateComparison(currentValue, previousValue)
      };
   }, [athleteLogs]);

   const timelineData = useMemo(() => {
      const sourceData = activeTab === 'fisik' ? athleteTests : athleteLogs;
      return aggregateByTimeline(sourceData, timeframe, timeframe === 'monthly' ? 'Date' : 'Date');
   }, [activeTab, timeframe, athleteLogs, athleteTests]);

   // Initializing local states once data is loaded
   useEffect(() => {
      if (athleteSummary && !localProfile) {
         setLocalProfile(athleteSummary.user);
         setProfileForm({
            Name: athleteSummary.user.Name,
            Weight: athleteSummary.user.Weight,
            Height: athleteSummary.user.Height,
            Birth_Date: athleteSummary.user.Birth_Date || ""
         });
         setTestResults(athleteSummary.tes_fisik || []);
      }
   }, [athleteSummary, localProfile]);

   // -- EARLY RETURNS (AFTER ALL HOOKS) --
   if (isLoading) {
      return (
         <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-gold-600" />
            <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">Memuat Data Atlet...</p>
         </div>
      );
   }

   if (!athleteSummary) {
      return (
         <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">No athlete found with ID: {id}</p>
            <button
               onClick={() => router.back()}
               className="px-6 py-2 bg-gold-600 text-zinc-950 font-bold rounded-xl uppercase text-xs"
            >
               Go Back
            </button>
         </div>
      );
   }

   // -- UI CALCULATIONS --
   const currentProfile = localProfile || athleteSummary.user;
   const age = calculateAge(currentProfile.Birth_Date);
   const insights = getMetricsInsights(athleteSummary.metrics);
   const avgMonthlyLoad = Math.round(athleteSummary.metrics.weeklyLoad / 7);

   const combinedChartData = sessions.map(s => ({
      Date: s.date,
      load: s.reps * s.duration,
      Activity: s.activity
   }));


   // -- HANDLERS --
   const handleUpdateProfile = async () => {
      setIsUpdatingProfile(true);
      try {
         const res = await fetch("/api/gsheets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               action: "updateProfile",
               payload: { userId: id, ...profileForm }
            })
         });
         if (res.ok) {
            setLocalProfile({ ...currentProfile, ...profileForm });
            setIsEditModalOpen(false);
         }
      } catch (error) {
         console.error("Failed to update profile", error);
      } finally {
         setIsUpdatingProfile(false);
      }
   };

   const handleAddExercise = () => {
      if (!currentExercise.activity || currentExercise.set <= 0 || currentExercise.reps <= 0) return;
      setPendingExercises([...pendingExercises, { ...currentExercise, id: Date.now() }]);
      setCurrentExercise({ ...currentExercise, set: 0, reps: 0, load: 0, note: "" });
   };

   const removePendingExercise = (id: number) => {
      setPendingExercises(pendingExercises.filter(e => e.id !== id));
   };

   const handleSaveSession = async () => {
      if (!sessionName || pendingExercises.length === 0) return;
      setIsAddingSession(true);
      try {
         const payload = pendingExercises.map(ex => ({
            userId: id,
            date: sessionDate,
            sessionName: sessionName,
            activity: ex.activity,
            set: ex.set,
            reps: ex.reps,
            load: ex.load,
            note: ex.note
         }));

         const res = await fetch("/api/gsheets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               action: "addLogbook",
               payload: payload
            })
         });
         
         if (res.ok) {
            setSessions([...sessions, ...pendingExercises.map(ex => ({ ...ex, date: sessionDate }))]);
            setPendingExercises([]);
            setSessionName("");
         }
      } catch (error) {
         console.error("Failed to add session", error);
      } finally {
         setIsAddingSession(false);
      }
   };


   const removeSession = (sessionId: number) => {
      setSessions(sessions.filter(s => s.id !== sessionId));
   };

   const handleAddTestResult = async () => {
      if (!newTestResult.metric || !newTestResult.target || !newTestResult.value) return;
      setIsAddingTestResult(true);
      try {
         const res = await fetch("/api/gsheets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               action: "addTestResult",
               payload: { userId: id, ...newTestResult }
            })
         });

         if (res.ok) {
            const selectedMaster = data?.masterTests?.find((t: any) => t.Name === newTestResult.metric);
            const newEntry = {
               User_ID: id,
               Metric: newTestResult.metric,
               Target: Number(newTestResult.target),
               Value: Number(newTestResult.value),
               Category: selectedMaster?.Category || "General",
               Date: newTestResult.date,
               achievement: Math.round((Number(newTestResult.value) / Number(newTestResult.target)) * 100)
            };

            setTestResults([newEntry, ...testResults]);
            setIsTestModalOpen(false);
            setNewTestResult({ metric: "", target: "", value: "", date: new Date().toISOString().split('T')[0] });
         }
      } catch (error) {
         console.error("Failed to add test result", error);
      } finally {
         setIsAddingTestResult(false);
      }
   };

   return (
      <>
         <div className="space-y-8 animate-in slide-in-from-right duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <button
                     onClick={() => router.back()}
                     className="p-3 bg-white/5 border border-white/5 rounded-2xl hover:bg-gold-600/10 hover:text-gold-600 transition-all active:scale-90"
                  >
                     <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="space-y-1">
                     <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Profil Atlet Detail</p>
                     <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-extrabold text-white tracking-widest uppercase">{currentProfile.Name}</h2>
                        <div className="px-2 py-0.5 bg-zinc-800 rounded text-[9px] font-black text-zinc-500 uppercase tracking-widest border border-white/5">
                           {currentProfile.Cabor || "Cabor N/A"}
                        </div>
                     </div>
                  </div>
               </div>
               <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black text-gold-600 uppercase tracking-widest transition-all shadow-xl active:scale-95"
               >
                  Edit Profil
               </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
               {/* Left Column */}
               <div className="lg:col-span-1 space-y-6">
                  <div className="stat-card flex flex-col items-center gap-6 p-10 bg-[#111]">
                     <div className="w-32 h-32 rounded-[40px] bg-zinc-800 border-2 border-gold-600/20 flex items-center justify-center text-5xl font-black text-gold-600/20">
                        {currentProfile.Name.charAt(0)}
                     </div>
                     <div className="grid grid-cols-2 gap-3 w-full">
                        <BioStat label="TGL LAHIR" value={currentProfile.Birth_Date || "N/A"} />
                        <BioStat label="USIA" value={`${age} Thn`} />
                        <BioStat label="BERAT" value={`${currentProfile.Weight} Kg`} />
                        <BioStat label="TINGGI" value={`${currentProfile.Height} Cm`} />
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
                        <h3 className="text-lg font-black uppercase tracking-tighter">Wawasan Analisis</h3>
                     </div>
                     <div className="space-y-6 relative z-10">
                        <div className="space-y-2">
                           <p className="text-[9px] font-black uppercase tracking-widest text-gold-600">Pesan Monotony</p>
                           <p className="text-[11px] font-bold text-white/70 italic border-l-2 border-gold-600/30 pl-3">{insights.monotonyMsg}</p>
                        </div>
                        <div className="space-y-2">
                           <p className="text-[9px] font-black uppercase tracking-widest text-gold-600">Pesan Strain</p>
                           <p className="text-[11px] font-bold text-white/70 italic border-l-2 border-gold-600/30 pl-3">{insights.strainMsg}</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Right Column */}
               <div className="lg:col-span-3 space-y-8">
                  {/* Tab Navigation */}
                  <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/5 rounded-2xl w-fit mb-8 overflow-x-auto max-w-full">
                     {[
                        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
                        { id: 'profiling', label: 'Profil Fisik', icon: UserCircle },
                        { id: 'logbook', label: 'Logbook Harian', icon: History },
                        { id: 'fisik', label: 'Tes Fisik', icon: Trophy }
                     ].map((tab) => (
                        <button
                           key={tab.id}
                           onClick={() => setActiveTab(tab.id as any)}
                           className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                              activeTab === tab.id 
                                 ? "bg-gold-600 text-zinc-950 shadow-lg shadow-gold-600/20" 
                                 : "text-zinc-500 hover:text-white hover:bg-white/5"
                           }`}
                        >
                           <tab.icon className="w-4 h-4" />
                           {tab.label}
                        </button>
                     ))}
                  </div>

                  {/* Dashboard Tab */}
                  {activeTab === 'overview' && (
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="lg:col-span-1 space-y-6">
                           <div className="bg-[#111] border border-white/5 rounded-[40px] p-8 shadow-2xl relative overflow-hidden group">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-gold-600/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-gold-600/10 transition-all" />
                              <div className="flex flex-col gap-1 mb-8">
                                 <p className="text-[10px] font-black text-gold-600 uppercase tracking-widest">Assessment Komponen</p>
                                 <h4 className="text-2xl font-bold text-white uppercase tracking-tighter">Radar Performa</h4>
                              </div>
                              <div className="h-[280px] w-full mt-4">
                                 <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                       <PolarGrid stroke="#ffffff10" />
                                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 10, fontWeight: 'bold' }} />
                                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                       <Radar
                                          name="Performance"
                                          dataKey="A"
                                          stroke="#D4AF37"
                                          fill="#D4AF37"
                                          fillOpacity={0.6}
                                       />
                                    </RadarChart>
                                 </ResponsiveContainer>
                              </div>
                           </div>
                           
                           <div className="bg-[#111] border border-white/5 rounded-[40px] p-8 space-y-6">
                              <div className="flex items-center justify-between">
                                 <p className="text-[10px] font-black text-white uppercase tracking-widest">Status Komposisi</p>
                                 <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Valid</span>
                                 </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="p-5 bg-white/5 border border-white/5 rounded-3xl space-y-2">
                                    <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest leading-none">Indeks BMI</p>
                                    <div className="flex items-baseline gap-2">
                                       <p className="text-2xl font-black text-white">{athleteSummary.metrics.bmi || 0}</p>
                                    </div>
                                    <div className={`px-2 py-1 rounded-md inline-block ${
                                       athleteSummary.metrics.bmiStatus.includes('Normal') 
                                          ? "bg-gold-600/10 text-gold-600 border border-gold-600/20" 
                                          : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                                    }`}>
                                       <p className="text-[7px] font-black uppercase tracking-widest font-mono">
                                          Analyst: {athleteSummary.metrics.bmiStatus}
                                       </p>
                                    </div>
                                 </div>
                                 <div className="p-5 bg-white/5 border border-white/5 rounded-3xl space-y-1">
                                    <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">ACWR Status</p>
                                    <div className="flex items-baseline gap-2">
                                       <p className="text-2xl font-black text-white">{athleteSummary.metrics.acwr || 0}</p>
                                       <span className={`text-[9px] font-bold uppercase ${athleteSummary.metrics.acwr > 1.3 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                          {athleteSummary.metrics.acwr > 1.3 ? 'Risk' : 'Stable'}
                                       </span>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="lg:col-span-2 space-y-8">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="bg-[#111] border border-white/5 rounded-[40px] p-8 flex items-center justify-between group hover:border-gold-600/20 transition-all">
                                 <div className="space-y-2">
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Compare Volume Load</p>
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
                                 <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-gold-600 border border-white/5 group-hover:scale-110 transition-all">
                                    <TrendingUp className="w-8 h-8" />
                                 </div>
                              </div>

                              <div className="bg-[#111] border border-white/5 rounded-[40px] p-8 flex items-center justify-between group hover:border-gold-600/20 transition-all">
                                 <div className="space-y-2">
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Weekly Workload</p>
                                    <div className="flex items-baseline gap-3">
                                       <h4 className="text-4xl font-black text-white tracking-tighter">
                                          {athleteSummary.metrics.weeklyLoad || 0}
                                       </h4>
                                       <span className="text-[10px] font-black text-zinc-600 uppercase">Points</span>
                                    </div>
                                    <p className="text-[9px] font-bold text-zinc-800 uppercase tracking-[0.2em]">TOTAL 7 HARI TERAKHIR</p>
                                 </div>
                                 <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-rose-500 border border-white/5 group-hover:scale-110 transition-all">
                                    <Zap className="w-8 h-8" />
                                 </div>
                              </div>
                           </div>

                           <div className="bg-[#111] border border-white/5 rounded-[40px] p-8 shadow-2xl">
                              <LoadChart 
                                 data={athleteSummary.metrics.dailyLoads} 
                                 title="Tren Beban Kerja (7 Hari)" 
                              />
                           </div>
                        </div>
                     </div>
                  )}

                  {/* Profiling Tab */}
                  {activeTab === 'profiling' && (
                     <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="bg-[#111] border border-white/5 rounded-[40px] p-8 shadow-2xl">
                              <div className="flex items-center justify-between mb-8">
                                 <h4 className="text-xl font-bold text-white uppercase tracking-tighter">Komposisi Tubuh</h4>
                              </div>
                              <div className="h-[300px] w-full">
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
                                       <Tooltip contentStyle={{backgroundColor: '#111', border: '1px solid #ffffff10', borderRadius: '16px'}} />
                                       <Area type="monotone" dataKey="value" stroke="#D4AF37" fillOpacity={1} fill="url(#colorVal)" />
                                    </AreaChart>
                                 </ResponsiveContainer>
                              </div>
                           </div>
                           <div className="bg-[#111] border border-white/5 rounded-[40px] p-8 space-y-6">
                              <h4 className="text-xl font-bold text-white uppercase tracking-tighter mb-4">Metrik Terakhir</h4>
                              <div className="space-y-4">
                                 {[
                                    { label: 'Indeks BMI', value: athleteSummary.metrics.bmi, status: athleteSummary.metrics.bmiStatus },
                                    { label: 'Tinggi Badan', value: `${currentProfile.Height} Cm`, status: 'Statis' },
                                    { label: 'Berat Badan', value: `${currentProfile.Weight} Kg`, status: 'Aktif' }
                                 ].map((m, i) => (
                                    <div key={i} className="p-6 bg-white/5 border border-white/5 rounded-[32px] flex items-center justify-between">
                                       <div className="space-y-1">
                                          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{m.label}</p>
                                          <p className="text-2xl font-black text-white">{m.value}</p>
                                       </div>
                                       <span className="text-[9px] font-black text-gold-600 uppercase tracking-widest">{m.status}</span>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                     </div>
                  )}

                  {/* Logbook Tab */}
                  {activeTab === 'logbook' && (
                     <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center gap-2 mb-2">
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

                        <div className="bg-[#111] border border-white/5 rounded-[40px] p-8 shadow-2xl">
                           <LoadChart data={timelineData} title={`Statistik Beban (${timeframe.toUpperCase()})`} />
                        </div>

                        <div className="bg-[#111] border border-white/5 rounded-[40px] p-8 md:p-12 space-y-10 shadow-2xl">
                           <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                              <div className="space-y-1">
                                 <p className="text-[10px] font-black text-gold-600 uppercase tracking-[.3em]">MANAJEMEN SESI LATIHAN</p>
                                 <h4 className="text-3xl font-black text-white uppercase tracking-tighter">Perencana Sesi Coach</h4>
                              </div>
                              {pendingExercises.length > 0 && (
                                 <button onClick={handleSaveSession} disabled={isAddingSession} className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-50">
                                    {isAddingSession ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {isAddingSession ? "Memproses..." : "Terbitkan Sesi"}
                                 </button>
                              )}
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white/5 border border-white/5 rounded-[32px]">
                              <div className="space-y-3">
                                 <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Nama Sesi (Manual)</p>
                                 <input type="text" value={sessionName} onChange={(e) => setSessionName(e.target.value)} placeholder="Contoh: Penguatan Kaki Pagi..." className="w-full bg-dashboard-bg border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold text-white outline-none focus:border-gold-600/30 transition-all placeholder:text-zinc-800" />
                              </div>
                              <div className="space-y-3">
                                 <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Tanggal Latihan</p>
                                 <input type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} className="w-full bg-dashboard-bg border border-white/5 rounded-2xl py-4 px-6 text-sm font-black text-white outline-none focus:border-gold-600/30 transition-all [color-scheme:dark]" />
                              </div>
                           </div>

                           <div className="space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                 <div className="md:col-span-3 space-y-3">
                                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Pilih Komponen</p>
                                    <select value={selectedComponent} onChange={(e) => { setSelectedComponent(e.target.value); setCurrentExercise({ ...currentExercise, activity: "" }); }} className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-xs font-bold text-white outline-none focus:border-gold-600/30 transition-all appearance-none" >
                                       <option value="" className="bg-dashboard-bg">Semua Komponen</option>
                                       <option value="Endurance">Endurance</option>
                                       <option value="Strength">Strength</option>
                                       <option value="Speed">Speed</option>
                                       <option value="Agility">Agility</option>
                                       <option value="Flexibility">Flexibility</option>
                                       <option value="Power">Power</option>
                                       <option value="Umum">Umum</option>
                                    </select>
                                 </div>
                                 <div className="md:col-span-3 space-y-3">
                                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Jenis Latihan</p>
                                    <select value={currentExercise.activity} onChange={(e) => setCurrentExercise({ ...currentExercise, activity: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-xs font-bold text-white outline-none focus:border-gold-600/30 transition-all appearance-none" >
                                       <option value="" disabled>Pilih Latihan...</option>
                                       {data?.masterTests?.filter((t: any) => !selectedComponent || t.Category === selectedComponent).map((test: any) => (<option key={test.Test_ID} value={test.Name}>{test.Name}</option>))}
                                    </select>
                                 </div>
                                 <div className="md:col-span-1 space-y-3 text-center">
                                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Set</p>
                                    <input type="number" value={currentExercise.set || ""} onChange={(e) => setCurrentExercise({ ...currentExercise, set: Number(e.target.value) })} className="w-full bg-white/5 border border-white/5 rounded-xl py-4 text-center text-xs font-black text-white" />
                                 </div>
                                 <div className="md:col-span-2 space-y-3 text-center">
                                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Reps</p>
                                    <input type="number" value={currentExercise.reps || ""} onChange={(e) => setCurrentExercise({ ...currentExercise, reps: Number(e.target.value) })} className="w-full bg-white/5 border border-white/5 rounded-xl py-4 text-center text-xs font-black text-white" />
                                 </div>
                                 <div className="md:col-span-1 space-y-3 text-center">
                                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">KG</p>
                                    <input type="number" value={currentExercise.load || ""} onChange={(e) => setCurrentExercise({ ...currentExercise, load: Number(e.target.value) })} className="w-full bg-white/5 border border-white/5 rounded-xl py-4 text-center text-xs font-black text-white" />
                                 </div>
                                 <div className="md:col-span-2 space-y-3">
                                    <button onClick={handleAddExercise} className="w-full py-4 bg-gold-600 text-zinc-950 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-gold-500">+ Tambah</button>
                                 </div>
                              </div>
                           </div>

                           {pendingExercises.length > 0 && (
                              <div className="pt-10 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                                 {pendingExercises.map((e) => (
                                    <div key={e.id} className="p-5 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-between group">
                                       <div className="flex items-center gap-4">
                                          <div className="w-10 h-10 rounded-xl bg-gold-600/10 flex items-center justify-center text-gold-600 text-[10px] font-black">{e.activity.charAt(0)}</div>
                                          <div className="space-y-0.5">
                                             <p className="text-xs font-black text-white uppercase">{e.activity}</p>
                                             <p className="text-[9px] font-bold text-zinc-600 uppercase">{e.set} Set × {e.reps} Reps @ {e.load}kg</p>
                                          </div>
                                       </div>
                                       <button onClick={() => removePendingExercise(e.id)} className="p-2 text-zinc-800 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                 ))}
                              </div>
                           )}
                        </div>
                     </div>
                  )}

                  {/* Fisik Tab */}
                  {activeTab === 'fisik' && (
                     <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2 bg-white/5 border border-white/5 p-2 rounded-2xl w-fit">
                              {['daily', 'weekly', 'monthly'].map((t) => (
                                 <button key={t} onClick={() => setTimeframe(t as any)} className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${timeframe === t ? "bg-white/10 text-white shadow-xl" : "text-zinc-500 hover:text-white"}`}>
                                    {t === 'daily' ? 'Harian' : t === 'weekly' ? 'Mingguan' : 'Bulanan'}
                                 </button>
                              ))}
                           </div>
                           <button onClick={() => setIsTestModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-gold-600 text-zinc-950 text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-gold-500 transition-all active:scale-95">
                              <Plus className="w-4 h-4" /> Hasil Tes Baru
                           </button>
                        </div>

                        <div className="bg-[#111] border border-white/5 rounded-[40px] p-8 shadow-2xl">
                           <h4 className="text-xl font-bold text-white uppercase tracking-tighter mb-8">Pencapaian Target (%)</h4>
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
                                    <Tooltip contentStyle={{backgroundColor: '#111', border: '1px solid #ffffff10', borderRadius: '16px'}} />
                                    <Area type="step" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorTest)" />
                                 </AreaChart>
                              </ResponsiveContainer>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                           {athleteTests.map((test: any, idx: number) => (
                              <div key={idx} className="p-6 bg-white/5 border border-white/5 rounded-[32px] group hover:border-gold-600/30 transition-all space-y-4">
                                 <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                       <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">{test.Category || "Fisik"}</p>
                                       <h4 className="text-sm font-bold text-white uppercase truncate">{test.Metric}</h4>
                                    </div>
                                    <div className={`p-2 rounded-lg ${test.achievement >= 100 ? "bg-emerald-500/10 text-emerald-500" : "bg-gold-600/10 text-gold-600"}`}>
                                       <Target className="w-4 h-4" />
                                    </div>
                                 </div>
                                 <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-black text-white">{test.Value}</span>
                                    <span className="text-[9px] font-bold text-zinc-600 uppercase">Target: {test.Target}</span>
                                 </div>
                                 <div className="space-y-1.5">
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                       <div className={`h-full ${test.achievement >= 100 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" : "bg-gold-600"}`} style={{ width: `${Math.min(test.achievement, 100)}%` }} />
                                    </div>
                                    <p className="text-[8px] font-black text-zinc-600 uppercase text-right">{test.achievement}% Achievement</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* Modals */}
         <EditProfileModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            formData={profileForm}
            setFormData={setProfileForm}
            onSave={handleUpdateProfile}
            isSaving={isUpdatingProfile}
         />

         {isTestModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsTestModalOpen(false)} />
               <div className="relative w-full max-w-xl bg-dashboard-bg border border-white/10 rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                  <div className="p-8 md:p-12 space-y-10">
                     <div className="flex items-center justify-between">
                        <div>
                           <p className="text-[10px] font-black text-gold-600 uppercase tracking-widest">Input Penilaian</p>
                           <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Fisik & Performa</h3>
                        </div>
                        <button onClick={() => setIsTestModalOpen(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-zinc-500 transition-all"><X className="w-6 h-6" /></button>
                     </div>
                     <div className="space-y-6">
                        <div className="space-y-3">
                           <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Pilih Komponen</p>
                           <select
                              value={selectedTestComponent}
                              onChange={(e) => {
                                 setSelectedTestComponent(e.target.value);
                                 setNewTestResult({ ...newTestResult, metric: "" });
                              }}
                              className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold text-white outline-none focus:border-gold-600/30 transition-all appearance-none cursor-pointer"
                           >
                              <option value="" className="bg-dashboard-bg">Semua Komponen</option>
                              <option value="Endurance" className="bg-dashboard-bg">Endurance</option>
                              <option value="Strength" className="bg-dashboard-bg">Strength</option>
                              <option value="Speed" className="bg-dashboard-bg">Speed</option>
                              <option value="Agility" className="bg-dashboard-bg">Agility</option>
                              <option value="Flexibility" className="bg-dashboard-bg">Flexibility</option>
                              <option value="Power" className="bg-dashboard-bg">Power</option>
                              <option value="Umum" className="bg-dashboard-bg">Umum</option>
                           </select>
                        </div>
                        <div className="space-y-3">
                           <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Pilih Test</p>
                           <select
                              value={newTestResult.metric}
                              onChange={(e) => setNewTestResult({ ...newTestResult, metric: e.target.value })}
                              className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold text-white outline-none focus:border-gold-600/30 transition-all appearance-none"
                           >
                              <option value="" disabled className="bg-dashboard-bg">Pilih Master Test...</option>
                              {data?.masterTests
                                 ?.filter((t: any) => !selectedTestComponent || t.Category === selectedTestComponent)
                                 ?.map((test: any) => (
                                    <option key={test.Test_ID} value={test.Name} className="bg-dashboard-bg">{test.Name}</option>
                                 ))}
                           </select>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-3">
                              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Target (Sasaran)</p>
                              <input type="number" value={newTestResult.target} onChange={(e) => setNewTestResult({ ...newTestResult, target: e.target.value })} placeholder="0" className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold text-white outline-none focus:border-gold-600/30 transition-all" />
                           </div>
                           <div className="space-y-3">
                              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Hasil Aktual</p>
                              <input type="number" value={newTestResult.value} onChange={(e) => setNewTestResult({ ...newTestResult, value: e.target.value })} placeholder="0" className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold text-white outline-none focus:border-gold-600/30 transition-all" />
                           </div>
                        </div>
                        <div className="space-y-3">
                           <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1 text-center">Tanggal</p>
                           <input type="date" value={newTestResult.date} onChange={(e) => setNewTestResult({ ...newTestResult, date: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm font-black text-white outline-none focus:border-gold-600/30 transition-all text-center [color-scheme:dark]" />
                        </div>
                     </div>
                     <button
                        onClick={handleAddTestResult}
                        disabled={isAddingTestResult}
                        className="w-full py-5 bg-gold-600 hover:bg-gold-500 text-zinc-950 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                     >
                        {isAddingTestResult && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isAddingTestResult ? "Menyimpan..." : "Simpan Data"}
                     </button>
                  </div>
               </div>
            </div>
         )}
      </>
   );
}

function EditProfileModal({ isOpen, onClose, formData, setFormData, onSave, isSaving }: any) {
   if (!isOpen) return null;
   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
         <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
         <div className="relative w-full max-w-xl bg-dashboard-bg border border-white/10 rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 md:p-12 space-y-10">
               <div className="flex items-center justify-between">
                  <div className="space-y-1">
                     <p className="text-[10px] font-black text-gold-600 uppercase tracking-widest">Edit Profil</p>
                     <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Data Atlet</h3>
                  </div>
                  <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-zinc-500 transition-all"><X className="w-6 h-6" /></button>
               </div>
               <div className="space-y-6">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Nama</label>
                     <input type="text" value={formData.Name} onChange={(e) => setFormData({ ...formData, Name: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold text-white outline-none focus:border-gold-600/30" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Berat (Kg)</label>
                        <input type="number" value={formData.Weight} onChange={(e) => setFormData({ ...formData, Weight: Number(e.target.value) })} className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold text-white outline-none focus:border-gold-600/30" />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Tinggi (Cm)</label>
                        <input type="number" value={formData.Height} onChange={(e) => setFormData({ ...formData, Height: Number(e.target.value) })} className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold text-white outline-none focus:border-gold-600/30" />
                     </div>
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Tgl Lahir</label>
                     <input type="date" value={formData.Birth_Date} onChange={(e) => setFormData({ ...formData, Birth_Date: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm font-black text-white outline-none focus:border-gold-600/30 [color-scheme:dark]" />
                  </div>
               </div>
               <button
                  onClick={onSave}
                  disabled={isSaving}
                  className="w-full py-5 bg-gold-600 hover:bg-gold-500 text-zinc-950 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
               >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSaving ? "Memproses..." : "Simpan"}
               </button>
            </div>
         </div>
      </div>
   );
}

function BioStat({ label, value }: { label: string; value: string | number }) {
   return (
      <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-1">
         <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{label}</p>
         <p className="text-[11px] font-bold text-white uppercase">{value}</p>
      </div>
   );
}
