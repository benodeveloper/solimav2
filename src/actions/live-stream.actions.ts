'use server';

import { LiveStreamService } from '@/src/services/live-stream.service';
import { CredentialsService } from '@/src/services/credentials.service';

/**
 * Server action to get paginated and filtered live streams.
 * @param options - Pagination and filtering options.
 */
export async function getPaginatedStreamsAction(options: {
  page?: number;
  limit?: number;
  search?: string;
  categoryIds?: number[];
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
}) {
  return await LiveStreamService.getPaginatedStreams(options);
}

/**
 * Server action to get paginated and filtered live categories.
 * @param page - Current page.
 * @param limit - Items per page.
 * @param search - Search term.
 */
export async function getPaginatedCategoriesAction(page: number, limit: number, search: string) {
  return await LiveStreamService.getPaginatedCategories(page, limit, search);
}

/**
 * Server action to generate a signed or credential-based stream URL.
 * @param streamId - The unique ID of the stream.
 * @returns The full M3U8 stream URL.
 */
export async function getStreamUrlAction(streamId: string) {
  const creds = await CredentialsService.getLatestCredentials();
  
  if (!creds) {
    throw new Error('No streaming credentials found');
  }

  // Construct URL: {host}/live/{username}/{password}/{stream_id}.m3u8
  return `${creds.host}/live/${creds.username}/${creds.password}/${streamId}.m3u8`;
}

/**
 * Server action to start the live streams synchronization process.
 * @param selectedCategoryIds - Optional array of category IDs to sync.
 * @returns The ID of the created sync task.
 */
export async function startSyncLiveStreamsAction(selectedCategoryIds?: number[]) {
  const taskId = await LiveStreamService.createSyncTask();
  
  // Run sync in background (fire and forget in Server Action)
  LiveStreamService.syncStreams(taskId, selectedCategoryIds).catch(console.error);
  
  return taskId;
}

/**
 * Server action to get the status of a sync task.
 * @param taskId - The ID of the sync task.
 */
export async function getSyncTaskAction(taskId: number) {
  return await LiveStreamService.getSyncTask(taskId);
}

/**
 * Server action to get paginated sync tasks.
 */
export async function getPaginatedSyncTasksAction(page: number, limit: number) {
  return await LiveStreamService.getPaginatedSyncTasks(page, limit);
}

/**
 * Server action to delete a sync task.
 */
export async function deleteSyncTaskAction(id: number) {
  return await LiveStreamService.deleteSyncTask(id);
}
