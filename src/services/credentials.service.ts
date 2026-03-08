import { desc, eq } from "drizzle-orm";
import { db } from "@/src/db";
import { credentials, type Credential, type NewCredential } from "@/src/db/schema";
import { StreamingApiService } from "./streaming-api.service";

/**
 * Service for handling API credentials persistence and status.
 * 
 * Author: benodeveloper
 * Website: https://www.benodeveloper.com
 */
export interface CredentialsStatus {
  hasCredentials: boolean;
  isExpired: boolean;
  isNearExpiry: boolean;
  fetchedAt: string | null;
  expiresAt: string | null;
  host: string | null;
}

export class CredentialsService {
  private static readonly REFRESH_BEFORE_HOURS = 24;

  /**
   * Retrieves the latest credentials from the database.
   * @returns The latest credential record or null if none exist.
   */
  static async getLatestCredentials(): Promise<Credential | null> {
    const rows = await db
      .select()
      .from(credentials)
      .orderBy(desc(credentials.fetched_at))
      .limit(1);
    return rows[0] ?? null;
  }

  /**
   * Saves new credentials to the database.
   * @param creds - The host, username, and password.
   */
  static async saveCredentials(creds: {
    host: string;
    username: string;
    password: string;
  }): Promise<void> {
    const api = new StreamingApiService(creds.host, creds.username, creds.password);
    const auth = await api.authenticate();
    
    // exp_date is a unix timestamp as string
    const expiresAt = new Date(parseInt(auth.user_info.exp_date) * 1000);

    const payload: NewCredential = {
      host: creds.host,
      username: creds.username,
      password: creds.password,
      fetched_at: new Date(),
      expires_at: expiresAt,
    };

    await db.insert(credentials).values(payload);
  }

  /**
   * Refreshes the expiration date of the latest credentials by calling the API.
   */
  static async refreshCredentials(): Promise<void> {
    const latest = await this.getLatestCredentials();
    if (!latest) return;

    try {
      const api = new StreamingApiService(latest.host, latest.username, latest.password);
      const auth = await api.authenticate();
      const expiresAt = new Date(parseInt(auth.user_info.exp_date) * 1000);

      await db.update(credentials)
        .set({ 
          expires_at: expiresAt,
          fetched_at: new Date()
        })
        .where(eq(credentials.id, latest.id));
    } catch (error) {
      console.error("Failed to refresh credentials:", error);
    }
  }

  /**
   * Checks if the latest credentials are expired.
   * @returns True if expired or missing, false otherwise.
   */
  static async isCredentialsExpired(): Promise<boolean> {
    const latest = await this.getLatestCredentials();
    if (!latest || !latest.expires_at) return true;
    return new Date(latest.expires_at) < new Date();
  }

  /**
   * Checks if credentials need to be refreshed soon.
   * @returns True if missing or near expiry.
   */
  static async needsRefresh(): Promise<boolean> {
    const latest = await this.getLatestCredentials();
    if (!latest || !latest.expires_at) return true;

    const now = new Date();
    const expiresAt = new Date(latest.expires_at);
    const hoursUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);

    return hoursUntilExpiry <= this.REFRESH_BEFORE_HOURS;
  }

  /**
   * Gets a comprehensive status of the current credentials.
   * @returns The credentials status object.
   */
  static async getCredentialsStatus(): Promise<CredentialsStatus> {
    const latest = await this.getLatestCredentials();

    if (!latest || !latest.expires_at || !latest.fetched_at) {
      return {
        hasCredentials: false,
        isExpired: true,
        isNearExpiry: false,
        fetchedAt: null,
        expiresAt: null,
        host: null,
      };
    }

    const now = new Date();
    const expiresAt = new Date(latest.expires_at);
    const isExpired = expiresAt < now;
    const hoursUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
    const isNearExpiry = !isExpired && hoursUntilExpiry <= this.REFRESH_BEFORE_HOURS;

    return {
      hasCredentials: true,
      isExpired,
      isNearExpiry,
      fetchedAt: latest.fetched_at.toISOString(),
      expiresAt: latest.expires_at.toISOString(),
      host: latest.host,
    };
  }
}
