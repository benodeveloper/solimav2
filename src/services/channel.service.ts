import { db } from '@/src/db';
import { channels } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
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
   * Gets a single channel by ID.
   */
  static async getChannelById(id: number) {
    const results = await db.select()
      .from(channels)
      .where(eq(channels.id, id))
      .limit(1);
    return results[0] || null;
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
