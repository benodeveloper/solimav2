'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, X, Check, Loader2 } from 'lucide-react';
import { getPaginatedCategoriesAction } from '@/src/actions/live-stream.actions';
import { LiveCategory } from '@/src/db/schema';
import { clsx } from 'clsx';
import { useQuery } from '@tanstack/react-query';

interface CategoryMultiSelectProps {
  selectedCategoryIds: number[];
  onChange: (ids: number[]) => void;
}

/**
 * Multi-select component for categories with server-side search and pagination.
 * 
 * Author: benodeveloper
 * Website: https://www.benodeveloper.com
 */
export default function CategoryMultiSelect({ selectedCategoryIds, onChange }: CategoryMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['categories', search, page],
    queryFn: () => getPaginatedCategoriesAction(page, 10, search),
  });

  const categories = data?.items || [];
  const totalPages = data?.totalPages || 1;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleCategory = (id: number) => {
    if (selectedCategoryIds.includes(id)) {
      onChange(selectedCategoryIds.filter((cid) => cid !== id));
    } else {
      onChange([...selectedCategoryIds, id]);
    }
  };

  const removeCategory = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedCategoryIds.filter((cid) => cid !== id));
  };

  return (
    <div className="relative w-full max-w-xs" ref={dropdownRef}>
      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
        Filter by Categories
      </label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "flex min-h-[42px] w-full cursor-pointer flex-wrap items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 transition-all focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500",
          isOpen ? "border-emerald-500 ring-1 ring-emerald-500" : "border-slate-200 hover:border-slate-300"
        )}
      >
        {selectedCategoryIds.length === 0 ? (
          <span className="text-sm text-slate-400">Select categories...</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {selectedCategoryIds.slice(0, 2).map((id) => (
              <span
                key={id}
                className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/10"
              >
                ID: {id}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-emerald-900"
                  onClick={(e) => removeCategory(id, e)}
                />
              </span>
            ))}
            {selectedCategoryIds.length > 2 && (
              <span className="text-xs font-medium text-slate-500">
                +{selectedCategoryIds.length - 2} more
              </span>
            )}
          </div>
        )}
        <ChevronDown className={clsx("ml-auto h-4 w-4 text-slate-400 transition-transform", isOpen && "rotate-180")} />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-slate-900/5 animate-in fade-in zoom-in-95 duration-100">
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              autoFocus
              className="w-full rounded-md border border-slate-100 bg-slate-50 py-2 pl-8 pr-3 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="max-h-60 overflow-y-auto overflow-x-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-6 text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : categories.length > 0 ? (
              <div className="space-y-0.5">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={clsx(
                      "flex cursor-pointer items-center justify-between rounded-md px-2.5 py-2 text-sm transition-colors",
                      selectedCategoryIds.includes(category.id)
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <span className="truncate">{category.category_name}</span>
                    {selectedCategoryIds.includes(category.id) && <Check className="h-4 w-4 shrink-0" />}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">No categories found</div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 px-1">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-emerald-600 disabled:opacity-30"
              >
                Prev
              </button>
              <span className="text-[10px] font-medium text-slate-400">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-emerald-600 disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
