'use client';

import { ImageIcon } from 'lucide-react';
import { useState, useRef, useMemo } from 'react';
import { Channel, Media } from '@/src/db/schema';
import { MediaCollection } from '@/src/enums/media-collection.enum';
import Button from '@/src/components/ui/Button';
import Input from '@/src/components/ui/Input';
import { createChannel, updateChannelAction } from '@/src/actions/channel.actions';

interface ChannelWithMedia extends Channel {
  media?: Media[];
}

interface ChannelFormProps {
  channel?: ChannelWithMedia;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Modern Channel Form for Create and Edit operations.
 * Author: benodeveloper
 * Website: https://www.benodeveloper.com
 */
export default function ChannelForm({ channel, onSuccess, onCancel }: ChannelFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialLogo = useMemo(() => {
    if (!channel?.media) return null;
    const logoMedia = channel.media.find(m => m.collection_name === MediaCollection.LOGO);
    if (!logoMedia) return null;
    
    try {
      const conversions = JSON.parse(logoMedia.generated_conversions || '{}');
      return conversions.thumbnail || conversions.original || `/uploads/${logoMedia.file_name}`;
    } catch (e) {
      return `/uploads/${logoMedia.file_name}`;
    }
  }, [channel]);

  const [logoPreview, setLogoPreview] = useState<string | null>(initialLogo);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = !!channel;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const result = isEditing
      ? await updateChannelAction(channel.id, formData)
      : await createChannel(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      onSuccess();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5">
        {/* Logo Upload Section */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Channel Logo
          </label>
          <div className="flex items-center gap-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 transition-all hover:border-emerald-300 hover:bg-emerald-50"
            >
              {logoPreview ? (
                <>
                  <img src={logoPreview} alt="Preview" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                    <ImageIcon className="h-6 w-6 text-white" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1 text-slate-400">
                  <ImageIcon className="h-6 w-6" />
                  <span className="text-[10px] font-bold">UPLOAD</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500">
                Recommended size: 200x200px. <br />
                Supports JPG, PNG or WEBP.
              </p>
              <input
                type="file"
                name="logo"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>
        </div>

        <Input
          label="Channel Name"
          name="name"
          defaultValue={channel?.name}
          placeholder="e.g. HBO HD"
          required
        />

        <Input
          label="Channel Number"
          name="num"
          type="number"
          defaultValue={channel?.num?.toString()}
          placeholder="e.g. 101"
        />

        <div className="flex items-center gap-3 py-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              name="is_adult"
              value="true"
              defaultChecked={channel?.is_adult || false}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
              Adult Content
            </span>
          </label>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Status
          </label>
          <select
            name="status"
            defaultValue={channel?.status || 'active'}
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600 border border-red-100">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="border-slate-200 hover:bg-slate-50"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="min-w-[120px] bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-200">
          {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Channel'}
        </Button>
      </div>
    </form>
  );
}
