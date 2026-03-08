import { db } from '@/src/db';
import { liveCategories, liveStreams, syncTasks, NewLiveCategory, NewLiveStream, LiveStream, LiveCategory, SyncTask, NewSyncTask } from '@/src/db/schema';
import { eq, and, like, or, sql, inArray, desc, asc } from 'drizzle-orm';
import { StreamingApiService } from './streaming-api.service';
import { CredentialsService } from './credentials.service';

/**
 * Service for handling Live Streams and Categories persistence.
 */
export class LiveStreamService {
  /**
   * Creates a new sync task.
   */
  static async createSyncTask(type: string = 'live_streams'): Promise<number> {
    const [result] = await db.insert(syncTasks).values({
      task_type: type,
      status: 'pending',
      progress: 0,
      logs: JSON.stringify(['Task initialized...']),
    });
    return (result as any).insertId;
  }

  /**
   * Updates a sync task's progress and logs.
   */
  static async updateSyncTask(id: number, data: Partial<SyncTask>, newLog?: string) {
    const existing = await db.select().from(syncTasks).where(eq(syncTasks.id, id)).limit(1);
    if (existing.length === 0) return;

    const updateData: any = { ...data };
    if (newLog) {
      const logs = JSON.parse(existing[0].logs || '[]');
      logs.push(`[${new Date().toLocaleTimeString()}] ${newLog}`);
      updateData.logs = JSON.stringify(logs.slice(-50)); // Keep last 50 logs
    }

    await db.update(syncTasks).set(updateData).where(eq(syncTasks.id, id));
  }

  /**
   * Gets a sync task by ID.
   */
  static async getSyncTask(id: number) {
    const [task] = await db.select().from(syncTasks).where(eq(syncTasks.id, id)).limit(1);
    return task;
  }

  /**
   * Gets paginated and filtered sync tasks.
   */
  static async getPaginatedSyncTasks(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;

    const [items, countResult] = await Promise.all([
      db.select()
        .from(syncTasks)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(syncTasks.created_at)),
      db.select({ count: sql<number>`count(*)` })
        .from(syncTasks)
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
   * Deletes a sync task.
   */
  static async deleteSyncTask(id: number) {
    await db.delete(syncTasks).where(eq(syncTasks.id, id));
  }

  /**
   * Performs the synchronization of live streams.
   */
  static async syncStreams(taskId: number, selectedCategoryIds?: number[]) {
    const creds = await CredentialsService.getLatestCredentials();
    if (!creds) throw new Error("No credentials available.");

    const api = new StreamingApiService(creds.host, creds.username, creds.password);

    try {
      await this.updateSyncTask(taskId, { status: 'running' }, 'Fetching categories...');
      const allCategories = await api.getLiveCategories();
      
      const categoriesToSync = selectedCategoryIds && selectedCategoryIds.length > 0
        ? allCategories.filter(cat => selectedCategoryIds.includes(Number(cat.category_id)))
        : allCategories;

      await this.updateSyncTask(taskId, { total_items: categoriesToSync.length }, `Found ${categoriesToSync.length} categories to sync.`);

      for (let i = 0; i < categoriesToSync.length; i++) {
        const cat = categoriesToSync[i];
        const progress = Math.round(((i) / categoriesToSync.length) * 100);

        await this.updateSyncTask(taskId, { 
          progress, 
          current_item: cat.category_name 
        }, `Syncing: ${cat.category_name}...`);

        const localCatId = await this.upsertCategory({
          category_id: String(cat.category_id),
          category_name: cat.category_name,
          parent_id: String(cat.parent_id || '')
        });

        const streams = await api.getLiveStreams(cat.category_id);
        
        for (const stream of streams) {
          await this.upsertStream({
            num: stream.num != null ? Number(stream.num) : 0,
            name: String(stream.name ?? ""),
            stream_type: String(stream.stream_type ?? "live"),
            stream_id: String(stream.stream_id),
            stream_icon: String(stream.stream_icon),
            direct_source: String(stream.direct_source || ""),
            epg_channel_id: String(stream.epg_channel_id || ""),
            added: String(stream.added),
            is_adult: !!stream.is_adult,
            category_id: Number(localCatId),
            category_ids: Array.isArray(stream.category_ids) ? (stream.category_ids as number[]) : [],
            custom_sid: String(stream.custom_sid || ""),
            tv_archive: stream.tv_archive != null ? Number(stream.tv_archive) : 0,
            tv_archive_duration: Number(stream.tv_archive_duration || 0),
          });
        }
      }

      await this.updateSyncTask(taskId, { 
        status: 'completed', 
        progress: 100,
        current_item: 'Done'
      }, 'Synchronization completed successfully.');

    } catch (error: any) {
      await this.updateSyncTask(taskId, { status: 'failed' }, `Error: ${error.message}`);
      throw error;
    }
  }

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
   * Gets a single live stream by ID.
   */
  static async getStreamById(id: number) {
    const results = await db.select()
      .from(liveStreams)
      .where(eq(liveStreams.id, id))
      .limit(1);
    return results[0] || null;
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
    orderBy?: string;
    orderDir?: 'asc' | 'desc';
  }) {
    const { page = 1, limit = 10, search = '', categoryIds = [], orderBy = 'created_at', orderDir = 'desc' } = options;
    const offset = (page - 1) * limit;

    const filters = [];
    if (search) {
      filters.push(like(liveStreams.name, `%${search}%`));
    }
    if (categoryIds.length > 0) {
      filters.push(inArray(liveStreams.category_id, categoryIds));
    }

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    // Handle dynamic sorting
    let orderColumn: any;
    switch (orderBy) {
      case 'name': orderColumn = liveStreams.name; break;
      case 'num': orderColumn = liveStreams.num; break;
      case 'category_name': orderColumn = liveCategories.category_name; break;
      case 'created_at':
      default: orderColumn = liveStreams.created_at; break;
    }

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
        .orderBy(orderDir === 'asc' ? asc(orderColumn) : desc(orderColumn)),
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
