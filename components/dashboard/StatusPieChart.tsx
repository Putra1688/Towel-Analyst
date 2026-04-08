"use client";

import React from "react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from "recharts";

interface StatusPieChartProps {
  data: {
    Optimal: number;
    Kurang: number;
    Overweight: number;
  };
}

export default function StatusPieChart({ data }: StatusPieChartProps) {
  const chartData = [
    { name: "Optimal", value: data?.Optimal || 0, color: "#d4af37" }, // Gold
    { name: "Kurang", value: data?.Kurang || 0, color: "#3f3f46" },  // Zinc-600
    { name: "Overweight", value: data?.Overweight || 0, color: "#a1a1aa" }, // Zinc-400
  ];

  // If no data at all, show empty state
  const hasData = data?.Optimal > 0 || data?.Kurang > 0 || data?.Overweight > 0;

  return (
    <div className="stat-card flex flex-col h-full bg-[#111] border-white/5 hover:border-gold-600/30">
      <div className="mb-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-gold-600">Body Composition</p>
        <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Sensus Kebugaran Tim</h3>
      </div>
      
      <div className="flex-1 min-h-[400px] w-full relative">
        {!hasData ? (
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
             <p className="text-[10px] font-black uppercase tracking-widest">No data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart margin={{ top: 0, right: 0, bottom: 20, left: 0 }}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={8}
                dataKey="value"
                stroke="transparent"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#090909",
                  border: "1px solid rgba(212, 175, 55, 0.2)",
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: "#fff",
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                align="center"
                iconType="circle"
                wrapperStyle={{ fontSize: '10px', paddingTop: '20px', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.1em' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
