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
    <div className="flex items-center justify-between p-4 md:p-5 bg-rose-500/5 border border-rose-500/10 hover:border-rose-500/30 rounded-[20px] md:rounded-2xl group transition-all gap-4">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 shrink-0">
           <ShieldAlert className="w-6 h-6 text-rose-500" />
        </div>
        <div className="space-y-1 min-w-0">
           <h4 className="text-xs md:text-sm font-black text-rose-500 uppercase tracking-widest truncate">{athlete.user.Name}</h4>
           <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <div className="flex items-center gap-1.5">
                 <span className="text-[10px] font-bold text-zinc-600 uppercase">ACWR:</span>
                 <span className={`text-[11px] font-black ${isHighACWR ? "text-rose-500" : "text-zinc-400"}`}>{athlete.metrics.acwr}</span>
              </div>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-zinc-800" />
              <div className="flex items-center gap-1.5">
                 <span className="text-[10px] font-bold text-zinc-600 uppercase">Strain:</span>
                 <span className={`text-[11px] font-black ${isHighStrain ? "text-rose-500" : "text-zinc-400"}`}>{athlete.metrics.strain}</span>
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
