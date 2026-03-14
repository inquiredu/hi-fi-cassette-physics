import { useState, useEffect } from 'react';
import { useBuilderStore } from '../store/useBuilderStore';
import { useAudio } from '../hooks/useAudio';
import { encodeMixtape } from '../utils/serialization';
import { PlayerFrame } from '../components/templates/PlayerFrame';
import { CassetteDeck } from '../components/CassetteDeck';
import { Copy, Check, Sparkles, Loader2 } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

export function BuilderPage() {
  const { draft, updateTheme, updateLinerNotes } = useBuilderStore();
  const [mobileControlsOpen, setMobileControlsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareLink, setShareLink] = useState('');
  
  // AI Vibe Engine State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Re-generate share link whenever draft changes (debounced slightly in practice, but this is fast enough for UI)
  useEffect(() => {
    const encoded = encodeMixtape(draft);
    setShareLink(`${window.location.origin}/mixtape/${encoded}`);
  }, [draft]);

  const { state, currentTrack, toggle, prev, next, seekToPercent } = useAudio(draft.tracks);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateVibe = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setErrorMsg('');
    
    try {
      const generateMixtape = httpsCallable(functions, 'generateMixtapeFromVibe');
      const response = await generateMixtape({ prompt: aiPrompt });
      const data = response.data as Partial<import('../types').Mixtape>;
      
      if (data.tracks && data.theme && data.linerNotes) {
        useBuilderStore.setState((state) => ({
          draft: {
            ...state.draft,
            tracks: data.tracks || state.draft.tracks,
            theme: { ...state.draft.theme, ...data.theme },
            linerNotes: { ...state.draft.linerNotes, ...data.linerNotes }
          }
        }));
      }
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Failed to dig for crates. Try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0a0a0a]">
      {/* 
        PREVIEW AREA 
        Takes full width on mobile, left pane on desktop.
      */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-[50vh] relative">
        <div className="w-full max-w-2xl flex items-center justify-center">
          <PlayerFrame template={draft.theme.playerTemplate}>
            <CassetteDeck
              title={draft.linerNotes.title || 'Untitled'}
              progress={state.progress}
              transportMode={state.isPlaying ? 'playing' : 'paused'}
              shellColor={draft.theme.tapeColor}
              labelColor={draft.theme.labelColor}
              isPlaying={state.isPlaying}
              currentTrack={currentTrack}
              trackIndex={state.currentTrackIndex}
              totalTracks={draft.tracks.length}
              currentTime={state.currentTime}
              duration={state.duration}
              onPlayPause={toggle}
              onPrev={prev}
              onNext={next}
              onSeek={seekToPercent}
            />
          </PlayerFrame>
        </div>

        {/* Mobile toggle button for controls */}
        <button 
          className="lg:hidden fixed bottom-6 z-40 bg-white text-black px-6 py-3 rounded-full font-bold shadow-lg"
          onClick={() => setMobileControlsOpen(!mobileControlsOpen)}
        >
          {mobileControlsOpen ? 'Close Editor' : 'Edit Mixtape'}
        </button>
      </div>

      {/* 
        CONTROLS AREA
        Collapsible bottom sheet on mobile, right pane on desktop. 
      */}
      <div className={`
        fixed inset-x-0 bottom-0 z-30 lg:relative lg:inset-auto lg:z-auto
        w-full lg:w-[400px] xl:w-[480px] bg-neutral-900 border-t lg:border-t-0 lg:border-l border-neutral-800
        transition-transform duration-300 ease-in-out lg:transform-none
        flex flex-col h-[70vh] lg:h-screen
        ${mobileControlsOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
      `}>
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Mixtape Editor</h2>
          </div>

          {/* AI Vibe Engine */}
          <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-purple-500/30 rounded-xl p-5 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="text-purple-400" size={18} />
              <h3 className="text-lg font-bold text-white tracking-wide">AI Vibe Engine</h3>
            </div>
            <p className="text-sm text-neutral-300 mb-4 leading-relaxed">
              Describe a mood, setting, or feeling. Our AI will curate exactly 5 tracks and design a matching aesthetic just for you.
            </p>
            <div className="flex gap-2 relative">
              <textarea 
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. driving through a neon city at 2am while it rains..."
                className="w-full bg-black/40 border border-purple-500/50 rounded-lg p-3 text-sm text-white focus:ring-2 focus:ring-purple-400 focus:outline-none resize-none h-24"
                disabled={isGenerating}
              />
            </div>
            {errorMsg && <p className="text-red-400 text-xs mt-2">{errorMsg}</p>}
            <button
              onClick={handleGenerateVibe}
              disabled={isGenerating || !aiPrompt.trim()}
              className="mt-3 w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Digging creates...
                </>
              ) : (
                'Generate Mixtape'
              )}
            </button>
          </div>

          {/* Core Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Title</label>
              <input 
                type="text" 
                value={draft.linerNotes.title}
                onChange={(e) => updateLinerNotes({ title: e.target.value })}
                className="w-full bg-neutral-800 border-none rounded-lg p-3 text-white focus:ring-2 focus:ring-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Artist / Creator</label>
              <input 
                type="text" 
                value={draft.linerNotes.artist || ''}
                onChange={(e) => updateLinerNotes({ artist: e.target.value })}
                className="w-full bg-neutral-800 border-none rounded-lg p-3 text-white focus:ring-2 focus:ring-white"
              />
            </div>
          </div>

          {/* Theme & Design */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-neutral-800 pb-2">Design</h3>
            
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Player Template</label>
              <div className="grid grid-cols-3 gap-2">
                {(['minimal', 'walkman', 'boombox'] as const).map((tmpl) => (
                  <button
                    key={tmpl}
                    onClick={() => updateTheme({ playerTemplate: tmpl })}
                    className={`p-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                      draft.theme.playerTemplate === tmpl 
                        ? 'bg-white text-black' 
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    {tmpl}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <div className="flex-1">
                <label className="block text-xs font-medium text-neutral-500 mb-1 uppercase tracking-wider">Shell Color</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={draft.theme.tapeColor}
                    onChange={(e) => updateTheme({ tapeColor: e.target.value })}
                    className="w-10 h-10 rounded border-none p-0 cursor-pointer bg-transparent"
                  />
                  <span className="text-sm font-mono text-neutral-300">{draft.theme.tapeColor}</span>
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-neutral-500 mb-1 uppercase tracking-wider">Label Color</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={draft.theme.labelColor}
                    onChange={(e) => updateTheme({ labelColor: e.target.value })}
                    className="w-10 h-10 rounded border-none p-0 cursor-pointer bg-transparent"
                  />
                  <span className="text-sm font-mono text-neutral-300">{draft.theme.labelColor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tracks Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-neutral-800 pb-2">Tracks ({draft.tracks.length})</h3>
            <div className="space-y-2">
              {draft.tracks.map((track) => (
                <div key={track.id} className="bg-neutral-800/50 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{track.title}</p>
                    <p className="text-xs text-neutral-500">{track.artist}</p>
                  </div>
                  <span className="text-xs text-neutral-500">{Math.floor(track.duration/60)}:{(track.duration%60).toString().padStart(2,'0')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Share Section at bottom of controls */}
        <div className="p-6 bg-neutral-950 border-t border-neutral-800">
          <label className="block text-sm font-bold text-white mb-2">Share Link</label>
          <div className="flex gap-2">
            <input 
              readOnly
              value={shareLink}
              className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-xs text-neutral-300 font-mono focus:outline-none"
            />
            <button 
              onClick={copyToClipboard}
              className="px-4 py-2 bg-white text-black rounded-lg hover:bg-neutral-200 transition-colors flex items-center justify-center flex-shrink-0"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
