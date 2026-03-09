'use client';

import { useState, useEffect } from 'react';
import { Movie, Media } from '@/src/db/schema';
import { MediaCollection } from '@/src/enums/media-collection.enum';
import Button from '@/src/components/ui/Button';
import Input from '@/src/components/ui/Input';
import { createMovieAction, updateMovieAction, getTmdbMovieDetailsAction } from '@/src/actions/movie.actions';
import { Film, Calendar, Clock, Star, Globe, Tag, Info, Search, Loader2, X } from 'lucide-react';
import { clsx } from 'clsx';
import TmdbSearchModal from './TmdbSearchModal';

interface MovieFormProps {
  movie?: any;
  onSuccess: (id: number) => void;
  onCancel: () => void;
}

/**
 * Advanced Movie Form with TMDB integration.
 * 
 * Author: benodeveloper
 * Website: https://www.benodeveloper.com
 */
export default function MovieForm({ movie, onSuccess, onCancel }: MovieFormProps) {
  const [loading, setLoading] = useState(false);
  const [fetchingTmdb, setFetchingTmdb] = useState(false);
  const [isTmdbModalOpen, setIsTmdbModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<any>({
    title: movie?.title || '',
    slug: movie?.slug || '',
    overview: movie?.overview || '',
    release_date: movie?.release_date || '',
    runtime: movie?.runtime || 0,
    tmdb_id: movie?.tmdb_id || '',
    imdb_id: movie?.imdb_id || '',
    adult: movie?.adult ?? 1,
    site: movie?.site || '',
    original_language: movie?.original_language || 'en',
    budget: movie?.budget || 0,
    revenue: movie?.revenue || 0,
    vote_average: movie?.vote_average || 0,
    vote_count: movie?.vote_count || 0,
    tagline: movie?.tagline || '',
    status: movie?.status || 'Draft',
  });

  const [previews, setPreviews] = useState({
    poster: movie?.media?.find((m: any) => m.collection_name === MediaCollection.POSTER)?.file_name,
    backdrop: movie?.media?.find((m: any) => m.collection_name === MediaCollection.BACKDROP)?.file_name,
  });

  const [tmdbMediaUrls, setTmdbMediaUrls] = useState<{ poster?: string; backdrop?: string }>({});

  const isEditing = !!movie;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleTmdbSelect = async (tmdbId: number) => {
    setIsTmdbModalOpen(false);
    setFetchingTmdb(true);
    setError(null);

    try {
      const details = await getTmdbMovieDetailsAction(tmdbId);
      if (details.error) throw new Error(details.error);

      setFormData({
        title: details.title,
        slug: details.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
        overview: details.overview,
        release_date: details.release_date,
        runtime: details.runtime,
        tmdb_id: String(details.id),
        imdb_id: details.imdb_id,
        adult: details.adult ? 1 : 0,
        site: details.homepage,
        original_language: details.original_language,
        budget: details.budget,
        revenue: details.revenue,
        vote_average: details.vote_average,
        vote_count: details.vote_count,
        tagline: details.tagline,
        status: details.status === 'Released' ? 'Published' : 'Draft',
      });

      setTmdbMediaUrls({
        poster: details.poster_path ? `https://image.tmdb.org/t/p/original${details.poster_path}` : undefined,
        backdrop: details.backdrop_path ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` : undefined,
      });

      setPreviews({
        poster: details.poster_path ? `https://image.tmdb.org/t/p/w342${details.poster_path}` : undefined,
        backdrop: details.backdrop_path ? `https://image.tmdb.org/t/p/w780${details.backdrop_path}` : undefined,
      });

    } catch (err: any) {
      setError(`Failed to fetch TMDB details: ${err.message}`);
    } finally {
      setFetchingTmdb(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = isEditing 
        ? await updateMovieAction(movie.id, formData)
        : await createMovieAction(formData, tmdbMediaUrls);

      if (result.error) throw new Error(result.error);
      onSuccess(isEditing ? movie.id : (result as any).movieId);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* TMDB Quick Import Header */}
      {!isEditing && (
        <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl shadow-slate-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Film className="h-32 w-32 -rotate-12" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-md">
              <h3 className="text-2xl font-black tracking-tight">Auto-fill with TMDB</h3>
              <p className="mt-2 text-sm font-medium text-slate-400 leading-relaxed">
                Save time by importing all movie metadata, posters, and backdrops directly from the TMDB database.
              </p>
            </div>
            <Button 
              onClick={() => setIsTmdbModalOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-widest px-8 h-14 rounded-2xl shadow-xl shadow-emerald-500/20 gap-3"
            >
              <Search className="h-5 w-5" />
              Search & Import
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                <Info className="h-5 w-5 text-slate-900" />
              </div>
              <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Basic Information</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input
                  label="Movie Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Interstellar"
                  required
                  className="font-bold"
                />
              </div>

              <div className="md:col-span-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Overview / Plot</label>
                  <textarea
                    name="overview"
                    value={formData.overview}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Enter movie plot summary..."
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-sm font-medium text-slate-900 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>
              </div>

              <Input
                label="Release Date"
                name="release_date"
                type="date"
                value={formData.release_date}
                onChange={handleChange}
                required
              />

              <Input
                label="Runtime (Minutes)"
                name="runtime"
                type="number"
                value={formData.runtime}
                onChange={handleChange}
                icon={<Clock className="h-4 w-4" />}
              />

              <div className="md:col-span-2">
                <Input
                  label="Tagline"
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleChange}
                  placeholder="e.g. Mankind was born on Earth. It was never meant to die here."
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                <Globe className="h-5 w-5 text-slate-900" />
              </div>
              <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Technical Details</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="TMDB ID"
                name="tmdb_id"
                value={formData.tmdb_id}
                onChange={handleChange}
                placeholder="e.g. 157336"
              />
              <Input
                label="IMDB ID"
                name="imdb_id"
                value={formData.imdb_id}
                onChange={handleChange}
                placeholder="e.g. tt1130884"
              />
              <Input
                label="Original Language"
                name="original_language"
                value={formData.original_language}
                onChange={handleChange}
                placeholder="e.g. en"
              />
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 text-sm font-bold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Previews & Actions */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-[32px] border border-slate-200 p-6 shadow-sm sticky top-8">
            <div className="space-y-6">
              {/* Poster Preview */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Poster Preview</label>
                <div className="aspect-[2/3] w-full rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50 overflow-hidden relative group">
                  {previews.poster ? (
                    <img 
                      src={previews.poster.startsWith('http') ? previews.poster : `/uploads/${previews.poster}`} 
                      className="h-full w-full object-cover" 
                      alt="Poster"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-2">
                      <Film className="h-10 w-10" />
                      <span className="text-[10px] font-black uppercase tracking-widest">No Poster</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-400 uppercase tracking-widest">Rating</span>
                  <span className="text-slate-900 flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                    {formData.vote_average?.toFixed(1) || '0.0'} ({formData.vote_count})
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-400 uppercase tracking-widest">Adult</span>
                  <span className={clsx(
                    "px-2 py-0.5 rounded text-[10px] uppercase",
                    formData.adult ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                  )}>
                    {formData.adult ? 'Yes (18+)' : 'No'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Button 
                  type="submit" 
                  disabled={loading || fetchingTmdb}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest h-14 rounded-2xl shadow-xl shadow-slate-200 gap-2"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : isEditing ? 'Save Movie' : 'Create Movie'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                  className="w-full h-14 rounded-2xl border-slate-200 font-bold"
                >
                  Discard Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>

      <TmdbSearchModal 
        isOpen={isTmdbModalOpen}
        onClose={() => setIsTmdbModalOpen(false)}
        onSelect={handleTmdbSelect}
      />

      {fetchingTmdb && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-md">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
              <Loader2 className="relative h-12 w-12 animate-spin text-slate-900" />
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">Fetching Cinematic Intel...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-8 right-8 z-[100] bg-red-500 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-300">
          <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
            <X className="h-5 w-5" />
          </div>
          <div className="font-bold text-sm pr-4">{error}</div>
          <button onClick={() => setError(null)} className="ml-auto hover:scale-110 transition-transform">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
