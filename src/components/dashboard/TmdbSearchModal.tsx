'use client';

import { useState } from 'react';
import { Search, Film, Calendar, Star, Loader2, Check } from 'lucide-react';
import { searchTmdbMoviesAction } from '@/src/actions/movie.actions';
import Modal from '@/src/components/ui/Modal';
import Button from '@/src/components/ui/Button';
import { clsx } from 'clsx';

interface TmdbSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (tmdbId: number) => void;
}

/**
 * Modal for searching movies on TMDB and selecting one to import.
 * 
 * Author: benodeveloper
 * Website: https://www.benodeveloper.com
 */
export default function TmdbSearchModal({ isOpen, onClose, onSelect }: TmdbSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const data = await searchTmdbMoviesAction(query);
      if (data.results) {
        setResults(data.results);
      }
    } catch (error) {
      console.error('TMDB Search Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Search TMDB"
      size="2xl"
    >
      <div className="flex flex-col gap-6">
        <form onSubmit={handleSearch} className="relative group">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            autoFocus
            placeholder="Search movie title (e.g. Inception, The Dark Knight)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-32 text-sm font-bold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
          />
          <Button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 top-2 bottom-2 bg-slate-900 hover:bg-slate-800 rounded-xl px-6"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
          </Button>
        </form>

        <div className="max-h-[500px] overflow-y-auto custom-scrollbar pr-2 -mr-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
                <Loader2 className="relative h-12 w-12 animate-spin text-emerald-500" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Scanning TMDB database...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {results.map((movie) => (
                <div
                  key={movie.id}
                  onClick={() => onSelect(movie.id)}
                  className="group flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-3 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all cursor-pointer shadow-sm hover:shadow-md"
                >
                  <div className="h-24 w-16 overflow-hidden rounded-lg border border-slate-100 bg-slate-50 shrink-0">
                    {movie.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                        alt={movie.title}
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Film className="h-6 w-6 text-slate-200" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="truncate font-black text-slate-900 group-hover:text-emerald-700 transition-colors">{movie.title}</h4>
                      <div className="flex items-center gap-1 shrink-0 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        <span className="text-[10px] font-black text-amber-700">{movie.vote_average?.toFixed(1) || '0.0'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        {movie.release_date || 'N/A'}
                      </div>
                      <span>•</span>
                      <span>ID: {movie.id}</span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs text-slate-500 leading-relaxed font-medium">
                      {movie.overview || 'No overview available.'}
                    </p>
                  </div>
                  <div className="self-center pr-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-300 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
                      <Check className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : hasSearched ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
              <Film className="h-16 w-16 text-slate-100" />
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No movies found</p>
              <p className="text-xs text-slate-300 max-w-[200px]">Try searching with a different title or keyword.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
              <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center">
                <Search className="h-8 w-8 text-slate-200" />
              </div>
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Search TMDB</p>
              <p className="text-xs text-slate-300 max-w-[250px]">Find movies to import directly from the world's most popular movie database.</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
