import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { StreamingApiService } from '../services/streaming-api.service';

// Mock axios
vi.mock('axios');

describe('StreamingApiService', () => {
  const baseURL = 'http://test-api.com';
  const username = 'testuser';
  const password = 'testpassword';
  let service: StreamingApiService;
  let mockAxiosInstance: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup the mock instance with a .get method
    mockAxiosInstance = {
      get: vi.fn(),
    };

    // Make axios.create return our mock instance
    (axios.create as any).mockReturnValue(mockAxiosInstance);

    service = new StreamingApiService(baseURL, username, password);
  });

  it('should initialize correctly with baseURL and auth params', () => {
    expect(axios.create).toHaveBeenCalledWith(expect.objectContaining({
      baseURL,
      params: { username, password },
      timeout: 15000,
    }));
  });

  describe('Category Methods', () => {
    it('getLiveCategories should call player_api.php with correct action', async () => {
      const mockData = [{ category_id: '1', category_name: 'News' }];
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockData });

      const result = await service.getLiveCategories();

      expect(result).toEqual(mockData);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('player_api.php', {
        params: { action: 'get_live_categories' },
      });
    });
  });

  describe('Content Methods', () => {
    it('getLiveStreams should include category_id if provided', async () => {
      const mockData = [{ stream_id: 123, name: 'CNN' }];
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockData });

      const result = await service.getLiveStreams('5');

      expect(result).toEqual(mockData);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('player_api.php', {
        params: { action: 'get_live_streams', category_id: '5' },
      });
    });

    it('getAllSeries should work without a category_id', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: [] });
      await service.getAllSeries();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('player_api.php', {
        params: { action: 'get_series' },
      });
    });
  });

  describe('Detailed Info & EPG', () => {
    it('getSeriesInfo should use series_id parameter', async () => {
      const mockInfo = { info: { name: 'Breaking Bad' } };
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockInfo });

      const result = await service.getSeriesInfo(50);

      expect(result).toEqual(mockInfo);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('player_api.php', {
        params: { action: 'get_series_info', series_id: 50 },
      });
    });

    it('getShortEpg should include stream_id and limit', async () => {
      const mockEpg = { epg_listings: [{ title: 'Movie' }] };
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockEpg });

      const result = await service.getShortEpg(100, 10);

      expect(result).toEqual(mockEpg);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('player_api.php', {
        params: { action: 'get_short_epg', stream_id: 100, limit: 10 },
      });
    });
  });

  describe('Error Handling', () => {
    it('should throw a formatted error when the request fails', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce(new Error('Timeout'));

      await expect(service.getLiveCategories()).rejects.toThrow(
        '[StreamingApiService] get_live_categories failed: Timeout'
      );
    });

    it('should extract error message from response data if available', async () => {
      const errorResponse = {
        response: {
          data: { message: 'Invalid Credentials' }
        }
      };
      mockAxiosInstance.get.mockRejectedValueOnce(errorResponse);

      await expect(service.getLiveCategories()).rejects.toThrow(
        '[StreamingApiService] get_live_categories failed: Invalid Credentials'
      );
    });
  });
});
