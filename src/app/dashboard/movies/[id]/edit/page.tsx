import { MovieService } from '@/src/services/movie.service';
import { notFound } from 'next/navigation';
import MovieFormWrapper from './MovieFormWrapper';
import SourceManagement from '@/src/components/dashboard/SourceManagement';
import { Film, ChevronLeft, Settings2, Database, Clapperboard } from 'lucide-react';
import Link from 'next/link';

interface EditMoviePageProps {
  params: Promise<{ id: string }>;
}

/**
 * Dedicated Edit Movie Page.
 * 
 * Author: benodeveloper
 * Website: https://www.benodeveloper.com
 */
export default async function EditMoviePage({ params }: EditMoviePageProps) {
  const { id } = await params;
  
  const movieId = parseInt(id);
  if (isNaN(movieId)) {
    notFound();
  }

  const movie = await MovieService.getMovieById(movieId);

  if (!movie) {
    notFound();
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 p-8">
      {/* Breadcrumb / Back Link */}
      <Link 
        href="/dashboard/movies"
        className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-emerald-500 transition-all group"
      >
        <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:border-emerald-100 group-hover:bg-emerald-50 transition-all">
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        </div>
        Back to Studio
      </Link>

      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 shadow-2xl shadow-slate-200">
            <Clapperboard className="h-8 w-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">{movie.title}</h1>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Post-Production & Distribution</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-8">
          <div className="flex items-center gap-3 mb-6 px-1">
            <Settings2 className="h-4 w-4 text-emerald-500" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Production Metadata</h2>
          </div>
          <MovieFormWrapper movie={movie} />
        </div>

        <div className="xl:col-span-4 space-y-8">
          <div className="flex items-center gap-3 mb-6 px-1">
            <Database className="h-4 w-4 text-emerald-500" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Streaming Assets</h2>
          </div>
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8">
              <SourceManagement 
                modelId={movie.id} 
                modelType="movies" 
                initialSources={movie.sources || []} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
