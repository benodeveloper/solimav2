'use client';

import { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { Loader2, AlertCircle } from 'lucide-react';
import type Player from 'video.js/dist/types/player';

interface VideoPlayerProps {
  url: string;
  title?: string;
}

/**
 * Professional Video Player using Video.js for robust IPTV/HLS playback.
 * 
 * Author: benodeveloper
 * Website: https://www.benodeveloper.com
 */
export default function VideoPlayer({ url, title }: VideoPlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current && videoRef.current) {
      const videoElement = document.createElement('video-js');
      videoElement.classList.add('vjs-big-play-centered', 'vjs-solima-skin');
      videoRef.current.appendChild(videoElement);

      const player = playerRef.current = videojs(videoElement, {
        autoplay: true,
        controls: true,
        responsive: true,
        fluid: true,
        preload: 'auto',
        liveui: true,
        sources: [{
          src: url,
          type: 'application/x-mpegURL'
        }],
        html5: {
          vhs: {
            overrideNative: true
          }
        },
        userActions: {
          hotkeys: true
        }
      }, () => {
        setIsLoading(false);
      });

      player.on('error', () => {
        const error = player.error();
        setError(`Playback Error: ${error?.message || 'Failed to load live stream'}`);
        setIsLoading(false);
      });

      player.on('waiting', () => setIsLoading(true));
      player.on('playing', () => setIsLoading(false));
    }

    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [url]);

  return (
    <div className="group relative aspect-video w-full overflow-hidden rounded-xl bg-slate-950 shadow-2xl ring-1 ring-white/10">
      <style jsx global>{`
        .vjs-solima-skin {
          --vjs-theme-primary: #10b981; /* Emerald 500 */
        }
        .vjs-solima-skin .vjs-control-bar {
          background-color: rgba(15, 23, 42, 0.85) !important; /* Slate 900 */
          backdrop-filter: blur(8px);
          height: 3.5em;
        }
        .vjs-solima-skin .vjs-big-play-button {
          background-color: rgba(16, 185, 129, 0.9) !important;
          border: none !important;
          border-radius: 50% !important;
          width: 2em !important;
          height: 2em !important;
          line-height: 2em !important;
          margin-top: -1em !important;
          margin-left: -1em !important;
          box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3);
        }
        .vjs-solima-skin .vjs-slider {
          background-color: rgba(255, 255, 255, 0.1);
        }
        .vjs-solima-skin .vjs-play-progress {
          background-color: var(--vjs-theme-primary);
        }
        .vjs-solima-skin .vjs-load-progress div {
          background-color: rgba(255, 255, 255, 0.2);
        }
        .vjs-solima-skin .vjs-live-display {
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #ef4444; /* Red 500 for LIVE */
        }
      `}</style>
      
      {isLoading && !error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-[2px]">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
          <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-white/80">Connecting to Stream...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950 px-6 text-center">
          <div className="rounded-full bg-red-500/10 p-4">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-white">Playback Interrupted</h3>
          <p className="mt-2 text-sm text-slate-400">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 rounded-lg bg-white/5 px-4 py-2 text-xs font-bold text-white hover:bg-white/10 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      )}

      <div data-vjs-player ref={videoRef} className="h-full w-full" />
      
      {title && !error && (
        <div className="absolute left-4 top-4 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="rounded-lg bg-slate-900/60 px-3 py-1.5 backdrop-blur-md ring-1 ring-white/10">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">{title}</h3>
          </div>
        </div>
      )}
    </div>
  );
}
