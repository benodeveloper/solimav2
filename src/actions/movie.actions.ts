'use server';

import { revalidatePath } from 'next/cache';
import { MovieService } from '@/src/services/movie.service';
import { TmdbService } from '@/src/services/tmdb.service';
import { MediaService } from '@/src/services/media.service';
import { MediaCollection } from '@/src/enums/media-collection.enum';

/**
 * Server Actions for Movie Management.
 * 
 * Author: benodeveloper
 * Website: https://www.benodeveloper.com
 */

export async function getPaginatedMoviesAction(options: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  return await MovieService.getPaginatedMovies(options);
}

export async function searchTmdbMoviesAction(query: string, page: number = 1) {
  try {
    return await TmdbService.searchMovies(query, page);
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getTmdbMovieDetailsAction(tmdbId: string | number) {
  try {
    return await TmdbService.getMovieDetails(tmdbId);
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function createMovieAction(data: any, mediaUrls?: { poster?: string; backdrop?: string; logo?: string }) {
  try {
    const movieId = await MovieService.createMovie(data);

    // If media URLs are provided (from TMDB), fetch and save them
    if (mediaUrls) {
      if (mediaUrls.poster) {
        await MediaService.addMediaFromUrl(movieId, 'movies', mediaUrls.poster, MediaCollection.POSTER as any);
      }
      if (mediaUrls.backdrop) {
        await MediaService.addMediaFromUrl(movieId, 'movies', mediaUrls.backdrop, MediaCollection.BACKDROP as any);
      }
    }

    revalidatePath('/dashboard/movies');
    return { success: true, movieId };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateMovieAction(id: number, data: any) {
  try {
    await MovieService.updateMovie(id, data);
    revalidatePath('/dashboard/movies');
    revalidatePath(`/dashboard/movies/${id}/edit`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteMovieAction(id: number) {
  try {
    await MovieService.deleteMovie(id);
    revalidatePath('/dashboard/movies');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
