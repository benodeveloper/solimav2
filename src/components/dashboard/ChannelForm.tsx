'use client';

import { useState } from 'react';
import { Channel } from '@/src/db/schema';
import Button from '@/src/components/ui/Button';
import Input from '@/src/components/ui/Input';
import { createChannel, updateChannel } from '@/src/actions/channel.actions';

interface ChannelFormProps {
  channel?: Channel;
  isEditing?: boolean;
}

/**
 * Form component for creating or editing a channel.
 * Author: benodeveloper
 */
export default function ChannelForm({ channel, isEditing = false }: ChannelFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = isEditing && channel
      ? await updateChannel(channel.id, formData)
      : await createChannel(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6 max-w-2xl bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
      <div className="space-y-4">
        <Input
          label="Channel Name"
          name="name"
          defaultValue={channel?.name}
          placeholder="Enter channel name"
          required
        />

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Description
          </label>
          <textarea
            name="description"
            defaultValue={channel?.description || ''}
            rows={4}
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
            placeholder="Describe your channel..."
          />
        </div>

        {isEditing && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Status
            </label>
            <select
              name="status"
              defaultValue={channel?.status || 'active'}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        )}
      </div>

      {error && <p className="text-sm font-medium text-red-500">{error}</p>}

      <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
        <Button type="submit" disabled={loading} className="min-w-[120px]">
          {loading ? 'Saving...' : isEditing ? 'Update Channel' : 'Create Channel'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
