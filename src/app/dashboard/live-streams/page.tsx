'use client';

import { Suspense, useState } from 'react';
import LiveStreamTable from '@/src/components/dashboard/LiveStreamTable';
import SyncLiveStreamsModal from '@/src/components/dashboard/SyncLiveStreamsModal';
import { Radio, Loader2, RefreshCw } from 'lucide-react';
import Button from '@/src/components/ui/Button';

/**
 * Live Streams Dashboard Page.
 * Lists all live streams from the database with advanced filtering and sync capability.
 * 
 * Author: benodeveloper
 * Website: https://www.benodeveloper.com
 */
export default function LiveStreamsPage() {
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-8 p-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 shadow-xl shadow-emerald-200/50">
            <Radio className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Live Streams</h1>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Broadcast Library</p>
          </div>
        </div>

        <Button 
          onClick={() => setIsSyncModalOpen(true)}
          className="h-11 gap-2 bg-slate-900 px-5 text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-800"
        >
          <RefreshCw className="h-4 w-4" />
          Sync Streams
        </Button>
      </div>

      <div className="w-full">
        <Suspense fallback={
          <div className="flex h-96 items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
                <Loader2 className="relative h-10 w-10 animate-spin text-emerald-500" />
              </div>
              <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Loading stream data...</p>
            </div>
          </div>
        }>
          <LiveStreamTable />
        </Suspense>
      </div>

      <SyncLiveStreamsModal 
        isOpen={isSyncModalOpen} 
        onClose={() => setIsSyncModalOpen(false)} 
      />
    </div>
  );
}
