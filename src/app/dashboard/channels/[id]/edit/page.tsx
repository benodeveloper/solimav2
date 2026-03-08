import { ChannelService } from '@/src/services/channel.service';
import { notFound } from 'next/navigation';
import ChannelFormWrapper from './ChannelFormWrapper';
import SourceManagement from '@/src/components/dashboard/SourceManagement';
import { Radio, ChevronLeft, Settings2, Database } from 'lucide-react';
import Link from 'next/link';

interface EditChannelPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Dedicated Edit Channel Page.
 * Author: benodeveloper
 * Website: https://www.benodeveloper.com
 */
export default async function EditChannelPage({ params }: EditChannelPageProps) {
  const { id } = await params;
  
  const channelId = parseInt(id);
  if (isNaN(channelId)) {
    notFound();
  }

  const channel = await ChannelService.getChannelById(channelId);

  if (!channel) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Breadcrumb / Back Link */}
      <Link 
        href="/dashboard/channels"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-colors group"
      >
        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Channels
      </Link>

      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-900 shadow-sm">
              <Radio className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Channel Settings</h1>
              <p className="text-sm font-medium text-slate-500">
                Configure <span className="text-slate-900 font-bold">{channel.name}</span> metadata and sources
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center gap-2 px-1">
            <Settings2 className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Basic Info</h2>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6">
              <ChannelFormWrapper channel={channel as any} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 px-1">
            <Database className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Stream Sources</h2>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8">
              <SourceManagement 
                modelId={channel.id} 
                modelType="channels" 
                initialSources={channel.sources || []} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
