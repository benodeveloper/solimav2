'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Radio, Loader2 } from 'lucide-react';
import Button from '@/src/components/ui/Button';
import { getChannels } from '@/src/actions/channel.actions';
import ChannelTable from '@/src/components/dashboard/ChannelTable';
import Modal from '@/src/components/ui/Modal';
import ChannelForm from '@/src/components/dashboard/ChannelForm';
import { motion } from 'motion/react';

/**
 * Channels Management Page - Unified CRUD.
 * Author: benodeveloper
 * Website: https://www.benodeveloper.com
 */
export default function ChannelsPage() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: channels, isLoading, isError } = useQuery({
    queryKey: ['channels'],
    queryFn: () => getChannels(),
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
              <Radio className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Channels</h1>
          </div>
          <p className="text-sm font-medium text-slate-500">
            Easily manage your broadcast channels and their settings in one place.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="h-11 gap-2 bg-emerald-600 px-5 text-sm font-bold shadow-md shadow-emerald-100 transition-all hover:bg-emerald-700 hover:shadow-lg active:scale-95"
        >
          <PlusCircle className="h-5 w-5" />
          Create New Channel
        </Button>
      </div>

      {/* Main Content Area */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {isLoading ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white/50">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
            <p className="text-sm font-semibold text-slate-500">Loading your channels...</p>
          </div>
        ) : isError ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 rounded-2xl border border-red-100 bg-red-50/50 p-8 text-center">
            <div className="rounded-full bg-red-100 p-3 text-red-600">
              <PlusCircle className="h-8 w-8 rotate-45" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Failed to load channels</h3>
            <p className="max-w-xs text-sm text-slate-500">
              There was an error fetching your data. Please check your connection and try again.
            </p>
            <Button
              variant="outline"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['channels'] })}
              className="mt-2 border-red-200 text-red-600 hover:bg-red-100"
            >
              Retry Connection
            </Button>
          </div>
        ) : (
          <ChannelTable data={channels || []} />
        )}
      </motion.div>

      {/* Create Channel Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Channel"
      >
        <ChannelForm
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['channels'] });
            setIsCreateModalOpen(false);
          }}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
