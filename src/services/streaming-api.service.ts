import axios, { AxiosResponse, AxiosInstance } from 'axios';

/**
 * Interfaces for Type Safety
 */
export interface StreamingCategory {
  category_id: string | number;
  category_name: string;
  parent_id?: number;
}

export interface StreamingItem {
  num: number;
  name: string;
  stream_type: string;
  stream_id: number;
  stream_icon: string;
  category_id: string;
  added: string;
  rating?: string;
  [key: string]: any;
}

export interface EpgEntry {
  id: string;
  start: string;
  end: string;
  title: string;
  description: string;
}

/**
 * StreamingApiService
 * Optimized for the player_api.php endpoint.
 */
export class StreamingApiService {
  private client: AxiosInstance;

  constructor(baseUrl: string, username: string, password: string) {
    this.client = axios.create({
      baseURL: baseUrl,
      params: {
        username,
        password,
      },
      timeout: 15000,
    });
  }

  /**
   * Internal request handler targeting player_api.php
   */
  private async request<T>(action: string, extraParams: Record<string, any> = {}): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.get('player_api.php', {
        params: {
          action,
          ...extraParams,
        },
      });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Unknown API Error';
      throw new Error(`[StreamingApiService] ${action} failed: ${message}`);
    }
  }

  // --- Category Methods ---

  public async getLiveCategories(): Promise<StreamingCategory[]> {
    return this.request<StreamingCategory[]>('get_live_categories');
  }

  public async getVodCategories(): Promise<StreamingCategory[]> {
    return this.request<StreamingCategory[]>('get_vod_categories');
  }

  public async getSeriesCategories(): Promise<StreamingCategory[]> {
    return this.request<StreamingCategory[]>('get_series_categories');
  }

  // --- Content Methods ---

  public async getLiveStreams(categoryId?: string | number): Promise<StreamingItem[]> {
    const params = categoryId ? { category_id: categoryId } : {};
    return this.request<StreamingItem[]>('get_live_streams', params);
  }

  public async getVodStreams(categoryId?: string | number): Promise<StreamingItem[]> {
    const params = categoryId ? { category_id: category_id } : {};
    return this.request<StreamingItem[]>('get_vod_streams', params);
  }

  public async getAllSeries(categoryId?: string | number): Promise<StreamingItem[]> {
    const params = categoryId ? { category_id: categoryId } : {};
    return this.request<StreamingItem[]>('get_series', params);
  }

  // --- Detailed Info & EPG ---

  /** Fetches specific series info (includes season/episode data) */
  public async getSeriesInfo<T = any>(seriesId: string | number): Promise<T> {
    return this.request<T>('get_series_info', { series_id: seriesId });
  }

  /** Fetches VOD details (cast, plot, etc.) */
  public async getVodInfo<T = any>(vodId: string | number): Promise<T> {
    return this.request<T>('get_vod_info', { vod_id: vodId });
  }

  /** Fetches short EPG for a stream */
  public async getShortEpg(streamId: string | number, limit: number = 4): Promise<{ epg_listings: EpgEntry[] }> {
    return this.request('get_short_epg', { stream_id: streamId, limit });
  }

  /** Fetches full EPG table for a stream */
  public async getSimpleDataTable(streamId: string | number): Promise<any> {
    return this.request('get_simple_data_table', { stream_id: streamId });
  }

  /**
   * Authenticates the user and retrieves account information, including expiration.
   */
  public async authenticate(): Promise<StreamingAuthResponse> {
    try {
      const response: AxiosResponse<StreamingAuthResponse> = await this.client.get('player_api.php');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Unknown Auth Error';
      throw new Error(`[StreamingApiService] authenticate failed: ${message}`);
    }
  }
}

export interface StreamingAuthResponse {
  user_info: {
    username: string;
    password: string;
    message: string;
    auth: number;
    status: string;
    exp_date: string;
    is_trial: string;
    active_cons: string;
    created_at: string;
    max_connections: string;
    allowed_output_formats: string[];
  };
  server_info: {
    url: string;
    port: string;
    https_port: string;
    server_protocol: string;
    rtmp_port: string;
    timezone: string;
    timestamp_now: number;
    time_now: string;
    process: boolean;
  };
}
