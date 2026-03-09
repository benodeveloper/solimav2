import { db } from '@/src/db';
import { movies, media, sources } from '@/src/db/schema';
import { eq, and, like, sql, desc } from 'drizzle-orm';
import { MediaService } from './media.service';
import { MediaCollection } from '@/src/enums/media-collection.enum';
import { slugify } from '@/src/lib/utils';

/**
 * Service for handling movie management logic.
 * 
 * Author: benodeveloper
 * Website: https://www.benodeveloper.com
 */
export class MovieService {
  /**
   * Gets paginated and filtered movies.
   */
  static async getPaginatedMovies(options: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const { page = 1, limit = 20, search = '' } = options;
    const offset = (page - 1) * limit;

    const whereClause = search ? like(movies.title, `%${search}%`) : undefined;

    const [items, countResult] = await Promise.all([
      db.select()
        .from(movies)
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(movies.created_at)),
      db.select({ count: sql<number>`count(*)` })
        .from(movies)
        .where(whereClause)
    ]);

    return {
      items,
      total: countResult[0].count,
      page,
      limit,
      totalPages: Math.ceil(countResult[0].count / limit)
    };
  }

  /**
   * Gets a single movie by ID with its media and sources.
   */
  static async getMovieById(id: number) {
    const results = await db.select()
      .from(movies)
      .where(eq(movies.id, id))
      .limit(1);
    
    if (results.length === 0) return null;
    
    const movie = results[0];
    const movieMedia = await MediaService.getMedia(id, 'movies');
    const movieSources = await db.select().from(sources).where(and(
      eq(sources.streamable_id, id),
      eq(sources.streamable_type, 'movies')
    ));
    
    return {
      ...movie,
      media: movieMedia,
      sources: movieSources
    };
  }

  /**
   * Creates a new movie.
   */
  static async createMovie(data: any) {
    const slug = data.slug || slugify(data.title);
    
    const [result] = await db.insert(movies).values({
      ...data,
      slug,
      status: data.status || 'Draft',
    });

    return (result as any).insertId;
  }

  /**
   * Updates an existing movie.
   */
  static async updateMovie(id: number, data: any) {
    if (data.title && !data.slug) {
      data.slug = slugify(data.title);
    }

    return await db.update(movies)
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where(eq(movies.id, id));
  }

  /**
   * Deletes a movie and its associated data.
   */
  static async deleteMovie(id: number) {
    // Delete sources
    await db.delete(sources).where(and(
      eq(sources.streamable_id, id),
      eq(sources.streamable_type, 'movies')
    ));

    // Delete movie record (Media will be handled by its own cleanup or kept if needed)
    return await db.delete(movies).where(eq(movies.id, id));
  }
}
