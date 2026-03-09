'use server';

import { revalidatePath } from 'next/cache';
import { SourceService } from '@/src/services/source.service';
import { LiveStreamService } from '@/src/services/live-stream.service';
import { VodStreamService } from '@/src/services/vod-stream.service';
import { NewSource, Source } from '@/src/db/schema';

/**
 * Server Actions for Source Management.
 * Author: benodeveloper
 * Website: https://www.benodeveloper.com
 */

export async function addSourcesFromStreamsAction(modelId: number, modelType: string, streamIds: number[]) {
  try {
    let streams: any[] = [];
    if (modelType === 'movies') {
      streams = await Promise.all(streamIds.map(id => VodStreamService.getStreamById(id)));
    } else {
      streams = await Promise.all(streamIds.map(id => LiveStreamService.getStreamById(id)));
    }
    
    const validStreams = streams.filter(Boolean);
    
    await SourceService.addSourcesFromStreams(modelId, modelType, validStreams);
    revalidatePath(`/dashboard/${modelType}/${modelId}/edit`);
    return { success: true };
  } catch (error) {
    console.error('Action Error:', error);
    return { error: 'Failed to add sources' };
  }
}

export async function updateSourceAction(id: number, data: Partial<NewSource>, modelId: number, modelType: string) {
  try {
    await SourceService.updateSource(id, data);
    revalidatePath(`/dashboard/${modelType}/${modelId}/edit`);
    return { success: true };
  } catch (error) {
    return { error: 'Failed to update source' };
  }
}

export async function deleteSourceAction(id: number, modelId: number, modelType: string) {
  try {
    await SourceService.deleteSource(id);
    revalidatePath(`/dashboard/${modelType}/${modelId}/edit`);
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

export async function searchVodStreamsAction(search: string, page: number = 1) {
  try {
    return await VodStreamService.getPaginatedStreams({ search, page, limit: 10 });
  } catch (error) {
    console.error('Search Error:', error);
    return { items: [], total: 0, totalPages: 0 };
  }
}

export async function getStreamUrlAction(streamId: string, extension: string = 'm3u8', modelType: string = 'channels') {
  try {
    const { CredentialsService } = await import('@/src/services/credentials.service');
    const creds = await CredentialsService.getLatestCredentials();
    if (!creds) throw new Error('No credentials found');

    const host = creds.host.replace(/\/$/, '');
    
    if (modelType === 'movies') {
      const ext = extension || 'mp4';
      return `${host}/movie/${creds.username}/${creds.password}/${streamId}.${ext}`;
    }
    
    return `${host}/live/${creds.username}/${creds.password}/${streamId}.${extension}`;
  } catch (error) {
    console.error('Stream URL Error:', error);
    return null;
  }
}
