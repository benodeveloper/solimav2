import axios from 'axios';

/**
 * Service for interacting with TMDB API.
 * 
 * Author: benodeveloper
 * Website: https://www.benodeveloper.com
 */
export class TmdbService {
  private static readonly BASE_URL = 'https://api.themoviedb.org/3';
  private static readonly API_KEY = process.env.TMDB_API_KEY;

  /**
   * Searches for movies on TMDB.
   */
  static async searchMovies(query: string, page: number = 1) {
    if (!this.API_KEY) throw new Error('TMDB_API_KEY is not configured');

    const response = await axios.get(`${this.BASE_URL}/search/movie`, {
      params: {
        api_key: this.API_KEY,
        query,
        page,
        language: 'en-US'
      }
    });

    return response.data;
  }

  /**
   * Gets detailed movie info from TMDB.
   */
  static async getMovieDetails(tmdbId: string | number) {
    if (!this.API_KEY) throw new Error('TMDB_API_KEY is not configured');

    const response = await axios.get(`${this.BASE_URL}/movie/${tmdbId}`, {
      params: {
        api_key: this.API_KEY,
        append_to_response: 'videos,images,credits',
        language: 'en-US'
      }
    });

    return response.data;
  }

  /**
   * Helper to get full image URL.
   */
  static getImageUrl(path: string | null, size: string = 'original') {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }
}
