'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSession } from '@/src/lib/auth-utils';
import { ChannelService } from '@/src/services/channel.service';

/**
 * Server Actions for Channel Management.
 * Author: benodeveloper
 */

async function getAuthUser() {
  const session = await getSession();
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }
  return session.user;
}

export async function createChannel(formData: FormData) {
  const user = await getAuthUser();
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;

  if (!name) {
    return { error: 'Channel name is required' };
  }

  try {
    await ChannelService.createChannel(user.id, { name, description });
    revalidatePath('/dashboard/channels');
    redirect('/dashboard/channels');
  } catch (error) {
    return { error: 'Failed to create channel' };
  }
}

export async function updateChannel(id: number, formData: FormData) {
  const user = await getAuthUser();
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const status = formData.get('status') as string;

  if (!name) {
    return { error: 'Channel name is required' };
  }

  try {
    await ChannelService.updateChannel(id, user.id, { name, description, status });
    revalidatePath('/dashboard/channels');
    revalidatePath(`/dashboard/channels/${id}`);
    redirect('/dashboard/channels');
  } catch (error) {
    return { error: 'Failed to update channel' };
  }
}

export async function deleteChannel(id: number) {
  const user = await getAuthUser();

  try {
    await ChannelService.deleteChannel(id, user.id);
    revalidatePath('/dashboard/channels');
    redirect('/dashboard/channels');
  } catch (error) {
    return { error: 'Failed to delete channel' };
  }
}
