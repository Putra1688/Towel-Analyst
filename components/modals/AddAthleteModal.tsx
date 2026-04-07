"use client";

import React, { useState } from "react";
import { 
  X, 
  UserPlus, 
  User, 
  Lock, 
  Weight, 
  Ruler, 
  Calendar,
  Loader2,
  CheckCircle2
} from "lucide-react";

interface AddAthleteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddAthleteModal({ isOpen, onClose }: AddAthleteModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    weight: "",
    height: "",
    birthDate: "",
    cabor: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const res = await fetch("/api/gsheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "addAthlete", payload: formData })
      });

      if (!res.ok) throw new Error("Failed to add athlete");

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        setFormData({
          username: "",
          password: "",
          name: "",
          weight: "",
          height: "",
          birthDate: "",
          cabor: ""
        });
      }, 2000);
    } catch (error) {
      console.error("Failed to add athlete", error);
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/5 rounded-[32px] md:rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 max-h-[90vh] overflow-y-auto">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gold-600/10 border border-gold-600/20 flex items-center justify-center">
                <UserPlus className="w-5 h-5 md:w-6 md:h-6 text-gold-600" />
              </div>
              <div className="space-y-1">
                 <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter leading-none">Register Athlete</h3>
                 <p className="text-[8px] md:text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none">New roster deployment</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 md:p-3 bg-white/5 border border-white/5 rounded-xl md:rounded-2xl text-zinc-500 hover:text-white transition-all active:scale-95"
            >
              <X className="w-4 h-4 ml-0" />
            </button>
          </div>

          {isSuccess ? (
            <div className="py-12 md:py-20 flex flex-col items-center justify-center space-y-4 md:space-y-6 animate-in zoom-in-90 duration-500">
               <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-emerald-500" />
               </div>
               <div className="text-center space-y-1 md:space-y-2">
                  <h4 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">Athlete Registered!</h4>
                  <p className="text-xs text-zinc-500">The credentials have been activated.</p>
               </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {/* Credentials Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] md:text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2">Username</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-gold-600 transition-colors" />
                    <input 
                      type="text"
                      name="username"
                      required
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/5 rounded-xl md:rounded-2xl py-3 md:py-4 pl-12 pr-4 text-xs md:text-sm text-white outline-none focus:border-gold-600/30 transition-all placeholder:text-zinc-800"
                      placeholder="atlet01"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] md:text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-gold-600 transition-colors" />
                    <input 
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/5 rounded-xl md:rounded-2xl py-3 md:py-4 pl-12 pr-4 text-xs md:text-sm text-white outline-none focus:border-gold-600/30 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] md:text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2">Full Name</label>
                  <div className="relative group">
                    <input 
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/5 rounded-xl md:rounded-2xl py-3 md:py-4 px-5 md:px-6 text-xs md:text-sm text-white outline-none focus:border-gold-600/30 transition-all"
                      placeholder="Athlete's full name"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] md:text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2">Cabor (Sports Branch)</label>
                  <div className="relative group">
                    <input 
                      type="text"
                      name="cabor"
                      required
                      value={formData.cabor}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/5 rounded-xl md:rounded-2xl py-3 md:py-4 px-5 md:px-6 text-xs md:text-sm text-white outline-none focus:border-gold-600/30 transition-all"
                      placeholder="e.g., Football, Swimming..."
                    />
                  </div>
                </div>
              </div>

              {/* Stats Section */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] md:text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2">Weight (kg)</label>
                  <div className="relative group">
                    <Weight className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input 
                      type="number"
                      name="weight"
                      required
                      value={formData.weight}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/5 rounded-xl md:rounded-2xl py-3 md:py-4 pl-12 pr-4 text-xs md:text-sm text-white outline-none focus:border-gold-600/30 transition-all"
                      placeholder="70"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] md:text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2">Height (cm)</label>
                  <div className="relative group">
                    <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input 
                      type="number"
                      name="height"
                      required
                      value={formData.height}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/5 rounded-xl md:rounded-2xl py-3 md:py-4 pl-12 pr-4 text-xs md:text-sm text-white outline-none focus:border-gold-600/30 transition-all"
                      placeholder="175"
                    />
                  </div>
                </div>
                <div className="space-y-1.5 col-span-2 md:col-span-1">
                  <label className="text-[9px] md:text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2">Birth Date</label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input 
                      type="date"
                      name="birthDate"
                      required
                      value={formData.birthDate}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/5 rounded-xl md:rounded-2xl py-3 md:py-4 pl-12 pr-4 text-xs md:text-sm text-white outline-none focus:border-gold-600/30 transition-all [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full relative overflow-hidden group bg-gold-600 hover:bg-gold-500 text-zinc-950 font-black py-3.5 md:py-4 rounded-xl md:rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 md:mt-4"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="text-xs md:text-sm">INITIALIZE ROSTER</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
