import ChannelForm from '@/src/components/dashboard/ChannelForm';
import { getSession } from '@/src/lib/auth-utils';
import { ChannelService } from '@/src/services/channel.service';
import { notFound } from 'next/navigation';

/**
 * Edit channel page.
 * Author: benodeveloper
 */
export default async function EditChannelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const userId = session.user.id;
  const channelId = parseInt(id);

  const channel = await ChannelService.getChannelById(channelId, userId);

  if (!channel) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Edit Channel</h1>
        <p className="text-slate-500 font-medium">Update the details for &quot;{channel.name}&quot;.</p>
      </div>

      <ChannelForm channel={channel} isEditing={true} />
    </div>
  );
}
