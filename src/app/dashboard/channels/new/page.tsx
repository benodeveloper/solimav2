import ChannelForm from '@/src/components/dashboard/ChannelForm';

/**
 * Create new channel page.
 * Author: benodeveloper
 */
export default function NewChannelPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Create Channel</h1>
        <p className="text-slate-500 font-medium">Set up a new channel for your network.</p>
      </div>

      <ChannelForm />
    </div>
  );
}
