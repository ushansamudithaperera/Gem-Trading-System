import React from 'react';
import { LucideIcon } from 'lucide-react';

type AccentColor = 'emerald' | 'blue' | 'amber' | 'sky' | 'indigo' | 'rose' | 'purple' | 'teal';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accentColor: AccentColor;
  trend?: { value: number; label: string };
}

const accentStyles: Record<AccentColor, {
  iconBg: string;
  iconText: string;
  iconRing: string;
  accentLine: string;
  trendUp: string;
  trendDown: string;
}> = {
  emerald: {
    iconBg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/80',
    iconText: 'text-emerald-600',
    iconRing: 'ring-1 ring-emerald-200/60',
    accentLine: 'from-emerald-400 to-emerald-600',
    trendUp: 'text-emerald-600 bg-emerald-50',
    trendDown: 'text-rose-600 bg-rose-50',
  },
  blue: {
    iconBg: 'bg-gradient-to-br from-blue-50 to-blue-100/80',
    iconText: 'text-blue-600',
    iconRing: 'ring-1 ring-blue-200/60',
    accentLine: 'from-blue-400 to-blue-600',
    trendUp: 'text-emerald-600 bg-emerald-50',
    trendDown: 'text-rose-600 bg-rose-50',
  },
  amber: {
    iconBg: 'bg-gradient-to-br from-amber-50 to-amber-100/80',
    iconText: 'text-amber-600',
    iconRing: 'ring-1 ring-amber-200/60',
    accentLine: 'from-amber-400 to-amber-500',
    trendUp: 'text-emerald-600 bg-emerald-50',
    trendDown: 'text-rose-600 bg-rose-50',
  },
  sky: {
    iconBg: 'bg-gradient-to-br from-sky-50 to-sky-100/80',
    iconText: 'text-sky-600',
    iconRing: 'ring-1 ring-sky-200/60',
    accentLine: 'from-sky-400 to-sky-600',
    trendUp: 'text-emerald-600 bg-emerald-50',
    trendDown: 'text-rose-600 bg-rose-50',
  },
  indigo: {
    iconBg: 'bg-gradient-to-br from-indigo-50 to-indigo-100/80',
    iconText: 'text-indigo-600',
    iconRing: 'ring-1 ring-indigo-200/60',
    accentLine: 'from-indigo-400 to-indigo-600',
    trendUp: 'text-emerald-600 bg-emerald-50',
    trendDown: 'text-rose-600 bg-rose-50',
  },
  rose: {
    iconBg: 'bg-gradient-to-br from-rose-50 to-rose-100/80',
    iconText: 'text-rose-600',
    iconRing: 'ring-1 ring-rose-200/60',
    accentLine: 'from-rose-400 to-rose-600',
    trendUp: 'text-emerald-600 bg-emerald-50',
    trendDown: 'text-rose-600 bg-rose-50',
  },
  purple: {
    iconBg: 'bg-gradient-to-br from-purple-50 to-purple-100/80',
    iconText: 'text-purple-600',
    iconRing: 'ring-1 ring-purple-200/60',
    accentLine: 'from-purple-400 to-purple-600',
    trendUp: 'text-emerald-600 bg-emerald-50',
    trendDown: 'text-rose-600 bg-rose-50',
  },
  teal: {
    iconBg: 'bg-gradient-to-br from-teal-50 to-teal-100/80',
    iconText: 'text-teal-600',
    iconRing: 'ring-1 ring-teal-200/60',
    accentLine: 'from-teal-400 to-teal-600',
    trendUp: 'text-emerald-600 bg-emerald-50',
    trendDown: 'text-rose-600 bg-rose-50',
  },
};

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, accentColor, trend }) => {
  const styles = accentStyles[accentColor];

  return (
    <div className="group relative rounded-2xl border border-white/60 bg-white/80 backdrop-blur-xl text-slate-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 overflow-hidden">
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${styles.accentLine} opacity-60 group-hover:opacity-100 transition-opacity duration-300`} />

      <div className="p-6 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</p>
          {trend && (
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${
              trend.value >= 0 ? styles.trendUp : styles.trendDown
            }`}>
              <span>{trend.value >= 0 ? '▲' : '▼'}</span>
              <span>{Math.abs(trend.value)}% {trend.label}</span>
            </div>
          )}
        </div>

        {/* Icon container */}
        <div className={`${styles.iconBg} ${styles.iconRing} p-3.5 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105`}>
          <Icon className={`h-6 w-6 ${styles.iconText}`} />
        </div>
      </div>
    </div>
  );
};
