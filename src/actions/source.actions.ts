'use server';

import { revalidatePath } from 'next/cache';
import { SourceService } from '@/src/services/source.service';
import { LiveStreamService } from '@/src/services/live-stream.service';
import { NewSource } from '@/src/db/schema';

/**
 * Server Actions for Source Management.
 * Author: benodeveloper
 * Website: https://www.benodeveloper.com
 */

export async function addSourcesFromStreamsAction(modelId: number, modelType: string, streamIds: number[]) {
  try {
    const streams = await Promise.all(streamIds.map(id => LiveStreamService.getStreamById(id)));
    const validStreams = streams.filter(Boolean);
    
    await SourceService.addSourcesFromStreams(modelId, modelType, validStreams);
    revalidatePath(`/dashboard/channels/${modelId}/edit`);
    return { success: true };
  } catch (error) {
    console.error('Action Error:', error);
    return { error: 'Failed to add sources' };
  }
}

export async function updateSourceAction(id: number, data: Partial<NewSource>) {
  try {
    await SourceService.updateSource(id, data);
    // Since we don't know the exact path here easily without more context, 
    // we can revalidate the general channels path or let the client handle it.
    revalidatePath('/dashboard/channels', 'layout');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to update source' };
  }
}

export async function deleteSourceAction(id: number, modelId: number) {
  try {
    await SourceService.deleteSource(id);
    revalidatePath(`/dashboard/channels/${modelId}/edit`);
    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete source' };
  }
}

export async function searchLiveStreamsAction(search: string, page: number = 1) {
  try {
    return await LiveStreamService.getPaginatedStreams({ search, page, limit: 10 });
  } catch (error) {
    console.error('Search Error:', error);
    return { items: [], total: 0, totalPages: 0 };
  }
}

export async function getStreamUrlAction(streamId: string, extension: string = 'm3u8') {
  try {
    const { CredentialsService } = await import('@/src/services/credentials.service');
    const creds = await CredentialsService.getLatestCredentials();
    if (!creds) throw new Error('No credentials found');

    // Remove trailing slash from host if present
    const host = creds.host.replace(/\/$/, '');
    return `${host}/live/${creds.username}/${creds.password}/${streamId}.${extension}`;
  } catch (error) {
    console.error('Stream URL Error:', error);
    return null;
  }
}
