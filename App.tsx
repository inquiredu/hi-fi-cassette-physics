import React, { useState, useEffect } from 'react';
import { UnifiedDeck } from './components/UnifiedDeck';
import { JCardEditor } from './components/JCardEditor';
import { LinerNotes } from './components/LinerNotes';
import { Auth } from './components/Auth';
import { SpotifyDrawer } from './components/SpotifyDrawer';
import { JCardConfig, TransportState, TapeSide } from './types';
import { Share2, Check, Save, User, LogOut, Disc } from 'lucide-react';
import { encodeConfig, decodeConfig } from './utils/shareUtils';
import { parseDuration, getStandardTapeLength } from './utils/timeUtils';
import { supabase } from './utils/supabaseClient';
import { isSpotifyPlaylistUrl } from './utils/spotifyUtils';

// Default J-Card for new users
const DEFAULT_J_CARD: JCardConfig = {
  textureId: 'grid-paper',
  layers: [
    {
      id: 'default-text',
      type: 'text',
      content: 'SUMMER MIX 98',
      x: 60,
      y: 120,
      rotation: -2,
      scale: 1,
      zIndex: 1,
      font: 'marker',
      color: '#000000'
    },
    {
      id: 'default-sticker',
      type: 'sticker',
      content: 'tape-logo',
      x: 240,
      y: 400,
      rotation: 0,
      scale: 0.8,
      zIndex: 2
    }
  ],
  spotifyUrl: '',
  tracklist: {
    sideA: [
      { id: '1', title: 'Semi-Charmed Life', duration: '4:28' },
      { id: '2', title: 'Tubthumping', duration: '4:39' },
      { id: '3', title: 'Fly', duration: '4:52' }
    ],
    sideB: [
      { id: '4', title: 'Bitter Sweet Symphony', duration: '5:58' },
      { id: '5', title: 'Song 2', duration: '2:02' }
    ]
  }
};

export default function App() {
  // Transport state machine
  const [transport, setTransport] = useState<TransportState>({
    mode: 'stopped',
    currentSide: 'A',
    sideAProgress: 0,
    sideBProgress: 0,
  });

  // Core state
  const [jCardConfig, setJCardConfig] = useState<JCardConfig>(DEFAULT_J_CARD);
  const [isEditing, setIsEditing] = useState(false);
  const [showLinerNotes, setShowLinerNotes] = useState(false);
  const [isShared, setIsShared] = useState(false);

  // Auth state
  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showMixtapes, setShowMixtapes] = useState(false);
  const [savedMixtapes, setSavedMixtapes] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Spotify drawer state
  const [spotifyDrawerOpen, setSpotifyDrawerOpen] = useState(false);
  const hasSpotifyPlaylist = jCardConfig.spotifyUrl && isSpotifyPlaylistUrl(jCardConfig.spotifyUrl);

  // Derived values
  const currentProgress = transport.currentSide === 'A'
    ? transport.sideAProgress
    : transport.sideBProgress;
  const canFlip = currentProgress >= 0.99 || currentProgress === 0;

  // Calculate tape label based on tracklist duration
  const tapeDurationMinutes = React.useMemo(() => {
    const getSideDuration = (side: TapeSide) => {
      const tracks = side === 'A' ? jCardConfig.tracklist.sideA : jCardConfig.tracklist.sideB;
      return tracks.reduce((acc, track) => acc + parseDuration(track.duration || '0:00'), 0);
    };
    const longerSide = Math.max(getSideDuration('A'), getSideDuration('B'));
    return getStandardTapeLength(longerSide);
  }, [jCardConfig.tracklist]);

  const tapeLabel = `C-${tapeDurationMinutes * 2}`;

  // Load config from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mixtapeData = params.get('mixtape');
    if (mixtapeData) {
      const decoded = decodeConfig(mixtapeData);
      if (decoded) setJCardConfig(decoded);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Progress animation loop
  useEffect(() => {
    let animationFrame: number;
    let lastTime = performance.now();

    const getSideDuration = (side: TapeSide) => {
      const tracks = side === 'A' ? jCardConfig.tracklist.sideA : jCardConfig.tracklist.sideB;
      return tracks.reduce((acc, track) => acc + parseDuration(track.duration || '0:00'), 0);
    };

    const loop = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      setTransport(prev => {
        const progressKey = prev.currentSide === 'A' ? 'sideAProgress' : 'sideBProgress';
        const currentProgress = prev[progressKey];
        const durationSeconds = getSideDuration(prev.currentSide) || (tapeDurationMinutes * 60);

        switch (prev.mode) {
          case 'playing': {
            const newProgress = currentProgress + (delta / (durationSeconds * 1000));
            if (newProgress >= 1) {
              return { ...prev, mode: 'stopped', [progressKey]: 1 };
            }
            return { ...prev, [progressKey]: newProgress };
          }
          case 'rewinding': {
            const newProgress = Math.max(0, currentProgress - (delta * 5 / (durationSeconds * 1000)));
            return { ...prev, [progressKey]: newProgress };
          }
          case 'fast_forwarding': {
            const newProgress = Math.min(1, currentProgress + (delta * 5 / (durationSeconds * 1000)));
            if (newProgress >= 1) {
              return { ...prev, mode: 'stopped', [progressKey]: 1 };
            }
            return { ...prev, [progressKey]: newProgress };
          }
          default:
            return prev;
        }
      });

      animationFrame = requestAnimationFrame(loop);
    };

    animationFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrame);
  }, [jCardConfig.tracklist, tapeDurationMinutes]);

  // Transport handlers
  const handlePlay = () => setTransport(prev => ({ ...prev, mode: 'playing' }));
  const handlePause = () => setTransport(prev => ({ ...prev, mode: 'paused' }));
  const handleStop = () => setTransport(prev => ({
    ...prev,
    mode: 'stopped',
    [prev.currentSide === 'A' ? 'sideAProgress' : 'sideBProgress']: 0
  }));
  const handleRewindStart = () => setTransport(prev => ({ ...prev, mode: 'rewinding' }));
  const handleRewindEnd = () => setTransport(prev => ({
    ...prev,
    mode: prev.mode === 'rewinding' ? 'stopped' : prev.mode
  }));
  const handleFastForwardStart = () => setTransport(prev => ({ ...prev, mode: 'fast_forwarding' }));
  const handleFastForwardEnd = () => setTransport(prev => ({
    ...prev,
    mode: prev.mode === 'fast_forwarding' ? 'stopped' : prev.mode
  }));
  const handleFlip = () => setTransport(prev => ({
    ...prev,
    mode: 'stopped',
    currentSide: prev.currentSide === 'A' ? 'B' : 'A',
  }));

  // Share handler
  const handleShare = async () => {
    const encoded = encodeConfig(jCardConfig);
    const url = `${window.location.origin}${window.location.pathname}?mixtape=${encoded}`;
    try {
      await navigator.clipboard.writeText(url);
      setIsShared(true);
      setTimeout(() => setIsShared(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  // Save handler
  const handleSaveMixtape = async () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    setIsSaving(true);
    try {
      const titleLayer = jCardConfig.layers.find(l => l.type === 'text');
      const title = titleLayer ? titleLayer.content : 'Untitled Mixtape';
      const { error } = await supabase
        .from('mixtapes')
        .insert([{ user_id: user.id, title, config: jCardConfig }]);
      if (error) throw error;
    } catch (error: any) {
      console.error('Error saving mixtape:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Fetch mixtapes
  const fetchMixtapes = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('mixtapes')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setSavedMixtapes(data || []);
  };

  // If editing, show full-screen editor
  if (isEditing) {
    return (
      <JCardEditor
        initialConfig={jCardConfig}
        onSave={(newConfig) => {
          setJCardConfig(newConfig);
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4 text-white font-sans relative overflow-hidden">
      {/* Subtle background texture */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
        }}
      />

      {/* Minimal top bar */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-50">
        <button
          onClick={handleSaveMixtape}
          disabled={isSaving}
          className="p-2 rounded-full bg-gray-800/50 hover:bg-gray-700 text-gray-400 hover:text-white transition-all"
          title="Save"
        >
          <Save size={18} />
        </button>

        <button
          onClick={() => user ? (fetchMixtapes(), setShowMixtapes(true)) : setShowAuth(true)}
          className="p-2 rounded-full bg-gray-800/50 hover:bg-gray-700 text-gray-400 hover:text-white transition-all"
          title="My Tapes"
        >
          <Disc size={18} />
        </button>

        <button
          onClick={handleShare}
          className="p-2 rounded-full bg-gray-800/50 hover:bg-gray-700 text-gray-400 hover:text-white transition-all"
          title="Share"
        >
          {isShared ? <Check size={18} className="text-green-400" /> : <Share2 size={18} />}
        </button>

        {user ? (
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-xs font-bold">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={() => supabase.auth.signOut()}
              className="p-2 rounded-full bg-gray-800/50 hover:bg-red-900/50 text-gray-400 hover:text-red-400 transition-all"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAuth(true)}
            className="p-2 rounded-full bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 transition-all"
            title="Login"
          >
            <User size={18} />
          </button>
        )}
      </div>

      {/* THE UNIFIED DECK - The star of the show */}
      <div className="w-full max-w-xl py-8">
        <UnifiedDeck
          config={jCardConfig}
          transport={transport}
          tapeLabel={tapeLabel}
          onPlay={handlePlay}
          onPause={handlePause}
          onStop={handleStop}
          onRewindStart={handleRewindStart}
          onRewindEnd={handleRewindEnd}
          onFastForwardStart={handleFastForwardStart}
          onFastForwardEnd={handleFastForwardEnd}
          onFlip={handleFlip}
          onOpenEditor={() => setShowLinerNotes(true)}
          canFlip={canFlip}
        />
      </div>

      {/* Spotify Drawer - slides up from bottom */}
      {hasSpotifyPlaylist && (
        <SpotifyDrawer
          playlistUrl={jCardConfig.spotifyUrl}
          isOpen={spotifyDrawerOpen}
          onToggle={() => setSpotifyDrawerOpen(!spotifyDrawerOpen)}
        />
      )}

      {/* === MODALS === */}

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative">
            <button
              onClick={() => setShowAuth(false)}
              className="absolute -top-10 right-0 text-gray-400 hover:text-white text-sm"
            >
              Close
            </button>
            <Auth onLogin={() => setShowAuth(false)} />
          </div>
        </div>
      )}

      {/* Mixtapes Modal */}
      {showMixtapes && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 w-full max-w-lg rounded-2xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Disc className="text-orange-500" size={20} />
                My Mixtapes
              </h2>
              <button onClick={() => setShowMixtapes(false)} className="text-gray-400 hover:text-white text-sm">
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {savedMixtapes.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  <p>No saved mixtapes yet.</p>
                </div>
              ) : (
                savedMixtapes.map((tape) => (
                  <div
                    key={tape.id}
                    onClick={() => {
                      setJCardConfig(tape.config);
                      setShowMixtapes(false);
                    }}
                    className="group flex items-center justify-between p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-orange-500/50 cursor-pointer transition-all"
                  >
                    <div>
                      <h3 className="font-bold text-white group-hover:text-orange-400 transition-colors text-sm">
                        {tape.title || 'Untitled'}
                      </h3>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {new Date(tape.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-[10px] text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Load
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Liner Notes Modal - Opens J-Card editor */}
      {showLinerNotes && (
        <LinerNotes
          config={jCardConfig}
          onClose={() => setShowLinerNotes(false)}
          onEdit={() => {
            setShowLinerNotes(false);
            setIsEditing(true);
          }}
          onSeek={(p) => {
            const progressKey = transport.currentSide === 'A' ? 'sideAProgress' : 'sideBProgress';
            setTransport(prev => ({
              ...prev,
              [progressKey]: p,
              mode: 'playing'
            }));
            setShowLinerNotes(false);
          }}
        />
      )}
    </div>
  );
}
