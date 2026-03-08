import { Suspense } from 'react';
import SyncTaskTable from '@/src/components/dashboard/SyncTaskTable';
import { History, Loader2 } from 'lucide-react';

/**
 * Page for monitoring and managing synchronization tasks.
 * 
 * Author: benodeveloper
 * Website: https://www.benodeveloper.com
 */
export default function SyncTasksPage() {
  return (
    <div className="flex flex-col gap-8 p-8">
      {/* Header section */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 shadow-xl shadow-slate-200">
          <History className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Sync Tasks</h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Operation History & Status</p>
        </div>
      </div>

      <div className="w-full">
        <Suspense fallback={
          <div className="flex h-96 items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              <p className="text-sm font-medium text-slate-400">Loading tasks...</p>
            </div>
          </div>
        }>
          <SyncTaskTable />
        </Suspense>
      </div>
    </div>
  );
}
