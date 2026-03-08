'use client';

import { Suspense, useState } from 'react';
import VodStreamTable from '@/src/components/dashboard/VodStreamTable';
import SyncVodStreamsModal from '@/src/components/dashboard/SyncVodStreamsModal';
import { Film, Loader2, RefreshCw } from 'lucide-react';
import Button from '@/src/components/ui/Button';

/**
 * VOD Streams Dashboard Page.
 * Lists all movie titles from the database with advanced filtering and sync capability.
 * 
 * Author: benodeveloper
 * Website: https://www.benodeveloper.com
 */
export default function VodStreamsPage() {
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-8 p-8 max-w-[1600px] mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 shadow-2xl shadow-slate-200">
            <Film className="h-8 w-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">VOD Library</h1>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Video On Demand Collection</p>
          </div>
        </div>

        <Button 
          onClick={() => setIsSyncModalOpen(true)}
          className="h-12 gap-3 bg-slate-900 px-6 text-sm font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 rounded-xl"
        >
          <RefreshCw className="h-4 w-4 text-emerald-400" />
          Sync Library
        </Button>
      </div>

      <div className="w-full">
        <Suspense fallback={
          <div className="flex h-[600px] items-center justify-center rounded-[32px] border-2 border-dashed border-slate-200 bg-white/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
                <Loader2 className="relative h-12 w-12 animate-spin text-slate-900" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Accessing cinematic data...</p>
            </div>
          </div>
        }>
          <VodStreamTable />
        </Suspense>
      </div>

      <SyncVodStreamsModal 
        isOpen={isSyncModalOpen} 
        onClose={() => setIsSyncModalOpen(false)} 
      />
    </div>
  );
}
