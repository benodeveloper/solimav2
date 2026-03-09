'use client';

import { useState, useEffect } from 'react';
import { Source, LiveStream, LiveCategory } from '@/src/db/schema';
import { Search, Plus, Trash2, ChevronDown, ChevronUp, Save, Loader2, Globe, Monitor, Zap, Play } from 'lucide-react';
import Button from '@/src/components/ui/Button';
import Input from '@/src/components/ui/Input';
import Modal from '@/src/components/ui/Modal';
import VideoPlayer from '@/src/components/dashboard/VideoPlayer';
import { 
  addSourcesFromStreamsAction, 
  updateSourceAction, 
  deleteSourceAction, 
  searchLiveStreamsAction,
  searchVodStreamsAction,
  getStreamUrlAction
} from '@/src/actions/source.actions';
import { useRouter } from 'next/navigation';

interface SourceManagementProps {
  modelId: number;
  modelType: string;
  initialSources: Source[];
}

/**
 * Source Management Component for Channels and other streamable models.
 * Author: benodeveloper
 * Website: https://www.benodeveloper.com
 */
export default function SourceManagement({ modelId, modelType, initialSources }: SourceManagementProps) {
  const router = useRouter();
  const [sources, setSources] = useState<Source[]>(initialSources);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<{ stream: any; category: any | null }[]>([]);
  const [selectedStreamIds, setSelectedStreamIds] = useState<number[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [expandedSourceId, setExpandedSourceId] = useState<number | null>(null);
  const [editingSource, setEditingSource] = useState<Partial<Source> | null>(null);

  // Video Player state
  const [playerConfig, setPlayerConfig] = useState<{ isOpen: boolean; url: string; title: string }>({
    isOpen: false,
    url: '',
    title: ''
  });

  useEffect(() => {
    setSources(initialSources);
  }, [initialSources]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (search.length >= 2) {
        setLoadingSearch(true);
        const results = modelType === 'movies' 
          ? await searchVodStreamsAction(search)
          : await searchLiveStreamsAction(search);
        setSearchResults(results.items);
        setLoadingSearch(false);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search, modelType]);

  const handlePlayStream = async (streamId: string, title: string, extension: string = 'm3u8') => {
    const url = await getStreamUrlAction(streamId, extension, modelType);
    if (url) {
      setPlayerConfig({ isOpen: true, url, title });
    } else {
      alert('Could not fetch stream URL. Please check your credentials.');
    }
  };

  const handleAddSources = async () => {
    if (selectedStreamIds.length === 0) return;
    setLoadingAction(true);
    await addSourcesFromStreamsAction(modelId, modelType, selectedStreamIds);
    setSelectedStreamIds([]);
    setSearch('');
    setLoadingAction(false);
    router.refresh();
  };

  const handleDeleteSource = async (id: number) => {
    if (!confirm('Are you sure you want to delete this source?')) return;
    setLoadingAction(true);
    await deleteSourceAction(id, modelId, modelType);
    setLoadingAction(false);
    router.refresh();
  };

  const handleEditSource = (source: Source) => {
    if (expandedSourceId === source.id) {
      setExpandedSourceId(null);
      setEditingSource(null);
    } else {
      setExpandedSourceId(source.id);
      setEditingSource({ ...source });
    }
  };

  const handleSaveSource = async () => {
    if (!editingSource || !editingSource.id) return;
    setLoadingAction(true);
    await updateSourceAction(editingSource.id, editingSource, modelId, modelType);
    setExpandedSourceId(null);
    setEditingSource(null);
    setLoadingAction(false);
    router.refresh();
  };

  const toggleStreamSelection = (id: number) => {
    setSelectedStreamIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-10">
      {/* Selected Sources Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-black tracking-tight text-slate-900">Configured Sources</h3>
            <p className="text-sm font-medium text-slate-500">Manage the streaming servers for this channel</p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
            {sources.length}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Source Info</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Tech Details</th>
                <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sources.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-sm font-medium text-slate-400">
                    No sources configured yet. Use the search below to add some.
                  </td>
                </tr>
              ) : (
                sources.map((source) => (
                  <React.Fragment key={source.id}>
                    <tr className="group transition-colors hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors group-hover:bg-white group-hover:shadow-sm">
                            <Monitor className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900">{source.label || 'Untitled Source'}</div>
                            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-tight">{source.stream_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {source.quality && (
                            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-100 uppercase">
                              {source.quality}
                            </span>
                          )}
                          {source.lang && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-100 uppercase">
                              <Globe className="h-3 w-3" /> {source.lang}
                            </span>
                          )}
                          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200 uppercase">
                            {source.extension}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handlePlayStream(source.stream_id, source.stream_name || source.label || 'Preview', source.extension || 'm3u8')}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                            title="Play Stream"
                          >
                            <Play className="h-4 w-4 fill-current" />
                          </button>
                          <button
                            onClick={() => handleEditSource(source)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white hover:text-emerald-600 hover:shadow-sm transition-all"
                          >
                            {expandedSourceId === source.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteSource(source.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedSourceId === source.id && (
                      <tr className="bg-slate-50/50">
                        <td colSpan={3} className="px-8 py-6 border-y border-slate-200/50">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Input
                              label="Source Label"
                              value={editingSource?.label || ''}
                              onChange={(e) => setEditingSource({ ...editingSource, label: e.target.value })}
                              placeholder="e.g. Server 1"
                            />
                            <Input
                              label="Language"
                              value={editingSource?.lang || ''}
                              onChange={(e) => setEditingSource({ ...editingSource, lang: e.target.value })}
                              placeholder="e.g. English"
                            />
                            <Input
                              label="Quality"
                              value={editingSource?.quality || ''}
                              onChange={(e) => setEditingSource({ ...editingSource, quality: e.target.value })}
                              placeholder="e.g. 1080p"
                            />
                            <div className="flex items-end">
                              <Button
                                onClick={handleSaveSource}
                                disabled={loadingAction}
                                className="w-full bg-slate-900 hover:bg-black"
                              >
                                {loadingAction ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-2" /> Save Changes</>}
                              </Button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Sources Section */}
      <div className="space-y-4 pt-6 border-t border-slate-100">
        <div className="space-y-1">
          <h3 className="text-lg font-black tracking-tight text-slate-900">Add New Sources</h3>
          <p className="text-sm font-medium text-slate-500">Search for live streams from your synchronized categories</p>
        </div>

        <div className="space-y-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by stream name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
            />
            {loadingSearch && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
              </div>
            )}
          </div>

          {searchResults.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="max-h-[400px] overflow-y-auto">
                <table className="w-full border-collapse text-left">
                  <thead className="sticky top-0 bg-white shadow-sm z-10">
                    <tr className="border-b border-slate-100">
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 w-12 text-center">Select</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Stream Name</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Category</th>
                      <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500 w-12">Preview</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {searchResults.map(({ stream, category }) => (
                      <tr 
                        key={stream.id} 
                        className={`transition-colors hover:bg-emerald-50/30 ${selectedStreamIds.includes(stream.id) ? 'bg-emerald-50' : ''}`}
                      >
                        <td className="px-6 py-4 text-center">
                          <div 
                            onClick={() => toggleStreamSelection(stream.id)}
                            className={`h-5 w-5 rounded-md border-2 transition-all flex items-center justify-center cursor-pointer mx-auto ${
                            selectedStreamIds.includes(stream.id) 
                              ? 'bg-emerald-500 border-emerald-500 text-white' 
                              : 'border-slate-200 bg-white'
                          }`}>
                            {selectedStreamIds.includes(stream.id) && <Plus className="h-3.5 w-3.5 stroke-[3]" />}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {stream.stream_icon && (
                              <img src={stream.stream_icon} alt="" className="h-8 w-8 rounded-lg object-cover bg-slate-100" />
                            )}
                            <div className="text-sm font-bold text-slate-900">{stream.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 uppercase">
                            {category?.category_name || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handlePlayStream(
                              stream.stream_id, 
                              stream.name, 
                              modelType === 'movies' ? (stream.container_extension || 'mp4') : 'm3u8'
                            )}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all ml-auto"
                            title="Preview Stream"
                          >
                            <Play className="h-4 w-4 fill-current" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 p-4">
                <div className="text-xs font-bold text-slate-500">
                  {selectedStreamIds.length} streams selected
                </div>
                <Button
                  onClick={handleAddSources}
                  disabled={selectedStreamIds.length === 0 || loadingAction}
                  className="bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-200"
                >
                  {loadingAction ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-2" /> Add Selected to {modelType === 'movies' ? 'Movie' : 'Channel'}</>}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stream Playback Modal */}
      <Modal
        isOpen={playerConfig.isOpen}
        onClose={() => setPlayerConfig({ ...playerConfig, isOpen: false })}
        title={`Playing: ${playerConfig.title}`}
        size="4xl"
        noPadding
      >
        <div className="bg-slate-950 p-2">
          <VideoPlayer url={playerConfig.url} title={playerConfig.title} />
        </div>
      </Modal>
    </div>
  );
}

import React from 'react';
