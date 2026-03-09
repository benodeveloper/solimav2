'use client';

import { useState } from 'react';
import { Film, Plus, Search, Calendar, Star, Edit2, Trash2 } from 'lucide-react';
import Button from '@/src/components/ui/Button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPaginatedMoviesAction, deleteMovieAction } from '@/src/actions/movie.actions';
import Link from 'next/link';
import { clsx } from 'clsx';

/**
 * Movies Dashboard Page.
 * 
 * Author: benodeveloper
 * Website: https://www.benodeveloper.com
 */
export default function MoviesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['movies', page, search],
    queryFn: () => getPaginatedMoviesAction({ page, limit: 12, search }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteMovieAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
    },
  });

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this movie?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="flex flex-col gap-8 p-8 max-w-[1600px] mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 shadow-2xl shadow-slate-200">
            <Film className="h-8 w-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">Movie Studio</h1>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Production & Library Management</p>
          </div>
        </div>

        <Link href="/dashboard/movies/new">
          <Button className="h-14 gap-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest shadow-xl shadow-emerald-200 px-8 rounded-2xl transition-all active:scale-95">
            <Plus className="h-5 w-5" />
            Create Movie
          </Button>
        </Link>
      </div>

      {/* Stats & Filter Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white p-4 rounded-[24px] border border-slate-200 shadow-sm">
        <div className="relative w-full lg:max-w-md group">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            placeholder="Search movies by title..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-xl border-none bg-slate-50 py-3 pl-12 pr-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-emerald-500/10 transition-all"
          />
        </div>
        <div className="flex items-center gap-6 pr-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Titles</span>
            <span className="text-xl font-black text-slate-900">{data?.total || 0}</span>
          </div>
        </div>
      </div>

      {/* Grid Section */}
      <div className="w-full">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-[450px] rounded-[32px] bg-white border border-slate-100 animate-pulse" />
            ))}
          </div>
        ) : data?.items && data.items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.items.map((movie: any) => (
              <div key={movie.id} className="group relative flex flex-col bg-white rounded-[32px] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 overflow-hidden">
                {/* Poster Container */}
                <div className="aspect-[2/3] w-full overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <img
                    src={movie.tmdb_id ? `https://image.tmdb.org/t/p/w500${movie.tmdb_id}` : '/placeholder-movie.jpg'} // Simplified for now
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt={movie.title}
                    onError={(e) => {
                      (e.target as any).src = 'https://placehold.co/400x600/f8fafc/94a3b8?text=NO+POSTER';
                    }}
                  />

                  {/* Floating Badge */}
                  <div className="absolute top-4 left-4 z-20">
                    <span className={clsx(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md",
                      movie.status === 'Published' ? "bg-emerald-500/90 text-white" : "bg-slate-900/90 text-white"
                    )}>
                      {movie.status}
                    </span>
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute bottom-6 left-6 right-6 z-20 flex gap-2 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-75">
                    <Link href={`/dashboard/movies/${movie.id}/edit`} className="flex-1">
                      <Button className="w-full h-11 bg-white text-slate-900 hover:bg-emerald-500 hover:text-white font-black uppercase tracking-widest text-[10px] rounded-xl gap-2 shadow-xl shadow-black/20">
                        <Edit2 className="h-3 w-3" />
                        Edit Info
                      </Button>
                    </Link>
                    <button
                      onClick={() => handleDelete(movie.id)}
                      className="h-11 w-11 bg-red-500/90 text-white hover:bg-red-600 rounded-xl flex items-center justify-center shadow-xl shadow-black/20 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Info Container */}
                <div className="p-6">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="text-lg font-black text-slate-900 truncate tracking-tight">{movie.title}</h3>
                    <div className="flex items-center gap-1 shrink-0">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      <span className="text-xs font-black text-slate-900">{movie.vote_average?.toFixed(1) || '0.0'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {/** movie.release_date || 'N/A' **/}
                    </div>
                    <span>•</span>
                    <span>{movie.runtime || 0} MIN</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 rounded-[40px] border-2 border-dashed border-slate-200 bg-white/50">
            <Film className="h-16 w-16 text-slate-200 mb-4" />
            <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">Your Studio is Empty</h3>
            <p className="text-sm text-slate-300 mt-1 mb-8">Start your cinematic journey by creating your first movie entry.</p>
            <Link href="/dashboard/movies/new">
              <Button className="bg-slate-900 text-white rounded-xl px-8 h-12 font-black uppercase tracking-widest gap-2">
                <Plus className="h-5 w-5" />
                New Production
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {/* Simple pagination for now */}
        </div>
      )}
    </div>
  );
}
