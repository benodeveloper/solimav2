import { db } from '@/src/db';
import { sources, type Source, type NewSource } from '@/src/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Service for managing streaming sources.
 * Author: benodeveloper
 * Website: https://www.benodeveloper.com
 */
export class SourceService {
  /**
   * Creates a new source.
   */
  static async createSource(data: NewSource) {
    const [result] = await db.insert(sources).values(data);
    return (result as any).insertId;
  }

  /**
   * Updates an existing source.
   */
  static async updateSource(id: number, data: Partial<NewSource>) {
    return await db.update(sources)
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where(eq(sources.id, id));
  }

  /**
   * Deletes a source.
   */
  static async deleteSource(id: number) {
    return await db.delete(sources)
      .where(eq(sources.id, id));
  }

  /**
   * Gets all sources for a specific model.
   */
  static async getSourcesForModel(modelId: number, modelType: string) {
    return await db.select()
      .from(sources)
      .where(and(
        eq(sources.streamable_id, modelId),
        eq(sources.streamable_type, modelType)
      ));
  }

  /**
   * Adds multiple sources from live streams to a model.
   */
  static async addSourcesFromStreams(modelId: number, modelType: string, streams: any[]) {
    const newSources = streams.map(stream => ({
      streamable_id: modelId,
      streamable_type: modelType,
      stream_id: stream.stream_id.toString(),
      label: 'Source',
      stream_name: stream.name,
      extension: 'm3u8',
    }));

    if (newSources.length > 0) {
      await db.insert(sources).values(newSources);
    }
  }
}
