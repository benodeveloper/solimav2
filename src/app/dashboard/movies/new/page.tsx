'use client';

import MovieForm from '@/src/components/dashboard/MovieForm';
import { useRouter } from 'next/navigation';
import { Film } from 'lucide-react';

/**
 * Page for creating a new movie.
 * 
 * Author: benodeveloper
 * Website: https://www.benodeveloper.com
 */
export default function NewMoviePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-8 p-8 max-w-[1600px] mx-auto">
      <div className="flex items-center gap-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
          <Film className="h-7 w-7 text-slate-900" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">New Production</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-0.5">Add movie to library</p>
        </div>
      </div>

      <MovieForm 
        onSuccess={(id) => router.push('/dashboard/movies')}
        onCancel={() => router.push('/dashboard/movies')}
      />
    </div>
  );
}
