import { db } from '@/src/db';
import { liveCategories, liveStreams, NewLiveCategory, NewLiveStream, LiveStream, LiveCategory } from '@/src/db/schema';
import { eq, and, like, or, sql, inArray, desc, asc } from 'drizzle-orm';

/**
 * Service for handling Live Streams and Categories persistence.
 * 
 * Author: benodeveloper
 * Website: https://www.benodeveloper.com
 */
export class LiveStreamService {
  /**
   * Upserts a live category.
   * @param data - The category data.
   */
  static async upsertCategory(data: { category_id: string; category_name: string, parent_id: string }) {
    const existing = await db.select()
      .from(liveCategories)
      .where(eq(liveCategories.category_id, data.category_id))
      .limit(1);

    if (existing.length > 0) {
      await db.update(liveCategories)
        .set({
          category_name: data.category_name,
          parent_id: data.parent_id,
          updated_at: new Date()
        })
        .where(eq(liveCategories.id, existing[0].id));
      return existing[0].id;
    }

    const [result] = await db.insert(liveCategories).values({
      category_id: data.category_id,
      category_name: data.category_name,
      parent_id: data.parent_id,
    });

    return (result as any).insertId;
  }

  /**
   * Upserts a live stream.
   * @param data - The stream data from the API.
   */
  static async upsertStream(data: {
    num: number,
    name: string,
    stream_type: string,
    stream_id: string,
    stream_icon: string,
    direct_source: string,
    epg_channel_id: string,
    added: string,
    is_adult: boolean,
    category_id: number,
    category_ids: number[],
    custom_sid: string,
    tv_archive_duration: number,
    tv_archive: number
  }) {

    const existing = await db.select()
      .from(liveStreams)
      .where(eq(liveStreams.stream_id, data.stream_id))
      .limit(1);

    const values: NewLiveStream = data;

    if (existing.length > 0) {
      await db.update(liveStreams)
        .set(values)
        .where(eq(liveStreams.id, existing[0].id));
      return existing[0].id;
    }

    const [result] = await db.insert(liveStreams).values(values);
    return (result as any).insertId;
  }

  /**
   * Gets all live categories.
   */
  static async getCategories() {
    return await db.select().from(liveCategories);
  }

  /**
   * Gets paginated and filtered live categories.
   * @param page - Current page.
   * @param limit - Items per page.
   * @param search - Search term for category name.
   */
  static async getPaginatedCategories(page: number = 1, limit: number = 20, search: string = '') {
    const offset = (page - 1) * limit;
    const whereClause = search ? like(liveCategories.category_name, `%${search}%`) : undefined;

    const [items, countResult] = await Promise.all([
      db.select()
        .from(liveCategories)
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(asc(liveCategories.category_name)),
      db.select({ count: sql<number>`count(*)` })
        .from(liveCategories)
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
   * Gets paginated and filtered streams.
   * @param options - Filtering and pagination options.
   */
  static async getPaginatedStreams(options: {
    page?: number;
    limit?: number;
    search?: string;
    categoryIds?: number[];
  }) {
    const { page = 1, limit = 10, search = '', categoryIds = [] } = options;
    const offset = (page - 1) * limit;

    const filters = [];
    if (search) {
      filters.push(like(liveStreams.name, `%${search}%`));
    }
    if (categoryIds.length > 0) {
      filters.push(inArray(liveStreams.category_id, categoryIds));
    }

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const [items, countResult] = await Promise.all([
      db.select({
        stream: liveStreams,
        category: liveCategories
      })
        .from(liveStreams)
        .leftJoin(liveCategories, eq(liveStreams.category_id, liveCategories.id))
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(liveStreams.created_at)),
      db.select({ count: sql<number>`count(*)` })
        .from(liveStreams)
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
   * Gets streams for a category.
   */
  static async getStreamsByCategory(categoryId: number) {
    return await db.select()
      .from(liveStreams)
      .where(eq(liveStreams.category_id, categoryId));
  }
}
