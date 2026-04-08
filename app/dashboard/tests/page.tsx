"use client";

import { useLogbookData } from "@/hooks/useLogbookData";
import { useState } from "react";
import {
  Settings,
  ClipboardCheck,
  Plus,
  Search,
  Filter,
  BookOpen,
  X,
  Target,
  FileText,
  Layers,
  Activity,
  Edit3,
  Trash2,
  Loader2
} from "lucide-react";

export default function MasterTests() {
  const { data, isLoading } = useLogbookData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<any>(null);
  const [testToDelete, setTestToDelete] = useState<any>(null);
  const [localTests, setLocalTests] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    Name: "",
    Category: "Strength",
    Unit: "",
    Description: ""
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (isLoading) return null;

  const tests = data?.masterTests || [];

  const openModal = (test: any = null) => {
    if (test) {
      setEditingTest(test);
      setFormData({
        Name: test.Name,
        Category: test.Category,
        Unit: test.Unit,
        Description: test.Description || ""
      });
    } else {
      setEditingTest(null);
      setFormData({ Name: "", Category: "Strength", Unit: "", Description: "" });
    }
    setIsModalOpen(true);
  };

  const handleSaveTest = async () => {
    if (!formData.Name || !formData.Unit) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/gsheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: editingTest ? "updateMasterTest" : "addMasterTest",
          payload: formData
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingTest(null);
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to save test", error);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = (test: any) => {
    setTestToDelete(test);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteTest = async () => {
    if (!testToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch("/api/gsheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "deleteMasterTest",
          payload: { testId: testToDelete.Test_ID }
        })
      });

      if (res.ok) {
        setIsDeleteModalOpen(false);
        setTestToDelete(null);
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to delete test", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 relative">
      <div className="flex flex-col md:flex-row items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Physical Assessment Repository</p>
          <h2 className="text-4xl font-extrabold text-white tracking-tighter uppercase leading-[.9]">
            Master Test Dictionary
          </h2>
        </div>
        <button
          onClick={() => openModal()}
          className="px-8 py-4 bg-gold-600 hover:bg-gold-500 text-zinc-950 font-black rounded-2xl flex items-center gap-3 transition-all transform active:scale-95 shadow-[0_0_20px_-5px_rgba(212,175,55,0.4)]"
        >
          <Plus className="w-5 h-5" />
          ADD NEW TEST
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white/5 border border-white/5 rounded-3xl group hover:border-gold-600/20 transition-all flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none">Total Matrix</p>
            <p className="text-3xl font-black text-white">{tests.length}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-white/5 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-gold-600" />
          </div>
        </div>
        {/* Search Filter Bar */}
        <div className="md:col-span-2 p-3 bg-white/5 border border-white/5 rounded-3xl flex items-center gap-4">
          <div className="flex-1 relative flex items-center group">
            <Search className="absolute left-4 w-5 h-5 text-zinc-600 group-focus-within:text-gold-600 transition-colors" />
            <input
              type="text"
              placeholder="Search test name or category..."
              className="w-full bg-dashboard-bg border border-white/5 focus:border-gold-600/30 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none transition-all placeholder:text-zinc-700"
            />
          </div>
          <button className="p-4 bg-white/5 border border-white/5 rounded-2xl text-zinc-500 hover:text-white transition-all">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {tests.map((test: any, idx: number) => (
          <div key={idx} className="stat-card p-4 md:p-8 flex flex-col items-center text-center gap-4 md:gap-6 group hover:border-gold-600/50 shadow-2xl relative overflow-hidden">
            <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-[24px] bg-gold-600/10 border border-gold-600/20 flex items-center justify-center text-gold-600 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-[0_0_20px_-10px_rgba(212,175,55,0.4)]">
              <ClipboardCheck className="w-5 h-5 md:w-8 md:h-8" />
            </div>
            <div className="space-y-1 md:space-y-2">
              <p className="text-[7px] md:text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none">{test.Category}</p>
              <h3 className="text-sm md:text-xl font-bold text-white uppercase tracking-tighter line-clamp-1">{test.Name}</h3>
              <div className="inline-flex px-2 py-0.5 md:px-3 md:py-1 bg-white/5 border border-white/5 rounded-full text-[7px] md:text-[10px] font-black text-gold-600 uppercase tracking-widest">
                {test.Unit}
              </div>
            </div>
            <p className="hidden md:block text-xs text-zinc-500 font-medium px-4 line-clamp-2">
              {test.Description || "Standardized measurement used for athlete diagnostic records."}
            </p>
            <div className="w-full pt-3 md:pt-4 border-t border-white/5 flex items-center justify-around">
              <button
                onClick={() => openModal(test)}
                className="flex items-center gap-1 md:gap-2 text-[8px] md:text-[10px] font-black text-gold-600 hover:text-white uppercase tracking-widest transition-all"
              >
                <Edit3 className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <div className="w-px h-3 md:h-4 bg-white/5" />
              <button
                onClick={() => confirmDelete(test)}
                className="flex items-center gap-1 md:gap-2 text-[8px] md:text-[10px] font-black text-zinc-600 hover:text-rose-500 uppercase tracking-widest transition-all"
              >
                <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Retire</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Test Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => { setIsModalOpen(false); setEditingTest(null); }}
          />
          <div className="relative w-full max-w-xl bg-dashboard-bg border border-white/10 rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 md:p-12 space-y-10">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gold-600 uppercase tracking-[.3em]">REPOSITORI DATA</p>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter">
                    {editingTest ? "Update Data Test" : "Tambah Test Baru"}
                  </h3>
                </div>
                <button
                  onClick={() => { setIsModalOpen(false); setEditingTest(null); }}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-zinc-500 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSaveTest(); }}>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Target className="w-3 h-3" />
                    Nama Test
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.Name}
                    onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                    placeholder="Contoh: Bleep Test, 100m Sprint..."
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold text-white outline-none focus:border-gold-600/30 transition-all placeholder:text-zinc-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Layers className="w-3 h-3" />
                      Jenis / Kategori
                    </label>
                    <select
                      value={formData.Category}
                      onChange={(e) => setFormData({ ...formData, Category: e.target.value })}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold text-white outline-none focus:border-gold-600/30 transition-all appearance-none cursor-pointer"
                    >
                      <option value="Strength" className="bg-dashboard-bg">Strength</option>
                      <option value="Cardio" className="bg-dashboard-bg">Cardio</option>
                      <option value="Endurance" className="bg-dashboard-bg">Endurance</option>
                      <option value="Power" className="bg-dashboard-bg">Power</option>
                      <option value="Speed" className="bg-dashboard-bg">Speed</option>
                      <option value="Flexibility" className="bg-dashboard-bg">Flexibility</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Activity className="w-3 h-3" />
                      Unit (Satuan)
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.Unit}
                      onChange={(e) => setFormData({ ...formData, Unit: e.target.value })}
                      placeholder="Kg, meter, ml/kg/min..."
                      className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold text-white outline-none focus:border-gold-600/30 transition-all placeholder:text-zinc-800"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <FileText className="w-3 h-3" />
                    Deskripsi Test
                  </label>
                  <textarea
                    value={formData.Description}
                    onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                    placeholder="Jelaskan cara pengukuran atau standar penilaian..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/5 rounded-3xl py-4 px-6 text-sm font-bold text-white outline-none focus:border-gold-600/30 transition-all placeholder:text-zinc-800 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-5 bg-gold-600 hover:bg-gold-500 text-zinc-950 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-gold-600/10 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSaving ? "MEMPROSES..." : (editingTest ? "Update Data Matrix" : "Simpan Test Baru")}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            onClick={() => setIsDeleteModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-dashboard-bg border border-rose-500/20 rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 text-center space-y-8">
              <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
                <Trash2 className="w-10 h-10 text-rose-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Retire Assessment?</h3>
                <p className="text-sm text-zinc-500">
                  You are about to remove <span className="text-white font-bold">{testToDelete?.Name}</span> from the master repository. This action is destructive.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-black text-zinc-500 uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTest}
                  disabled={isDeleting}
                  className="py-4 bg-rose-600 hover:bg-rose-500 rounded-2xl text-xs font-black text-white uppercase tracking-widest transition-all shadow-lg shadow-rose-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isDeleting ? "DELETING..." : "Confirm Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
