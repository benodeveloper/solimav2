'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getVodCategoriesAction } from '@/src/actions/vod-stream.actions';
import { Check, ChevronsUpDown, X, Loader2, Tag } from 'lucide-react';
import { clsx } from 'clsx';

interface CategoryMultiSelectProps {
  selectedCategoryIds: number[];
  onChange: (ids: number[]) => void;
}

/**
 * Multi-select component for VOD Categories with search and visual tags.
 * 
 * Author: benodeveloper
 * Website: https://www.benodeveloper.com
 */
export default function VodCategoryMultiSelect({ selectedCategoryIds, onChange }: CategoryMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['vod-categories'],
    queryFn: () => getVodCategoriesAction(),
  });

  const filteredCategories = useMemo(() => {
    return categories.filter((cat: any) =>
      cat.category_name.toLowerCase().includes(search.toLowerCase())
    );
  }, [categories, search]);

  const selectedCategories = useMemo(() => {
    return categories.filter((cat: any) => selectedCategoryIds.includes(cat.id));
  }, [categories, selectedCategoryIds]);

  const toggleCategory = (id: number) => {
    if (selectedCategoryIds.includes(id)) {
      onChange(selectedCategoryIds.filter(i => i !== id));
    } else {
      onChange([...selectedCategoryIds, id]);
    }
  };

  const removeCategory = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedCategoryIds.filter(i => i !== id));
  };

  return (
    <div className="relative w-full">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "flex min-h-[44px] w-full cursor-pointer flex-wrap items-center gap-1.5 rounded-xl border bg-white px-3 py-2 text-sm transition-all focus-within:ring-4 focus-within:ring-emerald-500/10 shadow-sm",
          isOpen ? "border-emerald-500 ring-4 ring-emerald-500/10" : "border-slate-200 hover:border-slate-300"
        )}
      >
        {selectedCategories.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {selectedCategories.slice(0, 3).map((cat: any) => (
              <span
                key={cat.id}
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
              >
                {cat.category_name}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-emerald-900"
                  onClick={(e) => removeCategory(cat.id, e)}
                />
              </span>
            ))}
            {selectedCategories.length > 3 && (
              <span className="inline-flex items-center rounded-lg bg-slate-50 px-2 py-1 text-xs font-bold text-slate-600 ring-1 ring-inset ring-slate-200">
                +{selectedCategories.length - 3} more
              </span>
            )}
          </div>
        ) : (
          <span className="text-slate-400 font-medium">Filter by VOD category...</span>
        )}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
          <ChevronsUpDown className="h-4 w-4 text-slate-400" />
        </div>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full z-20 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="relative mb-2">
              <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                autoFocus
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border-none bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
              />
            </div>

            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((cat: any) => (
                  <div
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={clsx(
                      "flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
                      selectedCategoryIds.includes(cat.id)
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <span>{cat.category_name}</span>
                    {selectedCategoryIds.includes(cat.id) && (
                      <Check className="h-4 w-4 text-emerald-600" />
                    )}
                  </div>
                ))
              ) : (
                <div className="px-3 py-6 text-center text-xs font-bold uppercase tracking-widest text-slate-400">
                  No categories found
                </div>
              )}
            </div>

            {selectedCategoryIds.length > 0 && (
              <div className="mt-2 border-t border-slate-100 p-2">
                <button
                  onClick={() => onChange([])}
                  className="w-full rounded-lg py-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 hover:text-red-500 transition-all"
                >
                  Clear Selection
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
