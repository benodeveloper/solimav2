'use client';

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { Channel } from '@/src/db/schema';
import { useState } from 'react';
import { Edit2, Trash2, Search, Filter, ChevronUp, ChevronDown, Radio } from 'lucide-react';
import Button from '@/src/components/ui/Button';
import { deleteChannelAction } from '@/src/actions/channel.actions';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '@/src/components/ui/Modal';
import { useRouter } from 'next/navigation';
import { clsx } from 'clsx';

interface ChannelTableProps {
  data: Channel[];
}

const columnHelper = createColumnHelper<Channel>();

/**
 * Advanced Channel Table using TanStack Table.
 * Author: benodeveloper
 * Website: https://www.benodeveloper.com
 */
export default function ChannelTable({ data }: ChannelTableProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [deleteChannel, setDeleteChannel] = useState<Channel | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteChannelAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      setDeleteChannel(null);
      setIsDeleting(false);
    },
  });

  const handleDelete = async () => {
    if (!deleteChannel) return;
    setIsDeleting(true);
    deleteMutation.mutate(deleteChannel.id);
  };

  const columns = [
    columnHelper.accessor('num', {
      header: 'No.',
      cell: (info) => (
        <span className="font-medium text-slate-500">{info.getValue() || '-'}</span>
      ),
    }),
    columnHelper.accessor('name', {
      header: 'Channel Name',
      cell: (info) => {
        const logo = (info.row.original as any).logo?.thumbnail;
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-center shrink-0">
              {logo ? (
                <img src={logo} alt={info.getValue()} className="h-full w-full object-cover" />
              ) : (
                <Radio className="h-4 w-4 text-slate-300" />
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900">{info.getValue()}</span>
                {info.row.original.is_adult && (
                  <span className="inline-flex items-center rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-tight text-red-600 ring-1 ring-inset ring-red-600/10">
                    18+
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">ID: {info.row.original.id}</span>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => {
        const status = info.getValue();
        return (
          <span className={clsx(
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
            status === 'active' ? "bg-emerald-50 text-emerald-700 ring-emerald-600/10" :
              status === 'inactive' ? "bg-amber-50 text-amber-700 ring-amber-600/10" :
                "bg-slate-50 text-slate-700 ring-slate-600/10"
          )}>
            {status}
          </span>
        );
      },
    }),
    columnHelper.accessor('created_at', {
      header: 'Created',
      cell: (info) => (
        <span className="text-slate-500">
          {new Date(info.getValue()!).toLocaleDateString()}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => router.push(`/dashboard/channels/${info.row.original.id}/edit`)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 shadow-sm"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteChannel(info.row.original)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 shadow-sm"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Search & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search channels..."
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('name')?.setFilterValue(event.target.value)
            }
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-10 gap-2 border-slate-200 bg-white px-3 text-slate-600 hover:bg-slate-50">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="whitespace-nowrap px-6 py-4 font-bold uppercase tracking-wider text-[11px] text-slate-500"
                    >
                      <div
                        className={clsx(
                          "flex items-center gap-1.5",
                          header.column.getCanSort() ? "cursor-pointer select-none" : ""
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() === 'asc' && <ChevronUp className="h-3.5 w-3.5" />}
                        {header.column.getIsSorted() === 'desc' && <ChevronDown className="h-3.5 w-3.5" />}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="group transition-colors hover:bg-slate-50/80">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 text-slate-600">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="rounded-full bg-slate-100 p-3">
                        <Search className="h-6 w-6 text-slate-300" />
                      </div>
                      <p className="text-sm font-medium">No channels found</p>
                      <p className="text-xs">Try adjusting your filters or search terms</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={!!deleteChannel}
        onClose={() => setDeleteChannel(null)}
        title="Delete Channel"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete <span className="font-bold text-slate-900">{deleteChannel?.name}</span>? This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setDeleteChannel(null)}
              disabled={isDeleting}
              className="border-slate-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 shadow-sm shadow-red-200"
            >
              {isDeleting ? 'Deleting...' : 'Delete Channel'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
