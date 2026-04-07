import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: string;
    isUp: boolean;
  };
  variant?: "default" | "gold";
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  variant = "default",
}: StatCardProps) {
  return (
    <div className="bg-[#141414] border border-[rgba(212,175,55,0.1)] rounded-2xl p-4 md:p-6 hover:shadow-[0_0_30px_-10px_rgba(212,175,55,0.3)] transition-all group">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 flex-1">
          <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 group-hover:text-gold-600 transition-colors line-clamp-1">
            {title}
          </p>
          <div className="flex items-baseline gap-1 md:gap-2">
            <h3 className="text-xl md:text-3xl font-black text-white tracking-tight">
              {value}
            </h3>
            {trend && (
              <span
                className={`text-[8px] md:text-[10px] font-bold ${
                  trend.isUp ? "text-emerald-500" : "text-rose-500"
                }`}
              >
                {trend.isUp ? "↑" : "↓"} {trend.value}
              </span>
            )}
          </div>
          {description && (
            <p className="hidden md:block text-[10px] text-zinc-600 font-medium line-clamp-1">{description}</p>
          )}
        </div>
        <div
          className={`p-2 md:p-3 rounded-xl border ${
            variant === "gold"
              ? "bg-gold-600/10 border-gold-600/20 text-gold-600 shadow-[0_0_15px_-5px_rgba(212,175,55,0.4)]"
              : "bg-white/5 border-white/5 text-zinc-500"
          } transition-all duration-300 group-hover:scale-110 shrink-0`}
        >
          <Icon className="w-4 h-4 md:w-5 md:h-5" />
        </div>
      </div>

      {/* Decorative Progress/Trend Line (Subtle) */}
      <div className="mt-4 md:mt-6 h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${
            variant === "gold" ? "bg-gold-600" : "bg-zinc-700"
          }`}
          style={{ width: "65%" }}
        />
      </div>
    </div>
  );
}
