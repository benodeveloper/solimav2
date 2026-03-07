'use server';

import { revalidatePath } from 'next/cache';
import { ChannelService } from '@/src/services/channel.service';
import { MediaService } from '@/src/services/media.service';
import { MediaCollection } from '@/src/enums/media-collection.enum';

/**
 * Server Actions for Channel Management.
 * Author: benodeveloper
 * Website: https://www.benodeveloper.com
 */

export async function getChannels() {
  try {
    const channelList = await ChannelService.getChannels();
    
    // Attach first media (logo) to each channel
    const channelsWithMedia = await Promise.all(channelList.map(async (channel) => {
      const logo = await MediaService.getFirstMedia(channel.id, 'channels', MediaCollection.LOGO);
      return { ...channel, logo: logo ? JSON.parse(logo.generated_conversions!) : null };
    }));
    
    return channelsWithMedia;
  } catch (error) {
    return [];
  }
}

export async function createChannel(formData: FormData) {
  const name = formData.get('name') as string;
  const num = formData.get('num') ? parseInt(formData.get('num') as string) : undefined;
  const is_adult = formData.get('is_adult') === 'true';
  const status = (formData.get('status') as string) || 'active';
  const logoFile = formData.get('logo') as File;

  if (!name) {
    return { error: 'Channel name is required' };
  }

  try {
    const result: any = await ChannelService.createChannel({ name, num, is_adult, status });
    const channelId = result[0].insertId;

    if (logoFile && logoFile.size > 0) {
      await MediaService.addMedia(channelId, 'channels', logoFile, MediaCollection.LOGO);
    }

    revalidatePath('/dashboard/channels');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to create channel' };
  }
}

export async function updateChannelAction(id: number, formData: FormData) {
  const name = formData.get('name') as string;
  const num = formData.get('num') ? parseInt(formData.get('num') as string) : undefined;
  const is_adult = formData.get('is_adult') === 'true';
  const status = (formData.get('status') as string) || 'active';
  const logoFile = formData.get('logo') as File;

  if (!name) {
    return { error: 'Channel name is required' };
  }

  try {
    await ChannelService.updateChannel(id, { name, num, is_adult, status });

    if (logoFile && logoFile.size > 0) {
      await MediaService.addMedia(id, 'channels', logoFile, MediaCollection.LOGO);
    }

    revalidatePath('/dashboard/channels');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to update channel' };
  }
}

export async function deleteChannelAction(id: number) {
  try {
    await ChannelService.deleteChannel(id);
    revalidatePath('/dashboard/channels');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete channel' };
  }
}
