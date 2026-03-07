import { getSession } from '@/src/lib/auth-utils';
import { ChannelService } from '@/src/services/channel.service';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Button from '@/src/components/ui/Button';
import { Edit, Trash2, Radio, Calendar, Activity } from 'lucide-react';
import { deleteChannel } from '@/src/actions/channel.actions';

/**
 * Channel details page.
 * Author: benodeveloper
 */
export default async function ChannelDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const userId = session.user.id;
  const channelId = parseInt(id);

  const channel = await ChannelService.getChannelById(channelId, userId);

  if (!channel) {
    notFound();
  }

  const statusColors = {
    active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    inactive: 'bg-slate-100 text-slate-600 border-slate-200',
    archived: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Radio size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{channel.name}</h1>
            <div className={`mt-1 inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColors[channel.status as keyof typeof statusColors] || statusColors.active}`}>
              {channel.status}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/channels/${channelId}/edit`}>
            <Button variant="outline" className="flex items-center gap-2">
              <Edit size={16} />
              Edit
            </Button>
          </Link>
          <form action={async () => {
            'use server';
            await deleteChannel(channelId);
          }}>
            <Button variant="danger" className="flex items-center gap-2">
              <Trash2 size={16} />
              Delete
            </Button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Description</h2>
            <p className="text-slate-600 leading-relaxed">
              {channel.description || 'No description provided for this channel.'}
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Activity Log</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-slate-400 border border-slate-200">
                  <Activity size={14} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Channel Created</p>
                  <p className="text-xs text-slate-500">Initial setup completed successfully.</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-widest">
                    {channel.created_at?.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Channel Info</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500">
                  <Calendar size={16} />
                  <span className="text-sm font-semibold">Created</span>
                </div>
                <span className="text-sm font-bold text-slate-900">
                  {channel.created_at?.toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500">
                  <Activity size={16} />
                  <span className="text-sm font-semibold">Status</span>
                </div>
                <span className="text-sm font-bold text-slate-900 capitalize">
                  {channel.status}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-600 p-6 rounded-xl text-white shadow-lg shadow-emerald-100">
            <h3 className="font-black tracking-tight text-lg mb-2">Pro Tip</h3>
            <p className="text-emerald-50 text-sm leading-relaxed">
              Keep your channel descriptions detailed to help your team understand the purpose and goals of each channel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
