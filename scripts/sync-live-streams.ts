import { StreamingApiService } from '../src/services/streaming-api.service';
import { LiveStreamService } from '../src/services/live-stream.service';
import { CredentialsService } from '@/src/services/credentials.service';

async function main() {
  const creds = await CredentialsService.getLatestCredentials();
  if (!creds) {
    throw new Error("No credentials available. Please run crawl-credentials first.");
  }
  if (new Date(creds.expires_at) < new Date()) {
    throw new Error("Credentials have expired. Please refresh credentials.");
  }

  console.log('--- Starting Live Streams Sync ---');

  const api = new StreamingApiService(creds.host, creds.username, creds.password);

  try {
    console.log('Fetching live categories...');
    const categories = await api.getLiveCategories();
    console.log(`Found ${categories.length} categories.`);

    for (const cat of categories) {
      console.log(`Syncing category: ${cat.category_name} (${cat.category_id})...`);

      const localCatId = await LiveStreamService.upsertCategory({
        category_id: String(cat.category_id),
        category_name: cat.category_name,
        parent_id: String(cat.parent_id)
      });

      console.log(`Fetching streams for ${cat.category_name}...`);
      const streams = await api.getLiveStreams(cat.category_id);
      console.log(`Found ${streams.length} streams.`);

      for (const stream of streams) {
        await LiveStreamService.upsertStream({
          num: stream.num != null ? Number(stream.num) : 0,
          name: String(stream.name ?? ""),
          stream_type: String(stream.stream_type ?? "live"),
          stream_id: String(stream.stream_id),
          stream_icon: String(stream.stream_icon),
          direct_source: String(stream.direct_source),
          epg_channel_id: String(stream.epg_channel_id),
          added: String(stream.added),
          is_adult: stream.is_adult ? true : false,
          category_id: Number(localCatId),
          category_ids: Array.isArray(stream.category_ids) ? (stream.category_ids as number[]) : [],
          custom_sid: String(stream.custom_sid),
          tv_archive: stream.tv_archive != null ? Number(stream.tv_archive) : 0,
          tv_archive_duration: Number(stream.tv_archive_duration),
        });
      }

      console.log(`Finished syncing ${streams.length} streams for ${cat.category_name}.`);
    }

    console.log('--- Sync Completed Successfully ---');
  } catch (error: any) {
    console.error('Error during sync:', error.message);
    process.exit(1);
  }

  process.exit(0);
}

main();
