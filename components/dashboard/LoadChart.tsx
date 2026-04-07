"use client";

import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface LoadChartProps {
  data: any[];
  title?: string;
  subtitle?: string;
}

export default function LoadChart({ data, title, subtitle }: LoadChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Format data for Recharts (reverse to chronological order)
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return [...data].reverse().slice(-14).map(d => ({
      name: new Date(d.Date).toLocaleDateString('en-US', { weekday: 'short' }),
      load: d.load,
    }));
  }, [data]);

  if (!isMounted) {
    return (
      <div className="w-full h-full min-h-[300px] bg-white/5 animate-pulse rounded-3xl border border-white/5 flex items-center justify-center">
         <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Initializing Analytics...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full h-full min-h-[300px] flex flex-col">
      <div className="mb-8 flex flex-col gap-1">
        <p className="text-[10px] font-extrabold uppercase tracking-[.3em] text-gold-600/60">
          Workload Metrics
        </p>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-widest uppercase">
            {title || "Load Analytics"}
          </h2>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gold-600"></div>
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Daily Load</span>
             </div>
          </div>
        </div>
        {subtitle && <p className="text-xs text-zinc-500 font-medium">{subtitle}</p>}
      </div>

      <div className="flex-1 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(255,255,255,0.03)"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#52525b", fontSize: 10, fontWeight: 700 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#52525b", fontSize: 10, fontWeight: 700 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#090909",
                border: "1px solid rgba(212, 175, 55, 0.2)",
                borderRadius: "12px",
                fontSize: "12px",
                color: "#fff",
              }}
              cursor={{ stroke: '#d4af37', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey="load"
              stroke="#d4af37"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorLoad)"
              animationBegin={0}
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Add memo helper
import { useMemo } from "react";
