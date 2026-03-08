'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Play, 
  X,
  History,
  Terminal
} from 'lucide-react';
import { startSyncLiveStreamsAction, getSyncTaskAction } from '@/src/actions/live-stream.actions';
import CategoryMultiSelect from './CategoryMultiSelect';
import Button from '@/src/components/ui/Button';
import Modal from '@/src/components/ui/Modal';
import { clsx } from 'clsx';

/**
 * Modal component for syncing live streams with real-time progress and logs.
 * 
 * Author: benodeveloper
 * Website: https://www.benodeveloper.com
 */
export default function SyncLiveStreamsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
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
      const id = await startSyncLiveStreamsAction(selectedCategoryIds);
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
      title="Synchronize Live Streams"
      size="xl"
    >
      <div className="flex flex-col gap-6">
        {!taskId ? (
          <div className="space-y-6">
            <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-100">
              <div className="flex gap-3">
                <RefreshCw className="h-5 w-5 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-900">Sync with Streaming API</h4>
                  <p className="mt-1 text-xs text-emerald-700 leading-relaxed">
                    This will fetch the latest categories and streams from your provider. 
                    You can sync everything or select specific categories to save time.
                  </p>
                </div>
              </div>
            </div>

            <CategoryMultiSelect 
              selectedCategoryIds={selectedCategoryIds} 
              onChange={setSelectedCategoryIds} 
            />

            <div className="flex items-center justify-between border-t border-slate-100 pt-6">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {selectedCategoryIds.length > 0 
                  ? `${selectedCategoryIds.length} categories selected` 
                  : "All categories will be synced"}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleStartSync} className="gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100">
                  <Play className="h-4 w-4 fill-current" />
                  Start Synchronization
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Progress Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {task?.status === 'running' ? (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                    <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                  </div>
                ) : task?.status === 'completed' ? (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {task?.status === 'running' ? 'Syncing Streams...' : 
                     task?.status === 'completed' ? 'Sync Completed' : 'Sync Failed'}
                  </h4>
                  <p className="text-xs text-slate-500">{task?.current_item || 'Preparing...'}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-slate-900">{task?.progress || 0}%</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                style={{ width: `${task?.progress || 0}%` }}
              />
            </div>

            {/* Logs Terminal */}
            <div className="group relative">
              <div className="absolute -top-2.5 left-4 flex items-center gap-1.5 bg-slate-900 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest text-slate-400 ring-1 ring-slate-800">
                <Terminal className="h-3 w-3" />
                Live Logs
              </div>
              <div 
                ref={scrollRef}
                className="h-48 w-full overflow-y-auto rounded-xl bg-slate-950 p-4 font-mono text-[11px] leading-relaxed text-slate-300 shadow-inner ring-1 ring-slate-800"
              >
                {logs.length > 0 ? (
                  logs.map((log: string, i: number) => (
                    <div key={i} className="mb-1 border-l-2 border-emerald-500/30 pl-2 hover:border-emerald-500 transition-colors">
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="text-slate-600 animate-pulse italic">Waiting for logs...</div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
              {!isSyncing && (
                <Button onClick={reset} variant="outline">Start New Sync</Button>
              )}
              <Button 
                onClick={onClose} 
                disabled={isSyncing}
                className={clsx(
                  task?.status === 'completed' ? "bg-emerald-600" : "bg-slate-900",
                  "text-white"
                )}
              >
                {isSyncing ? 'Syncing...' : 'Close Window'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
