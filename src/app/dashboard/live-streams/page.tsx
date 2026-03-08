import { Suspense } from 'react';
import LiveStreamTable from '@/src/components/dashboard/LiveStreamTable';
import { Radio, Loader2 } from 'lucide-react';

/**
 * Live Streams Dashboard Page.
 * Lists all live streams from the database with advanced filtering.
 * 
 * Author: benodeveloper
 * Website: https://www.benodeveloper.com
 */
export default function LiveStreamsPage() {
  return (
    <div className="flex flex-col gap-8 p-8">
      {/* Header section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-200">
            <Radio className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Live Streams</h1>
            <p className="text-sm font-medium text-slate-500">Manage and monitor your live broadcast library</p>
          </div>
        </div>
      </div>

      <div className="w-full">
        <Suspense fallback={
          <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              <p className="text-sm font-medium text-slate-400">Loading stream data...</p>
            </div>
          </div>
        }>
          <LiveStreamTable />
        </Suspense>
      </div>
    </div>
  );
}
