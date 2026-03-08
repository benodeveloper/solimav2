import { NextRequest, NextResponse } from 'next/server';
import { ApiKeyService } from '@/src/services/api-key.service';
import { ChannelService } from '@/src/services/channel.service';
import { CredentialsService } from '@/src/services/credentials.service';

/**
 * Public API endpoint for Channels.
 * Authenticated via X-API-KEY header.
 * 
 * Author: benodeveloper
 * Website: https://www.benodeveloper.com
 */
export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key');

  if (!apiKey) {
    return NextResponse.json({ error: 'Unauthorized: Missing API Key' }, { status: 401 });
  }

  const validKey = await ApiKeyService.validateKey(apiKey);
  if (!validKey) {
    return NextResponse.json({ error: 'Unauthorized: Invalid or Inactive API Key' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

  try {
    const data = await ChannelService.getPaginatedChannels({ page, limit, search });
    const creds = await CredentialsService.getLatestCredentials();

    if (!creds) {
        return NextResponse.json({ error: 'Internal Error: Streaming credentials not configured' }, { status: 500 });
    }

    // Process sources to include final streaming URL
    const baseUrl = request.nextUrl.origin;
    const items = data.items.map(channel => ({
      ...channel,
      logo_url: channel.media.find(m => m.collection === 'logo')?.conversions?.thumbnail 
        ? `${baseUrl}${channel.media.find(m => m.collection === 'logo')?.conversions?.thumbnail}`
        : channel.media.find(m => m.collection === 'logo') 
            ? `${baseUrl}/uploads/${channel.media.find(m => m.collection === 'logo')?.file_name}`
            : null,
      sources: channel.sources.map(s => ({
        ...s,
        url: `${creds.host}/live/${creds.username}/${creds.password}/${s.stream_id}.${s.extension}`
      }))
    }));

    return NextResponse.json({
      ...data,
      items
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 });
  }
}
