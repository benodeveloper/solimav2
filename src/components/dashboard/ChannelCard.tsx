'use client';

import { Channel } from '@/src/db/schema';
import Link from 'next/link';
import { Radio, ChevronRight, MoreHorizontal } from 'lucide-react';

interface ChannelCardProps {
  channel: Channel;
}

/**
 * Component to display a channel in a list.
 * Author: benodeveloper
 */
export default function ChannelCard({ channel }: ChannelCardProps) {
  const statusColors = {
    active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    inactive: 'bg-slate-100 text-slate-600 border-slate-200',
    archived: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <Link
      href={`/dashboard/channels/${channel.id}`}
      className="group flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:border-emerald-300 hover:shadow-md transition-all"
    >
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
          <Radio size={24} />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
            {channel.name}
          </h3>
          <p className="text-sm text-slate-500 line-clamp-1 max-w-md">
            {channel.description || 'No description provided.'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColors[channel.status as keyof typeof statusColors] || statusColors.active}`}>
          {channel.status}
        </div>
        <div className="text-slate-300 group-hover:text-emerald-500 transition-colors">
          <ChevronRight size={20} />
        </div>
      </div>
    </Link>
  );
}
