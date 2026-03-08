'use client';

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
} from '@tanstack/react-table';
import { LiveStream, LiveCategory } from '@/src/db/schema';
import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Radio, ExternalLink, Calendar, Play, Loader2, Plus, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { getPaginatedStreamsAction, getStreamUrlAction } from '@/src/actions/live-stream.actions';
import { createChannelFromLiveStreamAction, createChannelFromMultipleStreamsAction } from '@/src/actions/channel.actions';
import { useQuery, useMutation } from '@tanstack/react-query';
import CategoryMultiSelect from './CategoryMultiSelect';
import VideoPlayer from './VideoPlayer';
import Modal from '@/src/components/ui/Modal';
import Button from '@/src/components/ui/Button';
import { clsx } from 'clsx';
import { useRouter } from 'next/navigation';

interface StreamWithCategory {
  stream: LiveStream;
  category: LiveCategory | null;
}

const columnHelper = createColumnHelper<StreamWithCategory>();

/**
 * Live Stream Data Table with server-side pagination, sorting, and multi-selection.
 * 
 * Author: benodeveloper
 * Website: https://www.benodeveloper.com
 */
export default function LiveStreamTable() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [activeStream, setActiveStream] = useState<{ url: string; title: string } | null>(null);
  const [isFetchingUrl, setIsFetchingUrl] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ['live-streams', page, limit, search, selectedCategoryIds, sorting],
    queryFn: () => getPaginatedStreamsAction({ 
      page, 
      limit, 
      search, 
      categoryIds: selectedCategoryIds,
      orderBy: sorting.length > 0 ? sorting[0].id.replace('stream_', '').replace('category_', '') : 'created_at',
      orderDir: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : 'desc'
    }),
  });

  const createChannelMutation = useMutation({
    mutationFn: (streamId: number) => createChannelFromLiveStreamAction(streamId),
    onSuccess: (res: any) => {
      if (res.success && res.channelId) {
        router.push(`/dashboard/channels/${res.channelId}/edit`);
      } else {
        alert(res.error || 'Failed to create channel');
      }
    },
  });

  const createBulkChannelMutation = useMutation({
    mutationFn: (streamIds: number[]) => createChannelFromMultipleStreamsAction(streamIds),
    onSuccess: (res: any) => {
      if (res.success && res.channelId) {
        router.push(`/dashboard/channels/${res.channelId}/edit`);
      } else {
        alert(res.error || 'Failed to create channel');
      }
    },
  });

  const handlePlay = async (stream: LiveStream) => {
    try {
      setIsFetchingUrl(stream.stream_id);
      const url = await getStreamUrlAction(stream.stream_id);
      setActiveStream({ url, title: stream.name });
    } catch (error) {
      console.error('Failed to get stream URL:', error);
      alert('Could not retrieve stream URL. Please check your credentials.');
    } finally {
      setIsFetchingUrl(null);
    }
  };

  const columns = useMemo(() => [
    columnHelper.display({
      id: 'select',
      header: ({ table }) => (
        <div className="px-1">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="px-1">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
          />
        </div>
      ),
    }),
    columnHelper.accessor('stream.num', {
      header: 'No.',
      cell: (info) => (
        <span className="font-mono text-xs font-bold text-slate-400">{info.getValue() || '-'}</span>
      ),
    }),
    columnHelper.accessor('stream.name', {
      header: 'Stream Name',
      cell: (info) => {
        const icon = info.row.original.stream.stream_icon;
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-center shrink-0 shadow-sm">
              {icon ? (
                <img src={icon} alt={info.getValue()} className="h-full w-full object-cover" />
              ) : (
                <Radio className="h-4 w-4 text-slate-300" />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate font-semibold text-slate-900">{info.getValue()}</span>
                {info.row.original.stream.is_adult && (
                  <span className="inline-flex shrink-0 items-center rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-tight text-red-600 ring-1 ring-inset ring-red-600/10">
                    18+
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                <span>ID: {info.row.original.stream.stream_id}</span>
              </div>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor('category.category_name', {
      header: 'Category',
      cell: (info) => (
        <span className={clsx(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
          info.getValue() 
            ? "bg-slate-50 text-slate-700 ring-slate-600/10" 
            : "bg-amber-50 text-amber-600 ring-amber-600/10"
        )}>
          {info.getValue() || 'Uncategorized'}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); createChannelMutation.mutate(info.row.original.stream.id); }}
            disabled={createChannelMutation.isPending}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 shadow-sm disabled:opacity-50"
            title="Create Channel"
          >
            {createChannelMutation.isPending && createChannelMutation.variables === info.row.original.stream.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handlePlay(info.row.original.stream); }}
            disabled={isFetchingUrl === info.row.original.stream.stream_id}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 shadow-sm disabled:opacity-50"
            title="Play Stream"
          >
            {isFetchingUrl === info.row.original.stream.stream_id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4 fill-current" />
            )}
          </button>
        </div>
      ),
    }),
  ], [isFetchingUrl, createChannelMutation.isPending]);

  const table = useReactTable({
    data: data?.items || [],
    columns,
    state: {
      sorting,
      rowSelection,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.stream.id.toString(),
    manualPagination: true,
    manualSorting: true,
  });

  const selectedStreamIds = useMemo(() => 
    Object.keys(rowSelection).filter(key => rowSelection[key as keyof typeof rowSelection]).map(Number),
    [rowSelection]
  );
  
  const hasSelection = selectedStreamIds.length > 0;

  const handleCreateFromSelection = () => {
    createBulkChannelMutation.mutate(selectedStreamIds);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Bulk Actions */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Live Library</h2>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {data?.total || 0} Total Streams
            </span>
          </div>

          <div className="flex items-center gap-2">
            {hasSelection && (
              <Button 
                onClick={handleCreateFromSelection}
                disabled={createBulkChannelMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-200 animate-in fade-in zoom-in duration-200"
              >
                {createBulkChannelMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Create Channel ({selectedStreamIds.length})
              </Button>
            )}
            <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="text-xs font-bold text-slate-600 bg-transparent px-2 py-1.5 focus:outline-none cursor-pointer"
              >
                <option value={10}>10 rows</option>
                <option value={25}>25 rows</option>
                <option value={50}>50 rows</option>
                <option value={100}>100 rows</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-end">
          <div className="lg:col-span-8">
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-500" />
              <input
                placeholder="Search by stream name or ID..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-900 transition-all focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-sm font-medium"
              />
            </div>
          </div>
          <div className="lg:col-span-4">
            <CategoryMultiSelect
              selectedCategoryIds={selectedCategoryIds}
              onChange={(ids) => { setSelectedCategoryIds(ids); setPage(1); }}
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {table.getHeaderGroups().map((headerGroup) => (
                  headerGroup.headers.map((header) => {
                    const isSortable = header.column.getCanSort();
                    const sortDir = header.column.getIsSorted();

                    return (
                      <th
                        key={header.id}
                        className={clsx(
                          "px-6 py-4 font-bold uppercase tracking-wider text-[11px] text-slate-500",
                          isSortable && "cursor-pointer select-none hover:text-slate-900 transition-colors"
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-1">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {isSortable && (
                            <div className="text-slate-400">
                              {sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : 
                               sortDir === 'desc' ? <ArrowDown className="h-3 w-3" /> : 
                               <ArrowUpDown className="h-3 w-3 opacity-30" />}
                            </div>
                          )}
                        </div>
                      </th>
                    );
                  })
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: limit }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {columns.map((_, j) => (
                      <td key={j} className="px-6 py-6">
                        <div className="h-4 bg-slate-50 rounded w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr 
                    key={row.id} 
                    onClick={() => row.toggleSelected()}
                    className={clsx(
                      "group cursor-pointer transition-colors",
                      row.getIsSelected() ? "bg-emerald-50/30" : "hover:bg-slate-50/50"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 text-slate-600">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-20 text-center text-slate-400">
                    No streams found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        {data && data.totalPages > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/30 px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Page</span>
              <span className="inline-flex h-7 min-w-[28px] items-center justify-center rounded bg-white px-1.5 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200">
                {page}
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">of {data.totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                disabled={page === data.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 shadow-sm"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Playback Modal */}
      <Modal
        isOpen={!!activeStream}
        onClose={() => setActiveStream(null)}
        title={activeStream?.title || 'Live Stream'}
        size="4xl"
        noPadding
      >
        <div className="bg-slate-950">
          {activeStream && (
            <VideoPlayer url={activeStream.url} title={activeStream.title} />
          )}
        </div>
      </Modal>
    </div>
  );
}
