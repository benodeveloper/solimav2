'use client';

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { LiveStream, LiveCategory } from '@/src/db/schema';
import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Radio, ExternalLink, Calendar, Play, Loader2, Plus } from 'lucide-react';
import { getPaginatedStreamsAction, getStreamUrlAction } from '@/src/actions/live-stream.actions';
import { createChannelFromLiveStreamAction } from '@/src/actions/channel.actions';
import { useQuery, useMutation } from '@tanstack/react-query';
import CategoryMultiSelect from './CategoryMultiSelect';
import VideoPlayer from './VideoPlayer';
import Modal from '@/src/components/ui/Modal';
import { clsx } from 'clsx';

interface StreamWithCategory {
  stream: LiveStream;
  category: LiveCategory | null;
}

const columnHelper = createColumnHelper<StreamWithCategory>();

/**
 * Live Stream Data Table with server-side pagination, search, and category filtering.
 * 
 * Author: benodeveloper
 * Website: https://www.benodeveloper.com
 */
export default function LiveStreamTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [activeStream, setActiveStream] = useState<{ url: string; title: string } | null>(null);
  const [isFetchingUrl, setIsFetchingUrl] = useState<string | null>(null);
  const limit = 10;

  const createChannelMutation = useMutation({
    mutationFn: (streamId: number) => createChannelFromLiveStreamAction(streamId),
    onSuccess: (res: any) => {
      if (res.success) {
        alert('Channel created successfully!');
      } else {
        alert(res.error || 'Failed to create channel');
      }
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['live-streams', page, search, selectedCategoryIds],
    queryFn: () => getPaginatedStreamsAction({ page, limit, search, categoryIds: selectedCategoryIds }),
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
                {info.row.original.stream.stream_type && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-slate-200" />
                    <span>{info.row.original.stream.stream_type}</span>
                  </>
                )}
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
    columnHelper.accessor('stream.tv_archive', {
      header: 'Archive',
      cell: (info) => (
        <div className="flex flex-col gap-0.5">
          <span className={clsx(
            "text-xs font-semibold",
            info.getValue() ? "text-emerald-600" : "text-slate-400"
          )}>
            {info.getValue() ? 'Available' : 'None'}
          </span>
          {info.getValue() && info.row.original.stream.tv_archive_duration ? (
            <span className="text-[10px] text-slate-400 font-medium">
              {info.row.original.stream.tv_archive_duration} days
            </span>
          ) : null}
        </div>
      ),
    }),
    columnHelper.accessor('stream.created_at', {
      header: 'Added',
      cell: (info) => (
        <div className="flex items-center gap-1.5 text-slate-500">
          <Calendar className="h-3.5 w-3.5 opacity-60" />
          <span className="text-xs">
            {new Date(info.getValue()!).toLocaleDateString()}
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
            onClick={() => createChannelMutation.mutate(info.row.original.stream.id)}
            disabled={createChannelMutation.isPending}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 shadow-sm disabled:opacity-50"
            title="Create Channel from Stream"
          >
            {createChannelMutation.isPending && createChannelMutation.variables === info.row.original.stream.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => handlePlay(info.row.original.stream)}
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
          {info.row.original.stream.direct_source && (
            <a
              href={info.row.original.stream.direct_source}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 shadow-sm"
              title="View Source"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      ),
    }),
  ], [isFetchingUrl]);

  const table = useReactTable({
    data: data?.items || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleCategoryChange = (ids: number[]) => {
    setSelectedCategoryIds(ids);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Filters Section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-end">
        <div className="lg:col-span-8">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-500" />
            <input
              placeholder="Search by stream name or ID..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-900 transition-all focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-sm"
            />
          </div>
        </div>
        <div className="lg:col-span-4">
          <CategoryMultiSelect
            selectedCategoryIds={selectedCategoryIds}
            onChange={handleCategoryChange}
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {table.getHeaderGroups().map((headerGroup) => (
                  headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-4 font-bold uppercase tracking-wider text-[11px] text-slate-500"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-6">
                      <div className="h-10 bg-slate-50 rounded-lg w-full" />
                    </td>
                  </tr>
                ))
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="group transition-colors hover:bg-slate-50/50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 text-slate-600">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                        <Radio className="h-8 w-8 text-slate-300" />
                      </div>
                      <div className="max-w-xs mx-auto">
                        <p className="text-base font-bold text-slate-900">No streams found</p>
                        <p className="mt-1 text-sm text-slate-500">We couldn't find any live streams matching your search or filters.</p>
                      </div>
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
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-white shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                disabled={page === data.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-white shadow-sm"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Video Player Modal */}
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
