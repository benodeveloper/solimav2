import ChannelCard from '@/src/components/dashboard/ChannelCard';
import { getSession } from '@/src/lib/auth-utils';
import { ChannelService } from '@/src/services/channel.service';
import { PlusCircle, Search } from 'lucide-react';
import Link from 'next/link';
import Button from '@/src/components/ui/Button';
import Input from '@/src/components/ui/Input';

import { Channel } from '@/src/db/schema';

/**
 * Channels list page.
 * Author: benodeveloper
 */
export default async function ChannelsPage() {
  const session = await getSession();
  const userId = session.user.id;

  const channels: Channel[] = await ChannelService.getChannelsByUserId(userId);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Channels</h1>
          <p className="text-slate-500 font-medium">View and manage all your active channels.</p>
        </div>
        <Link href="/dashboard/channels/new">
          <Button className="flex items-center gap-2">
            <PlusCircle size={18} />
            New Channel
          </Button>
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search channels..."
            className="w-full pl-10 pr-4 py-2 rounded-md border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select className="px-3 py-2 rounded-md border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-emerald-500 transition-all">
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
            <option>Archived</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {channels.length > 0 ? (
          channels.map((channel) => (
            <ChannelCard key={channel.id} channel={channel} />
          ))
        ) : (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 font-medium">No channels found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
