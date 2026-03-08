'use client';

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { SyncTask } from '@/src/db/schema';
import { useState, useMemo } from 'react';
import { 
  History, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Terminal, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Calendar,
  Clock
} from 'lucide-react';
import { getPaginatedSyncTasksAction, deleteSyncTaskAction } from '@/src/actions/live-stream.actions';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '@/src/components/ui/Modal';
import Button from '@/src/components/ui/Button';
import { clsx } from 'clsx';

const columnHelper = createColumnHelper<SyncTask>();

/**
 * Table for managing and monitoring synchronization tasks.
 * 
 * Author: benodeveloper
 * Website: https://www.benodeveloper.com
 */
export default function SyncTaskTable() {
  const [page, setPage] = useState(1);
  const [viewLogs, setViewLogs] = useState<SyncTask | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['sync-tasks', page],
    queryFn: () => getPaginatedSyncTasksAction(page, limit),
    refetchInterval: (query) => {
      // Auto-refresh if any task is running
      const items = query.state.data?.items || [];
      return items.some(t => t.status === 'running' || t.status === 'pending') ? 2000 : false;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSyncTaskAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sync-tasks'] });
      setDeleteId(null);
    }
  });

  const columns = useMemo(() => [
    columnHelper.accessor('id', {
      header: 'Task ID',
      cell: (info) => (
        <span className="font-mono text-xs font-bold text-slate-400">#{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => {
        const status = info.getValue();
        return (
          <div className="flex items-center gap-2">
            {status === 'running' ? (
              <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
            ) : status === 'completed' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : status === 'failed' ? (
              <AlertCircle className="h-4 w-4 text-red-500" />
            ) : (
              <Clock className="h-4 w-4 text-slate-400" />
            )}
            <span className={clsx(
              "text-[10px] font-black uppercase tracking-widest",
              status === 'completed' ? "text-emerald-600" :
              status === 'failed' ? "text-red-600" :
              status === 'running' ? "text-emerald-500" : "text-slate-400"
            )}>
              {status}
            </span>
          </div>
        );
      },
    }),
    columnHelper.accessor('progress', {
      header: 'Progress',
      cell: (info) => (
        <div className="flex w-32 items-center gap-3">
          <div className="h-1.5 w-full rounded-full bg-slate-100 ring-1 ring-slate-200">
            <div 
              className={clsx(
                "h-full rounded-full transition-all duration-500",
                info.row.original.status === 'failed' ? "bg-red-500" : "bg-emerald-500"
              )}
              style={{ width: `${info.getValue()}%` }}
            />
          </div>
          <span className="text-[10px] font-bold text-slate-600">{info.getValue()}%</span>
        </div>
      ),
    }),
    columnHelper.accessor('current_item', {
      header: 'Last Item / Info',
      cell: (info) => (
        <span className="truncate max-w-[200px] block text-xs font-medium text-slate-500">
          {info.getValue() || '-'}
        </span>
      ),
    }),
    columnHelper.accessor('created_at', {
      header: 'Started At',
      cell: (info) => (
        <div className="flex flex-col text-[10px] font-bold text-slate-400">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(info.getValue()!).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(info.getValue()!).toLocaleTimeString()}
          </span>
        </div>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setViewLogs(info.row.original)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all hover:border-slate-900 hover:bg-slate-900 hover:text-white shadow-sm"
            title="View Logs"
          >
            <Terminal className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteId(info.row.original.id)}
            disabled={info.row.original.status === 'running'}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 shadow-sm disabled:opacity-30"
            title="Delete Task"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    }),
  ], []);

  const table = useReactTable({
    data: data?.items || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  const logs = viewLogs?.logs ? JSON.parse(viewLogs.logs) : [];

  return (
    <div className="flex flex-col gap-6">
      {/* Table Content */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-6 py-4 font-bold uppercase tracking-wider text-[11px] text-slate-500">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-6">
                      <div className="h-8 bg-slate-50 rounded-lg w-full" />
                    </td>
                  </tr>
                ))
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="group transition-colors hover:bg-slate-50/50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 text-slate-300">
                        <History size={32} />
                      </div>
                      <p className="text-sm font-bold text-slate-900">No sync tasks found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/30 px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Page {page} of {data.totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page === data.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Logs Modal */}
      <Modal
        isOpen={!!viewLogs}
        onClose={() => setViewLogs(null)}
        title={`Logs for Task #${viewLogs?.id}`}
        size="2xl"
        noPadding
      >
        <div className="bg-slate-950 p-6">
          <div className="h-96 w-full overflow-y-auto rounded-xl bg-slate-900/50 p-4 font-mono text-[11px] leading-relaxed text-slate-300 shadow-inner ring-1 ring-white/5">
            {logs.length > 0 ? (
              logs.map((log: string, i: number) => (
                <div key={i} className="mb-1 border-l-2 border-emerald-500/30 pl-3 hover:border-emerald-500 transition-colors">
                  {log}
                </div>
              ))
            ) : (
              <div className="text-slate-600 italic">No logs recorded for this task.</div>
            )}
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Task Record"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Are you sure you want to delete this task record? This will only remove the history of the sync, not the synced data itself.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button onClick={() => deleteMutation.mutate(deleteId!)} className="bg-red-600 hover:bg-red-700">Delete Record</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
