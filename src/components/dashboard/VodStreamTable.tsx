'use client';

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
} from '@tanstack/react-table';
import { VodStream, VodCategory } from '@/src/db/schema';
import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Film, Play, Loader2, ArrowUpDown, ArrowUp, ArrowDown, Star, Info } from 'lucide-react';
import { getPaginatedVodStreamsAction, getVodStreamUrlAction } from '@/src/actions/vod-stream.actions';
import { useQuery } from '@tanstack/react-query';
import VodCategoryMultiSelect from './VodCategoryMultiSelect';
import VideoPlayer from './VideoPlayer';
import Modal from '@/src/components/ui/Modal';
import { clsx } from 'clsx';

interface StreamWithCategory {
  stream: VodStream;
  category: VodCategory | null;
}

const columnHelper = createColumnHelper<StreamWithCategory>();

/**
 * VOD Stream Data Table with server-side pagination, sorting, and playback.
 * 
 * Author: benodeveloper
 * Website: https://www.benodeveloper.com
 */
export default function VodStreamTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [activeStream, setActiveStream] = useState<{ url: string; title: string } | null>(null);
  const [isFetchingUrl, setIsFetchingUrl] = useState<number | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['vod-streams', page, limit, search, selectedCategoryIds, sorting],
    queryFn: () => getPaginatedVodStreamsAction({ 
      page, 
      limit, 
      search, 
      categoryIds: selectedCategoryIds,
      orderBy: sorting.length > 0 ? sorting[0].id.replace('stream_', '').replace('category_', '') : 'created_at',
      orderDir: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : 'desc'
    }),
  });

  const handlePlay = async (stream: VodStream) => {
    try {
      setIsFetchingUrl(Number(stream.stream_id));
      const url = await getVodStreamUrlAction(Number(stream.stream_id), stream.container_extension || 'mp4');
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
      header: 'Movie Name',
      cell: (info) => {
        const icon = info.row.original.stream.stream_icon;
        const rating = info.row.original.stream.rating;
        const year = info.row.original.stream.added; // Sometimes 'added' is used for release year in some APIs, or just date added
        
        return (
          <div className="flex items-center gap-4">
            <div className="h-14 w-10 overflow-hidden rounded-md border border-slate-100 bg-slate-50 flex items-center justify-center shrink-0 shadow-sm">
              {icon ? (
                <img src={icon} alt={info.getValue()} className="h-full w-full object-cover" />
              ) : (
                <Film className="h-4 w-4 text-slate-300" />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate font-bold text-slate-900">{info.getValue()}</span>
                {info.row.original.stream.is_adult === 1 && (
                  <span className="inline-flex shrink-0 items-center rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-tight text-red-600 ring-1 ring-inset ring-red-600/10">
                    18+
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1">
                {rating && (
                  <div className="flex items-center gap-1 text-[10px] font-black text-amber-500 uppercase tracking-wider">
                    <Star className="h-3 w-3 fill-current" />
                    {rating}
                  </div>
                )}
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  ID: {info.row.original.stream.stream_id} • {info.row.original.stream.container_extension?.toUpperCase() || 'MP4'}
                </div>
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
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ring-1 ring-inset",
          info.getValue() 
            ? "bg-slate-50 text-slate-600 ring-slate-600/10" 
            : "bg-amber-50 text-amber-600 ring-amber-600/10"
        )}>
          {info.getValue() || 'Uncategorized'}
        </span>
      ),
    }),
    columnHelper.accessor('stream.tmdb', {
      header: 'TMDB',
      cell: (info) => (
        <span className="font-mono text-[11px] font-bold text-slate-500">
          {info.getValue() ? (
            <a 
              href={`https://www.themoviedb.org/movie/${info.getValue()}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-emerald-600 flex items-center gap-1"
            >
              {info.getValue()}
              <Info className="h-3 w-3" />
            </a>
          ) : '-'}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => (
        <div className="flex items-center justify-end gap-2">
          {info.row.original.stream.trailer && (
            <a
              href={info.row.original.stream.trailer}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 shadow-sm"
              title="Watch Trailer"
            >
              <Film className="h-4 w-4" />
            </a>
          )}
          <button
            onClick={() => handlePlay(info.row.original.stream)}
            disabled={isFetchingUrl === Number(info.row.original.stream.stream_id)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-900 text-white transition-all hover:bg-slate-800 shadow-sm disabled:opacity-50"
            title="Play Movie"
          >
            {isFetchingUrl === Number(info.row.original.stream.stream_id) ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4 fill-current" />
            )}
          </button>
        </div>
      ),
    }),
  ], [isFetchingUrl]);

  const table = useReactTable({
    data: data?.items || [],
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Filters Header */}
      <div className="flex flex-col gap-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm shadow-slate-100/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Movie Library</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
              {data?.total || 0} Titles
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="text-xs font-black uppercase tracking-widest text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-4 focus:ring-slate-100 cursor-pointer transition-all"
            >
              <option value={10}>10 Per Page</option>
              <option value={25}>25 Per Page</option>
              <option value={50}>50 Per Page</option>
              <option value={100}>100 Per Page</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-500" />
              <input
                placeholder="Search by movie title, ID or TMDB..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-12 pr-4 text-sm text-slate-900 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 font-bold"
              />
            </div>
          </div>
          <div className="lg:col-span-4">
            <VodCategoryMultiSelect
              selectedCategoryIds={selectedCategoryIds}
              onChange={(ids) => { setSelectedCategoryIds(ids); setPage(1); }}
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100">
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
                          "px-6 py-5 font-black uppercase tracking-[0.1em] text-[10px] text-slate-400",
                          isSortable && "cursor-pointer select-none hover:text-slate-900 transition-colors"
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-1.5">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {isSortable && (
                            <div className="text-slate-300">
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
                        <div className="h-5 bg-slate-50 rounded-lg w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr 
                    key={row.id} 
                    className="group transition-colors hover:bg-slate-50/50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-5 text-slate-600">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-32 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Film className="h-12 w-12 text-slate-200 mb-2" />
                      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No movies found</p>
                      <p className="text-xs text-slate-300">Try adjusting your filters or sync your library.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        {data && data.totalPages > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/30 px-6 py-5">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Page</span>
              <span className="inline-flex h-9 min-w-[36px] items-center justify-center rounded-xl bg-white px-2 text-xs font-black text-slate-900 shadow-sm ring-1 ring-slate-200">
                {page}
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">of {data.totalPages}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                disabled={page === data.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 shadow-sm"
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
        title={activeStream?.title || 'VOD Stream'}
        size="4xl"
        noPadding
      >
        <div className="bg-slate-950 aspect-video flex items-center justify-center overflow-hidden rounded-b-[28px]">
          {activeStream && (
            <VideoPlayer url={activeStream.url} title={activeStream.title} />
          )}
        </div>
      </Modal>
    </div>
  );
}
