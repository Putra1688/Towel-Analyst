"use client";

import React from "react";
import { AlertCircle, User, ShieldAlert, ChevronRight } from "lucide-react";
import Link from "next/link";

interface AlertCardProps {
  athlete: {
    user: {
      User_ID: string;
      Name: string;
    };
    metrics: {
      acwr: number;
      strain: number;
    };
  };
}

export default function AlertCard({ athlete }: AlertCardProps) {
  const isHighACWR = athlete.metrics.acwr > 1.5;
  const isHighStrain = athlete.metrics.strain > 5000;

  return (
    <div className="flex items-center justify-between p-4 bg-rose-500/5 border border-rose-500/10 hover:border-rose-500/30 rounded-2xl group transition-all">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
           <ShieldAlert className="w-5 h-5 text-rose-500" />
        </div>
        <div className="space-y-0.5">
           <h4 className="text-xs font-black text-rose-500 uppercase tracking-widest">{athlete.user.Name}</h4>
           <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                 <span className="text-[9px] font-bold text-zinc-600 uppercase">ACWR:</span>
                 <span className={`text-[10px] font-black ${isHighACWR ? "text-rose-500" : "text-zinc-400"}`}>{athlete.metrics.acwr}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-zinc-800" />
              <div className="flex items-center gap-1">
                 <span className="text-[9px] font-bold text-zinc-600 uppercase">Strain:</span>
                 <span className={`text-[10px] font-black ${isHighStrain ? "text-rose-500" : "text-zinc-400"}`}>{athlete.metrics.strain}</span>
              </div>
           </div>
        </div>
      </div>
      
      <Link 
        href={`/dashboard/athlete/${athlete.user.User_ID}`}
        className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all transform active:scale-95"
      >
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
