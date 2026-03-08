'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Play, 
  Terminal,
  Film
} from 'lucide-react';
import { startSyncVodStreamsAction, getSyncTaskAction } from '@/src/actions/vod-stream.actions';
import VodCategoryMultiSelect from './VodCategoryMultiSelect';
import Button from '@/src/components/ui/Button';
import Modal from '@/src/components/ui/Modal';
import { clsx } from 'clsx';

/**
 * Modal component for syncing VOD streams with real-time progress and logs.
 * 
 * Author: benodeveloper
 * Website: https://www.benodeveloper.com
 */
export default function SyncVodStreamsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [taskId, setTaskId] = useState<number | null>(null);
  const [task, setTask] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Polling for task status
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (taskId && isSyncing) {
      interval = setInterval(async () => {
        const updatedTask = await getSyncTaskAction(taskId);
        setTask(updatedTask);

        if (updatedTask.status === 'completed' || updatedTask.status === 'failed') {
          setIsSyncing(false);
          clearInterval(interval);
        }
      }, 1500);
    }

    return () => clearInterval(interval);
  }, [taskId, isSyncing]);

  // Auto-scroll logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [task?.logs]);

  const handleStartSync = async () => {
    try {
      setIsSyncing(true);
      const id = await startSyncVodStreamsAction(selectedCategoryIds);
      setTaskId(id);
    } catch (error) {
      console.error('Failed to start sync:', error);
      setIsSyncing(false);
    }
  };

  const reset = () => {
    setTaskId(null);
    setTask(null);
    setIsSyncing(false);
    setSelectedCategoryIds([]);
  };

  const logs = task?.logs ? JSON.parse(task.logs) : [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={isSyncing ? () => {} : onClose}
      title="Synchronize Movie Library"
      size="xl"
    >
      <div className="flex flex-col gap-6">
        {!taskId ? (
          <div className="space-y-6">
            <div className="rounded-2xl bg-slate-900 p-5 text-white shadow-xl shadow-slate-200">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                  <Film className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-base font-black tracking-tight">Sync VOD Library</h4>
                  <p className="mt-1 text-xs font-medium text-slate-400 leading-relaxed">
                    Update your local movie collection with the latest titles from the provider. 
                    Syncing specific categories is faster for large libraries.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                Select Categories to Sync
              </label>
              <VodCategoryMultiSelect 
                selectedCategoryIds={selectedCategoryIds} 
                onChange={setSelectedCategoryIds} 
              />
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-6">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg">
                {selectedCategoryIds.length > 0 
                  ? `${selectedCategoryIds.length} Categories` 
                  : "All Categories"}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose} disabled={isSyncing} className="rounded-xl border-slate-200 font-bold">
                  Cancel
                </Button>
                <Button onClick={handleStartSync} className="gap-2 bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-200 rounded-xl px-6">
                  <Play className="h-4 w-4 fill-current" />
                  Start Sync
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Progress Header */}
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-4">
                {task?.status === 'running' ? (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                  </div>
                ) : task?.status === 'completed' ? (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 shadow-sm ring-1 ring-emerald-100">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  </div>
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 shadow-sm ring-1 ring-red-100">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                    {task?.status === 'running' ? 'Syncing Movies...' : 
                     task?.status === 'completed' ? 'Library Updated' : 'Sync Failed'}
                  </h4>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                    {task?.current_item || 'Initializing...'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-slate-900 tabular-nums">{task?.progress || 0}%</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-4 w-full overflow-hidden rounded-full bg-slate-100 p-1 shadow-inner">
              <div 
                className="h-full rounded-full bg-emerald-500 transition-all duration-700 ease-out shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                style={{ width: `${task?.progress || 0}%` }}
              />
            </div>

            {/* Logs Terminal */}
            <div className="group relative">
              <div className="absolute -top-2.5 left-4 flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400 shadow-xl ring-1 ring-slate-800 z-10">
                <Terminal className="h-3 w-3 text-emerald-500" />
                Processing Logs
              </div>
              <div 
                ref={scrollRef}
                className="h-56 w-full overflow-y-auto rounded-2xl bg-slate-950 p-6 font-mono text-[11px] leading-relaxed text-slate-300 shadow-2xl ring-1 ring-slate-800 custom-scrollbar"
              >
                {logs.length > 0 ? (
                  logs.map((log: string, i: number) => (
                    <div key={i} className="mb-2 flex gap-3 group/log">
                      <span className="text-slate-700 select-none font-bold">{String(i + 1).padStart(3, '0')}</span>
                      <span className="text-slate-400 group-hover/log:text-emerald-400 transition-colors">{log}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-600 animate-pulse italic gap-2">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    Waiting for data...
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
              {!isSyncing && (
                <Button onClick={reset} variant="outline" className="rounded-xl border-slate-200 font-bold">
                  New Sync Task
                </Button>
              )}
              <Button 
                onClick={onClose} 
                disabled={isSyncing}
                className={clsx(
                  task?.status === 'completed' ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-900 hover:bg-slate-800",
                  "text-white rounded-xl px-8 font-black shadow-lg shadow-slate-200 transition-all active:scale-95"
                )}
              >
                {isSyncing ? 'Synchronizing...' : 'Dismiss'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
