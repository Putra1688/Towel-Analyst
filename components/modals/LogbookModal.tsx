"use client";

import React, { useState } from "react";
import { 
  X, 
  Send, 
  History, 
  ChevronRight, 
  Activity, 
  Clock, 
  Trophy,
  Loader2
} from "lucide-react";

interface LogbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LogbookModal({ isOpen, onClose, onSuccess }: LogbookModalProps) {
  const [rpe, setRpe] = useState(5);
  const [duration, setDuration] = useState(60);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate POST delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Real implementation would call /api/gsheets/logbook
      // await fetch('/api/gsheets/logbook', { method: 'POST', body: JSON.stringify({ rpe, duration }) });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to submit logbook", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-dashboard-bg border border-white/5 rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gold-600/10 border border-gold-600/20 flex items-center justify-center">
                <History className="w-6 h-6 text-gold-600" />
              </div>
              <div className="space-y-1">
                 <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Logbook Harian</h3>
                 <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none">Catat intensitas latihan</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-3 bg-white/5 border border-white/5 rounded-2xl text-zinc-500 hover:text-white transition-all active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* RPE Selector */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Tingkat Persepsi Beban (RPE)</label>
                <div className="px-3 py-1 bg-gold-600/20 border border-gold-600/30 text-gold-600 text-xs font-black rounded-lg">
                  Level {rpe}
                </div>
              </div>
              <input 
                type="range" 
                min="1" 
                max="10" 
                step="1"
                value={rpe}
                onChange={(e) => setRpe(parseInt(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-gold-600"
              />
              <div className="flex items-center justify-between text-[10px] text-zinc-600 font-black uppercase tracking-widest px-1">
                 <span>Istirahat</span>
                 <span>Sedang</span>
                 <span>Usaha Maksimal</span>
              </div>
            </div>

            {/* Duration Input */}
            <div className="space-y-4">
               <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2">Durasi Latihan (Menit)</label>
               <div className="relative group">
                  <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-gold-600 transition-colors" />
                  <input 
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full bg-[#111] border border-white/5 rounded-[24px] py-6 pl-16 pr-6 text-2xl font-black text-white outline-none focus:border-gold-600/30 transition-all placeholder:text-zinc-800"
                    placeholder="60"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-zinc-700 uppercase tracking-widest">Menit</span>
               </div>
            </div>

            {/* Summary Preview */}
            <div className="p-6 bg-gold-600/10 border border-gold-600/20 rounded-[32px] flex items-center justify-between">
               <div className="space-y-1">
                  <p className="text-[10px] font-black text-gold-600 uppercase tracking-widest leading-none">Beban Kerja Terhitung</p>
                  <h4 className="text-3xl font-black text-white uppercase tracking-tighter">{rpe * duration}</h4>
               </div>
               <div className="p-4 bg-gold-600 rounded-2xl shadow-xl shadow-gold-600/20">
                  <Activity className="w-6 h-6 text-zinc-950" />
               </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full relative overflow-hidden group bg-gold-600 hover:bg-gold-500 text-zinc-950 font-black py-6 rounded-[24px] flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  KIRIM PERFORMA HARIAN
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
