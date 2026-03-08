import { db } from '@/src/db';
import { apiKeys, type ApiKey, type NewApiKey } from '@/src/db/schema';
import { eq, and } from 'drizzle-orm';
import { randomBytes } from 'crypto';

/**
 * Service for managing Public API Keys.
 * Author: benodeveloper
 * Website: https://www.benodeveloper.com
 */
export class ApiKeyService {
  /**
   * Generates a new random API key.
   */
  static generateKeyString(): string {
    return `sol_${randomBytes(24).toString('hex')}`;
  }

  /**
   * Creates a new API key in the database.
   */
  static async createApiKey(name: string): Promise<ApiKey> {
    const key = this.generateKeyString();
    const [result] = await db.insert(apiKeys).values({
      name,
      key,
      is_active: true,
    });
    
    const id = (result as any).insertId;
    const [newKey] = await db.select().from(apiKeys).where(eq(apiKeys.id, id)).limit(1);
    return newKey;
  }

  /**
   * Validates an API key and updates its last_used_at timestamp.
   */
  static async validateKey(key: string): Promise<ApiKey | null> {
    const results = await db.select()
      .from(apiKeys)
      .where(and(
        eq(apiKeys.key, key),
        eq(apiKeys.is_active, true)
      ))
      .limit(1);
    
    if (results.length === 0) return null;

    const apiKey = results[0];
    
    // Update last used timestamp (async, don't wait to respond faster)
    db.update(apiKeys)
      .set({ last_used_at: new Date() })
      .where(eq(apiKeys.id, apiKey.id))
      .execute();

    return apiKey;
  }

  /**
   * Lists all API keys.
   */
  static async listApiKeys() {
    return await db.select().from(apiKeys);
  }

  /**
   * Deactivates an API key.
   */
  static async deactivateKey(id: number) {
    return await db.update(apiKeys)
      .set({ is_active: false })
      .where(eq(apiKeys.id, id));
  }
}
