import { db } from '@/src/db';
import { channels, sources, media } from '@/src/db/schema';
import { eq, and, like, sql, desc } from 'drizzle-orm';
import { LiveStreamService } from './live-stream.service';
import { MediaService } from './media.service';
import { MediaCollection } from '@/src/enums/media-collection.enum';

/**
 * Service for handling channel management logic.
 * Author: benodeveloper
 * Website: https://www.benodeveloper.com
 */
export class ChannelService {
  /**
   * Gets paginated and filtered channels for API.
   */
  static async getPaginatedChannels(options: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const { page = 1, limit = 20, search = '' } = options;
    const offset = (page - 1) * limit;

    const whereClause = search ? like(channels.name, `%${search}%`) : undefined;

    const [items, countResult] = await Promise.all([
      db.select()
        .from(channels)
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(channels.created_at)),
      db.select({ count: sql<number>`count(*)` })
        .from(channels)
        .where(whereClause)
    ]);

    // Attach media and sources for each channel
    const fullChannels = await Promise.all(items.map(async (channel) => {
      const channelMedia = await MediaService.getMedia(channel.id, 'channels');
      const channelSources = await db.select().from(sources).where(and(
        eq(sources.streamable_id, channel.id),
        eq(sources.streamable_type, 'channels')
      ));

      return {
        ...channel,
        media: channelMedia.map(m => ({
          collection: m.collection_name,
          file_name: m.file_name,
          conversions: m.generated_conversions ? JSON.parse(m.generated_conversions) : null
        })),
        sources: channelSources.map(s => ({
          label: s.label,
          lang: s.lang,
          quality: s.quality,
          extension: s.extension,
          stream_id: s.stream_id
        }))
      };
    }));

    return {
      items: fullChannels,
      total: countResult[0].count,
      page,
      limit,
      totalPages: Math.ceil(countResult[0].count / limit)
    };
  }

  /**
   * Creates a channel from a live stream.
   */
  static async createChannelFromLiveStream(streamId: number) {
    const stream = await LiveStreamService.getStreamById(streamId);
    if (!stream) throw new Error('Live stream not found');

    const [result] = await db.insert(channels).values({
      name: stream.name,
      num: stream.num,
      is_adult: stream.is_adult,
      status: 'active',
    });

    const channelId = (result as any).insertId;

    // Create initial source
    await db.insert(sources).values({
      streamable_id: channelId,
      streamable_type: 'channels',
      stream_id: stream.stream_id.toString(),
      label: 'Main Source',
      stream_name: stream.name,
      extension: 'm3u8',
    });

    if (stream.stream_icon) {
      await MediaService.addMediaFromUrl(
        channelId,
        'channels',
        stream.stream_icon,
        MediaCollection.LOGO
      );
    }

    return channelId;
  }

  /**
   * Gets all channels.
   */
  static async getChannels() {
    return await db.select().from(channels);
  }

  /**
   * Gets a single channel by ID with media and sources.
   */
  static async getChannelById(id: number) {
    const results = await db.select()
      .from(channels)
      .where(eq(channels.id, id))
      .limit(1);
    
    if (results.length === 0) return null;
    
    const channel = results[0];
    const media = await MediaService.getMedia(id, 'channels');
    const channelSources = await db.select().from(sources).where(and(
      eq(sources.streamable_id, id),
      eq(sources.streamable_type, 'channels')
    ));
    
    return {
      ...channel,
      media,
      sources: channelSources
    };
  }

  /**
   * Creates a new channel.
   */
  static async createChannel(data: { name: string; num?: number; is_adult?: boolean; status?: string }) {
    return await db.insert(channels).values({
      name: data.name,
      num: data.num,
      is_adult: data.is_adult,
      status: data.status as any,
    });
  }

  /**
   * Updates an existing channel.
   */
  static async updateChannel(id: number, data: { name: string; num?: number; is_adult?: boolean; status?: string }) {
    return await db.update(channels)
      .set({
        name: data.name,
        num: data.num,
        is_adult: data.is_adult,
        status: data.status as any,
        updated_at: new Date(),
      })
      .where(eq(channels.id, id));
  }

  /**
   * Deletes a channel.
   */
  static async deleteChannel(id: number) {
    return await db.delete(channels)
      .where(eq(channels.id, id));
  }

  /**
   * Gets summary stats.
   */
  static async getStats() {
    const allChannels = await this.getChannels();
    return {
      total: allChannels.length,
      active: allChannels.filter((c: any) => c.status === 'active').length,
      inactive: allChannels.filter((c: any) => c.status !== 'active').length,
    };
  }
}
