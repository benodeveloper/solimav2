import { db } from '@/src/db';
import { liveCategories, liveStreams, NewLiveCategory, NewLiveStream } from '@/src/db/schema';
import { eq, and } from 'drizzle-orm';

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
   * @param categoryId - The local database category ID.
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
   * Gets streams for a category.
   */
  static async getStreamsByCategory(categoryId: number) {
    return await db.select()
      .from(liveStreams)
      .where(eq(liveStreams.category_id, categoryId));
  }
}
