import DashboardStats from '@/src/components/dashboard/DashboardStats';
import { getSession } from '@/src/lib/auth-utils';
import { ChannelService } from '@/src/services/channel.service';
import { Radio, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import Button from '@/src/components/ui/Button';

import { Channel } from '@/src/db/schema';

/**
 * Main dashboard page.
 * Author: benodeveloper
 */
export default async function DashboardPage() {
  const session = await getSession();
  const userId = session.user.id;

  const stats = await ChannelService.getStats(userId);
  const channels: Channel[] = await ChannelService.getChannelsByUserId(userId);
  const recentChannels = channels
    .sort((a, b) => (b.created_at?.getTime() || 0) - (a.created_at?.getTime() || 0))
    .slice(0, 5);

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Overview</h1>
          <p className="text-slate-500 font-medium">Monitor and manage your channel network.</p>
        </div>
        <Link href="/dashboard/channels/new">
          <Button className="flex items-center gap-2">
            <PlusCircle size={18} />
            New Channel
          </Button>
        </Link>
      </div>

      <DashboardStats {...stats} />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recent Channels</h2>
          <Link href="/dashboard/channels" className="text-sm font-bold text-emerald-600 hover:text-emerald-700">
            View All
          </Link>
        </div>

        {recentChannels.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {recentChannels.map((channel) => (
              <Link
                key={channel.id}
                href={`/dashboard/channels/${channel.id}`}
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <Radio size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{channel.name}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-black">
                      {channel.status}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Created</p>
                  <p className="text-sm font-semibold text-slate-600">
                    {channel.created_at?.toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4">
              <Radio size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No channels yet</h3>
            <p className="text-slate-500 mb-6">Start by creating your first channel.</p>
            <Link href="/dashboard/channels/new">
              <Button variant="outline">Create Channel</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
