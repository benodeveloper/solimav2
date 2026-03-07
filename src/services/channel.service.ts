import { db } from '@/src/db';
import { channels } from '@/src/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Service for handling channel management logic.
 * Author: benodeveloper
 */
export class ChannelService {
  /**
   * Gets all channels for a specific user.
   */
  static async getChannelsByUserId(userId: number) {
    return await db.select().from(channels).where(eq(channels.user_id, userId));
  }

  /**
   * Gets a single channel by ID and user ID for security.
   */
  static async getChannelById(id: number, userId: number) {
    const results = await db.select()
      .from(channels)
      .where(and(eq(channels.id, id), eq(channels.user_id, userId)))
      .limit(1);
    return results[0] || null;
  }

  /**
   * Creates a new channel.
   */
  static async createChannel(userId: number, data: { name: string; description?: string }) {
    return await db.insert(channels).values({
      user_id: userId,
      name: data.name,
      description: data.description,
    });
  }

  /**
   * Updates an existing channel.
   */
  static async updateChannel(id: number, userId: number, data: { name: string; description?: string; status?: string }) {
    return await db.update(channels)
      .set({
        name: data.name,
        description: data.description,
        status: data.status as any,
        updated_at: new Date(),
      })
      .where(and(eq(channels.id, id), eq(channels.user_id, userId)));
  }

  /**
   * Deletes a channel.
   */
  static async deleteChannel(id: number, userId: number) {
    return await db.delete(channels)
      .where(and(eq(channels.id, id), eq(channels.user_id, userId)));
  }

  /**
   * Gets summary stats for a user.
   */
  static async getStats(userId: number) {
    const userChannels = await this.getChannelsByUserId(userId);
    return {
      total: userChannels.length,
      active: userChannels.filter((c: any) => c.status === 'active').length,
      inactive: userChannels.filter((c: any) => c.status === 'inactive').length,
    };
  }
}
