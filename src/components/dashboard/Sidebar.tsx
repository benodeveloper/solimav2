'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Radio,
  Settings,
  LogOut,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Tv,
  History,
  Film
} from 'lucide-react';
import { logout } from '@/src/actions/auth.actions';
import { cn } from '@/src/lib/utils';

/**
 * Sidebar component for the dashboard.
 * Author: benodeveloper
 */
export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Update CSS variable for sidebar width
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-width',
      isCollapsed ? '80px' : '260px'
    );
  }, [isCollapsed]);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Channels', href: '/dashboard/channels', icon: Radio },
    { name: 'Live Streams', href: '/dashboard/live-streams', icon: Tv },
    { name: 'VOD Streams', href: '/dashboard/vod-streams', icon: Film },
    { name: 'Sync Tasks', href: '/dashboard/sync-tasks', icon: History },
    { name: 'Create Channel', href: '/dashboard/channels/new', icon: PlusCircle },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full bg-slate-950 border-r border-slate-800 flex flex-col transition-all duration-300 z-50",
        isCollapsed ? "w-[80px]" : "w-[260px]"
      )}
    >
      <div className={cn(
        "p-6 border-b border-slate-800 flex items-center justify-between",
        isCollapsed ? "px-4" : "px-6"
      )}>
        {!isCollapsed && (
          <h1 className="text-xl font-black tracking-tighter text-emerald-500 animate-in fade-in duration-500">
            SOLIMA
          </h1>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center mx-auto">
            <Radio size={20} className="text-white" />
          </div>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isActive
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-100",
                isCollapsed && "justify-center px-0"
              )}
              title={isCollapsed ? item.name : ""}
            >
              <Icon
                size={20}
                className={cn(
                  "transition-colors",
                  isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300"
                )}
              />
              {!isCollapsed && <span className="animate-in fade-in slide-in-from-left-2 duration-300">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <button
          onClick={() => logout()}
          className={cn(
            "flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all group",
            isCollapsed && "justify-center px-0"
          )}
          title={isCollapsed ? "Log Out" : ""}
        >
          <LogOut size={20} className="text-slate-500 group-hover:text-red-400 transition-colors" />
          {!isCollapsed && <span className="animate-in fade-in slide-in-from-left-2 duration-300">Log Out</span>}
        </button>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex w-full items-center justify-center p-2 rounded-lg text-slate-500 hover:bg-slate-900 hover:text-slate-100 transition-all border border-slate-800/50 mt-4"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
    </aside>
  );
}
