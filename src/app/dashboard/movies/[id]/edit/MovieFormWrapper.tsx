'use client';

import MovieForm from '@/src/components/dashboard/MovieForm';
import { useRouter } from 'next/navigation';

interface MovieFormWrapperProps {
  movie: any;
}

/**
 * Client Wrapper for the MovieForm to handle navigation.
 * 
 * Author: benodeveloper
 * Website: https://www.benodeveloper.com
 */
export default function MovieFormWrapper({ movie }: MovieFormWrapperProps) {
  const router = useRouter();

  return (
    <MovieForm 
      movie={movie}
      onSuccess={() => {
        router.push('/dashboard/movies');
        router.refresh();
      }}
      onCancel={() => {
        router.push('/dashboard/movies');
      }}
    />
  );
}
