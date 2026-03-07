'use client';

import { Users, Radio, Activity } from 'lucide-react';

interface StatsProps {
  total: number;
  active: number;
  inactive: number;
}

/**
 * Component to display summary statistics on the dashboard.
 * Author: benodeveloper
 */
export default function DashboardStats({ total, active, inactive }: StatsProps) {
  const stats = [
    { name: 'Total Channels', value: total, icon: Radio, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Active Channels', value: active, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'Inactive/Archived', value: inactive, icon: Users, color: 'text-slate-600', bg: 'bg-slate-50' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat) => (
        <div key={stat.name} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className={`h-10 w-10 rounded-lg ${stat.bg} flex items-center justify-center ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Summary</span>
          </div>
          <p className="text-3xl font-black text-slate-900">{stat.value}</p>
          <p className="text-sm font-semibold text-slate-500 mt-1">{stat.name}</p>
        </div>
      ))}
    </div>
  );
}
