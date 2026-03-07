'use client';

import { Channel } from '@/src/db/schema';
import ChannelForm from '@/src/components/dashboard/ChannelForm';
import { useRouter } from 'next/navigation';

interface ChannelFormWrapperProps {
  channel: Channel;
}

/**
 * Client Wrapper for the ChannelForm to handle navigation.
 * Author: benodeveloper
 * Website: https://www.benodeveloper.com
 */
export default function ChannelFormWrapper({ channel }: ChannelFormWrapperProps) {
  const router = useRouter();

  return (
    <ChannelForm 
      channel={channel}
      onSuccess={() => {
        router.push('/dashboard/channels');
        router.refresh();
      }}
      onCancel={() => {
        router.push('/dashboard/channels');
      }}
    />
  );
}
