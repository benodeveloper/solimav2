import { describe, it, expect, beforeAll } from 'vitest';
import { StreamingApiService } from '../services/streaming-api.service';

/**
 * Integration Test for StreamingApiService using real credentials.
 * This test will only run if the required environment variables are set.
 * 
 * To run this test:
 * 1. Set STREAMING_API_URL, STREAMING_API_USERNAME, and STREAMING_API_PASSWORD in your .env file.
 * 2. Run: npm test -- src/tests/streaming-api.service.integration.test.ts
 */
describe('StreamingApiService (Integration)', () => {
  let service: StreamingApiService;

  const config = {
    url: process.env.STREAMING_API_URL,
    username: process.env.STREAMING_API_USERNAME,
    password: process.env.STREAMING_API_PASSWORD,
  };

  beforeAll(() => {
    if (!config.url || !config.username || !config.password) {
      console.warn('Skipping integration tests: Missing real streaming API credentials.');
      return;
    }

    service = new StreamingApiService(config.url,
      config.username,
      config.password,
    );
  });

  // Helper to skip tests if credentials are not provided
  const itIfCredentials = (name: string, fn: () => Promise<void>) => {
    it(name, async () => {
      if (!service) {
        console.log(`Skipping: ${name} (No credentials)`);
        return;
      }
      await fn();
    });
  };

  describe('Real API Interaction', () => {
    itIfCredentials('should fetch live categories from a real endpoint', async () => {
      const categories = await service.getLiveCategories();

      expect(Array.isArray(categories)).toBe(true);
      if (categories.length > 0) {
        expect(categories[0]).toHaveProperty('category_id');
        expect(categories[0]).toHaveProperty('category_name');
        expect(categories[0]).toHaveProperty('parent_id');
        console.log(`Found ${categories.length} live categories.`);
      }
    });

    itIfCredentials('should fetch live streams for the first category', async () => {
      const categories = await service.getLiveCategories();

      if (categories.length > 0) {
        const categoryId = (categories[0] as any).category_id;
        const items = await service.getLiveStreams(categoryId);

        expect(Array.isArray(items)).toBe(true);
        if (items.length > 0) {
          expect(items[0]).toHaveProperty('num');
          expect(items[0]).toHaveProperty('name');
          expect(items[0]).toHaveProperty('stream_type');
          expect(items[0].stream_type).toEqual('live');
          expect(items[0]).toHaveProperty('stream_id');
          expect(items[0]).toHaveProperty('stream_icon');
          expect(items[0]).toHaveProperty('epg_channel_id');
          expect(items[0]).toHaveProperty('added');
          expect(items[0]).toHaveProperty('is_adult');
          expect(items[0]).toHaveProperty('category_id');
          expect(items[0]).toHaveProperty('category_ids');
          expect(items[0]).toHaveProperty('custom_sid');
          expect(items[0]).toHaveProperty('direct_source');
          expect(items[0]).toHaveProperty('tv_archive');
          expect(items[0]).toHaveProperty('tv_archive_duration');
          console.log(`Found ${items.length} streams in category ${categoryId}.`);
        }
      }
    });

    itIfCredentials('should fetch VOD categories', async () => {
      const categories = await service.getVodCategories();
      expect(Array.isArray(categories)).toBe(true);
      console.log(`Found ${categories.length} VOD categories.`);
    });
  });
});
