'use client';

import { User } from 'lucide-react';

interface HeaderProps {
  userName: string;
  userEmail: string;
}

/**
 * Header component for the dashboard.
 * Author: benodeveloper
 */
export default function Header({ userName, userEmail }: HeaderProps) {
  return (
    <header className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-500">Welcome back,</span>
        <span className="text-sm font-bold text-slate-900">{userName}</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-bold text-slate-900">{userName}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">{userEmail}</p>
        </div>
        <div className="h-9 w-9 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
          <User size={18} />
        </div>
      </div>
    </header>
  );
}
