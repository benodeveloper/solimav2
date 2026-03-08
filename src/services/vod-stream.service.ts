import { db } from '@/src/db';
import { vodCategories, vodStreams, syncTasks, NewVodCategory, NewVodStream, VodStream, VodCategory, SyncTask } from '@/src/db/schema';
import { eq, and, like, sql, inArray, desc, asc } from 'drizzle-orm';
import { StreamingApiService } from './streaming-api.service';
import { CredentialsService } from './credentials.service';

/**
 * Service for handling VOD Streams and Categories persistence.
 * 
 * Author: benodeveloper
 * Website: https://www.benodeveloper.com
 */
export class VodStreamService {
  /**
   * Creates a new sync task.
   */
  static async createSyncTask(type: string = 'vod_streams'): Promise<number> {
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
   * Performs the synchronization of VOD streams.
   */
  static async syncStreams(taskId: number, selectedCategoryIds?: number[]) {
    const creds = await CredentialsService.getLatestCredentials();
    if (!creds) throw new Error("No credentials available.");

    const api = new StreamingApiService(creds.host, creds.username, creds.password);

    try {
      await this.updateSyncTask(taskId, { status: 'running' }, 'Fetching categories...');
      const allCategories = await api.getVodCategories();
      
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

        const streams = await api.getVodStreams(cat.category_id);
        
        for (const stream of streams) {
          await this.upsertStream({
            num: stream.num != null ? Number(stream.num) : 0,
            name: String(stream.name ?? ""),
            stream_type: String(stream.stream_type ?? "movie"),
            stream_id: stream.stream_id != null ? Number(stream.stream_id) : 0,
            stream_icon: String(stream.stream_icon ?? ""),
            rating: String(stream.rating || ""),
            rating_5based: String(stream.rating_5based || ""),
            tmdb: String(stream.tmdb || ""),
            trailer: String(stream.trailer || ""),
            added: stream.added != null ? Number(stream.added) : 0,
            is_adult: stream.is_adult === 1 || stream.is_adult === true ? 1 : 0,
            category_id: Number(localCatId),
            category_ids: Array.isArray(stream.category_ids) ? (stream.category_ids as number[]) : [],
            container_extension: String(stream.container_extension || ""),
            custom_sid: String(stream.custom_sid || ""),
            direct_source: String(stream.direct_source || ""),
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
   * Upserts a VOD category.
   */
  static async upsertCategory(data: { category_id: string; category_name: string, parent_id: string }) {
    const existing = await db.select()
      .from(vodCategories)
      .where(eq(vodCategories.category_id, data.category_id))
      .limit(1);

    if (existing.length > 0) {
      await db.update(vodCategories)
        .set({
          category_name: data.category_name,
          parent_id: data.parent_id,
          updated_at: new Date()
        })
        .where(eq(vodCategories.id, existing[0].id));
      return existing[0].id;
    }

    const [result] = await db.insert(vodCategories).values({
      category_id: data.category_id,
      category_name: data.category_name,
      parent_id: data.parent_id,
    });

    return (result as any).insertId;
  }

  /**
   * Upserts a VOD stream.
   */
  static async upsertStream(data: NewVodStream) {
    if (!data.stream_id) return null;

    const existing = await db.select()
      .from(vodStreams)
      .where(eq(vodStreams.stream_id, data.stream_id))
      .limit(1);

    if (existing.length > 0) {
      await db.update(vodStreams)
        .set({
          ...data,
          updated_at: new Date()
        })
        .where(eq(vodStreams.id, existing[0].id));
      return existing[0].id;
    }

    const [result] = await db.insert(vodStreams).values(data);
    return (result as any).insertId;
  }

  /**
   * Gets a single VOD stream by ID.
   */
  static async getStreamById(id: number) {
    const results = await db.select()
      .from(vodStreams)
      .where(eq(vodStreams.id, id))
      .limit(1);
    return results[0] || null;
  }

  /**
   * Gets all VOD categories.
   */
  static async getCategories() {
    return await db.select().from(vodCategories).orderBy(asc(vodCategories.category_name));
  }

  /**
   * Gets paginated and filtered VOD streams.
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
      filters.push(like(vodStreams.name, `%${search}%`));
    }
    if (categoryIds.length > 0) {
      filters.push(inArray(vodStreams.category_id, categoryIds));
    }

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    // Handle dynamic sorting
    let orderColumn: any;
    switch (orderBy) {
      case 'name': orderColumn = vodStreams.name; break;
      case 'num': orderColumn = vodStreams.num; break;
      case 'category_name': orderColumn = vodCategories.category_name; break;
      case 'created_at':
      default: orderColumn = vodStreams.created_at; break;
    }

    const [items, countResult] = await Promise.all([
      db.select({
        stream: vodStreams,
        category: vodCategories
      })
        .from(vodStreams)
        .leftJoin(vodCategories, eq(vodStreams.category_id, vodCategories.id))
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(orderDir === 'asc' ? asc(orderColumn) : desc(orderColumn)),
      db.select({ count: sql<number>`count(*)` })
        .from(vodStreams)
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
}
