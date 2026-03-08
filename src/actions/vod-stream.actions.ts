'use server';

import { VodStreamService } from '@/src/services/vod-stream.service';
import { CredentialsService } from '@/src/services/credentials.service';

/**
 * Server action to get paginated and filtered VOD streams.
 * 
 * Author: benodeveloper
 * Website: https://www.benodeveloper.com
 */
export async function getPaginatedVodStreamsAction(options: {
  page?: number;
  limit?: number;
  search?: string;
  categoryIds?: number[];
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
}) {
  return await VodStreamService.getPaginatedStreams(options);
}

/**
 * Server action to get VOD categories.
 */
export async function getVodCategoriesAction() {
  return await VodStreamService.getCategories();
}

/**
 * Server action to generate a VOD stream URL.
 * @param streamId - The unique ID of the stream.
 * @param extension - The container extension (e.g., mp4, mkv).
 */
export async function getVodStreamUrlAction(streamId: number, extension: string) {
  const creds = await CredentialsService.getLatestCredentials();
  
  if (!creds) {
    throw new Error('No streaming credentials found');
  }

  const ext = extension || 'mp4';
  // Construct URL: {host}/movie/{username}/{password}/{stream_id}.{extension}
  return `${creds.host}/movie/${creds.username}/${creds.password}/${streamId}.${ext}`;
}

/**
 * Server action to start the VOD streams synchronization process.
 * @param selectedCategoryIds - Optional array of category IDs to sync.
 */
export async function startSyncVodStreamsAction(selectedCategoryIds?: number[]) {
  const taskId = await VodStreamService.createSyncTask();
  
  // Run sync in background
  VodStreamService.syncStreams(taskId, selectedCategoryIds).catch(console.error);
  
  return taskId;
}

/**
 * Server action to get the status of a sync task.
 */
export async function getSyncTaskAction(taskId: number) {
  const { LiveStreamService } = await import('@/src/services/live-stream.service');
  return await LiveStreamService.getSyncTask(taskId);
}
