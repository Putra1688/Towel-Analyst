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
   Loader2
} from "lucide-react";

export default function AthleteDetail() {
   const { id } = useParams();
   const router = useRouter();
   const { data, isLoading } = useLogbookData();

   // -- STATES --
   const [localProfile, setLocalProfile] = useState<any>(null);
   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
   const [profileForm, setProfileForm] = useState({
      Name: "",
      Weight: 0,
      Height: 0,
      Birth_Date: ""
   });

   const [sessions, setSessions] = useState<any[]>([]);
   const [newSession, setNewSession] = useState({
      activity: "",
      date: new Date().toISOString().split('T')[0],
      reps: 0,
      duration: 0
   });

   const [testResults, setTestResults] = useState<any[]>([]);
   const [isTestModalOpen, setIsTestModalOpen] = useState(false);
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

   if (isLoading) return null;

   const athlete = data?.summary?.find((s: any) => s.user.User_ID === id);

   if (!athlete) {
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

   // Initializing local states once data is loaded
   useEffect(() => {
      if (athlete && !localProfile) {
         setLocalProfile(athlete.user);
         setProfileForm({
            Name: athlete.user.Name,
            Weight: athlete.user.Weight,
            Height: athlete.user.Height,
            Birth_Date: athlete.user.Birth_Date || ""
         });
         setTestResults(athlete.tes_fisik || []);
      }
   }, [athlete, localProfile]);

   const currentProfile = localProfile || athlete.user;
   const age = calculateAge(currentProfile.Birth_Date);
   const insights = getMetricsInsights(athlete.metrics);
   const avgMonthlyLoad = Math.round(athlete.metrics.weeklyLoad / 7);

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

   const handleAddSession = async () => {
      if (!newSession.activity || !newSession.date || newSession.reps <= 0 || newSession.duration <= 0) return;
      setIsAddingSession(true);
      try {
         const res = await fetch("/api/gsheets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               action: "addLogbook",
               payload: { userId: id, ...newSession }
            })
         });
         if (res.ok) {
            setSessions([...sessions, { ...newSession, id: Date.now() }]);
            setNewSession({ activity: "", date: new Date().toISOString().split('T')[0], reps: 0, duration: 0 });
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
                     <h3 className="text-lg font-black uppercase tracking-tighter">Insight Analisis</h3>
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
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard title="WEEKLY LOAD" value={`${athlete.metrics.weeklyLoad} A.U`} icon={Activity} description={`Avg: ${avgMonthlyLoad}/hr`} variant="gold" />
                  <StatCard title="ACWR RATIO" value={athlete.metrics.acwr} icon={TrendingUp} description="Ratio Metric" />
                  <StatCard title="MONOTONY" value={athlete.metrics.monotony} icon={Zap} description="Intensity Mix" />
                  <StatCard title="STRAIN" value={athlete.metrics.strain} icon={Trophy} description="Overall Stress" />
               </div>

               {/* Physical Assessment Results Section */}
               <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                     <h3 className="text-lg font-bold text-white uppercase tracking-widest border-l-4 border-gold-600 pl-4">Physical Test Matrix</h3>
                     <button onClick={() => setIsTestModalOpen(true)} className="flex items-center gap-2 text-[10px] font-black text-gold-600 hover:text-white uppercase tracking-widest transition-all">
                        <Plus className="w-4 h-4" /> Add Result
                     </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     {testResults.map((test: any, idx: number) => (
                        <div key={idx} className="p-5 bg-white/5 border border-white/5 rounded-3xl group hover:border-gold-600/30 transition-all flex flex-col gap-4">
                           <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                 <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{test.Category || "Physical"}</p>
                                 <h4 className="text-sm font-bold text-white uppercase truncate max-w-[120px]">{test.Metric}</h4>
                              </div>
                              <div className={`p-2 rounded-lg ${test.achievement >= 100 ? "bg-emerald-500/10 text-emerald-500" : "bg-gold-600/10 text-gold-600"}`}>
                                 <Target className="w-4 h-4" />
                              </div>
                           </div>
                           <div className="flex items-baseline gap-2">
                              <span className="text-xl font-black text-white">{test.Value}</span>
                              <span className="text-[9px] font-black text-zinc-600 uppercase">Goal: {test.Target}</span>
                           </div>
                           <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-[7px] font-black text-zinc-600 uppercase tracking-widest">
                                 <span>Achievement</span>
                                 <span>{test.achievement}%</span>
                              </div>
                              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                 <div className={`h-full ${test.achievement >= 100 ? "bg-emerald-500" : "bg-gold-600"}`} style={{ width: `${Math.min(test.achievement, 100)}%` }} />
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Daily Load Chart */}
               <div className="stat-card relative min-h-[400px]">
                  <div className="space-y-1 mb-8">
                     <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Beban Harian vs Monotony</h3>
                     <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Live Dynamic Tracking</p>
                  </div>
                  <div className="h-[250px]">
                     <LoadChart data={combinedChartData} title="Load Metrics" />
                  </div>
               </div>

               {/* Session Planner */}
               <div className="bg-[#111] border border-white/5 rounded-[40px] p-8 md:p-12 space-y-10 shadow-2xl">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-gold-600 uppercase tracking-[.3em]">MANAJEMEN SESI LATIHAN</p>
                        <h4 className="text-3xl font-black text-white uppercase tracking-tighter">Set Latihan Baru</h4>
                     </div>
                     <button
                        onClick={handleAddSession}
                        disabled={isAddingSession}
                        className="px-8 py-4 bg-gold-600 hover:bg-gold-500 text-zinc-950 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-50"
                     >
                        {isAddingSession ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isAddingSession ? "Memproses..." : "Simpan Sesi"}
                     </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                     <div className="md:col-span-4 space-y-3">
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Nama Sesi</p>
                        <select value={newSession.activity} onChange={(e) => setNewSession({ ...newSession, activity: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold text-white outline-none focus:border-gold-600/30 transition-all appearance-none">
                           <option value="" disabled className="bg-dashboard-bg">Pilih Aktivitas...</option>
                           {data?.masterTests?.map((test: any) => (<option key={test.Test_ID} value={test.Name} className="bg-dashboard-bg">{test.Name}</option>))}
                           <option value="Training Match" className="bg-dashboard-bg">Training Match</option>
                           <option value="Recovery" className="bg-dashboard-bg">Recovery</option>
                        </select>
                     </div>
                     <div className="md:col-span-3 space-y-3">
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1 text-center">Tanggal</p>
                        <input type="date" value={newSession.date} onChange={(e) => setNewSession({ ...newSession, date: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm font-black text-white outline-none focus:border-gold-600/30 transition-all text-center [color-scheme:dark]" />
                     </div>
                     <div className="md:col-span-2 space-y-3">
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1 text-center">RPE (1-10)</p>
                        <input type="number" min="0" max="10" value={newSession.reps || ""} onChange={(e) => setNewSession({ ...newSession, reps: Number(e.target.value) })} placeholder="0" className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm font-black text-white outline-none focus:border-gold-600/30 transition-all text-center" />
                     </div>
                     <div className="md:col-span-3 space-y-3">
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1 text-center">Durasi (Min)</p>
                        <input type="number" min="0" value={newSession.duration || ""} onChange={(e) => setNewSession({ ...newSession, duration: Number(e.target.value) })} placeholder="0" className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm font-black text-white outline-none focus:border-gold-600/30 transition-all text-center" />
                     </div>
                  </div>
                  {sessions.length > 0 && (
                     <div className="pt-10 border-t border-white/5 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {sessions.map((s) => (
                              <div key={s.id} className="p-5 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-between group hover:border-gold-600/20 transition-all">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gold-600/10 flex items-center justify-center text-gold-600 text-[10px] font-black">{s.date.split('-').slice(1).join('/')}</div>
                                    <div className="space-y-0.5">
                                       <p className="text-xs font-black text-white uppercase">{s.activity}</p>
                                       <p className="text-[9px] font-bold text-zinc-600 uppercase">Load: {s.reps * s.duration}</p>
                                    </div>
                                 </div>
                                 <button onClick={() => removeSession(s.id)} className="p-2 text-zinc-800 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* Edit Profile Modal */}
         <EditProfileModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            formData={profileForm}
            setFormData={setProfileForm}
            onSave={handleUpdateProfile}
            isSaving={isUpdatingProfile}
         />

         {/* Add Test Result Modal */}
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
                           <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Pilih Test</p>
                           <select value={newTestResult.metric} onChange={(e) => setNewTestResult({ ...newTestResult, metric: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold text-white outline-none focus:border-gold-600/30 transition-all appearance-none">
                              <option value="" disabled className="bg-dashboard-bg">Pilih Master Test...</option>
                              {data?.masterTests?.map((test: any) => (<option key={test.Test_ID} value={test.Name} className="bg-dashboard-bg">{test.Name}</option>))}
                           </select>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-3">
                              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Target (Goal)</p>
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
      </div>
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
